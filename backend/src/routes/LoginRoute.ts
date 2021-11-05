
import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs'
import User from '../models/User';
import passport from 'passport';

class LoginRoute {

    private router: Router = Router();

    constructor() {    
        this.router.get('/login', this.handleGetReq);
        this.router.post('/login', passport.authenticate("local"), this.handlePostReq);
    }

    private async handleGetReq(req: Request, res: Response, next: NextFunction)
    {
        res.send(req.user);
    }
    private async handlePostReq(req: Request, res: Response, next: NextFunction)
    {
        res.send('loginSuccess')
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new LoginRoute().getRouter();