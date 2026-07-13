"use client";

import { useState } from "react";
import type { PrintOrder } from "../types/PrintOrder";
import OrderForm from "./OrderForm";
import OrdersTable from "./OrdersTable";
import OrderDetails from "./OrderDetails";

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
    if (!newOrder.customer.trim() || !newOrder.item.trim()) {
      return;
    }

    setOrders((currentOrders) => [...currentOrders, newOrder]);

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
    setOrders((currentOrders) =>
      currentOrders.map((order, orderIndex) =>
        orderIndex === index ? { ...order, status } : order
      )
    );

    setSelectedOrder((currentSelection) => {
      if (!currentSelection) {
        return null;
      }

      const selectedIndex = orders.findIndex(
        (order) => order === currentSelection
      );

      if (selectedIndex === index) {
        return {
          ...currentSelection,
          status,
        };
      }

      return currentSelection;
    });
  }

  function deleteOrder(index: number) {
    const orderBeingDeleted = orders[index];

    setOrders((currentOrders) =>
      currentOrders.filter((_, orderIndex) => orderIndex !== index)
    );

    if (selectedOrder === orderBeingDeleted) {
      setSelectedOrder(null);
    }
  }

  const revenue = orders.reduce((total, order) => {
    const amount = Number(order.price.replace(/[^0-9.-]+/g, "")) || 0;
    return total + amount;
  }, 0);

  const profit = orders.reduce((total, order) => {
    const amount = Number(order.profit.replace(/[^0-9.-]+/g, "")) || 0;
    return total + amount;
  }, 0);

  const activePrints = orders.filter(
    (order) => order.status === "Printing"
  ).length;

  return (
    <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-bold">3D Print Orders</h3>

          <p className="mt-1 text-slate-400">
            Track customers, prints, materials, revenue, and profit.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowOrderForm((currentValue) => !currentValue)}
          className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
        >
          {showOrderForm ? "Close Form" : "+ New Order"}
        </button>
      </div>

      {showOrderForm && (
        <OrderForm
          newOrder={newOrder}
          setNewOrder={setNewOrder}
          saveOrder={saveOrder}
        />
      )}

      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-slate-400">Total Orders</p>
          <p className="mt-2 text-3xl font-black">{orders.length}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-slate-400">Active Prints</p>
          <p className="mt-2 text-3xl font-black">{activePrints}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-slate-400">Revenue</p>
          <p className="mt-2 text-3xl font-black">
            ${revenue.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-slate-400">Profit</p>
          <p className="mt-2 text-3xl font-black">
            ${profit.toFixed(2)}
          </p>
        </div>
      </div>

      <OrdersTable
        orders={orders}
        setSelectedOrder={setSelectedOrder}
        updateOrderStatus={updateOrderStatus}
        deleteOrder={deleteOrder}
      />

      <OrderDetails selectedOrder={selectedOrder} />
    </div>
  );
}