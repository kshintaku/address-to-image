import {serializeUrl} from '../util/serializeUrl';
import * as cheerio from 'cheerio';
import {rejectPromise} from '../util/rejectPromise';
const request = require('request');

const realObject = {
    input: '4242 Locust Ave, Long Beach, CA, 90807',
    area_types: ['address', 'neighborhood', 'city', 'county', 'postal_code', 'street']
};

const makeRealtorRequest = (address): Promise<string> => {
    realObject.input = address;
    const realUrl = 'https://www.realtor.com/api/v1/geo-landing/parser/suggest/?' + serializeUrl(realObject, true);
    const realAddUrl = 'https://www.realtor.com/realestateandhomes-detail/M';

    return request(realUrl).then( body => {
        const jsonObject = JSON.parse(body);
        let url: string;
        try { url = jsonObject.result[0].mpr_id; }
        catch (err) { return rejectPromise('address not found'); }
        return `${realAddUrl}${url}`;
    });
};

const getRealImageUrl = (realAddUrl): Promise<string> => {
    return request(realAddUrl).then(body => {
        const imgUrl = cheerio('.modal-heroimg', body).children()[0].attribs.src;
        if (!imgUrl) { return rejectPromise('image not found'); }
        return imgUrl;
    });
};


export const getRealtorImage = (address): Promise<string> => {
    return makeRealtorRequest(address)
        .then(realAddUrl => getRealImageUrl(realAddUrl));
};
