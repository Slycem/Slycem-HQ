import type { PrintOrder } from "../types/PrintOrder";

type OrderFormProps = {
  newOrder: PrintOrder;
  setNewOrder: (order: PrintOrder) => void;
  saveOrder: () => void;
};

const statuses = [
  "Waiting",
  "Printing",
  "Post Processing",
  "Ready for Pickup",
  "Delivered",
];

export default function OrderForm({
  newOrder,
  setNewOrder,
  saveOrder,
}: OrderFormProps) {
  return (
    <div className="mt-6 rounded-xl bg-slate-950 border border-slate-800 p-5">
      <h4 className="text-xl font-bold">New 3D Print Order</h4>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <input
          value={newOrder.customer}
          onChange={(e) =>
            setNewOrder({ ...newOrder, customer: e.target.value })
          }
          className="rounded-lg bg-slate-900 border border-slate-700 p-3"
          placeholder="Customer name"
        />

        <input
          value={newOrder.item}
          onChange={(e) =>
            setNewOrder({ ...newOrder, item: e.target.value })
          }
          className="rounded-lg bg-slate-900 border border-slate-700 p-3"
          placeholder="Item / product"
        />

        <input
          value={newOrder.material}
          onChange={(e) =>
            setNewOrder({ ...newOrder, material: e.target.value })
          }
          className="rounded-lg bg-slate-900 border border-slate-700 p-3"
          placeholder="Material"
        />

        <select
          value={newOrder.status}
          onChange={(e) =>
            setNewOrder({ ...newOrder, status: e.target.value })
          }
          className="rounded-lg bg-slate-900 border border-slate-700 p-3"
        >
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>

        <input
          value={newOrder.price}
          onChange={(e) =>
            setNewOrder({ ...newOrder, price: e.target.value })
          }
          className="rounded-lg bg-slate-900 border border-slate-700 p-3"
          placeholder="Sale price"
        />

        <input
          value={newOrder.profit}
          onChange={(e) =>
            setNewOrder({ ...newOrder, profit: e.target.value })
          }
          className="rounded-lg bg-slate-900 border border-slate-700 p-3"
          placeholder="Estimated profit"
        />
      </div>

      <button
        onClick={saveOrder}
        className="mt-4 rounded-lg bg-cyan-400 text-slate-950 font-bold px-5 py-3"
      >
        Save Order
      </button>
    </div>
  );
}