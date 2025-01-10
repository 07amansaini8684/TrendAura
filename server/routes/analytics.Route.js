import express from "express";
import {adminRoute, protectRoute} from "../middleware/auth.middleware.js";
import {getAnalyticsData,getDailySalesData} from "../controllers/analyticsConrtoller.js.js";
const router = express.Router()

router.get("/",protectRoute,adminRoute, async (req,res) =>{
    try{
        const analytics = await getAnalyticsData()

        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

        const dailySalesData = await getDailySalesData(startDate, endDate)

        res.json({analytics, dailySalesData})

    }catch (e) {
        console.log("Error in analytics route", e.message)
        return res.status(500).json({ message: "Server error", error: e.message });
    }
} )
