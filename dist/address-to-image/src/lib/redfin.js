"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rejectPromise_1 = require("../util/rejectPromise");
const serializeUrl_1 = require("../util/serializeUrl");
const request = require('request');
class Redfin {
    constructor(_address) {
        this._address = _address;
        this.redfinBaseObject = {
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
        this.redfinBaseUrl = 'https://www.redfin.com/stingray/do/location-autocomplete';
        this.redfinHostname = 'https://www.redfin.com';
        this.redfinRequestUrl = `${this.redfinBaseUrl}?${serializeUrl_1.serializeUrl(Object.assign({}, this.redfinBaseObject, { location: _address }), false)}`;
    }
    getImage() {
        if (!this.redfinImageUrl) {
            this.redfinImageUrl = this.getPropertyPageUrl()
                .then(propertyPageUrl => this.getImageUrl(propertyPageUrl));
        }
        return this.redfinImageUrl;
    }
    getPropertyPageUrl() {
        return request(this.redfinRequestUrl).then(body => {
            let jsonObject;
            try {
                jsonObject = JSON.parse(body.slice(4));
            }
            catch (err) {
                return rejectPromise_1.rejectPromise('redfin thinks we are robots');
            }
            let resourceUrl;
            try {
                resourceUrl = jsonObject.payload.sections[0].rows[0].url;
            }
            catch (err) {
                return rejectPromise_1.rejectPromise('address not found');
            }
            return `${this.redfinHostname}${resourceUrl}`;
        });
    }
    getImageUrl(_propertyPageUrl) {
        return request(_propertyPageUrl).then(body => {
            const imgUrl = cheerio('.img-card', body).attr().src;
            if (!imgUrl) {
                return rejectPromise_1.rejectPromise('image not found');
            }
            return imgUrl;
        })
            .then((imgUrl) => {
            // formats
            imgUrl = imgUrl.replace('mbpaddedwide', 'bigphoto');
            imgUrl = imgUrl.replace('genMid\.', '');
            return imgUrl;
        })
            .catch(error => {
            if (typeof error.response !== 'undefined') {
                return rejectPromise_1.rejectPromise('redfin is not responding');
            }
            else {
                return rejectPromise_1.rejectPromise(error.err.code);
            }
        });
    }
}
exports.Redfin = Redfin;
//# sourceMappingURL=redfin.js.map