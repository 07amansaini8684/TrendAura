import Coupon from "../models/couponModel.js";
import {stripe} from "../lib/stripe.js";
import Order from "../models/orderModel.js";

export const createCheckoutSession = async (req, res) => {
try {

    const {products, couponCode } = req.body
    if(!Array.isArray(products) || products.length === 0){
        return res.status(400).json({message: "Please select at least one product"});
    }
    let totalAmount =0;
    const lineItems = products.map(product => {
        const amount = Math.round(product.price * 100) // In cents
        totalAmount += amount * product.quantity

        return {
           price_data:{
            currency: "usd",
            product_data: {
                name: product.name,
                images: [product.image],
            },
            unit_amount: amount,
           }
        }
    });
    let coupon = null;
    if(cuponCode){
        coupon = await Coupon.findOne({code: cuponCode, userId: req.user._id, isActive: true});
        if(coupon){
            totalAmount -= Math.round(totalAmount * (coupon.discountPercentage / 100));
        }

    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
        discounts: coupon ? [{coupon: await createStripeCoupon(coupon.discountPercentage)}] : [],
        metadata: {
            userId: req.user._id.toString(),
            couponCode: couponCode || "",
            products: JSON.stringify(
                products.map((p) => ({
                    id: p._id,
                    quantity: p.quantity,
                    price: p.price,
                }))
            ),
        },
    });

    if(totalAmount >= 20000){
        const newCoupon = await createNewCoupon(req.user._id);
    }
    res.status(200).json({id: session.id, totalAmount: totalAmount / 100});
}catch(error){
    console.log("Error in createCheckoutSession controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
}

}

async function createStripeCoupon(discountPercentage){
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    })
    return coupon.id
}

async function createNewCoupon(userId){
    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(2,8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        userId: userId,
        isActive: true,
    })

    await newCoupon.save();
    return newCoupon

}


export const checkoutSuccess = async (req, res) => {
    try{
        const {sessionId} = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if(session.payment_status === "paid"){
            if(session.metadata.couponCode){
                await Coupon.findOneAndUpdate({
                    code: session.metadata.couponCode,
                    userId: session.metadata.userId,
                },{
                    isActive: false
                })
            }
            // create a new Order
            const products = JSON.parse(session.metadata.products);
            const newOrder = new Order({
                user: session.metadata.userId,
                products: products.map(product => ({
                    product: product.id,
                    quantity: product.quantity,
                    price: product.price,
                })),
                totalAmount: session.amount_total / 100,
                stripeSessionId: sessionId,
            })
            await newOrder.save();
            res.status(200).json({success: true, orderId: newOrder._id,message: "Order created successfully"});
        }
    }catch (error){
        console.log("Error in checkoutSuccess controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}