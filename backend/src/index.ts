import http from 'http';
import mongoose from 'mongoose'
import expressApp from './expressApp'
import { Server, Socket } from 'socket.io';

const env: NodeJS.ProcessEnv = process.env;
const server = http.createServer(expressApp);
const io = new Server(server, {
    cors: {
        origin: `http://${process.env.SERVER_NAME}:${process.env.APP_PORT}`,
        methods: ["GET", "POST"],
        credentials: true
    }
})

mongoose.connect(
    //`mongodb+srv://${env.DB_USER}:${env.DB_PASS}@cluster0.yymov.mongodb.net/${env.DB_NAME}?retryWrites=true&w=majority`,
    `mongodb://127.0.0.1:27017/${env.DB_NAME}?retryWrites=true&w=majority`,
    {},
    (err: Error) => {
        if(err) {
            throw err;
        }
    }
);

mongoose.connection.once('open', () => {
    console.log("connection to MongoDB has been established");

    io.on('connection', (socket: Socket) => {
        console.log('New client connected');
    })



    server.listen(env.SERVER_PORT, () => {
        return console.log(`server is listening on http://${env.SERVER_NAME}:${env.SERVER_PORT}`);
    })

})




