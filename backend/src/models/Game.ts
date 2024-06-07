import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    link: {
        type: String,
        unique: true
    },
    description: {
        type: String
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
    }
});

export default mongoose.model("Game", gameSchema);