export interface ProductRow {
  id: number;
  created_at: string;
  name: string;
  description: string | null;
  starting_price: number | string;
  material: string | null;
  colors: string | null;
  print_hours: number | string;
  filament_grams: number | string;
  image_path: string | null;
  stl_path: string | null;
  three_mf_path: string | null;
  is_published: boolean;
  is_active: boolean;
}

export interface Product {
  id: number;
  createdAt: string;
  name: string;
  description: string;
  startingPrice: number;
  material: string;
  colors: string;
  printHours: number;
  filamentGrams: number;
  imagePath: string;
  stlPath: string;
  threeMfPath: string;
  isPublished: boolean;
  isActive: boolean;
}

export interface NewProduct {
  name: string;
  description: string;
  startingPrice: number;
  material: string;
  colors: string;
  printHours: number;
  filamentGrams: number;
  imagePath: string;
  stlPath: string;
  threeMfPath: string;
  isPublished: boolean;
  isActive: boolean;
}