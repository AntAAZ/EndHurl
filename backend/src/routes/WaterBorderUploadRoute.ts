
import { Router, Request, Response, NextFunction } from 'express';
import WaterBorder from '../models/WaterBorder';
import River from '../models/River';
import { v4 as uuidv4 } from 'uuid'

class WaterBorderUploadRoute {

    private router: Router = Router()

    constructor() {
        this.router.post('/waterBorderUpload', this.handlePostReq)
    }

    private async handlePostReq(req: any, res: Response, next: NextFunction) 
    {
        if (!req.isAuthenticated()) 
        {
            res.status(400).send({ message: `You are not logged in` })
            return
        } 
        
        const { points, name, mapName } = req.body
        console.log(points)

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
        if(!name)
        {
            res.status(401).send({ message: `Your selection name is missing` })
            return
        }
        
        if(!points || !(points instanceof Array))
        {
            res.status(401).send({ message: `Your border points are missing` })
            return
        }
        River.findOne({ name, mapName }, async(err: Error, doc: any) => {
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
                await new River({ name, mapName }).save()
            }
            let uuidVal = uuidv4()
            for(let i = 0; i < points.length; i++)
            {
                await new WaterBorder({
                    point: points[i], selection: uuidVal, name, mapName
                }).save()
            }
            return res.send("success")
        }).lean()
        
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new WaterBorderUploadRoute().getRouter();