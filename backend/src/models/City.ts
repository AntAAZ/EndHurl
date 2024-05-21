import mongoose from 'mongoose'
const city/**: mongoose.SchemaDefinitionProperty<BorderInterface>*/ = new mongoose.Schema({
    point: {
        type: Array,
    },
    type: {
        type: Boolean
    },
    name: {
        type: String
    },
    area: {
        type: String
    },
    pop_max : {
        type: Number
    },
    countryName: {
        type: String
    },
    mapName: {
        type: String
    }
})
/*city.index({ type: 1 })
city.index({ mapName: 1, countryName: 1 })
city.index({ mapName: 1, countryName: 1, area: 1 })*/

export default mongoose.model("City", city);

