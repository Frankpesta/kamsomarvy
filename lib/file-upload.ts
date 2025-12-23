import { ConvexReactClient } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

/**
 * Upload a file using Convex's generateUploadUrl method (recommended for all file sizes)
 * This method uploads directly to Convex storage, bypassing mutation argument size limits
 */
export async function uploadFile(
  client: ConvexReactClient,
  file: File
): Promise<Id<"_storage">> {
  // Generate upload URL
  const uploadUrl = await client.mutation(api.files.generateUploadUrl);
  
  // Upload file directly to Convex storage
  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!result.ok) {
    throw new Error(`Upload failed: ${result.statusText}`);
  }

  // Get storage ID from response (Convex returns JSON with storageId)
  const { storageId } = await result.json();
  return storageId as Id<"_storage">;
}

/**
 * Upload multiple files using the generateUploadUrl method
 */
export async function uploadFiles(
  client: ConvexReactClient,
  files: File[]
): Promise<Id<"_storage">[]> {
  const uploads = await Promise.all(
    files.map((file) => uploadFile(client, file))
  );
  return uploads;
}

