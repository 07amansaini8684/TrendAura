import { Router  } from "express";
import {protectRoute} from "../middleware/auth.middleware.js";
import {getCoupons,validateCoupon} from "../controllers/couponController.js";
const router = Router()

router.get("/", protectRoute, getCoupons);
router.get("/validate", protectRoute, validateCoupon);
// router.post("/",protectRoute, createCoupon);
// router.delete("/:id",protectRoute, deleteCoupon);
// router.put("/:id",protectRoute, updateCoupon);


export default  router