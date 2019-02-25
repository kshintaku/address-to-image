var request = require('request');
var $ = require('cheerio');

var propertiesObject = {
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

addressToURL(propertiesObject.location);

function addressToURL(address) {
    var redImgUrl = 'https://www.redfin.com';
    var redfinURL = 'https://www.redfin.com/stingray/do/location-autocomplete?'
    var redURL = redfinURL + 'location=' + address;
    redURL = redURL + '&start=0&count=10&v=2&market=socal&al=1&iss=false&ooa=true&mrs=false&region_id=37626&region_type=2';

    request({ url: redURL }, function (err, response, body) {
        if (err) { console.log(err); return; }
        var jsonObject = JSON.parse(body.slice(4));
        redImgUrl = redImgUrl + jsonObject.payload.sections[0].rows[0].url;
        urlToImgLink(redImgUrl);
        console.log('URL: ' + redImgUrl);
    });
}

function urlToImgLink(url) {
    // This will grab the image url from the individual property page
    // Sample redfin image url: 'https://www.redfin.com/PA/Harrisburg/4242-Locust-Ln-17109/home/123764313'
    request({ url: url }, function (err, response, body) {
        if (err) { console.log(err); return; }
        // console.log($('.img-card', body).length);
        console.log($('.img-card', body).attr().src);
    });
}