import React from 'react';

interface Proof {
  id: string;
  userId: string;
  planCode: string;
  currency: string;
  amount: number;
  createdAt: string;
}

interface ProofCardProps {
  proof: Proof;
}

export function ProofCard({ proof }: ProofCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-white/20 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{proof.planCode}</h4>
          <p className="text-sm text-gray-600">User: {proof.userId}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-green-600">
            {formatCurrency(proof.amount, proof.currency)}
          </div>
          <div className="text-xs text-gray-500 uppercase">{proof.currency}</div>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        {formatDate(proof.createdAt)}
      </div>

      <div className="mt-2 text-xs font-mono text-gray-400">
        ID: {proof.id.slice(0, 8)}...
      </div>
    </div>
  );
}
