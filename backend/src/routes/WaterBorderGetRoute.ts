
import { Router, Request, Response, NextFunction } from 'express';
import WaterBorder from '../models/WaterBorder';

class WaterBorderGetRoute {

    private router: Router = Router()

    constructor() {
        this.router.get('/waterBordersGet', this.handleGetReq)
    }

    private async handleGetReq(req: any, res: Response, next: NextFunction) 
    {
        if (!req.isAuthenticated()) 
        {
            res.status(400).send({ message: `You are not logged in` })
            return
        } 

        let { mapName } = req.query
        WaterBorder.find(
            { mapName }, 
            {'point': 1, 'selection': 1, 'name': 1, _id: 0 }, 
            (err: Error, doc: any) => {
            //console.log(doc)
            if(err) 
            {
                res.status(422).send({
                    message: `Unable to process the instructions on the server. Please use the contact form to report this issue`
                })
                return
            }
            if(!doc)
            {
                res.send([])
                return
            }
            res.send(doc)
        }).lean()
        return
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new WaterBorderGetRoute().getRouter();