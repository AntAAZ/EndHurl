
import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid'
class UuidGetRoute {

    private router: Router = Router();

    constructor() 
    {    
        this.router.get('/uuidGet', this.handleGetReq);
    }

    private handleGetReq(req: Request, res: Response, next: NextFunction)
    {
        return res.send(uuidv4());
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new UuidGetRoute().getRouter();