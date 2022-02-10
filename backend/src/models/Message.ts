import mongoose from 'mongoose'
const message/**: mongoose.SchemaDefinitionProperty<MessageInterface>*/ = new mongoose.Schema({
    message : {
        type: String,
    },
    senderName : {
        type: String
    },
    receiverName: {
        type: String
    },
    timestamp: {
        type: Date
    },
})

export default mongoose.model("Message", message);

