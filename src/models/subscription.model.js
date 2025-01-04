import mongoose,{Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber:{
        // the one who is subscribing
        type:Schema.Types.ObjectId,
        ref:"User"

    },
    channel:{
        // the one who is being subscribed to. this is also User
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Subscription= mongoose.model("Subscription",subscriptionSchema)