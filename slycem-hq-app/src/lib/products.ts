import {
  NewProduct,
  Product,
  ProductRow,
} from "@/types/Product";

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    description: row.description ?? "",
    startingPrice: Number(row.starting_price ?? 0),
    material: row.material ?? "",
    colors: row.colors ?? "",
    printHours: Number(row.print_hours ?? 0),
    filamentGrams: Number(row.filament_grams ?? 0),
    imagePath: row.image_path ?? "",
    stlPath: row.stl_path ?? "",
    threeMfPath: row.three_mf_path ?? "",
    isPublished: row.is_published,
    isActive: row.is_active,
  };
}

export function newProductToRow(product: NewProduct) {
  return {
    name: product.name.trim(),
    description: product.description.trim() || null,
    starting_price: product.startingPrice,
    material: product.material.trim() || null,
    colors: product.colors.trim() || null,
    print_hours: product.printHours,
    filament_grams: product.filamentGrams,
    image_path: product.imagePath.trim() || null,
    stl_path: product.stlPath.trim() || null,
    three_mf_path: product.threeMfPath.trim() || null,
    is_published: product.isPublished,
    is_active: product.isActive,
  };
}