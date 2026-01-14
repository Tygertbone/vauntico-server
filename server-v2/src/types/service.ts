export interface EmailRequest {
  to: string;
  subject: string;
  body: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export interface NotificationPayload {
  type: 'info' | 'error' | 'success';
  message: string;
}
