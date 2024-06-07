import mongoose from 'mongoose'
const userGame/**: mongoose.SchemaDefinitionProperty<BorderInterface>*/ = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    acquiredCountries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
    }],
    acquiredCities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
    }],
    units: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit'
    }]
})
export default mongoose.model("UserGame", userGame);

