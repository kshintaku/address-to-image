import {Request, Response} from 'express';
import {getTruliaImage} from '../../lib/trulia';

export const truliaRequest = (req: Request, res: Response) => {
    const address = req.params.address;
    getTruliaImage(address)
        .then( imageLink => res.status(200).send({url: imageLink}) )
        .catch( err => res.status(500).send(err));
};
