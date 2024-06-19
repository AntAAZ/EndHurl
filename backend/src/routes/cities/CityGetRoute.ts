
import { Router, Request, Response, NextFunction } from 'express';
import City from '../../models/City';
class CityGetRoute {
    private router: Router = Router()

    constructor() {
        this.router.get('/citiesGet', this.handleGetReq)
    }

    private async handleGetReq(req: any, res: Response, next: NextFunction) {
        try {
            if (!req.isAuthenticated()) {
                return res.status(400).json({ message: "You are not logged in" });
            }
            const { mapName } = req.query;
            const cities = await City.find({ mapName }, { _id: 0, __v: 0 }).lean();
            if (!cities || cities.length === 0) {
                return res.status(404).json({ message: "No cities found" });
            }
            return res.status(200).json(cities);
        } catch (err) {
            console.error("Error in City find route:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    public getRouter(): Router {
        return this.router;
    }
}

export default new CityGetRoute().getRouter();