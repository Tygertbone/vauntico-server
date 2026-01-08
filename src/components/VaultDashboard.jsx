import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Activity, CheckCircle, XCircle, Clock, Shield, TrendingUp, AlertTriangle, Globe, Zap } from 'lucide-react';
import webhookData from '../data/webhookData';

export default function VaultDashboard() {
  const [replayProtectionEnabled, setReplayProtectionEnabled] = useState(webhookData.replayProtection.enabled);
  const { totalRequests, successRate, rejectedCount, uptime, averageResponseTime, logs, analytics, replayProtection, security } = webhookData;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-vauntico-gold mb-2">Vault Dashboard</h1>
          <p className="text-gray-400">Monitor your webhook activity, security, and performance metrics</p>
        </header>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="replay">Replay Protection</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Requests</CardTitle>
                  <Activity className="h-4 w-4 text-vauntico-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{totalRequests.toLocaleString()}</div>
                  <p className="text-xs text-gray-500 mt-1">All time requests</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Success Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{successRate}%</div>
                  <p className="text-xs text-gray-500 mt-1">{(totalRequests * successRate / 100).toFixed(0)} successful</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Rejected</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{rejectedCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Failed requests</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{averageResponseTime}ms</div>
                  <p className="text-xs text-gray-500 mt-1">System performance</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="audit" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Audit Logs</CardTitle>
                <CardDescription className="text-gray-400">Recent webhook requests and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {log.status === 200 ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                          <span className="font-mono text-sm text-white">{log.method} {log.endpoint}</span>
                        </div>
                        <Badge variant={log.status === 200 ? "default" : "destructive"}>{log.status} {log.statusText}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-400 mb-2">
                        <div><span className="text-gray-500">Time:</span> {new Date(log.timestamp).toLocaleString()}</div>
                        <div><span className="text-gray-500">IP:</span> {log.ipAddress}</div>
                        <div><span className="text-gray-500">Response:</span> {log.responseTime}ms</div>
                        <div><span className="text-gray-500">Agent:</span> {log.userAgent}</div>
                      </div>
                      {log.error && <div className="mt-2 p-2 bg-red-950 rounded text-xs text-red-300"><span className="font-semibold">Error:</span> {log.error}</div>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="replay" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Replay Protection Settings</CardTitle>
                <CardDescription className="text-gray-400">Configure replay attack protection for your webhooks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="replay-toggle" className="text-base text-white">Enable Replay Protection</Label>
                    <p className="text-sm text-gray-400">Prevent duplicate webhook requests within the time window</p>
                  </div>
                  <Switch id="replay-toggle" checked={replayProtectionEnabled} onCheckedChange={setReplayProtectionEnabled} />
                </div>
                <div className="pt-4 border-t border-gray-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Window Duration</span>
                    <span className="text-white font-mono">{replayProtection.windowDuration}s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Rejected Replays</span>
                    <Badge variant="destructive">{replayProtection.rejectedReplays}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><TrendingUp className="h-5 w-5 text-vauntico-gold" />Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.statusDistribution).map(([status, count]) => {
                    const percentage = ((count / totalRequests) * 100).toFixed(1);
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300 capitalize">{status}</span>
                          <span className="text-white font-mono">{count.toLocaleString()} ({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
