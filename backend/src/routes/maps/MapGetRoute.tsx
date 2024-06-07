
import { Router, Request, Response, NextFunction } from 'express';
import Map from '../../models/Map';

class MapGetRoute {

    private router: Router = Router();

    constructor() 
    {    
        this.router.get('/getMapByName', this.handleGetReq);
    }

    private async handleGetReq(req: Request, res: Response, next: NextFunction) {
        if (!req.isAuthenticated()) {
            return res.status(401).send({ message: "You are not logged in" });
        }
        
        const { name } = req.query;
    
        try {
            if (!name) {
                res.status(404).send({ message: 'Map name is missing' });
                return;
            }
            const map = await Map.findOne({ name }).lean();
            if (!map) {
                return res.status(404).send({ message: "Map not found" });
            }
            return res.send(map);
        } catch (err) {
            console.error(`Error in map get route: ${err}`);
            return res.status(500).send({ message: "Internal server error" });
        }
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new MapGetRoute().getRouter();