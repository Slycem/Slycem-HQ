"use client";

import { FormEvent, useState } from "react";

import { NewProduct } from "@/types/Product";

interface ProductFormProps {
  addProduct: (product: NewProduct) => Promise<void>;
  isSaving: boolean;
}

const emptyProduct: NewProduct = {
  name: "",
  description: "",
  startingPrice: 0,
  material: "",
  colors: "",
  printHours: 0,
  filamentGrams: 0,
  imagePath: "",
  stlPath: "",
  threeMfPath: "",
  isPublished: false,
  isActive: true,
};

export default function ProductForm({
  addProduct,
  isSaving,
}: ProductFormProps) {
  const [product, setProduct] =
    useState<NewProduct>(emptyProduct);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!product.name.trim()) {
      return;
    }

    await addProduct(product);
    setProduct(emptyProduct);
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
          Product Manager
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          Add Product
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Create a reusable product that can later appear in
          the customer catalog.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Product Name" required>
          <input
            type="text"
            value={product.name}
            onChange={(event) =>
              setProduct((currentProduct) => ({
                ...currentProduct,
                name: event.target.value,
              }))
            }
            placeholder="Example: Custom Dog Tag"
            required
            className={inputClassName}
          />
        </FormField>

        <FormField label="Description">
          <textarea
            value={product.description}
            onChange={(event) =>
              setProduct((currentProduct) => ({
                ...currentProduct,
                description: event.target.value,
              }))
            }
            placeholder="Describe the product and any important options."
            rows={4}
            className={inputClassName}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Starting Price">
            <NumberInput
              value={product.startingPrice}
              step="0.01"
              onChange={(value) =>
                setProduct((currentProduct) => ({
                  ...currentProduct,
                  startingPrice: value,
                }))
              }
            />
          </FormField>

          <FormField label="Material">
            <input
              type="text"
              value={product.material}
              onChange={(event) =>
                setProduct((currentProduct) => ({
                  ...currentProduct,
                  material: event.target.value,
                }))
              }
              placeholder="PLA"
              className={inputClassName}
            />
          </FormField>

          <FormField label="Available Colors">
            <input
              type="text"
              value={product.colors}
              onChange={(event) =>
                setProduct((currentProduct) => ({
                  ...currentProduct,
                  colors: event.target.value,
                }))
              }
              placeholder="Black, White, Red"
              className={inputClassName}
            />
          </FormField>

          <FormField label="Estimated Print Hours">
            <NumberInput
              value={product.printHours}
              step="0.1"
              onChange={(value) =>
                setProduct((currentProduct) => ({
                  ...currentProduct,
                  printHours: value,
                }))
              }
            />
          </FormField>

          <FormField label="Estimated Filament Grams">
            <NumberInput
              value={product.filamentGrams}
              step="0.1"
              onChange={(value) =>
                setProduct((currentProduct) => ({
                  ...currentProduct,
                  filamentGrams: value,
                }))
              }
            />
          </FormField>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={product.isPublished}
              onChange={(event) =>
                setProduct((currentProduct) => ({
                  ...currentProduct,
                  isPublished: event.target.checked,
                }))
              }
              className="mt-1 h-4 w-4 accent-cyan-400"
            />

            <span>
              <span className="block font-bold text-white">
                Publish to customer catalog
              </span>

              <span className="mt-1 block text-sm text-slate-500">
                Published products will later appear on the
                public storefront.
              </span>
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSaving || !product.name.trim()}
          className="w-full rounded-xl bg-cyan-400 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSaving ? "Saving Product..." : "Add Product"}
        </button>
      </form>
    </section>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormField({
  label,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-300">
        {label}

        {required && (
          <span className="ml-1 text-red-400">*</span>
        )}
      </span>

      {children}
    </label>
  );
}

interface NumberInputProps {
  value: number;
  step: string;
  onChange: (value: number) => void;
}

function NumberInput({
  value,
  step,
  onChange,
}: NumberInputProps) {
  return (
    <input
      type="number"
      min="0"
      step={step}
      value={value}
      onChange={(event) =>
        onChange(Number(event.target.value))
      }
      className={inputClassName}
    />
  );
}

const inputClassName =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400";