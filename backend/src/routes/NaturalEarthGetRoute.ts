
import { Router, Request, Response, NextFunction } from 'express';
let borderCountries = require('./borderCountries.json')
class NaturalEarthGetRoute {

    private router: Router = Router();

    constructor() 
    {    
        this.router.get('/getNaturalEarthData', this.handleGetReq);
    }

    private handleGetReq(req: Request, res: Response, next: NextFunction)
    {
        if(!req.isAuthenticated())
        {   
            return res.status(401).send({message: "You are not logged in"})
        }
        //console.log(req.user)
        //console.log(borderCountries.features.length)
        let borders: any = []
        let features = borderCountries.features
        for(let i = 0; i < borderCountries.features.length; i++)
        {
            //console.log(features[i].properties.NAME)
            //if(features[i].properties.NAME == 'United Kingdom')
            //{
                borders.push({
                    'NAME': features[i].properties.SOVEREIGNT,
                    'coords': features[i].geometry.coordinates
                })
            //}
        }
        res.send(borders)
        return
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new NaturalEarthGetRoute().getRouter();