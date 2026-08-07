"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { rowToCustomerOrderRequest } from "@/lib/customerOrderRequests";
import { rowToPrintOrder } from "@/lib/printOrders";
import { rowToProduct } from "@/lib/products";
import { supabase } from "@/lib/supabase";
import {
  CustomerOrderRequest,
  CustomerOrderRequestRow,
} from "@/types/CustomerOrderRequest";
import {
  PrintOrder,
  PrintOrderRow,
} from "@/types/PrintOrder";
import {
  Product,
  ProductRow,
} from "@/types/Product";

export default function DashboardHQ() {
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [requests, setRequests] =
    useState<CustomerOrderRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
    setIsLoading(true);
    setErrorMessage("");

    const [ordersResult, requestsResult, productsResult] =
      await Promise.all([
        supabase
          .from("print_orders")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("customer_order_requests")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

    const errors = [
      ordersResult.error,
      requestsResult.error,
      productsResult.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error(
        "Unable to load dashboard:",
        errors
      );

      setErrorMessage(
        "Some dashboard information could not be loaded."
      );
    }

    if (!ordersResult.error) {
      setOrders(
        (
          (ordersResult.data ?? []) as PrintOrderRow[]
        ).map(rowToPrintOrder)
      );
    }

    if (!requestsResult.error) {
      setRequests(
        (
          (requestsResult.data ??
            []) as CustomerOrderRequestRow[]
        ).map(rowToCustomerOrderRequest)
      );
    }

    if (!productsResult.error) {
      setProducts(
        (
          (productsResult.data ?? []) as ProductRow[]
        ).map(rowToProduct)
      );
    }

    setIsLoading(false);
  }

  const activeOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status !== "Delivered" &&
          order.status !== "Cancelled"
      ),
    [orders]
  );

  const printingOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status === "Printing"
      ),
    [orders]
  );

  const pickupOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "Ready for Pickup"
      ),
    [orders]
  );

  const newRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.requestStatus === "Submitted"
      ),
    [requests]
  );

  const publishedProducts = useMemo(
    () =>
      products.filter(
        (product) => product.isPublished
      ),
    [products]
  );

  const currentMonthOrders = useMemo(() => {
    const now = new Date();

    return orders.filter((order) => {
      const createdAt = new Date(order.createdAt);

      return (
        createdAt.getFullYear() === now.getFullYear() &&
        createdAt.getMonth() === now.getMonth() &&
        order.status !== "Cancelled"
      );
    });
  }, [orders]);

  const monthlyRevenue = useMemo(
    () =>
      currentMonthOrders.reduce(
        (total, order) =>
          total + order.salePrice,
        0
      ),
    [currentMonthOrders]
  );

  const monthlyProfit = useMemo(
    () =>
      currentMonthOrders.reduce(
        (total, order) =>
          total + order.profit,
        0
      ),
    [currentMonthOrders]
  );

  const urgentOrders = useMemo(
    () =>
      [...activeOrders]
        .filter((order) => order.dueDate)
        .sort(
          (firstOrder, secondOrder) =>
            getDateValue(firstOrder.dueDate) -
            getDateValue(secondOrder.dueDate)
        )
        .slice(0, 5),
    [activeOrders]
  );

  const recentRequests = useMemo(
    () => requests.slice(0, 5),
    [requests]
  );

  return (
    <div className="min-h-screen bg-slate-950 px-5 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              SLYCEM HQ
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Business Command Center
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Your live view of orders, customers,
              production, products, revenue, and the
              work that needs your attention.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={isLoading}
            className="w-fit rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-bold transition hover:border-cyan-400 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? "Refreshing..."
              : "Refresh Dashboard"}
          </button>
        </header>

        {errorMessage && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-red-200">
            {errorMessage}
          </div>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Revenue This Month"
            value={`$${monthlyRevenue.toFixed(2)}`}
            detail={`${currentMonthOrders.length} non-cancelled orders`}
          />

          <MetricCard
            label="Profit This Month"
            value={`$${monthlyProfit.toFixed(2)}`}
            detail={getMarginDetail(
              monthlyRevenue,
              monthlyProfit
            )}
          />

          <MetricCard
            label="Active Orders"
            value={String(activeOrders.length)}
            detail={`${printingOrders.length} currently printing`}
          />

          <MetricCard
            label="New Requests"
            value={String(newRequests.length)}
            detail="Waiting for your attention"
          />
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Printing Now"
            value={String(printingOrders.length)}
            detail="Jobs in production"
          />

          <MetricCard
            label="Ready for Pickup"
            value={String(pickupOrders.length)}
            detail="Waiting for customers"
          />

          <MetricCard
            label="Catalog Products"
            value={String(products.length)}
            detail={`${publishedProducts.length} published`}
          />

          <MetricCard
            label="Customer Requests"
            value={String(requests.length)}
            detail="Total submitted requests"
          />
        </section>

        <section className="mt-8">
          <SectionHeading
            eyebrow="Take Action"
            title="Quick Actions"
            description="Jump straight into the work that generates or supports revenue."
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <QuickAction
              href="/customer-requests"
              icon="📨"
              title="Review Requests"
              detail={`${newRequests.length} waiting`}
            />

            <QuickAction
              href="/print-hq"
              icon="🖨️"
              title="Open Print HQ"
              detail={`${activeOrders.length} active orders`}
            />

            <QuickAction
              href="/products"
              icon="📦"
              title="Manage Catalog"
              detail={`${publishedProducts.length} published`}
            />

            <QuickAction
              href="/order"
              icon="➕"
              title="Public Order Form"
              detail="View customer intake page"
            />
          </div>
        </section>

        <div className="mt-8 grid gap-8 xl:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <SectionHeading
              eyebrow="Production"
              title="Priority Orders"
              description="Active jobs with the nearest due dates."
            />

            <div className="mt-5">
              {isLoading ? (
                <LoadingState />
              ) : urgentOrders.length === 0 ? (
                <EmptyState message="No active orders currently have due dates." />
              ) : (
                <div className="space-y-3">
                  {urgentOrders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                    />
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/print-hq"
              className="mt-5 inline-flex font-bold text-cyan-400 hover:text-cyan-300"
            >
              View all print orders →
            </Link>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <SectionHeading
              eyebrow="Customers"
              title="Recent Requests"
              description="Latest customer inquiries submitted through your public form."
            />

            <div className="mt-5">
              {isLoading ? (
                <LoadingState />
              ) : recentRequests.length === 0 ? (
                <EmptyState message="No customer requests have been submitted yet." />
              ) : (
                <div className="space-y-3">
                  {recentRequests.map((request) => (
                    <RequestRow
                      key={request.id}
                      request={request}
                    />
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/customer-requests"
              className="mt-5 inline-flex font-bold text-cyan-400 hover:text-cyan-300"
            >
              View all customer requests →
            </Link>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <SectionHeading
            eyebrow="Catalog"
            title="Product Readiness"
            description="A quick view of how much of your product library is ready for customers."
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <CatalogCard
              label="Total"
              value={products.length}
            />

            <CatalogCard
              label="Published"
              value={publishedProducts.length}
            />

            <CatalogCard
              label="Draft"
              value={
                products.length -
                publishedProducts.length
              }
            />
          </div>

          <Link
            href="/products"
            className="mt-5 inline-flex font-bold text-cyan-400 hover:text-cyan-300"
          >
            Manage product catalog →
          </Link>
        </section>
      </div>
    </div>
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
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

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-black text-white">
        {title}
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        {description}
      </p>
    </div>
  );
}

interface QuickActionProps {
  href: string;
  icon: string;
  title: string;
  detail: string;
}

function QuickAction({
  href,
  icon,
  title,
  detail,
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-cyan-500/50 hover:bg-slate-800"
    >
      <span className="text-3xl">{icon}</span>

      <h3 className="mt-4 font-black text-white group-hover:text-cyan-300">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {detail}
      </p>
    </Link>
  );
}

function OrderRow({
  order,
}: {
  order: PrintOrder;
}) {
  const dueStatus = getDueStatus(order.dueDate);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-black text-white">
          {order.orderNumber}
        </p>

        <p className="mt-1 text-sm text-slate-400">
          {order.customerName} · {order.itemName}
        </p>
      </div>

      <div className="sm:text-right">
        <p
          className={`text-sm font-bold ${
            dueStatus === "overdue"
              ? "text-red-300"
              : dueStatus === "today"
                ? "text-yellow-300"
                : "text-slate-300"
          }`}
        >
          {order.dueDate
            ? `Due ${formatDate(order.dueDate)}`
            : "No due date"}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {order.status}
        </p>
      </div>
    </div>
  );
}

function RequestRow({
  request,
}: {
  request: CustomerOrderRequest;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-black text-white">
          {request.customerName}
        </p>

        <p className="mt-1 line-clamp-1 text-sm text-slate-400">
          {request.itemDescription}
        </p>
      </div>

      <div className="sm:text-right">
        <p className="text-sm font-bold text-cyan-300">
          {request.requestStatus}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {formatDateTime(request.createdAt)}
        </p>
      </div>
    </div>
  );
}

function CatalogCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-white">
        {value}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-500">
      Loading...
    </div>
  );
}

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-500">
      {message}
    </div>
  );
}

function getMarginDetail(
  revenue: number,
  profit: number
) {
  if (revenue <= 0) {
    return "No revenue recorded this month";
  }

  const margin = (profit / revenue) * 100;

  return `${margin.toFixed(1)}% estimated margin`;
}

function getDateValue(date: string) {
  return new Date(`${date}T00:00:00`).getTime();
}

function formatDate(date: string) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString();
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleDateString();
}

function getDueStatus(date: string) {
  if (!date) {
    return "none";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(`${date}T00:00:00`);

  if (dueDate.getTime() < today.getTime()) {
    return "overdue";
  }

  if (dueDate.getTime() === today.getTime()) {
    return "today";
  }

  return "upcoming";
}