import { useState } from 'react';

interface UseDevelopmentAlertReturn {
  showAlert: (message?: string, duration?: number) => void;
  alertVisible: boolean;
  alertMessage: string;
  alertDuration: number;
  closeAlert: () => void;
}

export function useDevelopmentAlert(): UseDevelopmentAlertReturn {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('此功能正在开发中，敬请期待！');
  const [alertDuration, setAlertDuration] = useState(3000);

  const showAlert = (message?: string, duration?: number) => {
    setAlertMessage(message || '此功能正在开发中，敬请期待！');
    setAlertDuration(duration || 3000);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
  };

  return {
    showAlert,
    alertVisible,
    alertMessage,
    alertDuration,
    closeAlert,
  };
}