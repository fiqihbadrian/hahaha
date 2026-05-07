import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Nama produk tidak boleh kosong"),
  brand: z.string().min(1, "Brand tidak boleh kosong"),
  priceCents: z.number().int().min(0, "Harga harus positif"),
  stock: z.number().int().min(0, "Stok harus positif"),
  description: z.string().min(1, "Deskripsi tidak boleh kosong"),
  specifications: z.string().nullable().optional(),
  imageUrl: z.string().url("URL gambar tidak valid"),
});

// GET all products
export async function GET(request: NextRequest) {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Gagal memuat produk" },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = productSchema.parse(body);

    const product = await db.product.create({
      data: validated,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Gagal membuat produk" },
      { status: 500 }
    );
  }
}
