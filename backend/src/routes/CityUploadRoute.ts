
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
        if (!req.isAuthenticated()) 
        {
            res.status(400).send({ message: `You are not logged in` })
            return
        } 
        
        let { point, type, name, area, pop_max, countryName, mapName } = req.body
        //console.log(req.body)
        if(!mapName)
        {
            res.status(401).send({ message: `Your map name is missing` })
            return
        }

        if(mapName.length < parseInt(process.env.MAPNAME_MIN_CHARS || "") ||
            mapName.length > parseInt(process.env.MAPNAME_MAX_CHARS || ""))
        {
            res.status(401).send({ message: `Map name must be
                ${process.env.MAPNAME_MIN_CHARS}-${process.env.MAPNAME_MAX_CHARS} symbols` })
            return
        }

        if(!countryName)
        {
            res.status(401).send({ message: `Your country name is missing` })
            return
        }
        if(countryName.length < parseInt(process.env.COUNTRYNAME_MIN_CHARS || "") ||
            countryName.length > parseInt(process.env.COUNTRYNAME_MAX_CHARS || ""))
        {
            res.status(401).send({ message: `Country name must be 
                ${process.env.COUNTRYNAME_MIN_CHARS}-${process.env.COUNTRYNAME_MAX_CHARS} symbols` })
            return
        }   
        if(!point || !(point instanceof Array))
        {
            res.status(401).send({ message: `Your border points are missing` })
            return
        }
        if(type == null)
        {
            res.status(401).send({ message: `Your city type is missing` })
            return
        }
        if(!name)
        {
            res.status(401).send({ message: `Your city name is missing` })
            return
        }
        
        Country.findOne({ name: countryName, mapName }, async(err: Error, doc: any) => {
            if(err) 
            {
                res.status(422).send({
                    message: `Unable to process the instructions on the server. Please use the contact form to report this issue`
                })
                return
            }
            if(!doc) 
            {
                res.status(401).send({ message: `Your country doesn't exist in this map - ${countryName}` })
                return
            }
            City.findOne({ name, area, mapName }, async(err: Error, doc: any) => {
                if(err) 
                {
                    res.status(422).send({
                        message: `Unable to process the instructions on the server. Please use the contact form to report this issue`
                    })
                    return
                }
                if(doc)
                {
                    res.status(401).send({ 
                        message: `Your city with this name and area already exists` 
                    })
                    return
                }
                await new City({
                    point, type, name, area, pop_max, countryName, mapName
                }).save()
                res.send("success")
            }).lean()
        }).lean()
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new CityUploadRoute().getRouter();