import mongoose from 'mongoose'
const WaterBorder = new mongoose.Schema({
    point : {
        type: Array,
    },
    name: {
        type: String
    },
    mapName: {
        type: String
    }
})

export default mongoose.model("WaterBorder", WaterBorder);

