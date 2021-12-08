
import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs'
import User from '../models/User';
import { UserInterface } from '../interfaces/UserInterface';

class RegisterRoute {

    private router: Router = Router();

    constructor() {    
        this.router.post('/register', this.handlePostReq)
    }

    private async handlePostReq(req: Request, res: Response, next: NextFunction)
    {

        if(req.isAuthenticated()) 
        {
            res.status(400).send({message: `You are already logged in`})
            return
        }
        const { username, password } = req.body;

        if(!username || !password || typeof username !== "string" || typeof password !== "string")
        {
            res.status(400).send({message: `Missing credentials`})
            return
        }
        if(username.length < parseInt(process.env.USERNAME_MIN_CHARS || "") ||
            username.length > parseInt(process.env.USERNAME_MAX_CHARS || ""))
        {
            res.status(400).send({message: `Your username must have between ${process.env.USERNAME_MIN_CHARS}
                and ${process.env.USERNAME_MAX_CHARS} symbols`})
            return
        }
        if(!username.match(/^[a-z0-9]+$/i))
        {
            res.status(400).send({message: `Your username must be alphanumeric`})
            return
        }
        if(password.length < parseInt(process.env.PASSWORD_MIN_CHARS || "") ||
            password.length > parseInt(process.env.PASSWORD_MAX_CHARS || ""))
        {
            res.status(400).send({message: `Your password must have between ${process.env.PASSWORD_MIN_CHARS}
                and ${process.env.PASSWORD_MAX_CHARS} symbols`})
            return
        }

        User.findOne({username}, async (err: Error, doc: UserInterface) => 
        {
            if(err) 
            {
                res.status(422).send({
                    message: `Unable to process the instructions on the server. Please use the contact form to report this issue`
                })
                return
            }

            if(doc) 
            {
                return res.status(400).send({message: `The username already exists!`})
            }
            
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const newUser = new User({
                username: req.body.username,
                password: hashedPassword
            })

            await newUser.save();

            req.login(newUser, async(err: Error) => { 
                if(err) 
                {
                    res.status(422).send({
                        message: `Unable to process the instructions on the server. Please use the contact form to report this issue`
                    })
                    return;
                }
            })
            return res.send("success")
        })
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new RegisterRoute().getRouter();