"use client";

import { useState } from "react";
import type { PrintOrder } from "../types/PrintOrder";

const statuses = [
  "Waiting",
  "Printing",
  "Post Processing",
  "Ready for Pickup",
  "Delivered",
];

export default function PrintHQ() {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PrintOrder | null>(null);

  const [orders, setOrders] = useState<PrintOrder[]>([
    {
      customer: "Sample Customer",
      item: "Phone Stand",
      material: "PLA Black",
      status: "Waiting",
      price: "$25",
      profit: "$14",
    },
    {
      customer: "Test Order",
      item: "Dragon Statue",
      material: "PLA Red",
      status: "Printing",
      price: "$40",
      profit: "$22",
    },
  ]);

  const [newOrder, setNewOrder] = useState<PrintOrder>({
    customer: "",
    item: "",
    material: "",
    status: "Waiting",
    price: "",
    profit: "",
  });

  function saveOrder() {
    if (!newOrder.customer || !newOrder.item) return;

    setOrders([...orders, newOrder]);
    setNewOrder({
      customer: "",
      item: "",
      material: "",
      status: "Waiting",
      price: "",
      profit: "",
    });
    setShowOrderForm(false);
  }

  function updateOrderStatus(index: number, status: string) {
    const updatedOrders = [...orders];
    updatedOrders[index] = {
      ...updatedOrders[index],
      status,
    };
    setOrders(updatedOrders);
  }

  function deleteOrder(index: number) {
    setOrders(orders.filter((_, i) => i !== index));
    setSelectedOrder(null);
  }

  const revenue = orders.reduce(
    (total, order) => total + Number(order.price.replace("$", "") || 0),
    0
  );

  const profit = orders.reduce(
    (total, order) => total + Number(order.profit.replace("$", "") || 0),
    0
  );

  return (
    <div className="mt-10 rounded-2xl bg-slate-900 border border-slate-800 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-bold">3D Print Orders</h3>
          <p className="text-slate-400 mt-1">
            Track customers, prints, materials, revenue, and profit.
          </p>
        </div>

        <button
          onClick={() => setShowOrderForm(!showOrderForm)}
          className="rounded-xl bg-cyan-400 text-slate-950 font-bold px-5 py-3"
        >
          + New Order
        </button>
      </div>

      {showOrderForm && (
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
      )}

      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
          <p className="text-slate-400">Total Orders</p>
          <p className="text-3xl font-black mt-2">{orders.length}</p>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
          <p className="text-slate-400">Active Prints</p>
          <p className="text-3xl font-black mt-2">
            {orders.filter((o) => o.status === "Printing").length}
          </p>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
          <p className="text-slate-400">Revenue</p>
          <p className="text-3xl font-black mt-2">${revenue}</p>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
          <p className="text-slate-400">Profit</p>
          <p className="text-3xl font-black mt-2">${profit}</p>
        </div>
      </div>

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
                key={index}
                onClick={() => setSelectedOrder(order)}
                className="border-t border-slate-800 cursor-pointer hover:bg-slate-800 transition"
              >
                <td className="p-4">{order.customer}</td>
                <td className="p-4">{order.item}</td>
                <td className="p-4">{order.material}</td>

                <td className="p-4">
                  <select
                    value={order.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      updateOrderStatus(index, e.target.value)
                    }
                    className="rounded-lg bg-slate-950 border border-slate-700 p-2"
                  >
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </td>

                <td className="p-4">{order.price}</td>
                <td className="p-4 text-cyan-400">{order.profit}</td>

                <td className="p-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteOrder(index);
                    }}
                    className="rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-2 hover:bg-red-500/30"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
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
      )}
    </div>
  );
}