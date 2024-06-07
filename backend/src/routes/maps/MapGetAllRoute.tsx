
import { Router, Request, Response, NextFunction } from 'express';
import Map from '../../models/Map';

class MapGetAllRoute {

    private router: Router = Router();

    constructor() 
    {    
        this.router.get('/getAllMaps', this.handleGetReq);
    }

    private async handleGetReq(req: Request, res: Response, next: NextFunction) {
        if (!req.isAuthenticated()) {
            return res.status(401).send({ message: "You are not logged in" });
        }
    
        try {
            const maps = await Map.find().lean();
            if (!maps.length) {
                return res.status(404).send({ message: "No maps found" });
            }
            return res.send(maps);
        } catch (err) {
            console.error(`Error in map get all route: ${err}`);
            return res.status(500).send({ message: "Internal server error" });
        }
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new MapGetAllRoute().getRouter();