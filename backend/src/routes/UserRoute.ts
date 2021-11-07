
import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs'
import User from '../models/User';
import passport from 'passport';

class UserRoute {

    private router: Router = Router();

    constructor() 
    {    
        this.router.get('/user', this.handleGetReq);
    }

    private async handleGetReq(req: Request, res: Response, next: NextFunction)
    {
        res.send(req.user);
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new UserRoute().getRouter();