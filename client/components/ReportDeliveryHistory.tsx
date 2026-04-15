import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, Download, RotateCcw } from 'lucide-react';

export interface DeliveryRecord {
  id: number;
  scheduleId: number;
  recipient: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  provider: string;
  timestamp: Date;
  error?: string;
  messageId?: string;
}

interface ReportDeliveryHistoryProps {
  scheduleId?: number;
  onRetry?: (recordId: number) => void;
}

export function ReportDeliveryHistory({ scheduleId, onRetry }: ReportDeliveryHistoryProps) {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'failed' | 'pending'>('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch delivery history
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        // Mock data for demonstration
        const mockDeliveries: DeliveryRecord[] = [
          {
            id: 1,
            scheduleId: 1,
            recipient: 'admin@example.com',
            subject: 'Weekly Analytics Report',
            status: 'sent',
            provider: 'sendgrid',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            messageId: 'msg-12345',
          },
          {
            id: 2,
            scheduleId: 1,
            recipient: 'manager@example.com',
            subject: 'Weekly Analytics Report',
            status: 'sent',
            provider: 'sendgrid',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            messageId: 'msg-12346',
          },
          {
            id: 3,
            scheduleId: 2,
            recipient: 'invalid@',
            subject: 'Daily Webhook Report',
            status: 'failed',
            provider: 'aws-ses',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            error: 'Invalid email address',
          },
          {
            id: 4,
            scheduleId: 2,
            recipient: 'team@example.com',
            subject: 'Daily Webhook Report',
            status: 'pending',
            provider: 'mailgun',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
          },
        ];

        setDeliveries(mockDeliveries);
        setFilteredDeliveries(mockDeliveries);
      } catch (error) {
        console.error('Error fetching delivery history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [scheduleId]);

  // Apply filters
  useEffect(() => {
    let filtered = deliveries;

    // Filter by schedule ID if provided
    if (scheduleId) {
      filtered = filtered.filter(d => d.scheduleId === scheduleId);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        d =>
          d.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.messageId?.includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    // Filter by provider
    if (providerFilter !== 'all') {
      filtered = filtered.filter(d => d.provider === providerFilter);
    }

    setFilteredDeliveries(filtered);
    setCurrentPage(1);
  }, [deliveries, scheduleId, searchTerm, statusFilter, providerFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
  const paginatedDeliveries = filteredDeliveries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return null;
    }
  };

  const getProviderBadge = (provider: string) => {
    const colors: Record<string, string> = {
      sendgrid: 'bg-blue-100 text-blue-800',
      'aws-ses': 'bg-orange-100 text-orange-800',
      mailgun: 'bg-purple-100 text-purple-800',
    };

    return (
      <Badge className={colors[provider] || 'bg-gray-100 text-gray-800'}>
        {provider.toUpperCase()}
      </Badge>
    );
  };

  const handleExport = () => {
    const csv = [
      ['Recipient', 'Subject', 'Status', 'Provider', 'Timestamp', 'Error'],
      ...filteredDeliveries.map(d => [
        d.recipient,
        d.subject,
        d.status,
        d.provider,
        new Date(d.timestamp).toISOString(),
        d.error || '',
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delivery-history-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Delivery History</CardTitle>
        <CardDescription>
          Track all scheduled report deliveries and their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by recipient, subject, or message ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
                <SelectItem value="aws-ses">AWS SES</SelectItem>
                <SelectItem value="mailgun">Mailgun</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">
              {filteredDeliveries.filter(d => d.status === 'sent').length}
            </div>
            <div className="text-sm text-green-600">Successful Deliveries</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-700">
              {filteredDeliveries.filter(d => d.status === 'failed').length}
            </div>
            <div className="text-sm text-red-600">Failed Deliveries</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">
              {filteredDeliveries.filter(d => d.status === 'pending').length}
            </div>
            <div className="text-sm text-yellow-600">Pending Deliveries</div>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Error</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading delivery history...
                  </TableCell>
                </TableRow>
              ) : paginatedDeliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No deliveries found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDeliveries.map(delivery => (
                  <TableRow key={delivery.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{delivery.recipient}</TableCell>
                    <TableCell>{delivery.subject}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(delivery.status)}
                        {getStatusBadge(delivery.status)}
                      </div>
                    </TableCell>
                    <TableCell>{getProviderBadge(delivery.provider)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(delivery.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {delivery.error ? (
                        <span className="text-sm text-red-600 max-w-xs truncate">
                          {delivery.error}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {delivery.status === 'failed' && onRetry && (
                        <Button
                          onClick={() => onRetry(delivery.id)}
                          variant="ghost"
                          size="sm"
                          title="Retry delivery"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredDeliveries.length)} of{' '}
              {filteredDeliveries.length} deliveries
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
