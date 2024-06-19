
import { Router, Request, Response, NextFunction } from 'express';
import Border from '../../models/Border';
import Country from '../../models/Country';

class BorderUploadRoute {

    private router: Router = Router()

    constructor() {
        this.router.post('/borderUpload', this.handlePostReq)
    }

    private async handlePostReq(req: any, res: Response, next: NextFunction) 
    {
        const { points, countryName, mapName } = req.body;
        try {

            if (!req.isAuthenticated()) {
                res.status(400).send({ message: 'You are not logged in' });
                return;
            }
            if (!mapName || !countryName) {
                res.status(401).send({ message: 'Map name or country name is missing' });
                return;
            }
            const mapNameLength = mapName.length;
            const countryNameLength = countryName.length;
            const minMapNameLength = parseInt(process.env.MAPNAME_MIN_CHARS || '0', 10);
            const maxMapNameLength = parseInt(process.env.MAPNAME_MAX_CHARS || '0', 10);
            const minCountryNameLength = parseInt(process.env.COUNTRYNAME_MIN_CHARS || '0', 10);
            const maxCountryNameLength = parseInt(process.env.COUNTRYNAME_MAX_CHARS || '0', 10);

            if (mapNameLength < minMapNameLength || mapNameLength > maxMapNameLength ||
                countryNameLength < minCountryNameLength || countryNameLength > maxCountryNameLength) {
                res.status(401).send({
                    message: `Map name must be between ${minMapNameLength}-${maxMapNameLength} characters and 
                    country name must be between ${minCountryNameLength}-${maxCountryNameLength} characters`
                });
                return;
            }
            if (!Array.isArray(points)) {
                res.status(401).send({ message: 'Border points must be an array' });
                return;
            }

            let country = await Country.findOne({ name: countryName, mapName });
            if (!country) country = await new Country({ name: countryName, mapName }).save();

            await Promise.all(points.map((point: number[]) => 
                new Border({ point, countryName, mapName }).save()
            ));
            res.send('success');
        } catch (error) {
            console.error(`Error handling border upload map: ${mapName}`, error);
            res.status(500).send({ message: 'Internal server error' });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new BorderUploadRoute().getRouter();
