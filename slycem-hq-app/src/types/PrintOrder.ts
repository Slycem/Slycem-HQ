export type OrderStatus =
  | "New"
  | "Quoted"
  | "Approved"
  | "Printing"
  | "Ready for Pickup"
  | "Delivered"
  | "Cancelled";

export interface PrintOrder {
  id: number;
  createdAt: string;

  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;

  itemName: string;
  material: string;
  color: string;
  quantity: number;

  status: OrderStatus;
  dueDate: string;

  printHours: number;
  filamentGrams: number;
  filamentCost: number;
  salePrice: number;
  profit: number;

  notes: string;
}

export interface PrintOrderRow {
  id: number;
  created_at: string;

  order_number: string | null;
  customer_name: string | null;
  phone: string | null;
  email: string | null;

  item_name: string | null;
  material: string | null;
  color: string | null;
  quantity: number | null;

  status: string | null;
  due_date: string | null;

  print_hours: number | null;
  filament_grams: number | null;
  filament_cost: number | null;
  sale_price: number | null;
  profit: number | null;

  notes: string | null;
}

export type NewPrintOrder = Omit<PrintOrder, "id" | "createdAt">;