type ConfirmationModalProps = {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  // localized message should be passed in; no lang prop needed here
};

export default function ConfirmationModal({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Yes",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: // purchase-specific props were moved to a dedicated component
ConfirmationModalProps) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="premium-purchase-modal">
        <button className="modal-close" aria-label="Close" onClick={onCancel}>
          ×
        </button>
        
        <div className="premium-purchase-content">
          <div className="purchase-hero">
            <div className="purchase-icon-wrapper">
              <svg className="purchase-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2 className="purchase-hero-title">{title}</h2>
          </div>
          
          <div className="purchase-card">
            <p className="modal-message">{message}</p>
            
            <div className="purchase-actions">
              <button className="action-btn cancel-btn" onClick={onCancel}>
                {cancelText}
              </button>
              <button className="action-btn confirm-btn" onClick={onConfirm}>
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
