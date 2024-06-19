import mongoose from 'mongoose'
const border = new mongoose.Schema({
    point : {
        type: Array,
    },
    countryName: {
        type: String
    },
    mapName: {
        type: String
    }
})
export default mongoose.model("Border", border);

