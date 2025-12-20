import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import Confetti from 'react-confetti';
import { fetchTrustScore, fetchTrustScoreHistory, fetchAnomalies, fetchChallenges, fetchConnections } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowUp, ArrowDown } from 'lucide-react';

const severityColors = {
  Info: 'bg-green-100 text-green-800',
  Warning: 'bg-yellow-100 text-yellow-800',
  Critical: 'bg-red-100 text-red-800',
};

const TrendArrow = ({ trend }) => {
  if (trend === 'up') {
    return <ArrowUp className="w-5 h-5 text-green-500" />;
  }
  if (trend === 'down') {
    return <ArrowDown className="w-5 h-5 text-red-500" />;
  }
  return null;
};

const Tooltip = ({ children, text }) => {
  return (
    <div className="relative flex items-center group">
      {children}
      <div className="absolute bottom-full mb-2 w-max px-2 py-1 text-sm text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity">
        {text}
      </div>
    </div>
  );
};

function TrustScoreDashboard() {
  const [showConfetti, setShowConfetti] = useState(false);
  const { data: scoreData, isLoading: isLoadingScore, isError: isErrorScore } = useQuery({ queryKey: ['trustScore'], queryFn: fetchTrustScore });
  const { data: historyData, isLoading: isLoadingHistory, isError: isErrorHistory } = useQuery({ queryKey: ['trustScoreHistory'], queryFn: fetchTrustScoreHistory });
  const { data: anomalyData, isLoading: isLoadingAnomalies, isError: isErrorAnomalies } = useQuery({ queryKey: ['anomalies'], queryFn: fetchAnomalies });
  const { data: challengesData, isLoading: isLoadingChallenges, isError: isErrorChallenges } = useQuery({ queryKey: ['challenges'], queryFn: fetchChallenges });
  const { data: connectionsData, isLoading: isLoadingConnections, isError: isErrorConnections } = useQuery({ queryKey: ['connections'], queryFn: fetchConnections });

  if (isLoadingScore || isLoadingHistory || isLoadingAnomalies || isLoadingChallenges || isLoadingConnections) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  if (isErrorScore || isErrorHistory || isErrorAnomalies || isErrorChallenges || isErrorConnections) {
    return <div className="text-red-500 text-center mt-8">An error occurred while fetching data.</div>;
  }

  const handleChallengeComplete = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showConfetti && <Confetti />}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Vauntico Trust Score</h1>
        <p className="text-gray-600">Your credibility, engagement, and legacy in one score</p>
        <div className="mt-4 text-6xl font-extrabold">{scoreData?.overall}</div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {scoreData?.breakdown?.map((item, index) => (
          <div key={index} className="card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <Tooltip text={item.tooltip}>
                <TrendArrow trend={item.trend} />
              </Tooltip>
            </div>
            <p className="text-3xl font-bold">{item.score}</p>
          </div>
        ))}
      </section>

      <section className="card p-4 mb-8">
        <h2 className="text-2xl font-bold mb-4">Trust Score Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="card p-4 mb-8">
        <h2 className="text-2xl font-bold mb-4">Anomaly Flags</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Type</th>
                <th className="py-2 px-4 border-b">Severity</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {anomalyData?.map((anomaly, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b">{anomaly.date}</td>
                  <td className="py-2 px-4 border-b">{anomaly.type}</td>
                  <td className="py-2 px-4 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${severityColors[anomaly.severity]}`}>
                      {anomaly.severity}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">{anomaly.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="card p-4">
                <h2 className="text-2xl font-bold mb-4">Score Boost Challenge</h2>
                <div className="space-y-4">
                {challengesData?.map((challenge, index) => (
                    <div key={index}>
                    <div className="flex justify-between mb-1">
                        <h3 className="font-semibold">{challenge.title}</h3>
                        <p className="text-sm text-gray-500">{challenge.points} pts</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${challenge.progress}%` }}></div>
                    </div>
                    </div>
                ))}
                </div>
                <button className="btn-primary w-full mt-4" onClick={handleChallengeComplete}>Complete Challenge</button>
            </div>
            <div className="card p-4">
                <h2 className="text-2xl font-bold mb-4">Connections Status</h2>
                <ul className="space-y-2">
                {connectionsData?.map((connection, index) => (
                    <li key={index} className="flex justify-between items-center">
                    <span>{connection.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${connection.connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {connection.connected ? 'Connected' : 'Not Connected'}
                    </span>
                    </li>
                ))}
                </ul>
                <button className="btn-primary w-full mt-4">Connect new platform</button>
            </div>
        </section>
    </div>
  );
}

export default TrustScoreDashboard;
