
import { Router, Request, Response, NextFunction } from 'express';
import City from '../models/City';
import Country from '../models/Country';

class CityGetRoute {

    private router: Router = Router()

    constructor() {
        this.router.get('/citiesGet', this.handleGetReq)
    }

    private async handleGetReq(req: any, res: Response, next: NextFunction) 
    {
        if (!req.isAuthenticated()) 
        {
            res.status(400).send({ message: `You are not logged in` })
            return
        } 

        let { mapName } : any = req.query
        City.find(
            { mapName }, 
            {'point': 1, 'type': 1, 'name': 1, 'area': 1, 'pop_max': 1, 'countryName': 1, _id: 0 }, 
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

export default new CityGetRoute().getRouter();