/**
 * Cloudinary uploads for task attachments.
 *
 * Both the create and the edit form need this, and it was previously copied
 * into each of them — including the `resourceType` guess and the error that
 * only ever reached `console.error`.  Kept as a plain module rather than a
 * component because it has no UI of its own: the caller owns the status text.
 *
 * The preset is unsigned, so the upload is authorised by the preset alone and
 * nothing secret belongs in this file.
 */

const UPLOAD_BASE = "https://api.cloudinary.com/v1_1/djwydarmv";
const UPLOAD_PRESET = "pawscloudinary";

/** Cloudinary wants the endpoint to match the kind of file being sent. */
function resourceType(file) {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "raw";
}

/**
 * Upload one file and return its public URL.
 *
 * Throws on any non-2xx response so the caller can show a message instead of
 * silently attaching nothing.
 *
 * @param {File} file
 * @returns {Promise<string>} the uploaded file's `secure_url`
 */
export async function uploadAttachment(file) {
  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(`${UPLOAD_BASE}/${resourceType(file)}/upload`, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.secure_url;
}
