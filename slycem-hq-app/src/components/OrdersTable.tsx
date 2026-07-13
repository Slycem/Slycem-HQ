import type { PrintOrder } from "../types/PrintOrder";

type OrdersTableProps = {
  orders: PrintOrder[];
  setSelectedOrder: (order: PrintOrder) => void;
  updateOrderStatus: (index: number, status: string) => void;
  deleteOrder: (index: number) => void;
};

const statuses = [
  "Waiting",
  "Printing",
  "Post Processing",
  "Ready for Pickup",
  "Delivered",
];

export default function OrdersTable({
  orders,
  setSelectedOrder,
  updateOrderStatus,
  deleteOrder,
}: OrdersTableProps) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
      <table className="w-full text-left">
        <thead className="bg-slate-950 text-slate-400">
          <tr>
            <th className="p-4">Customer</th>
            <th className="p-4">Item</th>
            <th className="p-4">Material</th>
            <th className="p-4">Status</th>
            <th className="p-4">Price</th>
            <th className="p-4">Profit</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order, index) => (
            <tr
              key={`${order.customer}-${order.item}-${index}`}
              onClick={() => setSelectedOrder(order)}
              className="border-t border-slate-800 cursor-pointer hover:bg-slate-800 transition"
            >
              <td className="p-4">{order.customer}</td>
              <td className="p-4">{order.item}</td>
              <td className="p-4">{order.material}</td>

              <td className="p-4">
                <select
                  value={order.status}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) =>
                    updateOrderStatus(index, event.target.value)
                  }
                  className="rounded-lg bg-slate-950 border border-slate-700 p-2"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>

              <td className="p-4">{order.price}</td>
              <td className="p-4 text-cyan-400">{order.profit}</td>

              <td className="p-4">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteOrder(index);
                  }}
                  className="rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-2 hover:bg-red-500/30"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {orders.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="p-8 text-center text-slate-500"
              >
                No orders yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}