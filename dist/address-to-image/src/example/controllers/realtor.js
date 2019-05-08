"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const realtor_1 = require("../../lib/realtor");
exports.realtorRequest = (req, res) => {
    const address = req.params.address;
    console.log('Address received: ' + address);
    realtor_1.getRealtorImage(address)
        .then(imgUrl => res.status(200).send({ url: imgUrl }))
        .catch(err => res.status(500).send(err));
};
//# sourceMappingURL=realtor.js.map