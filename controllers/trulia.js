const throwErrorResponse = require('../util/throwErrorResponse');
const serializeURL = require('../util/serializeUrl');
const gCloudUpload = require('../util/gCloudUpload');
const request = require('request').defaults({ jar: true });
const cheerio = require('cheerio');

var truliaObj = {
    results: '5',
    query: '4242 locust ave',
    display: 'h'
};

var truliaQuery = {
    query: 'address',
    searchType: 'for_sale'
};

const makeTruliaRequest = (address) => {
    truliaObj.query = address;
    var truliaUrl = 'https://www.trulia.com/_ajax/AutoSuggest/AutoSuggest/?' + serializeURL(truliaObj, false);
    var truliaAdd = '';

    return new Promise(resolve => {
        request({ url: truliaUrl }, function (err, response, body) {
            if (err) { console.log(err); return; }
            resolve(body);
        })
    }).then(body => {
        var jsonObject = JSON.parse(body);
        try { truliaAdd = truliaAdd + jsonObject.locations[0].display; }
        catch (err) { throwErrorResponse(404, 'address not found'); }
        return truliaAdd;
    })
};

const getImageFromAdd = (imgUrl) => {
    truliaQuery.query = imgUrl;
    var truliaQueryUrl = 'https://www.trulia.com/json/search/location/?' + serializeURL(truliaQuery, false);
    var getImage = '';

    return new Promise(resolve => {
        request({ url: truliaQueryUrl }, function (err, response, body) {
            if (err) { console.log(err); return; }
            resolve(body);
        })
    }).then(body => {
        var jsonObject = JSON.parse(body);
        try { getImage = jsonObject.url; }
        catch (err) { throwErrorResponse(404, 'address not found'); }
        return getImage;
    })
};

const imageUrl = (url) => {
    var truliaAddPage = 'https://www.trulia.com/' + url;
    return new Promise(resolve => {
        request({ url: truliaAddPage }, function (err, response, body) {
            if (err) { console.log(err); return; }
            resolve(body)
        })
    }).then(body => {
        console.log(body);
    })
};

module.exports = (req, res, next) => {
    const address = req.params.address;
    makeTruliaRequest(address)
        .then(autofill => getImageFromAdd(autofill))
        .then(truliaUrl => imageUrl(truliaUrl))
        .then(imageLinke => console.log(imageLinke));
}