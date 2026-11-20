import { useState } from "react";

type ImageUploaderProps = {
  currentImage?: string;
  onUpload: (url: string, publicId: string) => void;
};

export default function ImageUploader({
  currentImage,
  onUpload,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        "http://localhost:5000/api/admin/uploads/image",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onUpload(data.url, data.publicId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div>
      {currentImage && (
        <img
          src={currentImage}
          alt="Current upload"
          style={{ width: 160, height: 160, objectFit: "cover" }}
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />

      {uploading && <p>Uploading image...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}