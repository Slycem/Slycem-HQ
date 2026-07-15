import { PrintOrder } from "@/types/PrintOrder";

interface OrderDetailsProps {
  selectedOrder: PrintOrder | null;
}

function formatDate(date: string) {
  if (!date) {
    return "No due date";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString();
}

export default function OrderDetails({
  selectedOrder,
}: OrderDetailsProps) {
  if (!selectedOrder) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Select an order to view its full details.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
          Order Details
        </p>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black">
              {selectedOrder.orderNumber}
            </h2>

            <p className="mt-1 text-slate-400">
              {selectedOrder.itemName}
            </p>
          </div>

          <span className="w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-bold text-cyan-300">
            {selectedOrder.status}
          </span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <DetailCard
          label="Customer"
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
          label="Material"
          value={selectedOrder.material || "Not specified"}
        />

        <DetailCard
          label="Color"
          value={selectedOrder.color || "Not specified"}
        />

        <DetailCard
          label="Quantity"
          value={String(selectedOrder.quantity)}
        />

        <DetailCard
          label="Due Date"
          value={formatDate(selectedOrder.dueDate)}
        />

        <DetailCard
          label="Print Time"
          value={`${selectedOrder.printHours.toFixed(1)} hours`}
        />

        <DetailCard
          label="Filament Used"
          value={`${selectedOrder.filamentGrams.toFixed(1)} g`}
        />

        <DetailCard
          label="Filament Cost"
          value={`$${selectedOrder.filamentCost.toFixed(2)}`}
        />

        <DetailCard
          label="Sale Price"
          value={`$${selectedOrder.salePrice.toFixed(2)}`}
        />

        <DetailCard
          label="Profit"
          value={`$${selectedOrder.profit.toFixed(2)}`}
        />
      </div>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
        <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Notes
        </p>

        <p className="mt-3 whitespace-pre-wrap text-slate-200">
          {selectedOrder.notes || "No notes were added."}
        </p>
      </div>
    </section>
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

      <p className="mt-2 font-semibold text-white">
        {value}
      </p>
    </div>
  );
}