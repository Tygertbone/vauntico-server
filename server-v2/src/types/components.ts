export interface UserCardProps {
  id: string;
  name: string;
  email: string;
}

export interface NotificationBannerProps {
  type: 'info' | 'error' | 'success';
  message: string;
}

export interface WaitlistFormProps {
  onSubmit: (email: string) => void;
}