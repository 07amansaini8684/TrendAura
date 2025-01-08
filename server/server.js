import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
const app = express()

/// routes
import authRoutes from './routes/auth.Route.js'
import productRoutes from './routes/product.Route.js'
import cartRoutes from './routes/cart.Route.js'
import couponRoutes from './routes/coupon.Route.js'
import paymentRoutes from './routes/payment.Route.js'

import { connectDB } from './lib/database.js'
dotenv.config()
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth' , authRoutes)
app.use('/api/products' , productRoutes)
app.use("/api/cart" , cartRoutes)
app.use("/api/coupons" , couponRoutes)
app.use("/api/payments" , paymentRoutes)

// console.log(process.env.PORT)
const PORT = process.env.PORT
app.listen(5555, ()=>{
    console.log(`Server is running ${PORT}`)
    connectDB()
})