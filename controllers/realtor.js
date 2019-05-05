const throwErrorResponse = require('../util/throwErrorResponse');
const serializeURL = require('../util/serializeUrl');
const gCloudUpload = require('../util/gCloudUpload');
const request = require('request').defaults({ jar: true });
const cheerio = require('cheerio');

var realObject = {
    input: '4242 Locust Ave, Long Beach, CA, 90807',
    area_types: ['address', 'neighborhood', 'city', 'county', 'postal_code', 'street']
};

const makeRealtorRequest = (address) => {
    realObject.input = address;
    var realUrl = 'https://www.realtor.com/api/v1/geo-landing/parser/suggest/?' + serializeURL(realObject, true);
    var realAddUrl = 'https://www.realtor.com/realestateandhomes-detail/M';

    return new Promise(resolve => {
        request({ url: realUrl }, function (err, response, body) {
            if (err) { console.log(err); return; }
            resolve(body);
        })
    }).then(body => {
        var jsonObject = JSON.parse(body);
        try { realAddUrl = realAddUrl + jsonObject.result[0].mpr_id; }
        catch (err) { throwErrorResponse(404, 'address not found'); }
        return realAddUrl;
    })
}

const getRealImageUrl = (realAddUrl) => {
    return new Promise(resolve => {
        request({ url: realAddUrl }, function (err, response, body) {
            if (err) { console.log(err); return; }
            resolve(body);
        })
    }).then(body => {
        var imgUrl = cheerio('.modal-heroimg', body).children()[0].attribs.src;
        return imgUrl;
    })
}
module.exports = (req, res, next) => {
    const address = req.params.address;
    console.log('Address received: ' + address);
    makeRealtorRequest(address)
        .then(realAddUrl => getRealImageUrl(realAddUrl))
        .then(imgUrl => gCloudUpload(imgUrl))
        .then(keithResponse => res.status(keithResponse[0]).send(keithResponse[1]))
        .catch(err => res.status(err[0]).send(err[1]));
}