
import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';

class LogoutRoute {

    private router: Router = Router();

    constructor() 
    {    
        this.router.get('/logout', this.handleGetReq);
    }

    private async handleGetReq(req: Request, res: Response, next: NextFunction)
    {
        req.logout();
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new LogoutRoute().getRouter();