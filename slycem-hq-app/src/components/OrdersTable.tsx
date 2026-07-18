"use client";

import {
  OrderStatus,
  PrintOrder,
} from "@/types/PrintOrder";

interface OrdersTableProps {
  orders: PrintOrder[];
  setSelectedOrder: (order: PrintOrder) => void;
  updateOrderStatus: (
    orderId: number,
    newStatus: OrderStatus
  ) => Promise<void>;
  deleteOrder: (orderId: number) => Promise<void>;
}

const statusOptions: OrderStatus[] = [
  "New",
  "Quoted",
  "Approved",
  "Printing",
  "Ready for Pickup",
  "Delivered",
  "Cancelled",
];
function formatDate(date: string) {
  if (!date) {
    return "No due date";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString();
}

export default function OrdersTable({
  orders,
  setSelectedOrder,
  updateOrderStatus,
  deleteOrder,
}: OrdersTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-6 py-5">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
          Order Queue
        </p>

        <h2 className="mt-2 text-2xl font-black">
          Print Orders
        </h2>
      </div>

      {orders.length === 0 ? (
        <div className="px-6 py-12 text-center text-slate-400">
          No print orders have been added yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-950/70">
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Item</th>
                <th className="px-5 py-4">Due</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="transition hover:bg-slate-800/40"
                >
                  <td className="whitespace-nowrap px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="text-left"
                    >
                      <p className="font-bold text-white hover:text-cyan-300">
                        {order.orderNumber}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        ID #{order.id}
                      </p>
                    </button>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-200">
                      {order.customerName}
                    </p>

                    {order.phone && (
                      <p className="mt-1 text-xs text-slate-500">
                        {order.phone}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-200">
                      {order.itemName}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {order.quantity} × {order.material}
                      {order.color ? ` · ${order.color}` : ""}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-300">
                    {formatDate(order.dueDate)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <p className="font-bold text-white">
                      ${order.salePrice.toFixed(2)}
                    </p>

                    <p className="mt-1 text-xs text-emerald-400">
                      Profit ${order.profit.toFixed(2)}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <select
                      value={order.status}
                      onChange={(event) =>
                        void updateOrderStatus(
                          order.id,
                          event.target.value as OrderStatus
                        )
                      }
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-cyan-400"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-bold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => void deleteOrder(order.id)}
                        className="rounded-lg border border-red-500/40 px-3 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}