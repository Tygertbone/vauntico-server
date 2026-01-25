'use client'

import { useState } from 'react'
import { Navigation } from '../components/Navigation'
import { Footer } from '../components/Footer'
import { Button } from '../components/ui/Button'
import {
  TrendingUpIcon,
  UsersIcon,
  FolderIcon,
  DollarSignIcon,
  ActivityIcon,
  BarChart3Icon
} from 'lucide-react'

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Mock data - in real app this would come from API
  const metrics = {
    vaultsCreated: 145,
    totalCollaborators: 892,
    revenue: 28450,
    trustScoreAvg: 87.3
  }

  const recentActivity = [
    { id: 1, action: 'Vault created', user: 'john@example.com', time: '2 hours ago' },
    { id: 2, action: 'Collaborator added', user: 'sarah@example.com', time: '4 hours ago' },
    { id: 3, action: 'Payment processed', user: 'mike@example.com', time: '6 hours ago' },
    { id: 4, action: 'Trust score calculated', user: 'emma@example.com', time: '8 hours ago' }
  ]

  return (
    <div className="min-h-screen bg-background-primary">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-text-secondary">Monitor your platform performance and activity</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 mb-8">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-accent-primary text-text-primary'
                    : 'bg-background-surface text-text-secondary hover:bg-background-elevated'
                }`}
              >
                {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </button>
            ))}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-background-surface border border-border-default rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-accent-success/10 p-3 rounded-lg">
                  <FolderIcon className="w-6 h-6 text-accent-success" />
                </div>
                <TrendingUpIcon className="w-5 h-5 text-accent-success" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-text-secondary">Vaults Created</p>
                <p className="text-2xl font-bold">{metrics.vaultsCreated}</p>
                <p className="text-sm text-accent-success">+12% from last month</p>
              </div>
            </div>

            <div className="bg-background-surface border border-border-default rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-accent-primary/10 p-3 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-accent-primary" />
                </div>
                <TrendingUpIcon className="w-5 h-5 text-accent-success" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-text-secondary">Total Collaborators</p>
                <p className="text-2xl font-bold">{metrics.totalCollaborators}</p>
                <p className="text-sm text-accent-success">+8% from last month</p>
              </div>
            </div>

            <div className="bg-background-surface border border-border-default rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-accent-warning/10 p-3 rounded-lg">
                  <DollarSignIcon className="w-6 h-6 text-accent-warning" />
                </div>
                <TrendingUpIcon className="w-5 h-5 text-accent-success" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-text-secondary">Revenue</p>
                <p className="text-2xl font-bold">${metrics.revenue.toLocaleString()}</p>
                <p className="text-sm text-accent-success">+15% from last month</p>
              </div>
            </div>

            <div className="bg-background-surface border border-border-default rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-accent-secondary/10 p-3 rounded-lg">
                  <BarChart3Icon className="w-6 h-6 text-accent-secondary" />
                </div>
                <TrendingUpIcon className="w-5 h-5 text-accent-success" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-text-secondary">Avg Trust Score</p>
                <p className="text-2xl font-bold">{metrics.trustScoreAvg}%</p>
                <p className="text-sm text-accent-success">+3% from last month</p>
              </div>
            </div>
          </div>

          {/* Charts and Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Chart Placeholder */}
            <div className="lg:col-span-2 bg-background-surface border border-border-default rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <ActivityIcon className="w-5 h-5 text-accent-primary" />
                <h2 className="text-xl font-semibold">Activity Overview</h2>
              </div>
              <div className="h-64 flex items-center justify-center bg-background-elevated rounded-lg">
                <p className="text-text-secondary">Chart visualization would go here</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-background-surface border border-border-default rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-border-default last:border-b-0 last:pb-0">
                    <div className="w-2 h-2 bg-accent-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-sm text-text-secondary">{activity.user}</p>
                      <p className="text-xs text-text-tertiary">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="secondary" className="w-full mt-4">
                View All Activity
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
