
import { Router, Request, Response, NextFunction } from 'express';
import Border from '../models/Border';
import Country from '../models/Country';

class BorderGetRoute {

    private router: Router = Router()

    constructor() {
        this.router.get('/bordersGet', this.handleGetReq)
    }

    private async handleGetReq(req: any, res: Response, next: NextFunction) 
    {
        if (!req.isAuthenticated()) 
        {
            res.status(400).send({ message: `You are not logged in` })
            return
        } 

        let { countryName, mapName } = req.query
        Border.find({ countryName, mapName },(err: Error, doc: any) => {
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
                //res.status(404).send({message: `A country with this name doesn't exist`})
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

export default new BorderGetRoute().getRouter();