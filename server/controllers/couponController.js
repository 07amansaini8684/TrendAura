
import Coupon from "../models/coupon.model.js";

export const getCoupons = async (req, res) => {
    try{
        const coupon = await Coupon.findOne({userId : req.user._id, isActive: true});
        res.json(coupon);
    }catch (error){
        console.log("Error in getCoupons controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const validateCoupon = async (req, res) => {
    try{
        const {code} = req.body;
        const coupon = await Coupon.findOne({code: code, userId: req.user._id, isActive: true});
        if(!coupon){
            res.status(404).json({message: "Coupon not found"});
        }
        if(coupon.expirationDate < Date.now()){
            coupon.isActive = false;
            await coupon.save();
            res.status(404).json({message: "Coupon expired"});
        }
        res.json({
            code: coupon.code,
            message: "Coupon is valid",
            discountPercentage: coupon.discountPercentage
        });
    }catch (error){
        console.log("Error in validateCoupon controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

    // export const createCoupon = async (req, res) => {}
    // export const deleteCoupon = async (req, res) => {}
    // export const updateCoupon = async (req, res) => {}