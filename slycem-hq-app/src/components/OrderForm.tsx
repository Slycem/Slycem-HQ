"use client";

import { FormEvent, useState } from "react";

import {
  NewPrintOrder,
  OrderStatus,
} from "@/types/PrintOrder";

interface OrderFormProps {
  addOrder: (order: NewPrintOrder) => Promise<void>;
  isSaving: boolean;
}

const defaultStatus: OrderStatus = "New";

export default function OrderForm({
  addOrder,
  isSaving,
}: OrderFormProps) {
  const [orderNumber, setOrderNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [itemName, setItemName] = useState("");
  const [material, setMaterial] = useState("PLA");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState("1");

  const [status, setStatus] =
    useState<OrderStatus>(defaultStatus);
  const [dueDate, setDueDate] = useState("");

  const [printHours, setPrintHours] = useState("0");
  const [filamentGrams, setFilamentGrams] = useState("0");
  const [filamentCost, setFilamentCost] = useState("0");
  const [salePrice, setSalePrice] = useState("0");

  const [notes, setNotes] = useState("");

  function resetForm() {
    setOrderNumber("");
    setCustomerName("");
    setPhone("");
    setEmail("");

    setItemName("");
    setMaterial("PLA");
    setColor("");
    setQuantity("1");

    setStatus(defaultStatus);
    setDueDate("");

    setPrintHours("0");
    setFilamentGrams("0");
    setFilamentCost("0");
    setSalePrice("0");

    setNotes("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const parsedQuantity = Math.max(
      1,
      Number.parseInt(quantity, 10) || 1
    );

    const parsedPrintHours = Number(printHours) || 0;
    const parsedFilamentGrams = Number(filamentGrams) || 0;
    const parsedFilamentCost = Number(filamentCost) || 0;
    const parsedSalePrice = Number(salePrice) || 0;

    const profit =
      parsedSalePrice - parsedFilamentCost;

    const order: NewPrintOrder = {
      orderNumber: orderNumber.trim(),
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim(),

      itemName: itemName.trim(),
      material: material.trim(),
      color: color.trim(),
      quantity: parsedQuantity,

      status,
      dueDate,

      printHours: parsedPrintHours,
      filamentGrams: parsedFilamentGrams,
      filamentCost: parsedFilamentCost,
      salePrice: parsedSalePrice,
      profit,

      notes: notes.trim(),
    };

    await addOrder(order);
    resetForm();
  }

  const inputClasses =
    "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
    >
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
          New Order
        </p>

        <h2 className="mt-2 text-2xl font-black">
          Add Print Order
        </h2>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">
            Order Number
          </span>
          <input
            type="text"
            value={orderNumber}
            onChange={(event) =>
              setOrderNumber(event.target.value)
            }
            placeholder="Example: SLY-1001"
            className={inputClasses}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-300">
            Customer Name
          </span>
          <input
            type="text"
            value={customerName}
            onChange={(event) =>
              setCustomerName(event.target.value)
            }
            placeholder="Customer name"
            className={inputClasses}
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">
              Phone
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="Phone number"
              className={inputClasses}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-300">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Email address"
              className={inputClasses}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-slate-300">
            Item Name
          </span>
          <input
            type="text"
            value={itemName}
            onChange={(event) =>
              setItemName(event.target.value)
            }
            placeholder="What are you printing?"
            className={inputClasses}
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">
              Material
            </span>
            <input
              type="text"
              value={material}
              onChange={(event) =>
                setMaterial(event.target.value)
              }
              placeholder="PLA, PETG, TPU..."
              className={inputClasses}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-300">
              Color
            </span>
            <input
              type="text"
              value={color}
              onChange={(event) =>
                setColor(event.target.value)
              }
              placeholder="Color"
              className={inputClasses}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">
              Quantity
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(event.target.value)
              }
              className={inputClasses}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-300">
              Status
            </span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as OrderStatus
                )
              }
              className={inputClasses}
            >
              <option value="New">New</option>
              <option value="Quoted">Quoted</option>
              <option value="Approved">Approved</option>
              <option value="Printing">Printing</option>
              <option value="Completed">Completed</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-slate-300">
            Due Date
          </span>
          <input
            type="date"
            value={dueDate}
            onChange={(event) =>
              setDueDate(event.target.value)
            }
            className={inputClasses}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">
              Print Hours
            </span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={printHours}
              onChange={(event) =>
                setPrintHours(event.target.value)
              }
              className={inputClasses}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-300">
              Filament Used (g)
            </span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={filamentGrams}
              onChange={(event) =>
                setFilamentGrams(event.target.value)
              }
              className={inputClasses}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">
              Filament Cost
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={filamentCost}
              onChange={(event) =>
                setFilamentCost(event.target.value)
              }
              className={inputClasses}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-300">
              Sale Price
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={salePrice}
              onChange={(event) =>
                setSalePrice(event.target.value)
              }
              className={inputClasses}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-slate-300">
            Notes
          </span>
          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            placeholder="Order notes, special instructions, customer requests..."
            rows={4}
            className={inputClasses}
          />
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-xl bg-cyan-400 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving Order..." : "Save Order"}
        </button>
      </div>
    </form>
  );
}