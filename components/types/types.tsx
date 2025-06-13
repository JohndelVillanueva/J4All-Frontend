// types.ts
export type UserType = 'general' | 'pwd' | 'indigenous' | 'employer' | 'admin';

export interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  className?: string;
  onClick?: () => void;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  icon: React.ReactNode;
}

export interface NotificationBarProps {
  notificationRef?: React.RefObject<HTMLDivElement>;
  isNotificationOpen: boolean;
  toggleNotification: () => void;
  notifications: Notification[];
}

