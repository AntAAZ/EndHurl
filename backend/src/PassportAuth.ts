import User from './models/User'
import passport from 'passport';
import passportLocal from 'passport-local'
import bcrypt from 'bcryptjs';
class PassportAuth {

    constructor()
    {
        passport.use(new passportLocal.Strategy((username, password, done) => 
        {
            User.findOne({username: username}, 
                (err: any, user: any) => 
                {
                    if(err) throw err
                    if(!user) return done(null, false, {message: `The username you input doesn't exist!`})
                    bcrypt.compare(password, user.password, (err, result) => 
                    {
                        if(err) throw err
                        if(result === true) return done(null, user);
                        return done(null, false, {message: `The password you input is incorrect`});   
                    })
                }
            )
        }))

        passport.serializeUser((user: any, cb) => 
        {
            cb(null, user.id)
        })

        passport.deserializeUser((id: string, cb) =>
        {
            User.findOne({_id: id}, 
                (err: any, user: any) => 
                {
                    const userInfo = {
                        username: user.username
                    }  
                    cb(err, userInfo)  
                }
            )
        })
    }

}

export default PassportAuth;