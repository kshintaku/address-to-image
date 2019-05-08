"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serializeUrl_1 = require("../util/serializeUrl");
const cheerio = require("cheerio");
const rejectPromise_1 = require("../util/rejectPromise");
const request = require('request');
const realObject = {
    input: '4242 Locust Ave, Long Beach, CA, 90807',
    area_types: ['address', 'neighborhood', 'city', 'county', 'postal_code', 'street']
};
const makeRealtorRequest = (address) => {
    realObject.input = address;
    const realUrl = 'https://www.realtor.com/api/v1/geo-landing/parser/suggest/?' + serializeUrl_1.serializeUrl(realObject, true);
    const realAddUrl = 'https://www.realtor.com/realestateandhomes-detail/M';
    return request(realUrl).then(body => {
        const jsonObject = JSON.parse(body);
        let url;
        try {
            url = jsonObject.result[0].mpr_id;
        }
        catch (err) {
            return rejectPromise_1.rejectPromise('address not found');
        }
        return `${realAddUrl}${url}`;
    });
};
const getRealImageUrl = (realAddUrl) => {
    return request(realAddUrl).then(body => {
        const imgUrl = cheerio('.modal-heroimg', body).children()[0].attribs.src;
        if (!imgUrl) {
            return rejectPromise_1.rejectPromise('image not found');
        }
        return imgUrl;
    });
};
exports.getRealtorImage = (address) => {
    return makeRealtorRequest(address)
        .then(realAddUrl => getRealImageUrl(realAddUrl));
};
//# sourceMappingURL=realtor.js.map