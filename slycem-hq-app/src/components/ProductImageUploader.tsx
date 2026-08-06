"use client";

import { ChangeEvent, useEffect, useState } from "react";

import {
  createProductFileUrl,
  isValidProductImage,
  uploadProductImage,
} from "@/lib/productFiles";
import { Product } from "@/types/Product";

interface ProductImageUploaderProps {
  product: Product;
  updateProductImage: (
    productId: number,
    imagePath: string
  ) => Promise<void>;
}

export default function ProductImageUploader({
  product,
  updateProductImage,
}: ProductImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [isLoadingImage, setIsLoadingImage] =
    useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadImage() {
      if (!product.imagePath) {
        setImageUrl("");
        return;
      }

      setIsLoadingImage(true);
      setErrorMessage("");

      try {
        const signedUrl = await createProductFileUrl(
          product.imagePath
        );

        if (!isCancelled) {
          setImageUrl(signedUrl);
        }
      } catch (error) {
        console.error("Unable to load product image:", error);

        if (!isCancelled) {
          setErrorMessage(
            "The current product image could not be loaded."
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingImage(false);
        }
      }
    }

    void loadImage();

    return () => {
      isCancelled = true;
    };
  }, [product.imagePath]);

  async function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setErrorMessage("");

    if (!isValidProductImage(file)) {
      setErrorMessage(
        "Choose a JPG, PNG, or WebP image no larger than 10 MB."
      );

      return;
    }

    setIsUploading(true);

    try {
      const filePath = await uploadProductImage(
        product.id,
        file
      );

      await updateProductImage(product.id, filePath);

      const signedUrl = await createProductFileUrl(filePath);
      setImageUrl(signedUrl);
    } catch (error) {
      console.error("Unable to upload product image:", error);

      setErrorMessage(
        "The image could not be uploaded. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
          Product Image
        </p>

        <h3 className="mt-2 text-xl font-black text-white">
          {product.name}
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Upload the main image that will represent this product
          in the catalog.
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        {isLoadingImage ? (
          <div className="flex aspect-[4/3] items-center justify-center text-slate-500">
            Loading image...
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="aspect-[4/3] h-full w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center p-6 text-center">
            <div>
              <div className="text-5xl">📷</div>

              <p className="mt-3 font-bold text-slate-400">
                No product image uploaded
              </p>

              <p className="mt-1 text-sm text-slate-600">
                JPG, PNG, or WebP up to 10 MB
              </p>
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-4 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      <label className="mt-5 block">
        <span className="sr-only">
          Choose product image
        </span>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          disabled={isUploading}
          className="block w-full cursor-pointer rounded-xl border border-slate-700 bg-slate-950 text-sm text-slate-400 file:mr-4 file:border-0 file:bg-cyan-400 file:px-4 file:py-3 file:font-black file:text-slate-950 hover:file:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>

      <p className="mt-3 text-sm text-slate-500">
        {isUploading
          ? "Uploading image..."
          : imageUrl
            ? "Choose another image to replace the current one."
            : "Choose an image to add it to this product."}
      </p>
    </section>
  );
}