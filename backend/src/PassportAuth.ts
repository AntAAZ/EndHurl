import User from './models/User'
import passport from 'passport';
import passportLocal from 'passport-local'
import bcrypt from 'bcryptjs';
class PassportAuth {
    constructor()
    {
        passport.use(new passportLocal.Strategy((username, password, done) => 
        {
            User.findOne({username: username}, (err: any, user: any) => {
                if(err) throw err
                if(!user) return done(null, false, { message: `This user doesn't exist` })
                bcrypt.compare(password, user.password, (err, result) => {
                    if(err) throw err
                    if(result === true) return done(null, user)
                    return done(null, false, { message: 'Incorrect username or password' }); 
                })
            })
        }))
        passport.serializeUser((user: any, cb) => 
        {
            cb(null, user._id)
        })
        passport.deserializeUser((id: string, cb) =>
        {
            User.findOne({_id: id}, (err: any, user: any) => {
                const userInfo = { 
                    _id: user._id, username: user.username, avatar: user.avatar, loc: user.loc, bio: user.bio 
                }  
                cb(err, userInfo)  
            })
        })
    }
}
export default PassportAuth;
