"use client";

import { useEffect, useMemo, useState } from "react";

import OrderDetails from "@/components/OrderDetails";
import OrderForm from "@/components/OrderForm";
import OrdersTable from "@/components/OrdersTable";
import {
  newPrintOrderToRow,
  rowToPrintOrder,
} from "@/lib/printOrders";
import { supabase } from "@/lib/supabase";
import {
  NewPrintOrder,
  OrderStatus,
  PrintOrder,
  PrintOrderRow,
} from "@/types/PrintOrder";
import ProductionQueue from "@/components/ProductionQueue";

export default function PrintHQ() {
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [selectedOrder, setSelectedOrder] =
    useState<PrintOrder | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    void loadOrders();
  }, []);

  async function loadOrders() {
    setIsLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("print_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Unable to load print orders:", error);
      setErrorMessage(
        "Print HQ could not load your orders from Supabase."
      );
      setIsLoading(false);
      return;
    }

    const loadedOrders = ((data ?? []) as PrintOrderRow[]).map(
      rowToPrintOrder
    );

    setOrders(loadedOrders);
    setIsLoading(false);
  }

  async function addOrder(order: NewPrintOrder) {
    setIsSaving(true);
    setErrorMessage("");

    const row = newPrintOrderToRow(order);

    const { data, error } = await supabase
      .from("print_orders")
      .insert(row)
      .select("*")
      .single();

    if (error) {
      console.error("Unable to add print order:", error);
      setErrorMessage(
        "The new order could not be saved. Please try again."
      );
      setIsSaving(false);
      return;
    }

    const savedOrder = rowToPrintOrder(data as PrintOrderRow);

    setOrders((currentOrders) => [
      savedOrder,
      ...currentOrders,
    ]);

    setSelectedOrder(savedOrder);
    setIsSaving(false);
  }

  async function updateOrderStatus(
    orderId: number,
    newStatus: OrderStatus
  ) {
    setErrorMessage("");

    const { data, error } = await supabase
      .from("print_orders")
      .update({ status: newStatus })
      .eq("id", orderId)
      .select("*")
      .single();

    if (error) {
      console.error("Unable to update order status:", error);
      setErrorMessage(
        "The order status could not be updated."
      );
      return;
    }

    const updatedOrder = rowToPrintOrder(
      data as PrintOrderRow
    );

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? updatedOrder : order
      )
    );

    setSelectedOrder((currentOrder) =>
      currentOrder?.id === orderId
        ? updatedOrder
        : currentOrder
    );
  }

  async function deleteOrder(orderId: number) {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!shouldDelete) {
      return;
    }

    setErrorMessage("");

    const { error } = await supabase
      .from("print_orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      console.error("Unable to delete print order:", error);
      setErrorMessage("The order could not be deleted.");
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== orderId)
    );

    setSelectedOrder((currentOrder) =>
      currentOrder?.id === orderId ? null : currentOrder
    );
  }

  const newOrders = useMemo(
    () => orders.filter((order) => order.status === "New"),
    [orders]
  );

  const printingOrders = useMemo(
    () =>
      orders.filter((order) => order.status === "Printing"),
    [orders]
  );

  const pickupOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status === "Ready for Pickup"
      ),
    [orders]
  );

  const deliveredOrders = useMemo(
    () =>
      orders.filter((order) => order.status === "Delivered"),
    [orders]
  );

  const activeOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status !== "Delivered" &&
          order.status !== "Cancelled"
      ),
    [orders]
  );

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((order) => order.status !== "Cancelled")
        .reduce(
          (total, order) => total + order.salePrice,
          0
        ),
    [orders]
  );

  const totalProfit = useMemo(
    () =>
      orders
        .filter((order) => order.status !== "Cancelled")
        .reduce(
          (total, order) => total + order.profit,
          0
        ),
    [orders]
  );

  const totalPrintHours = useMemo(
    () =>
      orders
        .filter((order) => order.status !== "Cancelled")
        .reduce(
          (total, order) => total + order.printHours,
          0
        ),
    [orders]
  );

  const totalFilamentGrams = useMemo(
    () =>
      orders
        .filter((order) => order.status !== "Cancelled")
        .reduce(
          (total, order) => total + order.filamentGrams,
          0
        ),
    [orders]
  );

  const totalFilamentKilograms =
    totalFilamentGrams / 1000;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              3D Print HQ
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Print Order Command Center
            </h1>

            <p className="mt-2 text-slate-400">
              Track orders, production status, revenue, and
              profit from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadOrders()}
            disabled={isLoading}
            className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-bold transition hover:border-cyan-400 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Refresh Orders"}
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-red-200">
            {errorMessage}
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
              Live Overview
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Print HQ Overview
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              A live snapshot of your current print operation.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Active Orders"
              value={String(activeOrders.length)}
              detail="Currently in your workflow"
            />

            <MetricCard
              label="New Orders"
              value={String(newOrders.length)}
              detail="Waiting for review"
            />

            <MetricCard
              label="Printing Now"
              value={String(printingOrders.length)}
              detail="Currently in production"
            />

            <MetricCard
              label="Ready for Pickup"
              value={String(pickupOrders.length)}
              detail="Waiting for the customer"
            />

            <MetricCard
              label="Delivered"
              value={String(deliveredOrders.length)}
              detail="Successfully completed"
            />

            <MetricCard
              label="Revenue"
              value={`$${totalRevenue.toFixed(2)}`}
              detail="All non-cancelled orders"
            />

            <MetricCard
              label="Profit"
              value={`$${totalProfit.toFixed(2)}`}
              detail="Estimated total profit"
            />

            <MetricCard
              label="Production Usage"
              value={`${totalPrintHours.toFixed(1)} hrs`}
              detail={`${totalFilamentKilograms.toFixed(
                2
              )} kg of filament`}
            />
          </div>
        </section>

<ProductionQueue
  orders={orders}
  setSelectedOrder={setSelectedOrder}
/>
        <section className="grid gap-8 xl:grid-cols-[380px_1fr]">
          <div>
            <OrderForm
              addOrder={addOrder}
              isSaving={isSaving}
            />
          </div>

          <div className="space-y-8">
            {isLoading ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
                Loading your print orders...
              </div>
            ) : (
              <OrdersTable
                orders={orders}
                setSelectedOrder={setSelectedOrder}
                updateOrderStatus={updateOrderStatus}
                deleteOrder={deleteOrder}
              />
            )}

            <OrderDetails
  selectedOrder={selectedOrder}
  updateOrderStatus={updateOrderStatus}
/>
          </div>
        </section>
      </div>
    </main>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
}

function MetricCard({
  label,
  value,
  detail,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm font-semibold text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {detail}
      </p>
    </div>
  );
}