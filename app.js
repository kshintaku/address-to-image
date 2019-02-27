var request = require('request');
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
        .catch(err => res.status(500).send(err));
});

app.listen(3000, function () {
    console.log("Started on PORT 3000");
});

function buildRequest(address) {
    var redfinURL = 'https://www.redfin.com/stingray/do/location-autocomplete?'
    var redURL = redfinURL + 'location=' + address;
    redURL = redURL + '&start=0&count=10&v=2&market=socal&al=1&iss=false&ooa=true&mrs=false&region_id=37626&region_type=2';
    return redURL;
}

function makeRedfinRequest(redfinRequest) {
    var redImgUrl = 'https://www.redfin.com';

    return new Promise(resolve => {
        request({ url: redfinRequest }, function (err, response, body) {
            if (err) { console.log(err); return; }
            resolve(body);
        })
    }).then(body => {
        var jsonObject = JSON.parse(body.slice(4));
        try { redImgUrl = redImgUrl + jsonObject.payload.sections[0].rows[0].url; }
        catch (err) { throw 'address not found'; }
        return redImgUrl;
    })
}

function getImageUrl(redImgUrl) {
    return new Promise(resolve => {
        request({ url: redImgUrl }, function (err, response, body) {
            if (err) { console.log(err); return; }
            resolve(body);
        })
    }).then(body => {
        var imgUrl = cheerio('.img-card', body).attr().src;
        return imgUrl;
    })
}

function buildResponse(imgUrl) {
    imgUrl = imgUrl.replace('mbpaddedwide', 'bigPhoto');
    imgUrl = imgUrl.replace('genMid\.', '');
    var keithResponse = {
        url: imgUrl
    };
    return keithResponse;
}