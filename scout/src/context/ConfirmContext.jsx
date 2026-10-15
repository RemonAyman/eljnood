import React, { createContext, useContext, useState, useCallback } from 'react';
import { ConfirmModal } from '../components/common/ConfirmModal';

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    type: 'danger',
    onConfirmHandler: null,
    onCancelHandler: null,
  });

  const showConfirm = useCallback(({
    title,
    message,
    confirmText,
    cancelText,
    type = 'danger',
    onConfirm,
    onCancel,
  }) => {
    return new Promise((resolve) => {
      setModalConfig({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirmHandler: () => {
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
          if (onConfirm) onConfirm();
          resolve(true);
        },
        onCancelHandler: () => {
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
          if (onCancel) onCancel();
          resolve(false);
        },
      });
    });
  }, []);

  const handleConfirm = () => {
    if (modalConfig.onConfirmHandler) {
      modalConfig.onConfirmHandler();
    }
  };

  const handleCancel = () => {
    if (modalConfig.onCancelHandler) {
      modalConfig.onCancelHandler();
    }
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        type={modalConfig.type}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
