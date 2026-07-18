"use client";

import {
  OrderStatus,
  PrintOrder,
} from "@/types/PrintOrder";

interface OrderDetailsProps {
  selectedOrder: PrintOrder | null;
  updateOrderStatus?: (
    orderId: number,
    newStatus: OrderStatus
  ) => Promise<void>;
}

const workflowSteps: OrderStatus[] = [
  "New",
  "Quoted",
  "Approved",
  "Printing",
  "Ready for Pickup",
  "Delivered",
];

export default function OrderDetails({
  selectedOrder,
  updateOrderStatus,
}: OrderDetailsProps) {
  if (!selectedOrder) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
          Print Job Workspace
        </p>

        <h2 className="mt-3 text-2xl font-black text-white">
          No Order Selected
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-slate-400">
          Select an order from the production queue or order
          table to open its customer, production, and financial
          details.
        </p>
      </section>
    );
  }

  const nextAction = getNextAction(selectedOrder.status);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-5 border-b border-slate-800 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
            Print Job Workspace
          </p>

          <h2 className="mt-2 text-3xl font-black text-white">
            {selectedOrder.orderNumber}
          </h2>

          <p className="mt-2 text-lg font-semibold text-slate-300">
            {selectedOrder.itemName}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Quantity: {selectedOrder.quantity}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <StatusBadge status={selectedOrder.status} />

          <p className="text-sm text-slate-400">
            Due {formatDate(selectedOrder.dueDate)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <SectionHeading
          eyebrow="Workflow"
          title="Production Progress"
        />

        <WorkflowTimeline currentStatus={selectedOrder.status} />

        {nextAction && (
          <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-white">
                  Next Production Step
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {nextAction.description}
                </p>
              </div>

              <button
                type="button"
                disabled={!updateOrderStatus}
                onClick={() =>
                  updateOrderStatus
                    ? void updateOrderStatus(
                        selectedOrder.id,
                        nextAction.status
                      )
                    : undefined
                }
                className="rounded-xl bg-cyan-400 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {nextAction.label}
              </button>
            </div>

            {!updateOrderStatus && (
              <p className="mt-3 text-xs text-slate-500">
                The workflow button will activate after we
                connect this workspace to Print HQ.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <WorkspaceSection
          eyebrow="Customer"
          title="Customer Information"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailCard
              label="Customer Name"
              value={selectedOrder.customerName}
            />

            <DetailCard
              label="Phone"
              value={selectedOrder.phone || "Not provided"}
            />

            <DetailCard
              label="Email"
              value={selectedOrder.email || "Not provided"}
            />

            <DetailCard
              label="Due Date"
              value={formatDate(selectedOrder.dueDate)}
            />
          </div>
        </WorkspaceSection>

        <WorkspaceSection
          eyebrow="Production"
          title="Print Specifications"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailCard
              label="Material"
              value={
                selectedOrder.material || "Not specified"
              }
            />

            <DetailCard
              label="Color"
              value={selectedOrder.color || "Not specified"}
            />

            <DetailCard
              label="Print Time"
              value={`${selectedOrder.printHours.toFixed(
                1
              )} hours`}
            />

            <DetailCard
              label="Filament Used"
              value={`${selectedOrder.filamentGrams.toFixed(
                1
              )} g`}
            />
          </div>
        </WorkspaceSection>
      </div>

      <div className="mt-6">
        <WorkspaceSection
          eyebrow="Financial"
          title="Job Financial Breakdown"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <FinancialCard
              label="Sale Price"
              value={`$${selectedOrder.salePrice.toFixed(2)}`}
              detail="Customer price"
            />

            <FinancialCard
              label="Filament Cost"
              value={`$${selectedOrder.filamentCost.toFixed(
                2
              )}`}
              detail="Estimated material cost"
            />

            <FinancialCard
              label="Estimated Profit"
              value={`$${selectedOrder.profit.toFixed(2)}`}
              detail={`${calculateMargin(
                selectedOrder.salePrice,
                selectedOrder.profit
              )}% margin`}
              highlight
            />
          </div>
        </WorkspaceSection>
      </div>

      <div className="mt-6">
        <WorkspaceSection
          eyebrow="Job Notes"
          title="Instructions and Details"
        >
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <p className="whitespace-pre-wrap text-slate-200">
              {selectedOrder.notes ||
                "No notes were added to this order."}
            </p>
          </div>
        </WorkspaceSection>
      </div>

      {selectedOrder.status !== "Delivered" &&
        selectedOrder.status !== "Cancelled" && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              disabled={!updateOrderStatus}
              onClick={() =>
                updateOrderStatus
                  ? void updateOrderStatus(
                      selectedOrder.id,
                      "Cancelled"
                    )
                  : undefined
              }
              className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel Order
            </button>
          </div>
        )}
    </section>
  );
}

interface WorkspaceSectionProps {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}

function WorkspaceSection({
  eyebrow,
  title,
  children,
}: WorkspaceSectionProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
      <SectionHeading eyebrow={eyebrow} title={title} />

      <div className="mt-5">{children}</div>
    </div>
  );
}

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
}

function SectionHeading({
  eyebrow,
  title,
}: SectionHeadingProps) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
        {eyebrow}
      </p>

      <h3 className="mt-1 text-xl font-black text-white">
        {title}
      </h3>
    </div>
  );
}

interface DetailCardProps {
  label: string;
  value: string;
}

function DetailCard({
  label,
  value,
}: DetailCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

interface FinancialCardProps {
  label: string;
  value: string;
  detail: string;
  highlight?: boolean;
}

function FinancialCard({
  label,
  value,
  detail,
  highlight = false,
}: FinancialCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-slate-800 bg-slate-950"
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-black ${
          highlight ? "text-emerald-300" : "text-white"
        }`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {detail}
      </p>
    </div>
  );
}

function WorkflowTimeline({
  currentStatus,
}: {
  currentStatus: OrderStatus;
}) {
  if (currentStatus === "Cancelled") {
    return (
      <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/5 p-4 font-bold text-red-300">
        This order has been cancelled.
      </div>
    );
  }

  const currentIndex = workflowSteps.indexOf(currentStatus);

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {workflowSteps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div
            key={step}
            className={`rounded-xl border p-3 ${
              isCurrent
                ? "border-cyan-400 bg-cyan-400/10"
                : isComplete
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-slate-800 bg-slate-950"
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                isCurrent
                  ? "bg-cyan-400 text-slate-950"
                  : isComplete
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-slate-800 text-slate-500"
              }`}
            >
              {isComplete ? "✓" : index + 1}
            </div>

            <p
              className={`mt-3 text-sm font-bold ${
                isCurrent
                  ? "text-cyan-300"
                  : isComplete
                    ? "text-emerald-300"
                    : "text-slate-500"
              }`}
            >
              {step}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const className = getStatusClassName(status);

  return (
    <span
      className={`w-fit rounded-full border px-3 py-1 text-sm font-black ${className}`}
    >
      {status}
    </span>
  );
}

function getStatusClassName(status: OrderStatus) {
  switch (status) {
    case "New":
      return "border-slate-500/40 bg-slate-500/10 text-slate-300";

    case "Quoted":
      return "border-blue-500/40 bg-blue-500/10 text-blue-300";

    case "Approved":
      return "border-yellow-500/40 bg-yellow-500/10 text-yellow-300";

    case "Printing":
      return "border-orange-500/40 bg-orange-500/10 text-orange-300";

    case "Ready for Pickup":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";

    case "Delivered":
      return "border-cyan-500/40 bg-cyan-500/10 text-cyan-300";

    case "Cancelled":
      return "border-red-500/40 bg-red-500/10 text-red-300";

    default:
      return "border-slate-500/40 bg-slate-500/10 text-slate-300";
  }
}

interface NextAction {
  label: string;
  description: string;
  status: OrderStatus;
}

function getNextAction(
  currentStatus: OrderStatus
): NextAction | null {
  switch (currentStatus) {
    case "New":
      return {
        label: "Mark as Quoted",
        description:
          "Confirm that pricing has been prepared for this customer.",
        status: "Quoted",
      };

    case "Quoted":
      return {
        label: "Approve Order",
        description:
          "Confirm that the customer approved the quote.",
        status: "Approved",
      };

    case "Approved":
      return {
        label: "Start Printing",
        description:
          "Move this job into active production.",
        status: "Printing",
      };

    case "Printing":
      return {
        label: "Finish Print",
        description:
          "Mark the completed job as ready for customer pickup.",
        status: "Ready for Pickup",
      };

    case "Ready for Pickup":
      return {
        label: "Mark Delivered",
        description:
          "Confirm that the customer received the finished order.",
        status: "Delivered",
      };

    default:
      return null;
  }
}

function calculateMargin(
  salePrice: number,
  profit: number
) {
  if (salePrice <= 0) {
    return "0.0";
  }

  return ((profit / salePrice) * 100).toFixed(1);
}

function formatDate(date: string) {
  if (!date) {
    return "not assigned";
  }

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString();
}