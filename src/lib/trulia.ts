import {rejectPromise} from '../util/rejectPromise';
import {serializeUrl} from '../util/serializeUrl';
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

const makeTruliaRequest = (address): Promise<string> => {
    truliaObj.query = address;
    const truliaUrl = 'https://www.trulia.com/_ajax/AutoSuggest/AutoSuggest/?' + serializeUrl(truliaObj, false);
    let truliaAdd = '';

    return request(truliaUrl).then(body => {
        const jsonObject = JSON.parse(body);
        try { truliaAdd = truliaAdd + jsonObject.locations[0].display; }
        catch (err) { return rejectPromise('address not found'); }
        return truliaAdd;
    });
};

const getImageFromAdd = (imgUrl): Promise<string> => {
    truliaQuery.query = imgUrl;
    const truliaQueryUrl = 'https://www.trulia.com/json/search/location/?' + serializeUrl(truliaQuery, false);
    let getImage = '';

    return request(truliaQueryUrl).then(body => {
        const jsonObject = JSON.parse(body);
        try { getImage = jsonObject.url; }
        catch (err) { return rejectPromise('address not found'); }
        return getImage;
    });
};

const imageUrl = (url): Promise<string> => {
    const truliaAddPage = 'https://www.trulia.com/' + url;
    return request(truliaAddPage).then( body => {
        console.log(body);
        return 'suh dude';
    });
};


export const getTruliaImage = (address): Promise<string> => {
    return makeTruliaRequest(address)
        .then(autofill => getImageFromAdd(autofill))
        .then(truliaUrl => imageUrl(truliaUrl))
        .then(imageLink => imageLink);
};
