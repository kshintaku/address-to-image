
module.exports = (errorCode, message) => {
    throw ([errorCode, message]);
};
