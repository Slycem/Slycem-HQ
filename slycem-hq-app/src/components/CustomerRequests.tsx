"use client";

import { useEffect, useState } from "react";

import { rowToCustomerOrderRequest } from "@/lib/customerOrderRequests";
import { supabase } from "@/lib/supabase";
import {
  CustomerOrderRequest,
  CustomerOrderRequestRow,
  CustomerRequestStatus,
} from "@/types/CustomerOrderRequest";

const statusOptions: CustomerRequestStatus[] = [
  "Submitted",
  "Contacted",
  "Quoted",
  "Approved",
  "Declined",
];

function formatDate(date: string) {
  if (!date) {
    return "No date provided";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString();
}

function formatCreatedAt(date: string) {
  return new Date(date).toLocaleString();
}

export default function CustomerRequests() {
  const [requests, setRequests] = useState<CustomerOrderRequest[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    void loadRequests();
  }, []);

  async function loadRequests() {
    setIsLoading(true);
    setErrorMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setErrorMessage(
        "Sign in through the admin login to view customer requests."
      );
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("customer_order_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Unable to load customer requests:", error);
      setErrorMessage(
        "Customer requests could not be loaded."
      );
      setIsLoading(false);
      return;
    }

    const loadedRequests = (
      (data ?? []) as CustomerOrderRequestRow[]
    ).map(rowToCustomerOrderRequest);

    setRequests(loadedRequests);
    setIsLoading(false);
  }

  async function updateRequestStatus(
    requestId: number,
    newStatus: CustomerRequestStatus
  ) {
    setErrorMessage("");

    const { data, error } = await supabase
      .from("customer_order_requests")
      .update({ request_status: newStatus })
      .eq("id", requestId)
      .select("*")
      .single();

    if (error) {
      console.error("Unable to update request status:", error);
      setErrorMessage(
        "The customer request status could not be updated."
      );
      return;
    }

    const updatedRequest = rowToCustomerOrderRequest(
      data as CustomerOrderRequestRow
    );

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId ? updatedRequest : request
      )
    );
  }

  async function deleteRequest(requestId: number) {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this customer request?"
    );

    if (!shouldDelete) {
      return;
    }

    setErrorMessage("");

    const { error } = await supabase
      .from("customer_order_requests")
      .delete()
      .eq("id", requestId);

    if (error) {
      console.error("Unable to delete customer request:", error);
      setErrorMessage(
        "The customer request could not be deleted."
      );
      return;
    }

    setRequests((currentRequests) =>
      currentRequests.filter(
        (request) => request.id !== requestId
      )
    );
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900">
      <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
            Customer Intake
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Customer Requests
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Requests submitted from the public order form.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadRequests()}
          disabled={isLoading}
          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold transition hover:border-cyan-400 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Refresh Requests"}
        </button>
      </div>

      {errorMessage && (
        <div className="m-6 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-red-200">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="px-6 py-12 text-center text-slate-400">
          Loading customer requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="px-6 py-12 text-center text-slate-400">
          No customer requests have been submitted yet.
        </div>
      ) : (
        <div className="space-y-5 p-6">
          {requests.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Request #{request.id}
                  </p>

                  <h3 className="mt-2 text-xl font-black text-white">
                    {request.customerName}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Submitted {formatCreatedAt(request.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={request.requestStatus}
                    onChange={(event) =>
                      void updateRequestStatus(
                        request.id,
                        event.target
                          .value as CustomerRequestStatus
                      )
                    }
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-cyan-400"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      void deleteRequest(request.id)
                    }
                    className="rounded-lg border border-red-500/40 px-3 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <InfoCard
                  label="Phone"
                  value={request.phone || "Not provided"}
                />

                <InfoCard
                  label="Email"
                  value={request.email}
                />

                <InfoCard
                  label="Preferred Contact"
                  value={
                    request.preferredContact || "Not specified"
                  }
                />

                <InfoCard
                  label="Needed By"
                  value={formatDate(request.neededBy)}
                />

                <InfoCard
                  label="Quantity"
                  value={String(request.quantity)}
                />

                <InfoCard
                  label="Material"
                  value={
                    request.materialPreference ||
                    "No preference"
                  }
                />

                <InfoCard
                  label="Color"
                  value={
                    request.colorPreference || "No preference"
                  }
                />

                <InfoCard
                  label="Status"
                  value={request.requestStatus}
                />
              </div>

              <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Requested Item
                </p>

                <p className="mt-3 whitespace-pre-wrap text-slate-200">
                  {request.itemDescription}
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Additional Notes
                </p>

                <p className="mt-3 whitespace-pre-wrap text-slate-200">
                  {request.notes || "No additional notes."}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

interface InfoCardProps {
  label: string;
  value: string;
}

function InfoCard({ label, value }: InfoCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words font-semibold text-white">
        {value}
      </p>
    </div>
  );
}