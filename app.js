var request = require('request');
request = request.defaults({ jar: true });
const express = require('express');
const cheerio = require('cheerio');
const uuidv1 = require('uuid/v1');
const fs = require('fs');
const {Storage} = require('@google-cloud/storage');
const storage = new Storage({
    // These variables need to change for bucket and account
    projectId: 'realestateproj',
    keyFilename: 'realestateproj.json'
})
const bucket = storage.bucket( 'realestateproj' );
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

var realObject = {
    input: '4242 Locust Ave, Long Beach, CA, 90807',
    area_types: ['address', 'neighborhood', 'city', 'country', 'postal_code', 'street']
};

var zillowAddress = '2248+w+230th';
var realAddress = '4242%2520Locust%2520Ave%252C%2520Long%2520Beach%252C%2520CA%252C%252090807&area_types=address&area_types=neighborhood&area_types=city&area_types=county&area_types=postal_code&area_types=street';
var homeSnapAddress = '20955 Brighton';

app.get('/propertyPhoto/:address', function (req, res) {
    const address = req.params.address;
    console.log('Address received: ' + address);
    var newUrl = buildRequest(address);
    makeRedfinRequest(newUrl)
        .then(redfinURL => getImageUrl(redfinURL))
        .then(imgUrl => buildResponse(imgUrl))
        .then(cloudUrl => gCloudUpload(cloudUrl.url))
        .then(keithResponse => res.status(keithResponse[0]).send(keithResponse[1]))
        .catch(err => res.status(err[0]).send(err[1]));
});

app.listen(3000, function () {
    console.log("Started on PORT 3000");
});

// console.log(serializeURL(realObject));
// console.log(realAddress);


// Method to ping Redfin for connectivity
// testRedfin()
//     .then(output => console.log(output))
//     .catch(err => console.log(err[0] + ' ' + err[1]));

// TODO: Better analyze Zillow
// makeZillowRequest(zillowAddress);

// var newUrl = buildRequest('2645%20west%20231st');
// makeRedfinRequest(newUrl)
//     .then(redfinUrl => getImageUrl(redfinUrl))
//     .then(imgUrl => buildResponse(imgUrl))
//     .then(sendCloud => gCloudUpload(sendCloud.url))
//     .then(keithResponse => console.log(keithResponse))
//     .catch(err => console.log(err));

// TODO: Fix address input
// makeRealtorRequest(realAddress)
//     .then(realAddUrl => getRealImageUrl(realAddUrl))
//     .then(imgUrl => gCloudUpload(imgUrl))
//     .then(newUrl => console.log(newUrl))
//     .catch(err => console.log(err));


// TODO: Finish HomeSnap at later date due to site loads weird
// (scripts pulling in data instead of page with data)
// makeHomeSnapRequest(homeSnapAddress)
//     .then(homeSnapImgUrl => getHomeSnapImgUrl(homeSnapImgUrl))
//     .then(imgUrl => console.log(imgUrl));


function buildRequest(address) {
    var redfinURL = 'https://www.redfin.com/stingray/do/location-autocomplete?'
    redfinObject.location = address;
    redfinURL += serializeURL(redfinObject);
    return redfinURL;
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
    return new Promise((resolve, reject) => {
        request({ url: redImgUrl }, function (err, response, body) {
            if (err || response.statusCode != 200) { reject({response, err}); }
            resolve(body);
        })
    }).then(body => {
        var imgUrl = cheerio('.img-card', body).attr().src;
        if (typeof imgUrl === 'undefined') {
            throw ([404, 'No image found in RedFin']);
        }
        return imgUrl;
    }).catch(error => {
        if (typeof error.response != 'undefined') {
            throw (error.response.statusCode, 'Redfin not responding');
        }
        else {
            throw ([404, error.err.code]);
        }
    });
}


function buildResponse(imgUrl) {
    imgUrl = imgUrl.replace('mbpaddedwide', 'bigphoto');
    imgUrl = imgUrl.replace('genMid\.', '');
    var keithResponse = {
        url: imgUrl
    };
    return keithResponse;
}


function makeZillowRequest(address) {
    // var zilUrl = 'https://www.zillow.com/search/RealEstateSearch.htm?citystatezip=';
    var zilUrl = 'https://www.zillow.com/homes/';
    var zilUrl = zilUrl + address + '_rb/';
    console.log(zilUrl);

    var options = {
        method: 'GET',
        url: 'https://www.zillow.com/homes/2248+w+230th_rb/',
        headers:
        {
            cookie: 'zgsession=1|378a942f-2184-4563-94f1-814ac45578e5; zguid=24|%24d84afb5a-900d-4e20-8a67-935ff842b2d5; abtest=3|DOjqyTP_AMMxPSaQ8w; pxvid=ad344f60-3abc-11e9-93d0-9b44f4fa3e50; _pxvid=ad344f60-3abc-11e9-93d0-9b44f4fa3e50; ajs_user_id=null; ajs_group_id=null; ajs_anonymous_id=%22d84afb5a-900d-4e20-8a67-935ff842b2d5%22; G_ENABLED_IDPS=google; JSESSIONID=54CEF49F78BD1A30E15A31B30F3BABF2; _pxff_tm=1; search=6|1554568957213%7Crect%3D33.830052%252C-118.310137%252C33.80224%252C-118.333097%26zm%3D14%26disp%3Dmap%26mdm%3Dauto%26p%3D1%26z%3D1%26fs%3D1%26fr%3D0%26mmm%3D1%26rs%3D0%26ah%3D0%26singlestory%3D0%09%01%0996159%09%09%092%090%09US_%09; AWSALB=P3XeChNhedsH2o08PcoF0Sb2xR7tnrH0IElgj6sK7hDtAKg62qBb+OVus6VRSu35fAdY3s8CuBC4vut2pISZ5QYgDUC9ff7WAWhrISnyP9+4ISYvdtAH72C9oSkZ; _px3=eee020384ec3a37a1f482f901f924db45484e5383becd0fa78c374f4f86704a8:Y1BjGgQu9aEFys8BGGkgr+C1KeegWTYf+7EPyoaBh70D5gZeVy33v7r5Pwy4q858UOiQriA9sUZzjZsQ0NZ2zw==:1000:wCG5HEOWvURDapg8MJHmcDr125bs4ySyU63HI7xdIUJTNCoCZ2x19aT3S0+VobLVUY1qYVNKac3+qJWRDYkm8dFc7SobS/3u7Wn9avXuw/lVbnTQY6/YPU0NmvjuRVpQ8GS/LvdmOnZkf4HgZmTV186nTaRgjntWqHITnis1NeE=',
            // 'Postman-Token': 'dd9659d2-8d8e-44b8-8b21-c2a47d9ab4fe',
            // 'accept-language': 'en-US,en;q=0.9',
            // 'accept-encoding': 'gzip, deflate, br',
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36',
            'upgrade-insecure-requests': '1',
            'cache-control': 'max-age=0,no-cache',
            authority: 'www.zillow.com'
        }
    };

    return new Promise(resolve => {
        request(options, function (err, response, body) {
            // request({ url: zilUrl }, function (err, response, body) {
            if (err) { console.log(err); return; }
            console.log(body);
            resolve(body);
        })
    }).then(body => {
        var imgUrl = cheerio('.photo-tile-image', body).attr().src;
        return imgUrl;
    })
}


function makeRealtorRequest(address) {
    var realUrl = 'https://www.realtor.com/api/v1/geo-landing/parser/suggest/?input=' + address;
    var realAddUrl = 'https://www.realtor.com/realestateandhomes-detail/M';

    return new Promise(resolve => {
        request({ url: realUrl }, function (err, response, body) {
            if (err) { console.log(err); return; }
            resolve(body);
        })
    }).then(body => {
        var jsonObject = JSON.parse(body);
        try { realAddUrl = realAddUrl + jsonObject.result[0].mpr_id; }
        catch (err) { throw 'address not found'; }
        return realAddUrl;
    })
}


function getRealImageUrl(realAddUrl) {
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


function makeHomeSnapRequest(address) {
    var homeSnapUrl = 'https://www.homesnap.com/service/Misc/Search';
    var homeSnapImgUrl = 'https://www.homesnap.com/';
    var options = {
        method: 'POST',
        url: homeSnapUrl,
        headers: {
            Connection: 'keep-alive',
            'X-Requested-With': 'XMLHttpRequest',
            Referer: 'https://www.homesnap.com/',
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            Origin: 'https://www.homesnap.com'
        },
        body: JSON.stringify({"text":address,"polygonType":1,"skip":0,"take":8,"submit":false})
    };

    return new Promise(resolve => {
        request(options, function (err, response, body) {
            if (err) { console.log(err); return; }
            resolve(body);
        })
    }).then(body => {
        var jsonObject = JSON.parse(body);
        try { homeSnapImgUrl = homeSnapImgUrl + jsonObject.d.Properties[0].Url; }
        catch (err) { throw 'address not found'; }
        return homeSnapImgUrl;
    })
}


// Unable to grab the image due to the HTML response not consisting of any img tags
// Page that is returned is fairly blank with a checkbox and some buttons (check actual response)
function getHomeSnapImgUrl(homeSnapUrl) {
    var options = {
        method: 'GET',
        url: homeSnapUrl,
        headers: {
            Connection: 'close',
            'X-Requested-With': 'XMLHttpRequest',
            Referer: 'https://www.homesnap.com/',
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            Origin: 'https://www.homesnap.com'
        }
    };
    return new Promise(resolve => {
        request(options, function (err, response, body) {
            console.log(response.statusCode);
            if (err) { console.log(err); return; }
            console.log(body);
            resolve(body);
        })
    }).then(body => {
        var imgUrl = cheerio('.listingImage large', body);
        return imgUrl;
    })
}


function gCloudUpload(uri) {
    var extension = uri.split('/');
    var fileName = uuidv1() + '_!!_' + extension[extension.length -1];
    const file = bucket.file(fileName);
    const writeStream = file.createWriteStream();
    return new Promise((resolve, reject) => {
        request({ url: uri }, function (err, response, body) {
            if (err || response.statusCode != 200) { reject({response, err}); }
            })
            .pipe(writeStream)
            .on('finish', function() {
                file.makePublic();
                fileName = 'https://storage.googleapis.com/' + storage.projectId + '/' + fileName;
                resolve(fileName);
            })
            .on('error', function() {
                reject('unable to upload');
            });
        }).then(fileName => {
            return [200, fileName];
        }).catch(err => {
            throw ([404, err.err.code]);
        });
}


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


function serializeURL(obj) {
    var str = "";
    for (var key in obj) {
        if ( typeof obj[key] == 'object') {
            for (var i in obj[key]) {
                if (str != "") {
                    str += "&";
                }
                str += key + "=" + encodeURIComponent(obj[key][i]);
            }
        }
        else {
            if (str != "") {
                str += "&";
            }
            str += key + "=" + encodeURIComponent(obj[key]);
        }
    }
    return str;
}