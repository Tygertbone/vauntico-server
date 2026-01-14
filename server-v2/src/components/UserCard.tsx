import React from 'react';

export interface UserCardProps {
  id: string;
  name: string;
  email: string;
}

const UserCard: React.FC<UserCardProps> = ({ id, name, email }) => {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>Email: {email}</p>
      <p>ID: {id}</p>
    </div>
  );
};

export default UserCard;