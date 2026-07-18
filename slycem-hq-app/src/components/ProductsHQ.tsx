"use client";

import { useEffect, useMemo, useState } from "react";

import ProductForm from "@/components/ProductForm";
import ProductGrid from "@/components/ProductGrid";
import {
  newProductToRow,
  rowToProduct,
} from "@/lib/products";
import { supabase } from "@/lib/supabase";
import {
  NewProduct,
  Product,
  ProductRow,
} from "@/types/Product";

export default function ProductsHQ() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    void loadProducts();
  }, []);

  async function loadProducts() {
    setIsLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Unable to load products:", error);

      setErrorMessage(
        "The Products module could not load your catalog."
      );

      setIsLoading(false);
      return;
    }

    const loadedProducts = ((data ?? []) as ProductRow[]).map(
      rowToProduct
    );

    setProducts(loadedProducts);
    setIsLoading(false);
  }

  async function addProduct(product: NewProduct) {
    setIsSaving(true);
    setErrorMessage("");

    const row = newProductToRow(product);

    const { data, error } = await supabase
      .from("products")
      .insert(row)
      .select("*")
      .single();

    if (error) {
      console.error("Unable to add product:", error);

      setErrorMessage(
        "The product could not be saved. Please try again."
      );

      setIsSaving(false);
      return;
    }

    const savedProduct = rowToProduct(data as ProductRow);

    setProducts((currentProducts) => [
      savedProduct,
      ...currentProducts,
    ]);

    setSelectedProduct(savedProduct);
    setIsSaving(false);
  }

  async function togglePublished(
    productId: number,
    isPublished: boolean
  ) {
    setErrorMessage("");

    const { data, error } = await supabase
      .from("products")
      .update({ is_published: isPublished })
      .eq("id", productId)
      .select("*")
      .single();

    if (error) {
      console.error(
        "Unable to update product publication status:",
        error
      );

      setErrorMessage(
        "The product publication status could not be updated."
      );

      return;
    }

    const updatedProduct = rowToProduct(data as ProductRow);

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId ? updatedProduct : product
      )
    );

    setSelectedProduct((currentProduct) =>
      currentProduct?.id === productId
        ? updatedProduct
        : currentProduct
    );
  }

  async function deleteProduct(productId: number) {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!shouldDelete) {
      return;
    }

    setErrorMessage("");

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Unable to delete product:", error);

      setErrorMessage(
        "The product could not be deleted."
      );

      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter(
        (product) => product.id !== productId
      )
    );

    setSelectedProduct((currentProduct) =>
      currentProduct?.id === productId
        ? null
        : currentProduct
    );
  }

  const publishedProducts = useMemo(
    () =>
      products.filter(
        (product) => product.isPublished
      ),
    [products]
  );

  const draftProducts = useMemo(
    () =>
      products.filter(
        (product) => !product.isPublished
      ),
    [products]
  );

  const activeProducts = useMemo(
    () =>
      products.filter(
        (product) => product.isActive
      ),
    [products]
  );

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              Products
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Product Catalog Manager
            </h1>

            <p className="mt-2 max-w-2xl text-slate-400">
              Build reusable products, prepare listings, and
              control what will appear in the customer-facing
              catalog.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadProducts()}
            disabled={isLoading}
            className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-bold transition hover:border-cyan-400 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? "Loading..."
              : "Refresh Products"}
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
              Catalog Overview
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Product Library
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              A live snapshot of your reusable products and
              storefront readiness.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Products"
              value={String(products.length)}
              detail="All catalog products"
            />

            <MetricCard
              label="Active Products"
              value={String(activeProducts.length)}
              detail="Available for use"
            />

            <MetricCard
              label="Published"
              value={String(publishedProducts.length)}
              detail="Visible to customers later"
            />

            <MetricCard
              label="Drafts"
              value={String(draftProducts.length)}
              detail="Still being prepared"
            />
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[380px_1fr]">
          <div>
            <ProductForm
              addProduct={addProduct}
              isSaving={isSaving}
            />
          </div>

          <div>
            {isLoading ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
                Loading your products...
              </div>
            ) : (
              <ProductGrid
                products={products}
                setSelectedProduct={setSelectedProduct}
                togglePublished={togglePublished}
                deleteProduct={deleteProduct}
              />
            )}

            {selectedProduct && (
              <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
                  Selected Product
                </p>

                <h2 className="mt-2 text-2xl font-black text-white">
                  {selectedProduct.name}
                </h2>

                <p className="mt-2 text-slate-400">
                  The full product workspace, photo uploads,
                  file attachments, and editing tools will be
                  added next.
                </p>
              </div>
            )}
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