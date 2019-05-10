import {getRealtorImage} from '../../lib/realtor';
import {Request, Response} from 'express';

export const realtorRequest = (req: Request, res: Response) => {
    const address = req.params.address;
    console.log('Address received: ' + address);

    getRealtorImage(address)
        .then( imgUrl => res.status(200).send({url: imgUrl}) )
        .catch( err => res.status(500).send(err) );
};
