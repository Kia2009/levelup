import React from "react";
import ConfirmationModal from "./ConfirmationModal";

type Props = {
  open: boolean;
  product?: {
    id: number;
    title: string;
    description?: string;
    seller_name?: string;
    price: number;
  } | null;
  lang: "en" | "fa";
  onConfirm: () => void;
  onCancel: () => void;
};

const PurchaseConfirmation: React.FC<Props> = ({
  open,
  product,
  lang,
  onConfirm,
  onCancel,
}) => {
  if (!product) return null;

  const title = lang === "fa" ? "تایید خرید" : "Confirm Purchase";
  const confirmText = lang === "fa" ? "خرید" : "Buy";
  const cancelText = lang === "fa" ? "انصراف" : "Cancel";

  return (
    <ConfirmationModal
      open={open}
      title={title}
      message={
        lang === "fa"
          ? `آیا از خرید "${product.title}" به قیمت ${product.price} سکه مطمئن هستید؟`
          : `Are you sure you want to buy "${product.title}" for ${product.price} IQ coins?`
      }
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};

export default PurchaseConfirmation;
