
import { Router, Request, Response, NextFunction } from 'express';
import WaterBorder from '../../models/WaterBorder';

class WaterBorderGetRoute {

    private router: Router = Router()

    constructor() {
        this.router.get('/waterBordersGet', this.handleGetReq)
    }

    private async handleGetReq(req: any, res: Response, next: NextFunction) {
        if (!req.isAuthenticated()) {
            return res.status(400).send({ message: `You are not logged in` });
        } 
    
        const { mapName } = req.query;
        
        try {
            if (!mapName) {
                return res.status(404).send({ message: 'Map name is missing' });
            }
            const waterBorders = await WaterBorder.find(
                { mapName }, 
                { point: 1, name: 1, _id: 0 }
            ).lean();
            
            if (!waterBorders || waterBorders.length === 0) {
                return res.send([]);
            }
    
            return res.send(waterBorders);
        } catch (err) {
            console.error(`Error fetching river borders map: ${mapName}`, err);
            return res.status(500).send({
                message: `Internal server error`
            });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new WaterBorderGetRoute().getRouter();