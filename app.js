var request = require('request');
var rp = require('request-promise');
var express = require('express');
var cheerio = require('cheerio');
var app = express();

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

app.get('/propertyPhoto/:address', function (req, res) {
    const address = req.params.address;
    console.log('Address received: ' + address);
    var newUrl = buildRequest(address);
    makeRedfinRequest(newUrl)
        .then(redfinURL => getImageUrl(redfinURL))
        .then(imgUrl => buildResponse(imgUrl))
        .then(keithResponse => res.status(200).send(keithResponse))
        .catch(err => res.status(500).send());
});

app.listen(3000, function() {
    console.log("Started on PORT 3000");
});

function buildRequest(address) {
    var redfinURL = 'https://www.redfin.com/stingray/do/location-autocomplete?'
    var redURL = redfinURL + 'location=' + address;
    redURL = redURL + '&start=0&count=10&v=2&market=socal&al=1&iss=false&ooa=true&mrs=false&region_id=37626&region_type=2';
    return redURL;
}

async function makeRedfinRequest(redfinRequest) {
    var redImgUrl = 'https://www.redfin.com';

    const body = await rp(redfinRequest);
    var jsonObject = JSON.parse(body.slice(4));
    redImgUrl = redImgUrl + jsonObject.payload.sections[0].rows[0].url;
    return redImgUrl;
}

async function getImageUrl(redImgUrl) {
    const body = await rp(redImgUrl);
    var imgUrl = cheerio('.img-card', body).attr().src;
    return imgUrl;
}

function buildResponse(imgUrl) {
    var keithResponse = {
        url: imgUrl
    };
    return keithResponse;
}