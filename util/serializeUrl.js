

module.exports = (obj, dblEncode) => {
    var str = "";
    for (var key in obj) {
        if (typeof obj[key] == 'object') {
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
            if (dblEncode == true) {
                str += key + "=" + encodeURIComponent(encodeURIComponent(obj[key]));
            }
            else {
                str += key + "=" + encodeURIComponent(obj[key]);
            }
        }
    }
    return str;
};
