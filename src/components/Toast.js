import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const Toast = ({ toast }) => {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[toast.type] || 'bg-blue-500';

  return (
    <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in`}>
      {toast.type === 'success' && <CheckCircle size={18} />}
      {toast.type === 'error' && <AlertCircle size={18} />}
      <span className="text-sm">{toast.message}</span>
    </div>
  );
};

export default Toast;
