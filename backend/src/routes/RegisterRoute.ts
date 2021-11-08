
import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs'
import User from '../models/User';
import { UserInterface } from '../interfaces/UserInterface';

class RegisterRoute {

    private router: Router = Router();

    constructor() {    
        this.router.post('/register', this.handlePostReq);
    }

    private async handlePostReq(req: Request, res: Response, next: NextFunction)
    {

        const { username, password } = req.body;

        if(!username || !password || typeof username !== "string" || typeof password !== "string")
        {
            res.send({message: `Improper values or credentials not entered`})
            return;
        }
        
        if(req.isAuthenticated())
        {
            res.send({message: `You are already logged in`})
            return;
        }

        User.findOne({username}, async(err: Error, doc: UserInterface) => 
        {
            if(err) throw err

            if(doc) {
                res.send({message: `The username already exists!`})
                return;
            }

            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const newUser = new User({
                username: req.body.username,
                password: hashedPassword
            })

            await newUser.save();
            
            req.login(newUser, async(err: Error) => {
                if (err) throw err;
                return res.send("success")
            });
            
        })
        
    }

    public getRouter() : Router {
        return this.router;
    }
}

export default new RegisterRoute().getRouter();