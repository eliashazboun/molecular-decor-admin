import Stripe from "stripe"
import {headers} from "next/headers"
import { NextResponse } from "next/server"

import {stripe} from "@/lib/stripe"
import prismadb from "@/lib/prismadb"

export async function POST(req:Request){
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string;

  let event : Stripe.Event

  try{
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  }catch(err:any){
    return new NextResponse( `Webhook Error: ${err.message}`)
  }

  const session = event.data.object as Stripe.Checkout.Session
  const address = session?.customer_details?.address;

  const addressComponent = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country
  ];

  const addressSring = addressComponent.filter((c) => c !== null).join(', ')


  if(event.type === "checkout.session.completed"){
    console.log('HOOK')

    const order = await prismadb.order.updateMany({
      where:{
        id: session?.metadata?.orderId
      },
      data:{
        isPaid:true,
        address:addressSring,
        phone:session?.customer_details?.phone || ''
      }
    })




  }

  return new NextResponse(null, {status:200})
}