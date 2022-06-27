
import { Router, Request, Response, NextFunction } from 'express';
import Country from '../models/Country';

class CountryGetRoute {

    private router: Router = Router();

    constructor() 
    {    
        this.router.get('/countryGet', this.handleGetReq);
    }

    private async handleGetReq(req: Request, res: Response, next: NextFunction)
    {
        if(!req.isAuthenticated())
        {   
            return res.status(401).send({message: "You are not logged in"})
        }
        //console.log(req.user)
        let { name, mapName } = req.query

        if (!name)
        {
            Country.find({ mapName }, async(err: Error, doc: any) => {
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
        Country.findOne({ name, mapName }, async(err: Error, doc: any) => {
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

    public getRouter() : Router {
        return this.router;
    }
}

export default new CountryGetRoute().getRouter();