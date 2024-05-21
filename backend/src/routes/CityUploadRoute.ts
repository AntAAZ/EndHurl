
import { Router, Request, Response, NextFunction } from 'express';
import City from '../models/City';
import Country from '../models/Country';

class CityUploadRoute {

    private router: Router = Router()

    constructor() {
        this.router.post('/cityUpload', this.handlePostReq)
    }

    private async handlePostReq(req: any, res: Response, next: NextFunction) 
    {
        try {
            if (!req.isAuthenticated()) 
                {
                return res.status(400).send({ message: `You are not logged in` });
            }
        
            let { point, type, name, area, pop_max, countryName, mapName } = req.body;
            console.log(req.body)
            if (!mapName || mapName.length < parseInt(process.env.MAPNAME_MIN_CHARS || "") ||
                mapName.length > parseInt(process.env.MAPNAME_MAX_CHARS || "")) {
                return res.status(401).send({ message: `Your map name is invalid` });
            }
        
            if (!countryName || countryName.length < parseInt(process.env.COUNTRYNAME_MIN_CHARS || "") ||
                countryName.length > parseInt(process.env.COUNTRYNAME_MAX_CHARS || "")) {
                return res.status(401).send({ message: `Your country name is invalid` });
            }
        
            if (!point || !(point instanceof Array) || type == null || !name) {
                return res.status(401).send({ message: `Some required fields are missing or invalid` });
            }
        
            const country = await Country.findOne({ name: countryName, mapName }).lean();
            if (!country) {
                return res.status(401).send({ message: `Your country doesn't exist in this map - ${countryName}` });
            }
        
            const existingCity = await City.findOne({ name, mapName }).lean();
            const newCityObject = { point, type, name, area, pop_max, countryName, mapName }
            if (existingCity) 
            {
                await City.findOneAndUpdate(
                    { _id: existingCity._id }, newCityObject
                );
            } else {
                await new City(newCityObject).save();
            }
            return res.send("success");
        } catch (err) {
            console.error("Error in city creation/update:", err);
            return res.status(500).send({ 
                message: `Internal server error` 
            });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new CityUploadRoute().getRouter();