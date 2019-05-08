"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trulia_1 = require("../../lib/trulia");
exports.truliaRequest = (req, res) => {
    const address = req.params.address;
    trulia_1.getTruliaImage(address)
        .then(imageLink => res.status(200).send({ url: imageLink }))
        .catch(err => res.status(500).send(err));
};
//# sourceMappingURL=trulia.js.map