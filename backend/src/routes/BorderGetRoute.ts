
import { Router, Request, Response, NextFunction } from 'express';
import Border from '../models/Border';
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

        try {
            if (!mapName) {
                res.status(401).send({ message: 'Map name is missing' });
                return;
            }
            const borders = await Border.find(
                { mapName }, 
                { point: 1, countryName: 1, _id: 0 }
            ).sort({ countryName: 1 }).lean();
        
            if (!borders || borders.length === 0) {
                return res.send([]);
            }
        
            return res.status(200).send(borders);
        } catch (error) {
            console.error(`Error fetching country borders map: ${mapName}`, error);
            return res.status(500).send({
                message: `Internal server error`
            });
        }
        
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new BorderGetRoute().getRouter();