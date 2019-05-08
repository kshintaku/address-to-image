"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redfin_1 = require("../../lib/redfin");
exports.redfinRequest = (req, res) => {
    const address = req.params.address;
    const redfinProcess = new redfin_1.Redfin(address);
    redfinProcess.getImage()
        .then(imgUrl => res.status(200).send({ url: imgUrl }))
        .catch(err => res.status(500).send(err));
};
//# sourceMappingURL=redfin.js.map