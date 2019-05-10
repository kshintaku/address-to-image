export const serializeUrl = (obj, dblEncode) => {
    let str = '';
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object') {
                for (const i in obj[key]) {
                    if (str != '') {
                        str += '&';
                    }
                    str += key + '=' + encodeURIComponent(obj[key][i]);
                }
            }
            else {
                if (str !== '') {
                    str += '&';
                }
                if (dblEncode) {
                    str += key + '=' + encodeURIComponent(encodeURIComponent(obj[key]));
                }
                else {
                    str += key + '=' + encodeURIComponent(obj[key]);
                }
            }
        }
    }
    return str;
};
