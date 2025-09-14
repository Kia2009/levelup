import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";

interface FileUploadProps {
  onUploadComplete: (fileUrl: string) => void;
  onUploadProgress: (progress: number) => void;
  lang: "en" | "fa";
}

const API_URL = import.meta.env.VITE_API_URL;

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadProgress,
  lang,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const { getToken } = useAuth();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    onUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      let token: string | null = null;
      try {
        token = await getToken({ template: "fullname" });
      } catch (tokErr: any) {
        // Friendly message when user is not signed in or token retrieval fails
        setError(
          lang === "fa"
            ? "برای آپلود لطفا وارد شوید."
            : "Please sign in to upload files."
        );
        setUploading(false);
        return;
      }

      if (!token) {
        setError(
          lang === "fa"
            ? "برای آپلود لطفا وارد شوید."
            : "Please sign in to upload files."
        );
        setUploading(false);
        return;
      }

      // شبیه‌سازی پیشرفت آپلود
      let simulated = 0;
      const progressInterval = setInterval(() => {
        simulated = Math.min(simulated + 10, 90);
        onUploadProgress(simulated);
      }, 200);

      const response = await fetch(`${API_URL}/shop/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        // Try to surface backend error details (401/403/400/...)
        let msg = lang === "fa" ? "خطا در آپلود فایل" : "File upload error";
        try {
          const errorData = await response.json();
          if (errorData?.detail) msg = errorData.detail;
        } catch (e) {
          // ignore JSON parse errors
        }
        setError(msg);
        onUploadProgress(0);
        setUploading(false);
        return;
      }

      const result = await response.json();
      onUploadProgress(100);
      onUploadComplete(result.file_url);
    } catch (err: any) {
      setError(
        err?.message || (lang === "fa" ? "خطای نامشخص" : "Unknown error")
      );
      onUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload-container">
      <input
        type="file"
        id="file-upload"
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
        onChange={handleFileUpload}
        disabled={uploading}
        style={{ display: "none" }}
      />
      <label
        htmlFor="file-upload"
        className={`file-upload-label ${uploading ? "uploading" : ""} primary`}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" className="upload-icon">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
        <span className="file-upload-text">
          {uploading
            ? lang === "fa"
              ? "در حال آپلود..."
              : "Uploading..."
            : lang === "fa"
            ? "فایل را انتخاب کنید"
            : "Choose File"}
        </span>
        <span className={`upload-dot ${uploading ? "pulse" : ""}`} />
      </label>
      {error && <div className="upload-error">{error}</div>}
    </div>
  );
};

export default FileUpload;
