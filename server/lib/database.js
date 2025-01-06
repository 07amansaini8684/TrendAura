import mongoose from "mongoose";

export const connectDB = async ()=>{
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDb connected: ${connection.connection.host}`)
    } catch (error) {
        console.error("Error connnecting to MONGODB",error.message)
        process.exit(1)
    }
}