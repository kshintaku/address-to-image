"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rejectPromise_1 = require("../util/rejectPromise");
const serializeUrl_1 = require("../util/serializeUrl");
const request = require('request');
const truliaObj = {
    results: '5',
    query: '4242 locust ave',
    display: 'h'
};
const truliaQuery = {
    query: 'address',
    searchType: 'for_sale'
};
const makeTruliaRequest = (address) => {
    truliaObj.query = address;
    const truliaUrl = 'https://www.trulia.com/_ajax/AutoSuggest/AutoSuggest/?' + serializeUrl_1.serializeUrl(truliaObj, false);
    let truliaAdd = '';
    return request(truliaUrl).then(body => {
        const jsonObject = JSON.parse(body);
        try {
            truliaAdd = truliaAdd + jsonObject.locations[0].display;
        }
        catch (err) {
            return rejectPromise_1.rejectPromise('address not found');
        }
        return truliaAdd;
    });
};
const getImageFromAdd = (imgUrl) => {
    truliaQuery.query = imgUrl;
    const truliaQueryUrl = 'https://www.trulia.com/json/search/location/?' + serializeUrl_1.serializeUrl(truliaQuery, false);
    let getImage = '';
    return request(truliaQueryUrl).then(body => {
        const jsonObject = JSON.parse(body);
        try {
            getImage = jsonObject.url;
        }
        catch (err) {
            return rejectPromise_1.rejectPromise('address not found');
        }
        return getImage;
    });
};
const imageUrl = (url) => {
    const truliaAddPage = 'https://www.trulia.com/' + url;
    return request(truliaAddPage).then(body => {
        console.log(body);
        return 'suh dude';
    });
};
exports.getTruliaImage = (address) => {
    return makeTruliaRequest(address)
        .then(autofill => getImageFromAdd(autofill))
        .then(truliaUrl => imageUrl(truliaUrl))
        .then(imageLink => imageLink);
};
//# sourceMappingURL=trulia.js.map