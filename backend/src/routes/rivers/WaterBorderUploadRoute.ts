
import { Router, Request, Response, NextFunction } from 'express';
import WaterBorder from '../../models/WaterBorder';
import River from '../../models/River';
import { v4 as uuidv4 } from 'uuid'

class WaterBorderUploadRoute {

    private router: Router = Router()

    constructor() {
        this.router.post('/waterBorderUpload', this.handlePostReq)
    }

    private async handlePostReq(req: any, res: Response, next: NextFunction) {
        if (!req.isAuthenticated()) {
            res.status(400).send({ message: `You are not logged in` });
            return
        } 
        
        const { points, name, mapName } = req.body;
    
        if (!mapName) {
            res.status(401).send({ message: `Your map name is missing` });
            return
        }
    
        const mapNameLength = mapName.length;
        const minChars = parseInt(process.env.MAPNAME_MIN_CHARS || "");
        const maxChars = parseInt(process.env.MAPNAME_MAX_CHARS || "");
    
        if (mapNameLength < minChars || mapNameLength > maxChars) {
            res.status(401).send({ message: `Map name must be ${minChars}-${maxChars} symbols` });
            return
        }
    
        if (!name) {
            res.status(401).send({ message: `Your selection name is missing` });
            return
        }
        
        if (!points || !Array.isArray(points) || points.length === 0) {
            res.status(401).send({ message: `Your border points are missing` });
            return
        }
    
        try {
            const existingRiver = await River.findOne({ name, mapName }).lean();
    
            if (!existingRiver) {
                await new River({ name, mapName }).save();
            }
    
            await Promise.all(points.map((point: number[]) => {
                new WaterBorder({ point, name, mapName }).save();
            }));
    
            res.send("success");
        } catch (err) {
            console.error(err);
            res.status(500).send({
                message: `Internal server error`
            });
        }
    }
    

    public getRouter(): Router {
        return this.router;
    }
}

export default new WaterBorderUploadRoute().getRouter();