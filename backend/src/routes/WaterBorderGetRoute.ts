
import { Router, Request, Response, NextFunction } from 'express';
import WaterBorder from '../models/WaterBorder';
import Country from '../models/Country';

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

        let { name, mapName } = req.query
        WaterBorder.find({name, mapName }, (err: Error, doc: any) => {
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
                return
            }
            res.send(doc)
        })
        return
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new WaterBorderGetRoute().getRouter();