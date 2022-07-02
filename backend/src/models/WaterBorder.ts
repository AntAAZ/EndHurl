import mongoose from 'mongoose'
const WaterBorder/**: mongoose.SchemaDefinitionProperty<BorderInterface>*/ = new mongoose.Schema({
    pointX : {
        type: Number,
    },
    pointY : {
        type: Number
    },
    selection: {
        type: String
    },
    name: {
        type: String
    },
    mapName: {
        type: String
    }
})

export default mongoose.model("WaterBorder", WaterBorder);

