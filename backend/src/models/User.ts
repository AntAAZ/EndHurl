import mongoose from 'mongoose'
import { UserInterface } from 'src/interfaces/UserInterface';

const user/**: mongoose.SchemaDefinitionProperty<UserInterface>*/ = new mongoose.Schema({
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

