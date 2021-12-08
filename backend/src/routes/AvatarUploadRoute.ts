import User from '../models/User';
import { Router, Request, Response, NextFunction } from 'express';
import upload from '../middlewares/uploadMiddleware';

class AvatarUploadRoute {

    private router: Router = Router();

    constructor() {
        this.router.post('/uploadAvatar', upload.single('avatar'), this.handlePostReq);
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
        console.log(req.file)
        User.findOne({username}, async (err: Error, doc: any) => 
        {
            if(err) 
            {
                res.status(422).send({
                    message: `Unable to process the instructions on the server. Please use the contact form to report this issue`
                })
                return
            }

            doc.avatar = `${`${req.protocol}://${req.get('host')}`}/public/${req.file.filename}`
            console.log(doc.avatar)
            await doc.save();

            return res.send("success")
        })
    
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new AvatarUploadRoute().getRouter();