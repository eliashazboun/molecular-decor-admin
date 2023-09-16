import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string , orderId: string} }
) {
  try {
    const { userId } = auth();

    if (!userId) return new NextResponse("Unauthenticated", { status: 400 });

    if (!params.orderId)return new NextResponse("Order ID is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId)return new NextResponse("Unauthorized", { status: 403 });

    const order = await prismadb.order.deleteMany({
      where: {
        id: params.orderId,
      },
    });

    return NextResponse.json(order)
    
  } catch (err) {
    console.log("[ORDERS_DELETE]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}