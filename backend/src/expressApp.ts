import express from 'express'
import cors from 'cors'
import passport from 'passport'
import PassportAuth from './PassportAuth'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import flash from 'connect-flash'
import path from 'path'
import http from 'http'
import LoginRoute from './routes/users/LoginRoute';
import RegisterRoute from './routes/users/RegisterRoute';
import UserRoute from './routes/users/UserRoute'
import dotenv from 'dotenv'
import { Server, Socket } from 'socket.io';
import sharedSession from 'express-socket.io-session';
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
import NaturalEarthGetRoute from './routes/borders/NaturalEarthGetRoute'
import NaturalEarthGetWatersRoute from './routes/rivers/NaturalEarthGetWatersRoute'
import RiverGetRoute from './routes/rivers/RiverGetRoute'
import NaturalEarthGetCityRoute from './routes/cities/NaturalEarthGetCityRoute'
import CityGetRoute from './routes/cities/CityGetRoute'
import CityUploadRoute from './routes/cities/CityUploadRoute'
import AddMapRoute from './routes/maps/AddMapRoute'
import MapGetRoute from './routes/maps/MapGetRoute'
import MapGetAllRoute from './routes/maps/MapGetAllRoute'
import AddGameByPropsRoute from './routes/games/AddGameByPropsRoute'
import AddUserGameDataRoute from './routes/games/AddUserGameDataRoute'
import GetGameByLinkRoute from './routes/games/GetGameByLinkRoute'
import GetUserGameDataRoute from './routes/games/GetUserGameDataRoute'
import EditGameByPropsRoute from './routes/games/EditGameByPropsRoute'

class expressApp {
    private io: any
    private server: any
    private express: express.Application;
    constructor() {
        dotenv.config();
        const sessionMiddleware = session({
            secret: "secretcode",
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                //mongoUrl: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yymov.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
                mongoUrl: `mongodb://127.0.0.1:27017/${process.env.DB_NAME}?retryWrites=true&w=majority`
            }),
            cookie: { maxAge: 1000 * 60 * 60 * 24} // 1 day ,
        });
        this.express = express()
            .use(cors({
                origin: [
                    `http://${process.env.SERVER_NAME}:${process.env.SERVER_PORT}`,
                    `http://${process.env.SERVER_NAME}:${process.env.APP_PORT}`
                ],
                credentials: true
            }))
            .use(express.json({ limit: '50mb' }))
            .use(express.urlencoded({
                extended: true,
                limit: '50mb'
            }))
            .use(cookieParser())
            .use(sessionMiddleware)
            .use(passport.initialize())
            .use(passport.session())
            .use(flash())

        new PassportAuth();
        this.server = http.createServer(this.getExpress())
        this.io = new Server(this.server, {
            cors: {
                origin: `http://${process.env.SERVER_NAME}:${process.env.APP_PORT}`,
                methods: ["GET", "POST"],
                credentials: true
            }
        })
        this.io.use(sharedSession(sessionMiddleware, { autoSave: true }));
        this.mountRoutes();
    }
    private mountRoutes(): void {
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
            AddMapRoute,
            AddGameByPropsRoute,
            AddUserGameDataRoute,
            GetGameByLinkRoute,
            GetUserGameDataRoute,
            EditGameByPropsRoute
        ]);
        this.express.use('/', router);
        this.express.use('/public/', express.static(path.join(__dirname, '../public')))
    }

    public getExpress(): express.Application {
        return this.express
    }
    public getServer() {
        return this.server
    }
    public getIO() {
        return this.io
    }

}

const appInstance = new expressApp();
export const expressInstance = appInstance.getExpress();
export const serverInstance = appInstance.getServer();
export const ioInstance = appInstance.getIO();