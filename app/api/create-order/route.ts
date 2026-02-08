
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
    try {
        const { amount } = await req.json(); // Amount in INR

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({ error: "Razorpay keys missing" }, { status: 500 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: amount * 100, // Amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json({ error: "Error creating order" }, { status: 500 });
    }
}
