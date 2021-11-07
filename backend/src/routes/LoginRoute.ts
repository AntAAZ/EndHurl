
import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';

class LoginRoute {

    private router: Router = Router();

    constructor() 
    {    
        this.router.post('/login', passport.authenticate("local"), this.handlePostReq);
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