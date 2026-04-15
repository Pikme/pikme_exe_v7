import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";

/**
 * JSON Schema Documentation Component
 * Displays JSON schema documentation and examples for API integration
 */
export function JSONSchemaDocumentation() {
  const [copiedSchema, setCopiedSchema] = useState<string | null>(null);

  const handleCopySchema = (schemaName: string, schemaContent: string) => {
    navigator.clipboard.writeText(schemaContent);
    setCopiedSchema(schemaName);
    setTimeout(() => setCopiedSchema(null), 2000);
  };

  const schemas = [
    {
      name: "Summary Report",
      type: "summary_report",
      description: "High-level metrics and statistics for a date range",
      example: `{
  "metadata": {
    "exportedAt": "2026-01-24T14:30:00.000Z",
    "version": "1.0",
    "schema": "summary_report",
    "dateRange": {
      "startDate": "2026-01-17",
      "endDate": "2026-01-24"
    }
  },
  "data": {
    "dateRange": "1/17/2026 - 1/24/2026",
    "totalEmails": 1000,
    "totalOpens": 450,
    "totalClicks": 120,
    "totalBounces": 30,
    "totalComplaints": 5,
    "averageOpenRate": 0.45,
    "averageClickRate": 0.12,
    "averageEngagementScore": 75
  }
}`,
    },
    {
      name: "Engagement Metrics",
      type: "engagement_metrics",
      description: "Detailed engagement metrics with trends",
      example: `{
  "metadata": {
    "exportedAt": "2026-01-24T14:30:00.000Z",
    "version": "1.0",
    "schema": "engagement_metrics",
    "dateRange": {
      "startDate": "2026-01-17",
      "endDate": "2026-01-24"
    }
  },
  "data": {
    "metrics": [
      {
        "name": "Total Opens",
        "value": 450,
        "percentage": 0.45,
        "trend": "up"
      },
      {
        "name": "Total Clicks",
        "value": 120,
        "percentage": 0.12,
        "trend": "up"
      }
    ]
  }
}`,
    },
    {
      name: "Engagement Trends",
      type: "engagement_trends",
      description: "Time-series data showing engagement trends over time",
      example: `{
  "metadata": {
    "exportedAt": "2026-01-24T14:30:00.000Z",
    "version": "1.0",
    "schema": "engagement_trends",
    "dateRange": {
      "startDate": "2026-01-17",
      "endDate": "2026-01-24"
    }
  },
  "data": {
    "trends": [
      {
        "date": "2026-01-17",
        "opens": 60,
        "clicks": 15,
        "bounces": 4,
        "complaints": 1,
        "averageOpenRate": 0.45,
        "averageClickRate": 0.12,
        "averageEngagementScore": 75
      }
    ]
  }
}`,
    },
    {
      name: "Recipient Profiles",
      type: "recipient_profiles",
      description: "Individual recipient engagement data and status",
      example: `{
  "metadata": {
    "exportedAt": "2026-01-24T14:30:00.000Z",
    "version": "1.0",
    "schema": "recipient_profiles",
    "dateRange": {
      "startDate": "2026-01-17",
      "endDate": "2026-01-24"
    }
  },
  "data": {
    "recipients": [
      {
        "email": "user@example.com",
        "name": "John Doe",
        "totalEmails": 10,
        "opens": 8,
        "clicks": 3,
        "bounces": 0,
        "complaints": 0,
        "openRate": 0.8,
        "clickRate": 0.3,
        "engagementScore": 85,
        "lastEngagement": "2026-01-24",
        "status": "active"
      }
    ]
  }
}`,
    },
    {
      name: "Email Performance",
      type: "email_performance",
      description: "Individual email performance metrics",
      example: `{
  "metadata": {
    "exportedAt": "2026-01-24T14:30:00.000Z",
    "version": "1.0",
    "schema": "email_performance",
    "dateRange": {
      "startDate": "2026-01-17",
      "endDate": "2026-01-24"
    }
  },
  "data": {
    "emails": [
      {
        "id": "email-123",
        "subject": "Welcome to our service",
        "sentDate": "2026-01-17",
        "recipients": 100,
        "opens": 45,
        "clicks": 12,
        "bounces": 3,
        "complaints": 1,
        "openRate": 0.45,
        "clickRate": 0.12,
        "conversionRate": 0.05,
        "engagementScore": 78
      }
    ]
  }
}`,
    },
  ];

  const apiIntegrationExamples = [
    {
      title: "Python - Requests",
      language: "python",
      code: `import requests
import json

# Download JSON export
response = requests.get('https://your-api.com/export/engagement-metrics.json')
data = response.json()

# Access metadata
print(f"Exported at: {data['metadata']['exportedAt']}")
print(f"Schema version: {data['metadata']['version']}")

# Process metrics
for metric in data['data']['metrics']:
    print(f"{metric['name']}: {metric['value']}")`,
    },
    {
      title: "JavaScript - Fetch",
      language: "javascript",
      code: `// Download and process JSON export
fetch('https://your-api.com/export/engagement-metrics.json')
  .then(response => response.json())
  .then(data => {
    console.log('Exported at:', data.metadata.exportedAt);
    console.log('Schema:', data.metadata.schema);
    
    // Process metrics
    data.data.metrics.forEach(metric => {
      console.log(\`\${metric.name}: \${metric.value}\`);
    });
  })
  .catch(error => console.error('Error:', error));`,
    },
    {
      title: "cURL",
      language: "bash",
      code: `# Download JSON export using cURL
curl -X GET 'https://your-api.com/export/engagement-metrics.json' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -o engagement-metrics.json

# Pretty print the JSON
cat engagement-metrics.json | jq .`,
    },
    {
      title: "Node.js - Express",
      language: "javascript",
      code: `const express = require('express');
const app = express();

// Endpoint to process JSON export
app.post('/process-export', async (req, res) => {
  const exportData = req.body;
  
  // Validate schema
  if (exportData.metadata.schema !== 'engagement_metrics') {
    return res.status(400).json({ error: 'Invalid schema' });
  }
  
  // Process metrics
  const processedMetrics = exportData.data.metrics.map(metric => ({
    ...metric,
    percentageFormatted: \`\${(metric.percentage * 100).toFixed(2)}%\`
  }));
  
  res.json({ success: true, metrics: processedMetrics });
});`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Schema Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>JSON Schema Documentation</CardTitle>
          <CardDescription>
            Reference documentation for JSON export schemas used in API integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary_report" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              {schemas.map((schema) => (
                <TabsTrigger key={schema.type} value={schema.type} className="text-xs">
                  {schema.name.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {schemas.map((schema) => (
              <TabsContent key={schema.type} value={schema.type} className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{schema.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{schema.description}</p>
                </div>

                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-slate-100 font-mono">{schema.example}</pre>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopySchema(schema.type, schema.example)}
                  className="gap-2"
                >
                  {copiedSchema === schema.type ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Example
                    </>
                  )}
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Metadata Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata Structure</CardTitle>
          <CardDescription>
            All JSON exports include standardized metadata for tracking and validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="font-mono text-sm font-semibold text-slate-900">exportedAt</p>
              <p className="text-sm text-slate-600">ISO 8601 timestamp of export</p>
              <p className="text-xs text-slate-500 mt-1">Example: "2026-01-24T14:30:00.000Z"</p>
            </div>
            <div>
              <p className="font-mono text-sm font-semibold text-slate-900">version</p>
              <p className="text-sm text-slate-600">Schema version for compatibility</p>
              <p className="text-xs text-slate-500 mt-1">Example: "1.0"</p>
            </div>
            <div>
              <p className="font-mono text-sm font-semibold text-slate-900">schema</p>
              <p className="text-sm text-slate-600">Type of data in this export</p>
              <p className="text-xs text-slate-500 mt-1">
                Example: "summary_report", "engagement_metrics", "recipient_profiles"
              </p>
            </div>
            <div>
              <p className="font-mono text-sm font-semibold text-slate-900">dateRange</p>
              <p className="text-sm text-slate-600">Date range of the exported data</p>
              <p className="text-xs text-slate-500 mt-1">
                Example: {"{ startDate: '2026-01-17', endDate: '2026-01-24' }"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Integration Examples */}
      <Card>
        <CardHeader>
          <CardTitle>API Integration Examples</CardTitle>
          <CardDescription>
            Code examples for integrating JSON exports into your applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="python" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="bash">cURL</TabsTrigger>
              <TabsTrigger value="nodejs">Node.js</TabsTrigger>
            </TabsList>

            {apiIntegrationExamples.map((example) => (
              <TabsContent key={example.language} value={example.language} className="space-y-4">
                <h3 className="font-semibold">{example.title}</h3>
                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-slate-100 font-mono">{example.code}</pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
          <CardDescription>
            Recommended practices for working with JSON exports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-slate-900">Validate Schema</h4>
              <p className="text-sm text-slate-600 mt-1">
                Always check the metadata.schema field to ensure you're processing the expected data type
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-slate-900">Handle Timestamps</h4>
              <p className="text-sm text-slate-600 mt-1">
                Parse ISO 8601 timestamps using standard date libraries for your language
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-slate-900">Version Compatibility</h4>
              <p className="text-sm text-slate-600 mt-1">
                Check the version field to handle schema changes gracefully in future updates
              </p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-slate-900">Error Handling</h4>
              <p className="text-sm text-slate-600 mt-1">
                Implement proper error handling for missing or null values in data arrays
              </p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-slate-900">Cache Appropriately</h4>
              <p className="text-sm text-slate-600 mt-1">
                Use the exportedAt timestamp to determine cache validity for your application
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default JSONSchemaDocumentation;
