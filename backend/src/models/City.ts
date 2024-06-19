import mongoose from 'mongoose'
const city = new mongoose.Schema({
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

export default mongoose.model("City", city);

