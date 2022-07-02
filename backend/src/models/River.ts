import mongoose from 'mongoose'
const river/**: mongoose.SchemaDefinitionProperty<CountryInterface>*/ = new mongoose.Schema({
    name : {
        type: String,
    },
    mapName : {
        type: String
    }
})

export default mongoose.model("River", river);

