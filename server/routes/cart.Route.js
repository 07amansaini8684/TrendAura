import express from "express"
import {protectRoute} from "../middleware/auth.middleware.js"
import {addToCart, getCartProducts, removeAllFromCart, updateQuantityInCart} from "../controllers/cartController.js";

const router = express.Router()

router.get("/", protectRoute, getCartProducts);
router.post("/",protectRoute, addToCart);
router.delete("/", protectRoute, removeAllFromCart);
router.put("/:id",protectRoute, updateQuantityInCart);

export default router