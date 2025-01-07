import express from "express"
import {adminRoute, protectRoute} from "../middleware/auth.middleware.js";
import {getAllProducts, getFeaturedProducts,createProduct,deleteProduct,getRecommendedProducts,getProductsByCategory,toggleFeaturedProduct} from "../controllers/productController.js";
const router =express.Router()

router.get("/",protectRoute, adminRoute, getAllProducts)
router.get("/featured", getFeaturedProducts)
router.get("/category/:category", getProductsByCategory)
router.get("/recommendations", getRecommendedProducts)
router.post("/",protectRoute, adminRoute, createProduct)
router.patch("/:id",protectRoute, adminRoute, toggleFeaturedProduct)
router.post("/:id",protectRoute, adminRoute, deleteProduct)

export default router
