import express from 'express'
import cors from 'cors'
import passport from 'passport'
import PassportAuth from './PassportAuth'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import flash from 'connect-flash'
import path from 'path'

import LoginRoute from './routes/LoginRoute';
import RegisterRoute from './routes/RegisterRoute';
import UserRoute from './routes/UserRoute'
import dotenv from 'dotenv'

import MongoStore from 'connect-mongo';
import LogoutRoute from './routes/LogoutRoute'
import UpdateRoute from './routes/UpdateRoute'
import AvatarUploadRoute from './routes/AvatarUploadRoute'
import SetBioRoute from './routes/SetBioRoute'
import SetLocRoute from './routes/SetLocRoute'
import AvatarDeleteRoute from './routes/AvatarDeleteRoute'

class expressApp
{
    private express: express.Application;
    constructor() 
    {
        dotenv.config();
        this.express = express()
            .use(express.json())
            .use(express.urlencoded({
                extended: true
            }))
            .use(cors({
                origin: [
                    `http://${process.env.SERVER_NAME}:${process.env.SERVER_PORT}`, 
                    `http://${process.env.SERVER_NAME}:${process.env.APP_PORT}`
                ],
                credentials: true
            }))
            .use(session({
                secret: "secretcode",
                resave: true,
                saveUninitialized: true,
                store: MongoStore.create({
                    mongoUrl: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yymov.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
                })
            }))
            .use(cookieParser())
            .use(passport.initialize())
            .use(passport.session())
            .use(flash())
            new PassportAuth();
        
        this.mountRoutes();
    }

    private mountRoutes() : void {
        const router: express.Router = express.Router();
        router.use([
            RegisterRoute, 
            LoginRoute, 
            UserRoute, 
            LogoutRoute, 
            UpdateRoute, 
            AvatarUploadRoute,
            AvatarDeleteRoute,
            SetBioRoute,
            SetLocRoute
        ]);
        this.express.use('/', router);
        this.express.use('/public/', express.static(path.join(__dirname, '../public')))
    }

    public getExpress() : express.Application {
        return this.express
    }

}

export default new expressApp().getExpress();