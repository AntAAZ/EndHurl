
import { Router, Request, Response, NextFunction } from 'express';
import River from '../../models/River';

class RiverGetRoute {

    private router: Router = Router();

    constructor() 
    {    
        this.router.get('/riversGet', this.handleGetReq);
    }

    private async handleGetReq(req: Request, res: Response, next: NextFunction) {
        if (!req.isAuthenticated()) {
            return res.status(401).send({ message: "You are not logged in" });
        }
    
        const { name, mapName } = req.query;
    
        try {
            if (!name) {
                const rivers = await River.find({ mapName }).lean();
                return res.send(rivers);
            }
    
            const river = await River.findOne({ name, mapName }).lean();
            if (!river) {
                return res.status(404).send({ message: "River not found" });
            }
    
            return res.send(river);
            
        } catch (err) {
            console.error(`Error in river get route: ${err}`);
            return res.status(500).send({ message: "Internal server error" });
        }
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new RiverGetRoute().getRouter();