import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import FileUpload from "./FileUpload";
import UploadProgress from "./UploadProgress";

interface Product {
  id: number;
  created_at: string;
  seller_id: string;
  seller_name: string;
  title: string;
  description: string;
  price: number;
  file_url: string;
}

interface SellProductModalProps {
  onClose: () => void;
  onCreated: (product: Product) => void;
  lang: "en" | "fa";
}

const API_URL = import.meta.env.VITE_API_URL;

const TEXT = {
  en: {
    sellItemTitle: "Sell Your Notebook",
    productTitle: "Notebook Title",
    productDescription: "Description",
    productPrice: "Price (IQ Coins)",
    productFileUrl: "File URL (e.g., Google Drive, Dropbox)",
    uploadFile: "Upload File",
    useUrl: "Use URL",
    sell: "List for Sale",
    posting: "Posting...",
    allFieldsRequired: "All fields are required.",
    pricePositive: "Price must be positive.",
  },
  fa: {
    sellItemTitle: "جزوه خود را بفروشید",
    productTitle: "عنوان جزوه",
    productDescription: "توضیحات",
    productPrice: "قیمت (سکه IQ)",
    productFileUrl: "لینک فایل (مثلا گوگل درایو)",
    uploadFile: "آپلود فایل",
    useUrl: "استفاده از لینک",
    sell: "ثبت برای فروش",
    posting: "در حال ارسال...",
    allFieldsRequired: "تمام فیلدها الزامی هستند.",
    pricePositive: "قیمت باید مثبت باشد.",
  },
};

const SellProductModal: React.FC<SellProductModalProps> = ({
  onClose,
  onCreated,
  lang,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"upload" | "url">("upload");
  const [uploadProgress, setUploadProgress] = useState(0);
  const { getToken } = useAuth();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !price || !fileUrl) {
      setError(TEXT[lang].allFieldsRequired);
      return;
    }
    if (parseInt(price) <= 0) {
      setError(TEXT[lang].pricePositive);
      return;
    }
    setError("");
    setLoading(true);
    const token = await getToken({ template: "fullname" });
    try {
      const res = await fetch(`${API_URL}/shop/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          price: parseInt(price),
          file_url: fileUrl,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        const detail = errData?.detail ?? errData ?? "Failed to create product";
        // If detail is an object, stringify it so UI shows readable info
        const message =
          typeof detail === "object" ? JSON.stringify(detail) : detail;
        throw new Error(message);
      }
      const product = await res.json();
      onCreated(product);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (url: string) => {
    setFileUrl(url);
    setUploadProgress(0);
  };

  return (
    <div className="popup-backdrop" onClick={onClose}>
      <form
        className="popup-card create-modal sell-modal no-scroll"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleCreate}
      >
        <button className="popup-close" onClick={onClose} type="button">
          ×
        </button>
        <h2>{TEXT[lang].sellItemTitle}</h2>

        <input
          type="text"
          placeholder={TEXT[lang].productTitle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder={TEXT[lang].productDescription}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder={TEXT[lang].productPrice}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="1"
        />

        <div className="upload-method-selector">
          <div className="method-selector-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            <span>{lang === 'fa' ? 'روش آپلود فایل' : 'File Upload Method'}</span>
          </div>
          <div className="enhanced-toggle">
            <div
              className={`toggle-track ${
                uploadMethod === "upload" ? "left" : "right"
              }`}
              role="tablist"
              aria-label="Upload method"
            >
              <button
                type="button"
                className={`toggle-option ${
                  uploadMethod === "upload" ? "active" : ""
                }`}
                onClick={() => setUploadMethod("upload")}
                role="tab"
                aria-selected={uploadMethod === "upload"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                {TEXT[lang].uploadFile}
              </button>
              <button
                type="button"
                className={`toggle-option ${
                  uploadMethod === "url" ? "active" : ""
                }`}
                onClick={() => setUploadMethod("url")}
                role="tab"
                aria-selected={uploadMethod === "url"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.59,13.41C11,13.8 11,14.4 10.59,14.81C10.2,15.2 9.6,15.2 9.19,14.81L7.77,13.39L7.77,13.39L6.36,12L7.77,10.61L9.19,9.19C9.6,8.8 10.2,8.8 10.59,9.19C11,9.6 11,10.2 10.59,10.61L10.24,11L14.83,11L14.83,11L16.24,12L14.83,13L10.24,13L10.59,13.41M21,7L15,1L13.5,2.5L16.5,5.5L10.5,11.5L8.5,9.5L2.5,15.5L1,17L7,23L8.5,21.5L14.5,15.5L12.5,13.5L18.5,7.5L21.5,10.5L23,9L21,7Z"/>
                </svg>
                {TEXT[lang].useUrl}
              </button>
              <div className="toggle-thumb" />
            </div>
          </div>
        </div>

        {uploadMethod === "upload" ? (
          <div className="file-upload-section">
            <FileUpload
              onUploadComplete={handleUploadComplete}
              onUploadProgress={setUploadProgress}
              lang={lang}
            />
            <UploadProgress progress={uploadProgress} lang={lang} />
            {fileUrl && (
              <div className="upload-success">
                ✅{" "}
                {lang === "fa"
                  ? "فایل با موفقیت آپلود شد"
                  : "File uploaded successfully"}
              </div>
            )}
          </div>
        ) : (
          <input
            type="url"
            placeholder={TEXT[lang].productFileUrl}
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            required
          />
        )}

        <button
          type="submit"
          disabled={
            loading ||
            (uploadMethod === "upload" &&
              uploadProgress > 0 &&
              uploadProgress < 100)
          }
        >
          {loading ? TEXT[lang].posting : TEXT[lang].sell}
        </button>

        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default SellProductModal;
