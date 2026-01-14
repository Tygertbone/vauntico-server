import React from 'react';

export interface NotificationBannerProps {
  type: 'info' | 'error' | 'success';
  message: string;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ type, message }) => {
  return (
    <div className={`notification-banner ${type}`}>
      <p>{message}</p>
    </div>
  );
};

export default NotificationBanner;