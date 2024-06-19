import mongoose from 'mongoose'
const user = new mongoose.Schema({
    username : {
        type: String,
        unique: true
    },
    password : {
        type: String
    },
    avatar: {
        type: String
    },
    loc: {
        type: String
    },
    bio: {
        type: String
    }
})
export default mongoose.model("User", user);

