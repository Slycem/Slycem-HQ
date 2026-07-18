"use client";

import { PrintOrder } from "@/types/PrintOrder";

interface ProductionQueueProps {
  orders: PrintOrder[];
  setSelectedOrder: (order: PrintOrder) => void;
}

export default function ProductionQueue({
  orders,
  setSelectedOrder,
}: ProductionQueueProps) {
  const printingOrders = sortOrdersByDueDate(
    orders.filter((order) => order.status === "Printing")
  );

  const readyToStartOrders = sortOrdersByDueDate(
    orders.filter((order) => order.status === "Approved")
  );

  const pickupOrders = sortOrdersByDueDate(
    orders.filter(
      (order) => order.status === "Ready for Pickup"
    )
  );

  const recentlyDeliveredOrders = orders
    .filter((order) => order.status === "Delivered")
    .slice(0, 4);

  return (
    <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
          Production Workflow
        </p>

        <h2 className="mt-2 text-2xl font-black">
          Production Queue
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Jobs are automatically prioritized by their due
          dates, with the most urgent orders shown first.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        <QueueColumn
          title="Printing Now"
          subtitle="Currently in production"
          emptyMessage="Nothing is printing right now."
          orders={printingOrders}
          setSelectedOrder={setSelectedOrder}
          badgeClassName="border-orange-500/40 bg-orange-500/10 text-orange-300"
          showDueAlerts
        />

        <QueueColumn
          title="Ready to Start"
          subtitle="Approved and ready to print"
          emptyMessage="No approved jobs are waiting."
          orders={readyToStartOrders}
          setSelectedOrder={setSelectedOrder}
          badgeClassName="border-yellow-500/40 bg-yellow-500/10 text-yellow-300"
          showDueAlerts
        />

        <QueueColumn
          title="Ready for Pickup"
          subtitle="Waiting for the customer"
          emptyMessage="No completed jobs are waiting."
          orders={pickupOrders}
          setSelectedOrder={setSelectedOrder}
          badgeClassName="border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          showDueAlerts
        />

        <QueueColumn
          title="Recently Delivered"
          subtitle="Latest completed orders"
          emptyMessage="No orders have been delivered."
          orders={recentlyDeliveredOrders}
          setSelectedOrder={setSelectedOrder}
          badgeClassName="border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
          showDueAlerts={false}
        />
      </div>
    </section>
  );
}

interface QueueColumnProps {
  title: string;
  subtitle: string;
  emptyMessage: string;
  orders: PrintOrder[];
  setSelectedOrder: (order: PrintOrder) => void;
  badgeClassName: string;
  showDueAlerts: boolean;
}

function QueueColumn({
  title,
  subtitle,
  emptyMessage,
  orders,
  setSelectedOrder,
  badgeClassName,
  showDueAlerts,
}: QueueColumnProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-white">{title}</h3>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-black ${badgeClassName}`}
        >
          {orders.length}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 px-4 py-8 text-center text-sm text-slate-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const dueDateStatus = getDueDateStatus(
              order.dueDate
            );

            const cardClassName = getCardClassName(
              showDueAlerts ? dueDateStatus : "normal"
            );

            return (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelectedOrder(order)}
                className={`w-full rounded-xl border p-4 text-left transition ${cardClassName}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-cyan-300">
                      {order.orderNumber}
                    </p>

                    <p className="mt-1 truncate font-bold text-white">
                      {order.itemName}
                    </p>
                  </div>

                  <span className="whitespace-nowrap text-xs font-bold text-slate-500">
                    Qty {order.quantity}
                  </span>
                </div>

                <p className="mt-3 truncate text-sm text-slate-300">
                  {order.customerName}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                  <span className="rounded-lg bg-slate-950 px-2 py-1">
                    {order.material}
                  </span>

                  {order.color && (
                    <span className="rounded-lg bg-slate-950 px-2 py-1">
                      {order.color}
                    </span>
                  )}

                  {order.printHours > 0 && (
                    <span className="rounded-lg bg-slate-950 px-2 py-1">
                      {order.printHours.toFixed(1)} hrs
                    </span>
                  )}
                </div>

                {order.dueDate ? (
                  <DueDateDisplay
                    dueDate={order.dueDate}
                    showAlert={showDueAlerts}
                  />
                ) : (
                  <p className="mt-3 text-xs text-slate-600">
                    No due date assigned
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface DueDateDisplayProps {
  dueDate: string;
  showAlert: boolean;
}

function DueDateDisplay({
  dueDate,
  showAlert,
}: DueDateDisplayProps) {
  const dueDateStatus = getDueDateStatus(dueDate);

  if (showAlert && dueDateStatus === "overdue") {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-xs font-black text-red-300">
          Overdue
        </span>

        <span className="text-xs font-semibold text-red-300">
          Due {formatDate(dueDate)}
        </span>
      </div>
    );
  }

  if (showAlert && dueDateStatus === "today") {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2.5 py-1 text-xs font-black text-yellow-300">
          Due Today
        </span>

        <span className="text-xs font-semibold text-yellow-300">
          {formatDate(dueDate)}
        </span>
      </div>
    );
  }

  if (showAlert && dueDateStatus === "tomorrow") {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-orange-500/40 bg-orange-500/10 px-2.5 py-1 text-xs font-black text-orange-300">
          Due Tomorrow
        </span>

        <span className="text-xs font-semibold text-orange-300">
          {formatDate(dueDate)}
        </span>
      </div>
    );
  }

  return (
    <p className="mt-3 text-xs text-slate-500">
      Due {formatDate(dueDate)}
    </p>
  );
}

type DueDateStatus =
  | "overdue"
  | "today"
  | "tomorrow"
  | "upcoming"
  | "normal";

function getDueDateStatus(date: string): DueDateStatus {
  if (!date) {
    return "normal";
  }

  const today = startOfDay(new Date());
  const dueDate = startOfDay(parseDate(date));

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (dueDate.getTime() < today.getTime()) {
    return "overdue";
  }

  if (dueDate.getTime() === today.getTime()) {
    return "today";
  }

  if (dueDate.getTime() === tomorrow.getTime()) {
    return "tomorrow";
  }

  return "upcoming";
}

function sortOrdersByDueDate(
  orders: PrintOrder[]
): PrintOrder[] {
  return [...orders].sort((firstOrder, secondOrder) => {
    if (!firstOrder.dueDate && !secondOrder.dueDate) {
      return 0;
    }

    if (!firstOrder.dueDate) {
      return 1;
    }

    if (!secondOrder.dueDate) {
      return -1;
    }

    return (
      parseDate(firstOrder.dueDate).getTime() -
      parseDate(secondOrder.dueDate).getTime()
    );
  });
}

function getCardClassName(status: DueDateStatus) {
  if (status === "overdue") {
    return "border-red-500/50 bg-red-950/20 hover:border-red-400 hover:bg-red-950/30";
  }

  if (status === "today") {
    return "border-yellow-500/50 bg-yellow-950/20 hover:border-yellow-400 hover:bg-yellow-950/30";
  }

  if (status === "tomorrow") {
    return "border-orange-500/40 bg-orange-950/10 hover:border-orange-400 hover:bg-orange-950/20";
  }

  return "border-slate-800 bg-slate-900 hover:border-cyan-500/60 hover:bg-slate-800";
}

function parseDate(date: string) {
  return new Date(`${date}T00:00:00`);
}

function startOfDay(date: Date) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  return normalizedDate;
}

function formatDate(date: string) {
  return parseDate(date).toLocaleDateString();
}