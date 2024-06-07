
import { Router, Request, Response, NextFunction } from 'express';
import Country from '../../models/Country';

class CountryGetRoute {

    private router: Router = Router();

    constructor() 
    {    
        this.router.get('/countryGet', this.handleGetReq);
    }

    private async handleGetReq(req: Request, res: Response, next: NextFunction) {
        if (!req.isAuthenticated()) {
            return res.status(401).send({ message: "You are not logged in" });
        }
        
        const { name, mapName } = req.query;
    
        try {
            if (!mapName) {
                res.status(404).send({ message: 'Map name is missing' });
                return;
            }
            if (!name) {
                const countries = await Country.find({ mapName }).lean();
                return res.send(countries);
            } 
            const country = await Country.findOne({ name, mapName }).lean();
            if (!country) {
                return res.status(404).send({ message: "Country not found" });
            }
            return res.send(country);
        } catch (err) {
            console.error(`Error in country get route: ${err}`);
            return res.status(500).send({ message: "Internal server error" });
        }
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new CountryGetRoute().getRouter();