// types.ts
export type UserType = 'general' | 'pwd' | 'indigenous' | 'employer' | 'admin';
type WorkMode = 'Onsite' | 'Remote' | 'Hybrid';

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

export type EmployerInfo = {
  id: string;
    name: string;
  logo?: string | null;
  description?: string;
}

export type Company = {
  id: string;
  name: string;
  logo?: string | null;
  description?: string;
}

export type JobListing = {
  id: string;
  title: string;
  company: string | Company;
  logo_path?: string | null;
  employer?: EmployerInfo;
  location: string;
  salary: string;
  type: string;
  posted: string;
  skills: {
    id: number;
    name: string;
    category?: string;
    is_required: boolean;
    importance_level: number;
  }[]; // Updated to match Prisma structure
  status: "new" | "applied" | "saved";
  match: number;
  work_mode: WorkMode;
  job_description: string;
  job_requirements: string;
  employer_id: number;
  employer_user_id: number;
  hrName?: string;
  hrPhoto?: string | null;
};

export type Skills = {
  id: number;
  skill_name: string;
  skill_category: string;
};

export type Application = {
  id: number;
  jobId: number;
  status: string;
  date: string;
  coverLetter?: string;
  resume?: string;
  job?: {
    id: number;
    title: string;
    company: string;
    location: string;
    salary: string;
    type: string;
    posted: string;
    workMode?: string;
    logo?: string;
    hrName?: string;
    hrPhoto?: string | null;
  };
  updates: {
    date: string;
    message: string;
  }[];
};

export type Applicant = {
  id: number;
  applicationId: number;
  name: string;
  email: string;
  phone: string;
  photo?: string | null; // Add photo field
  position: string;
  status: string;
  experience: string;
  applied: string;
  coverLetter?: string;
  resume?: string;
  education?: string;
  currentJobTitle?: string;
  desiredJobTitle?: string;
  desiredSalary?: number;
  locationPreference?: string;
  resumeText?: string;
  user_id: number; // Job seeker's user ID for messaging
  job?: {
    id: number;
    title: string;
    type: string;
    location: string;
    salary: string;
    workMode?: string;
    posted: string;
  };
  skills: string[];
};

export type StatItem = {
  name: string;
  value: string | number;
  change: string;
  trend: "up" | "down";
};

export interface ApplicantHeaderProps {
  title?: string;
  user?: { firstName: string; lastName: string;  };
  showSearch?: boolean;
  onSearchChange?: (term: string) => void;
  className?: string;
}
// export interface EmployerHeaderProps {
//   title?: string;
//   user?: { firstName: string; lastName: string };
//   showSearch?: boolean;
//   onSearchChange?: (term: string) => void;
//   className?: string;
// }

export interface  FormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;
  contactPerson: string;
  industry: string;
  companySize: string;
  websiteUrl: string;
  foundedYear: number | string;
  address: string;
  agreeToTerms: boolean;
  userType: "EMPLOYER";
  logo_path?: FileList ; // optional for employer registration
};

