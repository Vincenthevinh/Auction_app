import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideNotification } from '../redux/slices/uiSlice';
import { AlertCircle, Check, Info, X } from 'lucide-react';
import '../styles/Notification.css';

export default function Notification() {
  const dispatch = useDispatch();
  const { notification } = useSelector(state => state.ui);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show, dispatch]);

  if (!notification.show) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <Check size={20} />;
      case 'error': return <AlertCircle size={20} />;
      case 'info': return <Info size={20} />;
      default: return <Info size={20} />;
    }
  };

  return (
    <div className={`notification notification-${notification.type}`}>
      <div className="notification-content">
        {getIcon()}
        <span>{notification.message}</span>
      </div>
      <button onClick={() => dispatch(hideNotification())}>
        <X size={16} />
      </button>
    </div>
  );
}