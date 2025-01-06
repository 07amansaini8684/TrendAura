import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
const app = express()

/// routes
import authRoutes from './routes/auth.Route.js'
import { connectDB } from './lib/database.js'
dotenv.config()
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth' , authRoutes)

// console.log(process.env.PORT)
const PORT = process.env.PORT
app.listen(5555, ()=>{
    console.log(`Server is running ${PORT}`)
    connectDB()
})