import User from '../models/User';
import { Router, Request, Response, NextFunction } from 'express';
import uploadAvatar from '../middlewares/uploadAvatarMiddleware';

class AvatarDeleteRoute {

    private router: Router = Router();

    constructor() {
        this.router.post('/deleteAvatar', this.handlePostReq);
    }

    private async handlePostReq(req: any, res: Response, next: NextFunction) 
    {
        if(!req.isAuthenticated()) 
        {
            res.status(401).send({message: `You are not logged in`})
            return
        }

        let username = req.user.username
        User.findOne({username}, async (err: Error, doc: any) => 
        {
            if(err) 
            {
                res.status(422).send({
                    message: `Unable to process the instructions on the server. Please use the contact form to report this issue`
                })
                return
            }

            doc.avatar = null;
            await doc.save();

            return res.send("success")
        })
    
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new AvatarDeleteRoute().getRouter();