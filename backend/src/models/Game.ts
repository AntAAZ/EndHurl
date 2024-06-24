import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    link: {
        type: String,
        unique: true
    },
    maxPlayersCount: {
        type: Number
    },
    map: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Map',
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    started: {
        type: Boolean,
        default: false
    },
    battlePhase: {
        type: Boolean,
        default: false
    }
});

export default mongoose.model("Game", gameSchema);

