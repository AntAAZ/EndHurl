
import { Router, Request, Response, NextFunction } from 'express';

class UserRoute {

    private router: Router = Router();

    constructor() 
    {    
        this.router.get('/user', this.handleGetReq);
    }

    private handleGetReq(req: Request, res: Response, next: NextFunction)
    {
        if(!req.isAuthenticated())
        {   
            return res.status(401).send({message: "You are not logged in"})
        }
        console.log(req.user)
        return res.send(req.user);
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new UserRoute().getRouter();