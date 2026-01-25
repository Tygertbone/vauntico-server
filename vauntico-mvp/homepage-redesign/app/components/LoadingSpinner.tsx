export function LoadingSpinner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div
      className={`${sizes[size]} border-4 border-white/20 border-t-indigo-600 rounded-full animate-spin`}
    />
  );
}
