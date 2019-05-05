const request = require('request').defaults({ jar: true });
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
    // These variables need to change for bucket and account
    projectId: 'realestateproj',
    keyFilename: 'realestateproj.json'
})
const bucket = storage.bucket('realestateproj');
const uuidv1 = require('uuid/v1');


module.exports = (uri) => {
    var extension = uri.split('/');
    var fileName = uuidv1() + '_' + extension[extension.length - 1];
    const file = bucket.file(fileName);
    const writeStream = file.createWriteStream();
    return new Promise((resolve, reject) => {
        request({ url: uri }, function (err, response, body) {
            if (err || response.statusCode != 200) { reject({ response, err }); }
        })
            .pipe(writeStream)
            .on('finish', function () {
                file.makePublic();
                fileName = 'https://storage.googleapis.com/' + storage.projectId + '/' + fileName;
                resolve(fileName);
            })
            .on('error', function () {
                reject('unable to upload');
            });
    }).then(fileName => {
        return [200, fileName];
    }).catch(err => {
        throw ([404, err.err.code]);
    });
};
