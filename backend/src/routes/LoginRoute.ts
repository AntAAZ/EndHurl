
import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';

class LoginRoute {

    private router: Router = Router();

    constructor() 
    {    
        this.router.post('/login', this.handlePostReq);
    }

    private async handlePostReq(req: Request, res: Response, next: NextFunction)
    {
        if(req.body == undefined || !req.body.username || 
            !req.body.password || typeof req.body.username !== "string" || 
            typeof req.body.password !== "string")
        {
            res.send({message: "Improper values or credentials not entered"})
            return;
        }
        if(req.isAuthenticated())
        {
            res.send({message: "You are already logged in"})
            return;
        }
        passport.authenticate('local', async (e, user, info) => 
        {
            if(e) return next(e);
            if(info) return res.send(info);

            req.login(user, async(err: Error) => {
                if(err) return next(err);
                return res.send(user);
            });
        })(req, res, next);
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new LoginRoute().getRouter();