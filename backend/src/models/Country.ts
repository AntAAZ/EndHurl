import mongoose from 'mongoose'
const country = new mongoose.Schema({
    name : {
        type: String,
    },
    mapName : {
        type: String
    }
})

export default mongoose.model("Country", country);

