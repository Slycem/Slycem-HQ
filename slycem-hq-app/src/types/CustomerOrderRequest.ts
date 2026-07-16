export type CustomerRequestStatus =
  | "Submitted"
  | "Contacted"
  | "Quoted"
  | "Approved"
  | "Declined";

export interface CustomerOrderRequest {
  id: number;
  createdAt: string;

  customerName: string;
  phone: string;
  email: string;
  preferredContact: string;

  itemDescription: string;
  quantity: number;
  materialPreference: string;
  colorPreference: string;
  neededBy: string;
  notes: string;

  requestStatus: CustomerRequestStatus;
}

export interface CustomerOrderRequestRow {
  id: number;
  created_at: string;

  customer_name: string;
  phone: string | null;
  email: string;
  preferred_contact: string | null;

  item_description: string;
  quantity: number;
  material_preference: string | null;
  color_preference: string | null;
  needed_by: string | null;
  notes: string | null;

  request_status: string;
}