'use client';

import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationState {
  isOpen: boolean;
  type: NotificationType;
  title: string;
  message: string;
}

export interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

const initialNotification: NotificationState = {
  isOpen: false,
  type: 'info',
  title: '',
  message: '',
};

const initialConfirm: ConfirmState = {
  isOpen: false,
  title: '',
  message: '',
  onConfirm: () => {},
};

export { initialNotification, initialConfirm };

const iconMap = {
  success: <CheckCircle className="w-6 h-6 text-success" />,
  error: <AlertCircle className="w-6 h-6 text-danger" />,
  warning: <AlertCircle className="w-6 h-6 text-warning" />,
  info: <Info className="w-6 h-6 text-primary" />,
};

const bgMap = {
  success: 'bg-success/10 border-success/30',
  error: 'bg-red-50 dark:bg-red-900/20 border-danger/30',
  warning: 'bg-warning/10 border-warning/30',
  info: 'bg-primary/10 border-primary/30',
};

export function NotificationModal({
  notification,
  onClose,
}: {
  notification: NotificationState;
  onClose: () => void;
}) {
  useEffect(() => {
    if (notification.isOpen && notification.type !== 'error') {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.isOpen, notification.type, onClose]);

  if (!notification.isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-top-2 fade-in duration-300 max-w-sm w-full">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg bg-white dark:bg-dark-card ${bgMap[notification.type]}`}
      >
        <div className="flex-shrink-0 mt-0.5">{iconMap[notification.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm">
            {notification.title}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-line">
            {notification.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}

export function ConfirmModal({
  confirm,
  onClose,
}: {
  confirm: ConfirmState;
  onClose: () => void;
}) {
  if (!confirm.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-danger flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {confirm.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {confirm.message}
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              confirm.onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
