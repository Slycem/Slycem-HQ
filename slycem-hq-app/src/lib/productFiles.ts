import { supabase } from "@/lib/supabase";

const bucketName = "print-files";

export async function uploadProductImage(
  productId: number,
  file: File
): Promise<string> {
  const fileExtension =
    file.name.split(".").pop()?.toLowerCase() || "jpg";

  const filePath = `products/${productId}/images/${crypto.randomUUID()}.${fileExtension}`;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw uploadError;
  }

  return filePath;
}

export async function createProductFileUrl(
  filePath: string,
  expiresInSeconds = 3600
): Promise<string> {
  if (!filePath) {
    return "";
  }

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

export async function deleteProductFile(
  filePath: string
): Promise<void> {
  if (!filePath) {
    return;
  }

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath]);

  if (error) {
    throw error;
  }
}

export function isValidProductImage(file: File): boolean {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  const maximumFileSize = 10 * 1024 * 1024;

  return (
    allowedTypes.includes(file.type) &&
    file.size <= maximumFileSize
  );
}