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
      <div className={`modal-card modal-card--popup`}>
        <button className="modal-close" aria-label="Close" onClick={onCancel}>
          ×
        </button>

        <div className="modal-body">
          <div className="modal-content">
            <h3 className="modal-title">{title}</h3>
            <p className="modal-message">{message}</p>
          </div>
          <div className="modal-actions modal-actions--spaced">
            <button className="btn btn-secondary" onClick={onCancel}>
              {cancelText}
            </button>
            <button className="btn btn-primary" onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
