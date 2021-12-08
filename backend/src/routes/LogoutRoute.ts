
import { Router, Request, Response, NextFunction } from 'express';

class LogoutRoute {

    private router: Router = Router()

    constructor() {
        this.router.get('/logout', this.handleGetReq)
    }

    private async handleGetReq(req: Request, res: Response, next: NextFunction) {
        if (!req.isAuthenticated()) {
            res.status(400).send({ message: `You are not logged in` })
            return
        } 
        req.logout()
        req.session.destroy(() => {
            res.clearCookie('connect.sid')
            res.send('success')
        });
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new LogoutRoute().getRouter();