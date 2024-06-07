
import { Router, Request, Response, NextFunction } from 'express';
import User from '../../models/User';

class SetLocRoute {

    private router: Router = Router()

    constructor() {
        this.router.post('/loc', this.handlePostReq)
    }

    private async handlePostReq(req: any, res: Response, next: NextFunction) 
    {
        if (!req.isAuthenticated()) 
        {
            res.status(400).send({ message: `You are not logged in` })
            return
        } 

        const { username, loc } = req.body

        if(!loc)
        {
            res.status(401).send({ message: `Please enter a location!` })
            return
        }

        if (req.user.username !== username)
        {
            res.status(403).send({ message: `You cannot set the location of another user!` })
            return
        }

        User.findOne({ username }, async(err: Error, doc: any) => {
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
            doc.loc = loc
            await doc.save()
            return res.send("success")
        })
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default new SetLocRoute().getRouter();