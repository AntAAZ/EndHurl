
import { Router, Request, Response, NextFunction } from 'express';
let borderWaters = require('./borderWaters.json')
class NaturalEarthGetWatersRoute {

    private router: Router = Router();

    constructor() 
    {    
        this.router.get('/getNaturalEarthWaters', this.handleGetReq);
    }

    private handleGetReq(req: Request, res: Response, next: NextFunction)
    {
        if(!req.isAuthenticated())
        {   
            return res.status(401).send({message: "You are not logged in"})
        }
        let borders: any = []
        let features = borderWaters.features
        for(let i = 0; i < borderWaters.features.length; i++)
        {
            borders.push({
                'NAME': features[i].properties.name, 
                'coords': features[i].geometry.coordinates 
            })
        }
        res.send(borders)
        return
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new NaturalEarthGetWatersRoute().getRouter();