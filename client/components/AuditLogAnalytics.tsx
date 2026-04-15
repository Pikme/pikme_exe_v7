import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2, TrendingUp } from "lucide-react";

export interface EventsPerDayData {
  date: string;
  count: number;
  create: number;
  update: number;
  delete: number;
  export: number;
  import: number;
  login: number;
  logout: number;
}

export interface TopUserData {
  userId: string;
  userName: string;
  count: number;
  percentage: number;
}

export interface MostModifiedEntityData {
  entityType: string;
  entityId: string;
  entityName?: string;
  count: number;
  lastModified: Date;
}

export interface AuditAnalyticsData {
  eventsPerDay: EventsPerDayData[];
  topUsers: TopUserData[];
  mostModifiedEntities: MostModifiedEntityData[];
  totalEvents: number;
  dateRange: {
    start: string;
    end: string;
  };
}

interface AuditLogAnalyticsProps {
  data: AuditAnalyticsData;
  isLoading?: boolean;
  onDateRangeChange?: (start: string, end: string) => void;
}

const ACTION_COLORS: Record<string, string> = {
  create: "#10b981",
  update: "#3b82f6",
  delete: "#ef4444",
  export: "#f59e0b",
  import: "#8b5cf6",
  login: "#06b6d4",
  logout: "#6366f1",
};

const ENTITY_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
];

export function AuditLogAnalytics({
  data,
  isLoading = false,
  onDateRangeChange,
}: AuditLogAnalyticsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {data.totalEvents.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.dateRange.start} to {data.dateRange.end}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {data.topUsers.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Users with audit logs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Modified Entities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {data.mostModifiedEntities.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Unique entities changed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events">Events Trend</TabsTrigger>
          <TabsTrigger value="users">Top Users</TabsTrigger>
          <TabsTrigger value="entities">Modified Entities</TabsTrigger>
        </TabsList>

        {/* Events Per Day Chart */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Events Per Day</CardTitle>
              <CardDescription>
                Audit log activity trend over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.eventsPerDay.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data.eventsPerDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Total Events"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Action Breakdown</CardTitle>
              <CardDescription>
                Distribution of actions by type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.eventsPerDay.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.eventsPerDay.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="create" stackId="a" fill={ACTION_COLORS.create} name="Create" />
                    <Bar dataKey="update" stackId="a" fill={ACTION_COLORS.update} name="Update" />
                    <Bar dataKey="delete" stackId="a" fill={ACTION_COLORS.delete} name="Delete" />
                    <Bar dataKey="export" stackId="a" fill={ACTION_COLORS.export} name="Export" />
                    <Bar dataKey="import" stackId="a" fill={ACTION_COLORS.import} name="Import" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Users Chart */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Users by Activity</CardTitle>
              <CardDescription>
                Users with most audit log entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.topUsers.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={data.topUsers.slice(0, 10)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="userName" type="category" width={190} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" name="Events" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>
                Percentage of events by user
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.topUsers.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.topUsers.slice(0, 8)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ userName, percentage }) =>
                        `${userName}: ${percentage.toFixed(1)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.topUsers.slice(0, 8).map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={ENTITY_COLORS[index % ENTITY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        value.toLocaleString(),
                        "Events",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Most Modified Entities Chart */}
        <TabsContent value="entities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Modified Entities</CardTitle>
              <CardDescription>
                Resources with the most changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.mostModifiedEntities.length > 0 ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={data.mostModifiedEntities.slice(0, 10)}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="entityName"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" name="Changes" />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Entity Type Distribution */}
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">
                      By Entity Type
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={getEntityTypeDistribution(data.mostModifiedEntities)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ entityType, value }) =>
                            `${entityType}: ${value}`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getEntityTypeDistribution(data.mostModifiedEntities).map(
                            (_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={ENTITY_COLORS[index % ENTITY_COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getEntityTypeDistribution(
  entities: MostModifiedEntityData[]
): Array<{ entityType: string; value: number }> {
  const distribution: Record<string, number> = {};

  entities.forEach((entity) => {
    distribution[entity.entityType] =
      (distribution[entity.entityType] || 0) + entity.count;
  });

  return Object.entries(distribution).map(([entityType, value]) => ({
    entityType,
    value,
  }));
}
