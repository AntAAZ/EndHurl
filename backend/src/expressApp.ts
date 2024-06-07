import express from 'express'
import cors from 'cors'
import passport from 'passport'
import PassportAuth from './PassportAuth'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import flash from 'connect-flash'
import path from 'path'

import LoginRoute from './routes/users/LoginRoute';
import RegisterRoute from './routes/users/RegisterRoute';
import UserRoute from './routes/users/UserRoute'
import dotenv from 'dotenv'

import MongoStore from 'connect-mongo';
import LogoutRoute from './routes/users/LogoutRoute'
import UpdateRoute from './routes/users/UpdateRoute'
import AvatarUploadRoute from './routes/avatars/AvatarUploadRoute'
import SetBioRoute from './routes/users/SetBioRoute'
import SetLocRoute from './routes/users/SetLocRoute'
import AvatarDeleteRoute from './routes/avatars/AvatarDeleteRoute'
import BorderUploadRoute from './routes/borders/BorderUploadRoute'
import BorderGetRoute from './routes/borders/BorderGetRoute'
import CountryGetRoute from './routes/countries/CountryGetRoute'
import WaterBorderGetRoute from './routes/rivers/WaterBorderGetRoute'
import WaterBorderUploadRoute from './routes/rivers/WaterBorderUploadRoute'
//import UuidGetRoute from './routes/UuidGetRoute'
import NaturalEarthGetRoute from './routes/borders/NaturalEarthGetRoute'
import NaturalEarthGetWatersRoute from './routes/rivers/NaturalEarthGetWatersRoute'
import RiverGetRoute from './routes/rivers/RiverGetRoute'
import NaturalEarthGetCityRoute from './routes/cities/NaturalEarthGetCityRoute'
import CityGetRoute from './routes/cities/CityGetRoute'
import CityUploadRoute from './routes/cities/CityUploadRoute'
import AddMapRoute from './routes/maps/AddMapRoute'
import MapGetRoute from './routes/maps/MapGetRoute'
import MapGetAllRoute from './routes/maps/MapGetAllRoute'
class expressApp
{
    private express: express.Application;
    constructor() 
    {
        dotenv.config();
        this.express = express()
            .use(express.json({limit: '50mb'}))
            .use(express.urlencoded({
                extended: true,
                limit: '50mb'
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
                    //mongoUrl: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yymov.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
                    mongoUrl: `mongodb://127.0.0.1:27017/${process.env.DB_NAME}?retryWrites=true&w=majority`
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
            SetLocRoute,
            BorderUploadRoute,
            BorderGetRoute,
            NaturalEarthGetRoute,
            CountryGetRoute,
            RiverGetRoute,
            WaterBorderGetRoute,
            WaterBorderUploadRoute,
            NaturalEarthGetCityRoute,
            CityGetRoute,
            CityUploadRoute,
            NaturalEarthGetWatersRoute,
            MapGetRoute,
            MapGetAllRoute,
            AddMapRoute
        ]);
        this.express.use('/', router);
        this.express.use('/public/', express.static(path.join(__dirname, '../public')))
    }

    public getExpress() : express.Application {
        return this.express
    }

}

export default new expressApp().getExpress();