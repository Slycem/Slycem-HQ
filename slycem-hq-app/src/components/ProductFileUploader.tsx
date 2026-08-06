"use client";

import { ChangeEvent, useState } from "react";

import { supabase } from "@/lib/supabase";
import { Product } from "@/types/Product";

interface ProductFileUploaderProps {
  product: Product;
  updateProductFile: (
    productId: number,
    field: "stl_path" | "three_mf_path",
    filePath: string
  ) => Promise<void>;
}

const bucketName = "print-files";

export default function ProductFileUploader({
  product,
  updateProductFile,
}: ProductFileUploaderProps) {
  const [isUploadingStl, setIsUploadingStl] = useState(false);
  const [isUploadingThreeMf, setIsUploadingThreeMf] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleFileUpload(
    event: ChangeEvent<HTMLInputElement>,
    fileType: "stl" | "3mf"
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const expectedExtension =
      fileType === "stl" ? ".stl" : ".3mf";

    if (!file.name.toLowerCase().endsWith(expectedExtension)) {
      setErrorMessage(
        `Please choose a valid ${expectedExtension.toUpperCase()} file.`
      );
      return;
    }

    const maximumFileSize = 100 * 1024 * 1024;

    if (file.size > maximumFileSize) {
      setErrorMessage(
        "The file is too large. The maximum size is 100 MB."
      );
      return;
    }

    const setUploading =
      fileType === "stl"
        ? setIsUploadingStl
        : setIsUploadingThreeMf;

    setUploading(true);

    try {
      const fileExtension =
        fileType === "stl" ? "stl" : "3mf";

      const filePath = `products/${product.id}/files/${crypto.randomUUID()}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType:
            file.type || "application/octet-stream",
        });

      if (uploadError) {
        throw uploadError;
      }

      await updateProductFile(
        product.id,
        fileType === "stl"
          ? "stl_path"
          : "three_mf_path",
        filePath
      );

      setSuccessMessage(
        `${file.name} was uploaded successfully.`
      );
    } catch (error) {
      console.error("Unable to upload product file:", error);

      setErrorMessage(
        "The product file could not be uploaded. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
          Product Files
        </p>

        <h3 className="mt-2 text-xl font-black text-white">
          Print Files
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Attach the primary STL and 3MF files used to produce
          this product.
        </p>
      </div>

      {successMessage && (
        <div className="mt-5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mt-5 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <FileUploadCard
          title="STL File"
          description="Primary printable model file"
          currentPath={product.stlPath}
          accept=".stl"
          isUploading={isUploadingStl}
          onChange={(event) =>
            void handleFileUpload(event, "stl")
          }
        />

        <FileUploadCard
          title="3MF File"
          description="Slicer project with saved settings"
          currentPath={product.threeMfPath}
          accept=".3mf"
          isUploading={isUploadingThreeMf}
          onChange={(event) =>
            void handleFileUpload(event, "3mf")
          }
        />
      </div>
    </section>
  );
}

interface FileUploadCardProps {
  title: string;
  description: string;
  currentPath: string;
  accept: string;
  isUploading: boolean;
  onChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
}

function FileUploadCard({
  title,
  description,
  currentPath,
  accept,
  isUploading,
  onChange,
}: FileUploadCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <h4 className="font-black text-white">{title}</h4>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Current File
        </p>

        <p className="mt-2 break-all text-sm text-slate-300">
          {currentPath
            ? getFileName(currentPath)
            : "No file uploaded"}
        </p>
      </div>

      <label className="mt-4 block">
        <span className="sr-only">
          Choose {title}
        </span>

        <input
          type="file"
          accept={accept}
          onChange={onChange}
          disabled={isUploading}
          className="block w-full cursor-pointer rounded-xl border border-slate-700 bg-slate-900 text-sm text-slate-400 file:mr-4 file:border-0 file:bg-cyan-400 file:px-4 file:py-3 file:font-black file:text-slate-950 hover:file:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>

      <p className="mt-3 text-sm text-slate-500">
        {isUploading
          ? "Uploading file..."
          : currentPath
            ? "Choose another file to replace it."
            : "Maximum file size: 100 MB."}
      </p>
    </div>
  );
}

function getFileName(filePath: string) {
  return filePath.split("/").pop() || filePath;
}