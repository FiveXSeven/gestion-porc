import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import * as api from '@/lib/api';
import { Alert } from '@/types';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface AlertNotificationContextType {
  unreadCount: number;
  alerts: Alert[];
  refreshAlerts: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

const AlertNotificationContext = createContext<AlertNotificationContextType | undefined>(undefined);

export const useAlertNotifications = () => {
  const context = useContext(AlertNotificationContext);
  if (!context) {
    throw new Error('useAlertNotifications must be used within AlertNotificationProvider');
  }
  return context;
};

interface AlertNotificationProviderProps {
  children: ReactNode;
}

export const AlertNotificationProvider = ({ children }: AlertNotificationProviderProps) => {
  const { isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const previousAlertsRef = useRef<Alert[]>([]);
  const isFirstFetchRef = useRef(true);

  const refreshAlerts = useCallback(async () => {
    if (!isAuthenticated) {
      setAlerts([]);
      previousAlertsRef.current = [];
      return;
    }
    
    try {
      // First, trigger alert generation on the backend
      // This checks for mise bas, target weights, etc. and creates alerts
      await api.generateAlerts().catch(err => {
        console.warn('Alert generation failed:', err);
        // Continue even if generation fails
      });
      
      // Then fetch all alerts
      const data = await api.getAlerts();
      
      // Check for new unread alerts and show popup (skip first fetch to avoid spam on login)
      if (!isFirstFetchRef.current) {
        const previousIds = new Set(previousAlertsRef.current.map(a => a.id));
        const newAlerts = data.filter(a => !a.read && !previousIds.has(a.id));
        
        // Show popup for new alerts (5 seconds duration)
        if (newAlerts.length > 0) {
          newAlerts.forEach(alert => {
            toast.info(alert.message, {
              duration: 5000,
              icon: '🔔',
              description: 'Nouvelle alerte',
            });
          });
        }
      }
      isFirstFetchRef.current = false;
      
      setAlerts(data);
      previousAlertsRef.current = data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.markAlertRead(id);
      await refreshAlerts();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  }, [refreshAlerts]);

  useEffect(() => {
    if (!isAuthenticated) {
      setAlerts([]);
      previousAlertsRef.current = [];
      isFirstFetchRef.current = true;
      return;
    }

    // Initial fetch
    refreshAlerts();

    // Poll every 60 seconds for new alerts (increased from 30s to reduce requests)
    const interval = setInterval(refreshAlerts, 60000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshAlerts]);

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <AlertNotificationContext.Provider value={{ unreadCount, alerts, refreshAlerts, markAsRead }}>
      {children}
    </AlertNotificationContext.Provider>
  );
};
