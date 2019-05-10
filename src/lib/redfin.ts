import {rejectPromise} from '../util/rejectPromise';
import {serializeUrl} from '../util/serializeUrl';
const request = require('request-promise-native').defaults({ jar: true });
// const cheerio = require('cheerio');
import * as cheerio from 'cheerio';

export class Redfin {
    readonly [Symbol.toStringTag]: 'Promise';
    private readonly redfinBaseObject = {
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
    private readonly redfinBaseUrl = 'https://www.redfin.com/stingray/do/location-autocomplete';
    private readonly redfinHostname = 'https://www.redfin.com';
    private redfinRequestUrl: string;
    private redfinImageUrl: Promise<string>;

    constructor(public _address: string) {
        this.redfinRequestUrl = `${this.redfinBaseUrl}?${serializeUrl(
            {
                ...this.redfinBaseObject,
                location: _address
            }, false
        )}`;
    }

    getImage(): Promise<string> {
        if (!this.redfinImageUrl) {
            this.redfinImageUrl = this.getPropertyPageUrl()
                .then( propertyPageUrl => {
                    return this.getImageUrl(propertyPageUrl);
                });
        }
        return this.redfinImageUrl;
    }

    private getPropertyPageUrl(): Promise<string> {
        return request(this.redfinRequestUrl).then( body => {
            let jsonObject;

            try { jsonObject = JSON.parse((<any>body).slice(4)); }
            catch (err) { return rejectPromise('redfin thinks we are robots'); }

            let resourceUrl: string;
            try { resourceUrl = jsonObject.payload.sections[0].rows[0].url; }
            catch (err) { return rejectPromise('address not found'); }

            return `${this.redfinHostname}${resourceUrl}`;
        });

    }

    private getImageUrl(_propertyPageUrl: string): Promise<string> {
        return request(_propertyPageUrl).then( body => {
            const imgUrl = cheerio('.img-card', body).attr().src;
            if (!imgUrl) { return rejectPromise('image not found'); }
            return imgUrl;
        })
        .then( (imgUrl: string) => {
            // formats
            imgUrl = imgUrl.replace('mbpaddedwide', 'bigphoto');
            imgUrl = imgUrl.replace('genMid\.', '');
            return imgUrl;
        })
        .catch(error => {
            if (typeof error.response !== 'undefined') {
                return rejectPromise('redfin is not responding');
            }
            else {
                return rejectPromise(error);
            }
        });
    }

}
