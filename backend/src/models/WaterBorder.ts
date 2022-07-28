import mongoose from 'mongoose'
const WaterBorder/**: mongoose.SchemaDefinitionProperty<BorderInterface>*/ = new mongoose.Schema({
    point : {
        type: Array,
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

WaterBorder.index({ mapName: 1 })
export default mongoose.model("WaterBorder", WaterBorder);

