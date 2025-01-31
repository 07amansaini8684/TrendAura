import Product from "../models/productModel.js";
import {redis} from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

// api to get all the Products..
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({products});
    } catch (error) {
        console.log("Error in getAllProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
// api to get featured products
export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featured_Products")
        if(featuredProducts){
            return res.json(JSON.parse(featuredProducts))
        }
        /// if not in redis, fetch from db and store in redis
        // .lean() to convert mongoose object to js object
        // which is good for performance..
        featuredProducts = await Product.find({isFeatured: true}).lean();

        if(!featuredProducts){
            return res.status(404).json({ message: "No featured products found" });
        }

        // store in redis for future quick access
        await redis.set("featured_Products", JSON.stringify(featuredProducts))

        // send response
        res.json(featuredProducts)
    }catch (error){
        console.log("Error in getFeaturedProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });

    }
}

// api to create a new product
export const createProduct = async (req, res) => {
    try{
       const {name, description, price, image, category} = req.body;

       if(!name || !description || !price || !image || !category){
            return res.status(400).json({ message: "All fields are required" });
       }

       // upload image to cloudinary
        let cloudinaryResponse;

        if(image){
            cloudinaryResponse = await cloudinary.uploader.upload(image, {folder: "products"});
        }

        if(!cloudinaryResponse){
            return res.status(500).json({ message: "Error uploading image to cloudinary" });
        }

        const imageURL = cloudinaryResponse?.secure_url

       const product = await Product.create({
           name,
           description,
           price,
           image : imageURL ? imageURL : image,
           category,
       })

        // passing product object to response
       res.status(201).json(product);

    }catch (error){
        console.log("Error in createProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// delete a specific product
export const deleteProduct = async (req,res) => {
    try{
        const {id} = req.params;
        // check if product exists
        const product = await Product.findByIdAndDelete(id);
        // if not return error
        if(!product){
            return res.status(404).json({ message: "Product not found" });
        }
        // delete image from cloudinary
        if(product?.image){
            const imageId = product.image.split("/").pop().split(".")[0];
            // for example imageId = 12345
           try{
               await cloudinary.uploader.destroy(`products/${imageId}`);
               console.log("Image deleted from cloudinary");
           }catch (error){
               console.log("Error in deleting image from cloudinary", error.message);

           }
        }
        // delete image from db
        await Product.findByIdAndDelete(id);
        res.json({ message: "Product deleted successfully" });
    }catch (error){
        console.log("Error in deleteProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// grabbing random products
export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            { $sample: { size: 3 } },
            {project: {
            id: 1,
            name: 1,
            image: 1,
                    description: 1,
                    price: 1
            }}
        ]);
        if(!products){
            return res.status(404).json({ message: "No recommended products found" });
        }
        res.json(products);
    }catch (error) {
        console.log("Error in getRecommendedProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// grabbing product by category

export const getProductsByCategory = async (req, res) => {
    try {
        const {category} = req.params;
        const products = await Product.find({category});
        if(!products){
            return res.status(404).json({ message: "No products found for this category" });
        }
        res.json(products);
    }catch (error) {
        console.log("Error in getProductsByCategory controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// toggle featured status of a product
export const toggleFeaturedProduct = async (req, res) => {
    try {
        const {id} = req.params;
        const product = await Product.findById(id);
        if(!product){
            return res.status(404).json({ message: "Product not found" });
        }
        product.isFeatured = !product.isFeatured;
        const updatedProduct = await product.save();
        // update the redis
        await updateFeaturedProducts();
        res.json(product);
    }catch (error) {
        console.log("Error in toggleFeaturedProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

async function updateFeaturedProducts(){
    try{
        const featuredProducts = await Product.find({isFeatured: true}).lean();
        if(!featuredProducts){
            return res.status(404).json({ message: "No featured products found" });
        }
        await redis.set("featured_products", JSON.stringify(featuredProducts));

    }catch (error){
        console.log("Error in updateFeaturedProducts controller", error.message)

    }
}