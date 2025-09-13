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
          <button
            type="button"
            className={`method-btn ${
              uploadMethod === "upload" ? "active" : ""
            }`}
            onClick={() => setUploadMethod("upload")}
          >
            {TEXT[lang].uploadFile}
          </button>
          <button
            type="button"
            className={`method-btn ${uploadMethod === "url" ? "active" : ""}`}
            onClick={() => setUploadMethod("url")}
          >
            {TEXT[lang].useUrl}
          </button>
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
