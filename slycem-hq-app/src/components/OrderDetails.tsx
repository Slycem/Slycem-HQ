import type { PrintOrder } from "../types/PrintOrder";

type OrderDetailsProps = {
  selectedOrder: PrintOrder | null;
};

export default function OrderDetails({
  selectedOrder,
}: OrderDetailsProps) {
  if (!selectedOrder) {
    return null;
  }

  return (
    <div className="mt-8 rounded-xl bg-slate-950 border border-slate-800 p-6">
      <h3 className="text-2xl font-bold mb-4">Order Details</h3>

      <div className="grid grid-cols-2 gap-4 text-slate-300">
        <p>
          <strong className="text-white">Customer:</strong>{" "}
          {selectedOrder.customer}
        </p>

        <p>
          <strong className="text-white">Item:</strong>{" "}
          {selectedOrder.item}
        </p>

        <p>
          <strong className="text-white">Material:</strong>{" "}
          {selectedOrder.material}
        </p>

        <p>
          <strong className="text-white">Status:</strong>{" "}
          {selectedOrder.status}
        </p>

        <p>
          <strong className="text-white">Price:</strong>{" "}
          {selectedOrder.price}
        </p>

        <p>
          <strong className="text-white">Profit:</strong>{" "}
          {selectedOrder.profit}
        </p>
      </div>
    </div>
  );
}