var request = require('request');
var jar = request.jar();
var cookie = request.cookie("name=Jon");

jar.setCookie(cookie);

var propertiesObject = {
    location:'2645%20west%20231st',
    start:'0',
    count:'10',
    v:'2',
    market:'socal',
    ai:'1',
    iss:'false',
    ooa:'true',
    mrs:'false',
    region_id:'37626',
    region_type:'2'
};

request({url:'http://www.redfin.com/stingray/do/location-autocomplete?', qs:propertiesObject, jar:jar}, function(err, response, body) {
    if(err) { console.log(err); return; }
    console.log("Get response: " + response.statusCode);
    // console.log("Get response: " + response.statusMessage);
    console.log("Get body: " + body);
});