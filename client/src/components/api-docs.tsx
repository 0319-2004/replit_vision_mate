import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Key, Code, Globe, Zap } from "lucide-react"

export function ApiDocs() {
  const [apiKey] = useState("df_sk_1234567890abcdef") // todo: remove mock functionality

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    console.log("Copied to clipboard:", text)
  }

  const endpoints = [
    {
      method: "POST",
      path: "/api/jobs",
      description: "Create a new scraping job",
      example: `{
  "name": "Product Data Scrape",
  "url": "https://example.com",
  "selectors": ["h1.title", ".price"],
  "schedule": "daily"
}`
    },
    {
      method: "GET",
      path: "/api/jobs",
      description: "List all scraping jobs",
      example: "No body required"
    },
    {
      method: "GET",
      path: "/api/jobs/{id}/data",
      description: "Retrieve scraped data",
      example: "No body required"
    },
    {
      method: "POST",
      path: "/api/export",
      description: "Export data in specified format",
      example: `{
  "jobIds": ["job-001", "job-002"],
  "format": "json"
}`
    }
  ]

  const sdkExamples = {
    javascript: `// Install: npm install dataflow-sdk
import { DataFlowClient } from 'dataflow-sdk';

const client = new DataFlowClient('${apiKey}');

// Create a job
const job = await client.createJob({
  name: 'Product Scrape',
  url: 'https://example.com',
  selectors: ['h1.title', '.price']
});

// Get data
const data = await client.getJobData(job.id);`,
    python: `# Install: pip install dataflow-python
from dataflow import DataFlowClient

client = DataFlowClient('${apiKey}')

# Create a job
job = client.create_job({
    'name': 'Product Scrape',
    'url': 'https://example.com',
    'selectors': ['h1.title', '.price']
})

# Get data
data = client.get_job_data(job.id)`,
    curl: `# Create a job
curl -X POST https://api.dataflow.pro/jobs \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Product Scrape",
    "url": "https://example.com",
    "selectors": ["h1.title", ".price"]
  }'

# Get data
curl -X GET https://api.dataflow.pro/jobs/{job_id}/data \\
  -H "Authorization: Bearer ${apiKey}"`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
        <p className="text-muted-foreground">Integrate DataFlow Pro with your applications using our REST API</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Authentication
              </CardTitle>
              <CardDescription>Get started with API authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your API Key</label>
                <div className="flex gap-2">
                  <Input value={apiKey} readOnly data-testid="input-api-key" />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(apiKey)}
                    data-testid="button-copy-api-key"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">Usage</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Include your API key in the Authorization header: <code>Bearer {apiKey}</code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                REST API Endpoints
              </CardTitle>
              <CardDescription>Available endpoints for data operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="border rounded-lg p-4" data-testid={`endpoint-${index}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={endpoint.method === "POST" ? "default" : "secondary"}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{endpoint.path}</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{endpoint.description}</p>
                  <div>
                    <div className="text-xs font-medium mb-1">Request Body</div>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      <code>{endpoint.example}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* SDK Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                SDK Examples
              </CardTitle>
              <CardDescription>Code examples in popular programming languages</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="javascript">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="javascript" data-testid="tab-javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python" data-testid="tab-python">Python</TabsTrigger>
                  <TabsTrigger value="curl" data-testid="tab-curl">cURL</TabsTrigger>
                </TabsList>
                {Object.entries(sdkExamples).map(([lang, code]) => (
                  <TabsContent key={lang} value={lang} className="mt-4">
                    <div className="relative">
                      <pre className="text-sm bg-muted p-4 rounded overflow-x-auto">
                        <code>{code}</code>
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(code)}
                        data-testid={`button-copy-${lang}`}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Quick Reference */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Reference</CardTitle>
              <CardDescription>Essential API information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Base URL:</span><br />
                  <code className="text-xs">https://api.dataflow.pro</code>
                </div>
                <div>
                  <span className="font-medium">Rate Limit:</span><br />
                  1000 requests/hour
                </div>
                <div>
                  <span className="font-medium">Max Jobs:</span><br />
                  50 concurrent jobs
                </div>
                <div>
                  <span className="font-medium">Data Retention:</span><br />
                  90 days default
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Codes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <code>200</code>
                <span>Success</span>
              </div>
              <div className="flex justify-between">
                <code>201</code>
                <span>Created</span>
              </div>
              <div className="flex justify-between">
                <code>400</code>
                <span>Bad Request</span>
              </div>
              <div className="flex justify-between">
                <code>401</code>
                <span>Unauthorized</span>
              </div>
              <div className="flex justify-between">
                <code>429</code>
                <span>Rate Limited</span>
              </div>
              <div className="flex justify-between">
                <code>500</code>
                <span>Server Error</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" data-testid="button-api-playground">
                <Zap className="mr-2 h-4 w-4" />
                API Playground
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-postman-collection">
                Download Postman
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-contact-support">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}