import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle, TrendingUp, Mail, AlertTriangle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

export default function EmailDeliveryDashboard() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'failed' | 'bounces' | 'domains'>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

  // Queries
  const { data: summary, isLoading: summaryLoading } = trpc.emailDeliveryMonitoring.getSummary.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  const { data: metrics, isLoading: metricsLoading } = trpc.emailDeliveryMonitoring.getMetrics.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  const { data: trend, isLoading: trendLoading } = trpc.emailDeliveryMonitoring.getDeliveryTrend.useQuery(
    { days: dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90 },
    { enabled: user?.role === 'admin' }
  );

  const { data: failed, isLoading: failedLoading } = trpc.emailDeliveryMonitoring.getFailedDeliveries.useQuery(
    { limit: 50 },
    { enabled: user?.role === 'admin' && selectedTab === 'failed' }
  );

  const { data: bounces, isLoading: bouncesLoading } = trpc.emailDeliveryMonitoring.getBounceList.useQuery(
    { limit: 100, offset: 0 },
    { enabled: user?.role === 'admin' && selectedTab === 'bounces' }
  );

  const { data: domains, isLoading: domainsLoading } = trpc.emailDeliveryMonitoring.getStatsByDomain.useQuery(undefined, {
    enabled: user?.role === 'admin' && selectedTab === 'domains',
  });

  if (user?.role !== 'admin') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600">You do not have permission to access this page</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      case 'critical':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Mail className="w-8 h-8 text-red-600" />
            Email Delivery Dashboard
          </h1>
          <p className="text-gray-600">Monitor email delivery status, bounce rates, and failed deliveries</p>
        </div>

        {/* Health Score Card */}
        {summary && (
          <Card className="mb-8 border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Delivery Health Score</p>
                  <p className="text-5xl font-bold mb-2">{summary.healthScore}</p>
                  <p className={`text-lg font-semibold ${getStatusColor(summary.status)}`}>
                    {summary.status.toUpperCase()}
                  </p>
                </div>
                <div>{getStatusIcon(summary.status)}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Total Sent</p>
                <p className="text-3xl font-bold text-red-600">{metrics.totalSent}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Delivery Rate</p>
                <p className="text-3xl font-bold text-green-600">{metrics.deliveryRate.toFixed(1)}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Bounce Rate</p>
                <p className="text-3xl font-bold text-orange-600">{metrics.bounceRate.toFixed(1)}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Open Rate</p>
                <p className="text-3xl font-bold text-purple-600">{metrics.openRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b">
          {(['overview', 'failed', 'bounces', 'domains'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                selectedTab === tab
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && trend && (
          <Card>
            <CardHeader>
              <CardTitle>Delivery Trend</CardTitle>
              <CardDescription>Email delivery metrics over the last {dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : '90 days'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                {(['7d', '30d', '90d'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={dateRange === range ? 'default' : 'outline'}
                    onClick={() => setDateRange(range)}
                    size="sm"
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                  </Button>
                ))}
              </div>

              {trendLoading ? (
                <div className="text-center py-8">Loading trend data...</div>
              ) : (
                <div className="space-y-4">
                  {trend.map((item) => (
                    <div key={item.date} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.date}</p>
                        <p className="text-sm text-gray-600">Sent: {item.sent} | Failed: {item.failed} | Bounced: {item.bounced}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Open: {item.openRate.toFixed(1)}%</p>
                        <p className="text-sm text-gray-600">Click: {item.clickRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedTab === 'failed' && (
          <Card>
            <CardHeader>
              <CardTitle>Failed Deliveries</CardTitle>
              <CardDescription>Emails that failed to deliver and can be retried</CardDescription>
            </CardHeader>
            <CardContent>
              {failedLoading ? (
                <div className="text-center py-8">Loading failed deliveries...</div>
              ) : failed && failed.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {failed.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.recipientEmail}</p>
                        <p className="text-xs text-gray-600">{item.errorMessage}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Retry
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">No failed deliveries</div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedTab === 'bounces' && (
          <Card>
            <CardHeader>
              <CardTitle>Bounce List</CardTitle>
              <CardDescription>Email addresses that have bounced</CardDescription>
            </CardHeader>
            <CardContent>
              {bouncesLoading ? (
                <div className="text-center py-8">Loading bounce list...</div>
              ) : bounces && bounces.bounces.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {bounces.bounces.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded border border-orange-200">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.email}</p>
                        <p className="text-xs text-gray-600">
                          {item.bounceType} • {item.bounceCount} bounces
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Whitelist
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">No bounced emails</div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedTab === 'domains' && (
          <Card>
            <CardHeader>
              <CardTitle>Statistics by Domain</CardTitle>
              <CardDescription>Email delivery metrics grouped by recipient domain</CardDescription>
            </CardHeader>
            <CardContent>
              {domainsLoading ? (
                <div className="text-center py-8">Loading domain statistics...</div>
              ) : domains && Array.isArray(domains) && domains.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Domain</th>
                        <th className="text-right py-2 px-4">Sent</th>
                        <th className="text-right py-2 px-4">Failed</th>
                        <th className="text-right py-2 px-4">Bounced</th>
                        <th className="text-right py-2 px-4">Delivery Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domains.map((domain: any) => (
                        <tr key={domain.domain} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4">{domain.domain}</td>
                          <td className="text-right py-2 px-4">{domain.sent}</td>
                          <td className="text-right py-2 px-4">{domain.failed}</td>
                          <td className="text-right py-2 px-4">{domain.bounced}</td>
                          <td className="text-right py-2 px-4 font-medium">{domain.deliveryRate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">No domain statistics available</div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
