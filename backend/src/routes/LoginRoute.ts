
import { Router, Request, Response, NextFunction, request, response } from 'express';
import passport from 'passport';

class LoginRoute {

    private router: Router = Router();

    constructor() {
        this.router.post('/login', this.handlePostReq);
    }

    private async handlePostReq(req: Request, res: Response, next: NextFunction) 
    {
        if(req.isAuthenticated()) 
        {
            res.status(400).send({message: `You are already logged in`})
            return
        }
        
        passport.authenticate('local', (err, user, info) => {
            if(err) return next(err)
            if (!user) return res.status(401).send({ message: info.message })
            req.login(user, async(err: Error) => {
                if(err) return next(err);
                return res.send({message: 'success'})
            })
        })(req, res, next)
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new LoginRoute().getRouter();