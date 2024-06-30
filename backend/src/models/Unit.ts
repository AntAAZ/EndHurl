import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
    },
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
    },
    numberOfUnits: {
        type: Number,
        required: true
    },
    userGame: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserGame'
    },
    point: {
        type: Array,
    },
    range: {
        type: Number,
        default: 0
    }
});

export default mongoose.model("Unit", unitSchema);
