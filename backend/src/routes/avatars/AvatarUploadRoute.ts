import User from '../../models/User';
import { Router, Request, Response, NextFunction } from 'express';
import uploadAvatar from '../../middlewares/uploadAvatarMiddleware';

class AvatarUploadRoute {

    private router: Router = Router();

    constructor() {
        this.router.post('/uploadAvatar', uploadAvatar.single('avatar'), this.handlePostReq);
    }

    private async handlePostReq(req: any, res: Response, next: NextFunction) 
    {
        if(!req.isAuthenticated()) 
        {
            res.status(401).send({message: `You are not logged in`})
            return
        }
        if(!req.file)
        {
            res.status(400).send({message: `Please select a file to upload`})
            return
        }
        let username = req.user.username
        User.findOne({username}, async (err: Error, doc: any) => 
        {
            if(err) 
            {
                res.status(422).send({
                    message: `Unable to process the instructions on the server.`
                })
                return
            }

            doc.avatar = `${`${req.protocol}://${req.get('host')}`}/public/avatars/${req.file.filename}`
            await doc.save();

            return res.send("success")
        })
    
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new AvatarUploadRoute().getRouter();