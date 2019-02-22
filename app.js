var request = require('request');

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

console.log(addressToURL(propertiesObject.location));

function addressToURL(address) {
    var redfinURL = 'https://www.redfin.com/stingray/do/location-autocomplete?'
    var redURL = redfinURL + 'location=' + address;
    redURL = redURL + '&start=0&count=10&v=2&market=socal&al=1&iss=false&ooa=true&mrs=false&region_id=37626&region_type=2';

    request({ url: redURL }, function (err, response, body) {
        if (err) { console.log(err); return; }
        var jsonObject = JSON.parse(body.slice(4));
        console.log('URL: ' + jsonObject.payload.sections[0].rows[0].url);
    });
}