"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeUrl = (obj, dblEncode) => {
    let str = '';
    for (const key in obj) {
        if (typeof obj[key] == 'object') {
            for (const i in obj[key]) {
                if (str != '') {
                    str += '&';
                }
                str += key + '=' + encodeURIComponent(obj[key][i]);
            }
        }
        else {
            if (str != '') {
                str += '&';
            }
            if (dblEncode == true) {
                str += key + '=' + encodeURIComponent(encodeURIComponent(obj[key]));
            }
            else {
                str += key + '=' + encodeURIComponent(obj[key]);
            }
        }
    }
    return str;
};
//# sourceMappingURL=serializeUrl.js.map