
import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs'
import User from '../models/User';

class UpdateRoute {

    private router: Router = Router();

    constructor() {    
        this.router.post('/update', this.handlePostReq)
    }

    private async handlePostReq(req: any, res: Response, next: NextFunction)
    {

        if(!req.isAuthenticated()) 
        {
            res.status(401).send({message: `You are not logged in`})
            return
        }

        const { username, oldPassword, newPassword } = req.body;
        
        if(req.user.username !== username)
        {
            res.status(403).send({message: `You don't have permission to change another user's password`})
            return
        }

        if(!newPassword || typeof newPassword !== "string")
        {
            res.status(400).send({message: `You must enter a new password!`})
            return
        }
        if(newPassword.length < parseInt(process.env.PASSWORD_MIN_CHARS || "") ||
            newPassword.length > parseInt(process.env.PASSWORD_MAX_CHARS || ""))
        {
            res.status(400).send({message: `Your new password must have between ${process.env.PASSWORD_MIN_CHARS}
                and ${process.env.PASSWORD_MAX_CHARS} symbols`})
            return
        }

        User.findOne({username}, async (err: Error, doc: any) => 
        {
            if(err) 
            {
                res.status(422).send({
                    message: `Unable to process the instructions on the server. Please use the contact form to report this issue`
                })
                return
            }
            if(!doc) 
            {
                res.status(404).send({message: `This username doesn't exist`})
                return
            }

            bcrypt.compare(oldPassword, doc.password, async (err, result) => 
            {
                if(err) {
                    return res.status(422).send({
                        message: `Unable to process the instructions on the server. Please use the contact form to report this issue`
                    })
                }
                if(!result) return res.status(400).send({message: `Old pass must be same as your current pass`});

                doc.password = await bcrypt.hash(newPassword, 10);
                await doc.save();
    
                return res.send("success")
            })
            
        })
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new UpdateRoute().getRouter();