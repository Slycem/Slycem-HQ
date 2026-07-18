"use client";

import { Product } from "@/types/Product";

interface ProductGridProps {
  products: Product[];
  setSelectedProduct: (product: Product) => void;
  togglePublished: (
    productId: number,
    isPublished: boolean
  ) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;
}

export default function ProductGrid({
  products,
  setSelectedProduct,
  togglePublished,
  deleteProduct,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
          Product Catalog
        </p>

        <h2 className="mt-3 text-2xl font-black text-white">
          No Products Yet
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-slate-400">
          Add your first reusable print product using the form.
          It will appear here and can later be published to the
          customer storefront.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-5">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
          Product Catalog
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          Your Products
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Manage reusable products, pricing, production details,
          and storefront visibility.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.id}
            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
          >
            <button
              type="button"
              onClick={() => setSelectedProduct(product)}
              className="block w-full text-left"
            >
              <ProductImage product={product} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black text-white">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-2xl font-black text-cyan-300">
                      ${product.startingPrice.toFixed(2)}
                    </p>
                  </div>

                  <PublicationBadge
                    isPublished={product.isPublished}
                  />
                </div>

                <p className="mt-4 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-400">
                  {product.description ||
                    "No product description has been added."}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
                  {product.material && (
                    <ProductTag value={product.material} />
                  )}

                  {product.printHours > 0 && (
                    <ProductTag
                      value={`${product.printHours.toFixed(
                        1
                      )} hrs`}
                    />
                  )}

                  {product.filamentGrams > 0 && (
                    <ProductTag
                      value={`${product.filamentGrams.toFixed(
                        1
                      )} g`}
                    />
                  )}
                </div>

                {product.colors && (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Colors
                    </p>

                    <p className="mt-1 truncate text-sm text-slate-300">
                      {product.colors}
                    </p>
                  </div>
                )}
              </div>
            </button>

            <div className="grid grid-cols-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() =>
                  void togglePublished(
                    product.id,
                    !product.isPublished
                  )
                }
                className="border-r border-slate-800 px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                {product.isPublished
                  ? "Unpublish"
                  : "Publish"}
              </button>

              <button
                type="button"
                onClick={() => void deleteProduct(product.id)}
                className="px-4 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/10"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductImage({
  product,
}: {
  product: Product;
}) {
  if (product.imagePath) {
    return (
      <div className="aspect-[4/3] overflow-hidden bg-slate-950">
        <img
          src={product.imagePath}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-[4/3] items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="text-5xl">📦</div>

        <p className="mt-3 text-sm font-bold text-slate-500">
          Product photo coming next
        </p>
      </div>
    </div>
  );
}

function ProductTag({
  value,
}: {
  value: string;
}) {
  return (
    <span className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5">
      {value}
    </span>
  );
}

function PublicationBadge({
  isPublished,
}: {
  isPublished: boolean;
}) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-black ${
        isPublished
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          : "border-slate-600 bg-slate-800 text-slate-400"
      }`}
    >
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}