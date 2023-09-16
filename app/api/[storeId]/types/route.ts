import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();
    const { name, value } = body;

    if (!userId)return new NextResponse("Unauthenticated", { status: 401 });
    if (!name)return new NextResponse("Name is required", { status: 400 });
    if (!value)return new NextResponse("Value is required", { status: 400 });
    if (!params.storeId)return new NextResponse("Store ID is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId)return new NextResponse("Unauthorized", { status: 403 });

    const type = await prismadb.type.create({
      data: {
        name,
        value,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(type);
  } catch (err) {
    console.log("[TYPES_POST]", err);
    return new NextResponse("internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId)
      return new NextResponse("Store ID is required", { status: 400 });

    const types = await prismadb.type.findMany({
      where: {
        storeId: params.storeId,
      },
    });

    return NextResponse.json(types);
  } catch (err) {
    console.log("[TYPES_GET]", err);
    return new NextResponse("internal error", { status: 500 });
  }
}
