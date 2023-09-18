import Stripe from "stripe";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface OrderItem {
  itemId: string;
  itemQuantity: number;
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  const { productsOrdered } = await req.json();

  if (!productsOrdered || productsOrdered.length === 0) {
    return new NextResponse("Products are required", { status: 400 });
  }

  const productIds: string[] = productsOrdered.map(
    (item: OrderItem) => item.itemId
  );

  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    include:{
      images:true
    }
  });

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  products.forEach((product) => {
    const { itemQuantity } = productsOrdered.find(
      (item: OrderItem) => item.itemId === product.id
    );
    line_items.push({
      quantity: itemQuantity,
      price_data: {
        currency: "USD",
        product_data: {
          name: product.name,
          images:[product.images[0].url],
        },
        unit_amount: product.price.toNumber() * 100,
      },
    });
  });

  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId,
      isPaid: false,
      orderItems: {
        create: productIds.map((productId: string) => {
          const { itemQuantity } = productsOrdered.find(
            (item: OrderItem) => item.itemId === productId
          );
          return {
            quantity: itemQuantity,
            product: {
              connect: {
                id: productId,
              },
            },
          };
        }),
      },
    },
  });

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: "payment",
    billing_address_collection: "required",
    phone_number_collection: {
      enabled: true,
    },
    success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
    cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?success=0`,
    metadata: {
      orderId: order.id,
    },
  });

  return NextResponse.json(
    { url: session.url },
    {
      headers: corsHeaders,
    }
  );
}
