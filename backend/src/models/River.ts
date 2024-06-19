import mongoose from 'mongoose'
const river = new mongoose.Schema({
    name : {
        type: String,
    },
    mapName : {
        type: String
    }
})

export default mongoose.model("River", river);

