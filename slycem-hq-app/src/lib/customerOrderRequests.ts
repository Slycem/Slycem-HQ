import {
  CustomerOrderRequest,
  CustomerOrderRequestRow,
  CustomerRequestStatus,
} from "@/types/CustomerOrderRequest";

const validStatuses: CustomerRequestStatus[] = [
  "Submitted",
  "Contacted",
  "Quoted",
  "Approved",
  "Declined",
];

function normalizeStatus(
  status: string | null
): CustomerRequestStatus {
  if (
    status &&
    validStatuses.includes(status as CustomerRequestStatus)
  ) {
    return status as CustomerRequestStatus;
  }

  return "Submitted";
}

export function rowToCustomerOrderRequest(
  row: CustomerOrderRequestRow
): CustomerOrderRequest {
  return {
    id: row.id,
    createdAt: row.created_at,

    customerName: row.customer_name,
    phone: row.phone ?? "",
    email: row.email,
    preferredContact: row.preferred_contact ?? "",

    itemDescription: row.item_description,
    quantity: row.quantity ?? 1,
    materialPreference: row.material_preference ?? "",
    colorPreference: row.color_preference ?? "",
    neededBy: row.needed_by ?? "",
    notes: row.notes ?? "",

    requestStatus: normalizeStatus(row.request_status),
  };
}