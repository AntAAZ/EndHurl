
import { Router, Request, Response, NextFunction } from 'express';
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
            if (err) {
                console.error(`Error during authentication: ${err}`);
                res.status(500).send({ message: "Internal server error" });
                return
            }
            if (!user) 
            {
                res.status(401).send({ message: info.message })
                return
            }
            req.login(user, async(err: Error) => {
                if (err) {
                    console.error(`Error during authentication: ${err}`);
                    res.status(500).send({ message: "Internal server error" });
                    return
                }
                res.send({message: 'success'})
            })
        })(req, res, next)
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new LoginRoute().getRouter();
