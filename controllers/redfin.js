const throwErrorResponse = require('../util/throwErrorResponse');
const serializeURL = require('../util/serializeUrl');
const gCloudUpload = require('../util/gCloudUpload');
const request = require('request').defaults({ jar: true });
const cheerio = require('cheerio');

var redfinObject = {
    location: '2645%20west%20231st',
    start: '0',
    count: '10',
    v: '2',
    market: 'socal',
    ai: '1',
    iss: 'false',
    ooa: 'true',
    mrs: 'false',
    region_id: '37626',
    region_type: '2'
};

const buildRequest = (address) => {
    var redfinURL = 'https://www.redfin.com/stingray/do/location-autocomplete?';
    redfinObject.location = address;
    redfinURL += serializeURL(redfinObject, false);
    return redfinURL;
};

const makeRedfinRequest = (redfinRequest) => {
    var redImgUrl = 'https://www.redfin.com';

    return new Promise(resolve => {
        request({ url: redfinRequest }, function (err, response, body) {
            if (err) { console.log(err); return; }
            resolve(body);
        })
    }).then(body => {
        let jsonObject;
        try { jsonObject = JSON.parse(body.slice(4)); }
        catch (err) { throwErrorResponse(500, 'redfin thinks we are robots') }

        try { redImgUrl = redImgUrl + jsonObject.payload.sections[0].rows[0].url; }
        catch (err) { throwErrorResponse(404, 'address not found'); }
        return redImgUrl;
    })
};

const getImageUrl = (redImgUrl) => {
    return new Promise((resolve, reject) => {
        request({ url: redImgUrl }, function (err, response, body) {
            if (err || response.statusCode != 200) { reject({ response, err }); }
            resolve(body);
        })
    }).then(body => {
        var imgUrl = cheerio('.img-card', body).attr().src;
        if (!imgUrl) { throw ([404, 'No image found in RedFin']); }
        return imgUrl;
    }).catch(error => {
        if (typeof error.response != 'undefined') {
            throw ([error.response.statusCode, 'Redfin not responding']);
        }
        else {
            throw ([404, error.err.code]);
        }
    });
};

const buildResponse = (imgUrl) => {
    imgUrl = imgUrl.replace('mbpaddedwide', 'bigphoto');
    imgUrl = imgUrl.replace('genMid\.', '');
    var keithResponse = {
        url: imgUrl
    };
    return keithResponse;
};


function testRedfin() {
    var testUrl = 'https://www.redfin.com/CA/Signal-Hill/2240-N-Legion-Dr-90755/unit-204/home/7574819';

    return getImageUrl(testUrl)
        .then(fullImg => buildResponse(fullImg))
        .then(toGCloud => gCloudUpload(toGCloud.url))
        .catch(error => {
            if (typeof error.response != 'undefined') {
                throw ([error.response.statusCode, 'Redfin not responding']);
            }
            else {
                throw ([404, error.err.code]);
            }
        });
}

module.exports = (req, res, next) => {
    const address = req.params.address;
    const newUrl = buildRequest(address);
    makeRedfinRequest(newUrl)
        .then(redfinURL => getImageUrl(redfinURL))
        .then(imgUrl => buildResponse(imgUrl))
        .then(cloudUrl => gCloudUpload(cloudUrl.url))
        .then(keithResponse => res.status(keithResponse[0]).send(keithResponse[1]))
        .catch(err => res.status(err[0]).send(err[1]));
};
