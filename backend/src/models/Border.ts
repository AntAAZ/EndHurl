import mongoose from 'mongoose'
const border/**: mongoose.SchemaDefinitionProperty<BorderInterface>*/ = new mongoose.Schema({
    pointX : {
        type: Number,
    },
    pointY : {
        type: Number
    },
    selection: {
        type: String
    },
    countryName: {
        type: String
    },
    mapName: {
        type: String
    }
})

export default mongoose.model("Border", border);

