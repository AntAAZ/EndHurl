
import { Router, Request, Response, NextFunction } from 'express';
let borderCountries = require('./borderCountries.json')
let splitCountries = require('./splitBorders.json')
class NaturalEarthGetRoute {

    private router: Router = Router();

    constructor() 
    {    
        this.router.get('/getNaturalEarthBorders', this.handleGetReq);
    }

    private handleGetReq(req: Request, res: Response, next: NextFunction)
    {
        if(!req.isAuthenticated())
        {   
            return res.status(401).send({message: "You are not logged in"})
        }
        let borders: any = []
        let blacklisted: any = [
            'Antarctica', 
            'Brazil', 
            'Canada', 
            'United States of America',
            'Russia',
            'China',
            'India',
            'Australia'
        ]
        let features = borderCountries.features
        for(let i = 0; i < features.length; i++)
        {
            if(blacklisted.includes(features[i].properties.SOVEREIGNT))
            {
                continue
            }
            borders.push({
                'NAME': features[i].properties.SOVEREIGNT,
                'coords': features[i].geometry.coordinates
            })
        }
        features = splitCountries.features
        for(let i = 0; i < features.length; i++)
        {
            borders.push({
                'NAME': features[i].properties.layer,
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

export default new NaturalEarthGetRoute().getRouter();