"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function CustomerOrderPage() {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredContact, setPreferredContact] = useState("Text");

  const [itemDescription, setItemDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [materialPreference, setMaterialPreference] =
    useState("");
  const [colorPreference, setColorPreference] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function resetForm() {
    setCustomerName("");
    setPhone("");
    setEmail("");
    setPreferredContact("Text");
    setItemDescription("");
    setQuantity("1");
    setMaterialPreference("");
    setColorPreference("");
    setNeededBy("");
    setNotes("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage("");
    setIsSubmitted(false);

    const parsedQuantity = Math.max(
      1,
      Number.parseInt(quantity, 10) || 1
    );

    const { error } = await supabase
      .from("customer_order_requests")
      .insert({
        customer_name: customerName.trim(),
        phone: phone.trim() || null,
        email: email.trim(),
        preferred_contact: preferredContact,
        item_description: itemDescription.trim(),
        quantity: parsedQuantity,
        material_preference:
          materialPreference.trim() || null,
        color_preference: colorPreference.trim() || null,
        needed_by: neededBy || null,
        notes: notes.trim() || null,
        request_status: "Submitted",
      });

    if (error) {
      console.error("Order request submission failed:", error);
      setErrorMessage(
        "Your request could not be submitted. Please check the form and try again."
      );
      setIsSubmitting(false);
      return;
    }

    resetForm();
    setIsSubmitted(true);
    setIsSubmitting(false);
  }

  const inputClasses =
    "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400";

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex text-sm font-bold text-cyan-400 hover:text-cyan-300"
        >
          ← Return to SLYCEM HQ
        </Link>

        <header className="mt-8">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            SLYCEM 3D Printing
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Request a Custom 3D Print
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400">
            Tell us what you would like printed. We will review
            the request and contact you with questions, pricing,
            and an estimated completion date.
          </p>
        </header>

        {isSubmitted && (
          <div className="mt-8 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-5 text-emerald-200">
            <p className="font-black">
              Your request was submitted successfully.
            </p>
            <p className="mt-2">
              We will review it and contact you using your
              preferred contact method.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-500/40 bg-red-950/40 p-5 text-red-200">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8"
        >
          <section>
            <h2 className="text-2xl font-black">
              Contact Information
            </h2>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">
                  Name
                </span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(event.target.value)
                  }
                  className={inputClasses}
                  placeholder="Your full name"
                  required
                />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
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
                    className={inputClasses}
                    placeholder="Phone number"
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
                    className={inputClasses}
                    placeholder="Email address"
                    required
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-slate-300">
                  Preferred Contact Method
                </span>
                <select
                  value={preferredContact}
                  onChange={(event) =>
                    setPreferredContact(event.target.value)
                  }
                  className={inputClasses}
                >
                  <option value="Text">Text message</option>
                  <option value="Phone">Phone call</option>
                  <option value="Email">Email</option>
                </select>
              </label>
            </div>
          </section>

          <div className="my-8 border-t border-slate-800" />

          <section>
            <h2 className="text-2xl font-black">
              Print Request
            </h2>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">
                  What would you like printed?
                </span>
                <textarea
                  value={itemDescription}
                  onChange={(event) =>
                    setItemDescription(event.target.value)
                  }
                  className={inputClasses}
                  placeholder="Describe the item, its purpose, approximate dimensions, and any special requirements."
                  rows={6}
                  required
                />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
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
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-300">
                    Needed By
                  </span>
                  <input
                    type="date"
                    value={neededBy}
                    onChange={(event) =>
                      setNeededBy(event.target.value)
                    }
                    className={inputClasses}
                  />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-300">
                    Material Preference
                  </span>
                  <input
                    type="text"
                    value={materialPreference}
                    onChange={(event) =>
                      setMaterialPreference(event.target.value)
                    }
                    className={inputClasses}
                    placeholder="PLA, PETG, TPU, or unsure"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-300">
                    Color Preference
                  </span>
                  <input
                    type="text"
                    value={colorPreference}
                    onChange={(event) =>
                      setColorPreference(event.target.value)
                    }
                    className={inputClasses}
                    placeholder="Color or color combination"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-slate-300">
                  Additional Notes
                </span>
                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  className={inputClasses}
                  placeholder="Include any other details that may help us prepare your quote."
                  rows={4}
                />
              </label>
            </div>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full rounded-xl bg-cyan-400 px-6 py-4 text-lg font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Submitting Request..."
              : "Submit Print Request"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-500">
            Submitting this form requests a quote and does not
            require payment.
          </p>
        </form>
      </div>
    </main>
  );
}