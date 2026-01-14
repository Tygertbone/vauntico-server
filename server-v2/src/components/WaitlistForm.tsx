import React, { useState } from 'react';

export interface WaitlistFormProps {
  onSubmit: (email: string) => void;
}

const WaitlistForm: React.FC<WaitlistFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit">Join Waitlist</button>
    </form>
  );
};

export default WaitlistForm;