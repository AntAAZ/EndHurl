import mongoose from 'mongoose'
import expressApp from './expressApp'

const env: NodeJS.ProcessEnv = process.env;

mongoose.connect(`mongodb+srv://${env.DB_USER}:${env.DB_PASS}@cluster0.yymov.mongodb.net/${env.DB_NAME}?retryWrites=true&w=majority`, {},
    (err: Error) => {
        if(err) {
            throw err;
        }
    }
);

mongoose.connection.once('open', () => {

    console.log("connection to MongoDB has been established");

    expressApp.listen(env.SERVER_PORT, () => {
        return console.log(`server is listening on http://${env.SERVER_NAME}:${env.SERVER_PORT}`);
    })

})




