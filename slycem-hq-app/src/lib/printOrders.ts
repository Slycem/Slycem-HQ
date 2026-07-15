import {
  NewPrintOrder,
  OrderStatus,
  PrintOrder,
  PrintOrderRow,
} from "@/types/PrintOrder";

const validStatuses: OrderStatus[] = [
  "New",
  "Quoted",
  "Approved",
  "Printing",
  "Completed",
  "Delivered",
  "Cancelled",
];

function normalizeStatus(status: string | null): OrderStatus {
  if (status && validStatuses.includes(status as OrderStatus)) {
    return status as OrderStatus;
  }

  return "New";
}

export function rowToPrintOrder(row: PrintOrderRow): PrintOrder {
  return {
    id: row.id,
    createdAt: row.created_at,

    orderNumber: row.order_number ?? "",
    customerName: row.customer_name ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",

    itemName: row.item_name ?? "",
    material: row.material ?? "",
    color: row.color ?? "",
    quantity: row.quantity ?? 1,

    status: normalizeStatus(row.status),
    dueDate: row.due_date ?? "",

    printHours: Number(row.print_hours ?? 0),
    filamentGrams: Number(row.filament_grams ?? 0),
    filamentCost: Number(row.filament_cost ?? 0),
    salePrice: Number(row.sale_price ?? 0),
    profit: Number(row.profit ?? 0),

    notes: row.notes ?? "",
  };
}

export function newPrintOrderToRow(order: NewPrintOrder) {
  return {
    order_number: order.orderNumber,
    customer_name: order.customerName,
    phone: order.phone,
    email: order.email,

    item_name: order.itemName,
    material: order.material,
    color: order.color,
    quantity: order.quantity,

    status: order.status,
    due_date: order.dueDate || null,

    print_hours: order.printHours,
    filament_grams: order.filamentGrams,
    filament_cost: order.filamentCost,
    sale_price: order.salePrice,
    profit: order.profit,

    notes: order.notes,
  };
}