
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

        let { mapName } : any = req.query
        
        Border.find(
            { mapName }, 
            {'point': 1, 'selection': 1, 'countryName': 1, _id: 0 }, 
            (err: Error, doc: any) => {
            if(err) 
            {
                res.status(422).send({
                    message: `Unable to process the instructions on the server. Please use the contact form to report this issue`
                })
                return
            }
            if(!doc)
            {
                return res.send([])
            }
            return res.status(201).send(doc)
        }).sort({mapName: 1}).lean()
        
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new BorderGetRoute().getRouter();