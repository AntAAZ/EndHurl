import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
    },
    userGame: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserGame',
        required: true
    },
    numberOfUnits: {
        type: Number,
        required: true
    }
});

export default mongoose.model("Unit", unitSchema);
