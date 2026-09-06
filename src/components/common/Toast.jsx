import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import '../../styles/toast.css';

function ToastItem({ toast, onDismiss }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 240);
  };

  let icon = <Info size={18} color="#C9A24A" />;
  let variantClass = 'tb-toast-info';

  if (toast.type === 'success') {
    variantClass = 'tb-toast-success';
    icon = <CheckCircle2 size={18} color="#34D399" />;
  } else if (toast.type === 'warning') {
    variantClass = 'tb-toast-warning';
    icon = <AlertTriangle size={18} color="#FBBF24" />;
  } else if (toast.type === 'danger' || toast.type === 'error') {
    variantClass = 'tb-toast-danger';
    icon = <AlertCircle size={18} color="#F87171" />;
  }

  return (
    <div
      className={`tb-toast-item ${variantClass} ${isExiting ? 'tb-toast-exiting' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="tb-toast-body">
        <div className="tb-toast-icon-wrap" aria-hidden="true">
          {icon}
        </div>
        <div className="tb-toast-text">
          {toast.message}
        </div>
      </div>

      <button
        type="button"
        className="tb-toast-close-btn"
        onClick={handleClose}
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>

      {/* Progress countdown bar */}
      <div className="tb-toast-progress-track" aria-hidden="true">
        <div className="tb-toast-progress-fill" />
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="tb-toast-container"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={removeToast}
        />
      ))}
    </div>
  );
}
