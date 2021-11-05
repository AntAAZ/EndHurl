import express from 'express'
import cors from 'cors'
import passport from 'passport'
import passportLocal from 'passport-local'
import cookieParser from 'cookie-parser'
import session from 'express-session'
class expressApp 
{
    private express: express.Application;

    constructor() {
        this.express = express()
            .use(express.json())
            .use(cors({
                origin: `https://${process.env.SERVER_NAME}:${process.env.SERVER_PORT}`,
                credentials: true
            }))
            .use(session({
                secret: "secretcode",
                resave: true,
                saveUninitialized: true
            }))
            .use(cookieParser())
            .use(passport.initialize())
            .use(passport.session())
    }

    public getExpress() : express.Application {
        return this.express
    }

}

export default new expressApp().getExpress();