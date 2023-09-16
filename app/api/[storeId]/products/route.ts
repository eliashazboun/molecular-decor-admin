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
    const {
      name,
      price,
      categoryId,
      typeId,
      sizeId,
      images,
      isFeatured,
      isArchived,
      description
    } = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!price) return new NextResponse("Price is required", { status: 400 });
    if (!description) return new NextResponse("Description is required", { status: 400 });
    if (!categoryId)return new NextResponse("Category ID is required", { status: 400 });
    if (!typeId)return new NextResponse("Product Type ID is required", { status: 400 });
    if (!sizeId)return new NextResponse("Size ID is required", { status: 400 }); 
    if (!images || !images.length)return new NextResponse("Images are required", { status: 400 });

    if (!params.storeId)return new NextResponse("Store ID is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId)
      return new NextResponse("Unauthorized", { status: 403 });

    const product = await prismadb.product.create({
      data: {
        name,
        price,
        isFeatured,
        isArchived,
        categoryId,
        typeId,
        sizeId,
        description,
        storeId: params.storeId,
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.log("[PRODUCTS_POST]", err);
    return new NextResponse("internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const {searchParams} = new URL(req.url)

    const categoryId = searchParams.get("categoryId") || undefined
    const typeId = searchParams.get("typeId") || undefined
    const sizeId = searchParams.get("sizeId") || undefined
    const isFeatured = searchParams.get("isFeatured") 

    if (!params.storeId)
      return new NextResponse("Store ID is required", { status: 400 });

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        typeId,
        sizeId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false
      },
      include:{
        images: true,
        category: true,
        size: true,
        type: true
      },
      orderBy:{
        createdAt: 'desc'
      }
    });

    return NextResponse.json(products);
  } catch (err) {
    console.log("[PRODUCTS_GET]", err);
    return new NextResponse("internal error", { status: 500 });
  }
}
