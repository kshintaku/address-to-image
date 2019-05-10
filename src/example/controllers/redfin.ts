import {Request, Response} from 'express';
import {Redfin} from '../../lib/redfin';


export const redfinRequest = (req: Request, res: Response) => {
    const address = req.params.address;

    const redfinProcess = new Redfin(address);
    redfinProcess.getImage()
        .then( imgUrl =>
            res.status(200).send({url: imgUrl})
        )
        .catch( err => {
            console.error('[redfinRequest] error: ', err);
            res.status(500).send(err);
        });
};

