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

export interface User {
  id: string;
  username: string;
  email: string;
  user_type: string;
  first_name?: string; // optional
  last_name?: string;  // optional
}

export type UserData = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};

export type JobListing = {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  skills: string[];
  status: "new" | "applied" | "saved";
  match: number;
};

export type Application = {
  id: number;
  jobId: number;
  status: "under review" | "interview";
  date: string;
  updates: {
    date: string;
    message: string;
  }[];
};

export type StatItem = {
  name: string;
  value: string | number;
  change: string;
  trend: "up" | "down";
};

export interface DynamicHeaderProps {
  title?: string;
  user?: { firstName: string; lastName: string };
  showSearch?: boolean;
  onSearchChange?: (term: string) => void;
  className?: string;
}

