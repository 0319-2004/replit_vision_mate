import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, FileText, Database, Calendar } from "lucide-react"

export function DataExport() {
  const [selectedFormat, setSelectedFormat] = useState("")
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  // todo: remove mock functionality
  const availableJobs = [
    {
      id: "job-001",
      name: "E-commerce Product Data",
      records: 12450,
      lastRun: "2 hours ago",
      status: "completed"
    },
    {
      id: "job-002",
      name: "Social Media Analytics",
      records: 8320,
      lastRun: "1 day ago",
      status: "completed"
    },
    {
      id: "job-003",
      name: "News Articles Scrape",
      records: 5670,
      lastRun: "3 days ago",
      status: "completed"
    }
  ]

  const exportFormats = [
    { value: "json", label: "JSON", description: "Structured data format" },
    { value: "csv", label: "CSV", description: "Comma-separated values" },
    { value: "xml", label: "XML", description: "Extensible markup language" },
    { value: "xlsx", label: "Excel", description: "Microsoft Excel format" },
    { value: "sql", label: "SQL", description: "Database insert statements" }
  ]

  const handleJobSelection = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobs([...selectedJobs, jobId])
    } else {
      setSelectedJobs(selectedJobs.filter(id => id !== jobId))
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    console.log("Exporting data:", { selectedJobs, selectedFormat })
    
    // todo: remove mock functionality - simulate export progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setExportProgress(i)
    }
    
    setIsExporting(false)
    setExportProgress(0)
    console.log("Export completed!")
  }

  const totalRecords = selectedJobs.reduce((total, jobId) => {
    const job = availableJobs.find(j => j.id === jobId)
    return total + (job?.records || 0)
  }, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Export</h1>
        <p className="text-muted-foreground">Export your scraped data in various formats for analysis</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Job Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Select Data Sources
              </CardTitle>
              <CardDescription>Choose which scraping jobs to include in your export</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableJobs.map((job) => (
                <div key={job.id} className="flex items-center space-x-3 p-3 rounded-lg border" data-testid={`job-${job.id}`}>
                  <Checkbox
                    id={job.id}
                    checked={selectedJobs.includes(job.id)}
                    onCheckedChange={(checked) => handleJobSelection(job.id, checked as boolean)}
                    data-testid={`checkbox-${job.id}`}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={job.id} className="font-medium text-sm cursor-pointer">
                        {job.name}
                      </Label>
                      <Badge variant="secondary">{job.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {job.records.toLocaleString()} records • Last run {job.lastRun}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Export Format
              </CardTitle>
              <CardDescription>Choose the output format for your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>File Format</Label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger data-testid="select-export-format">
                    <SelectValue placeholder="Select export format" />
                  </SelectTrigger>
                  <SelectContent>
                    {exportFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        <div className="flex flex-col">
                          <span>{format.label}</span>
                          <span className="text-xs text-muted-foreground">{format.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFormat && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium">Format Details</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {exportFormats.find(f => f.value === selectedFormat)?.description}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Progress */}
          {isExporting && (
            <Card>
              <CardHeader>
                <CardTitle>Export in Progress</CardTitle>
                <CardDescription>Processing your data export</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Preparing export...</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Export Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Summary</CardTitle>
              <CardDescription>Review your export configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Selected Jobs:</span> {selectedJobs.length}
                </div>
                <div>
                  <span className="font-medium">Total Records:</span> {totalRecords.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Format:</span> {selectedFormat ? exportFormats.find(f => f.value === selectedFormat)?.label : "Not selected"}
                </div>
                <div>
                  <span className="font-medium">Estimated Size:</span> {totalRecords ? `~${Math.round(totalRecords * 0.5)} KB` : "0 KB"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full" 
                onClick={handleExport}
                disabled={selectedJobs.length === 0 || !selectedFormat || isExporting}
                data-testid="button-export-data"
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Exporting..." : "Export Data"}
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-preview-data">
                Preview Data
              </Button>
              <Button variant="ghost" className="w-full" data-testid="button-schedule-export">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Export
              </Button>
            </CardContent>
          </Card>

          {/* Recent Exports */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Exports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* todo: remove mock functionality */}
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded border">
                  <div className="font-medium">products_data.json</div>
                  <div className="text-muted-foreground">2 hours ago • 240 KB</div>
                </div>
                <div className="p-2 rounded border">
                  <div className="font-medium">social_analytics.csv</div>
                  <div className="text-muted-foreground">1 day ago • 156 KB</div>
                </div>
                <div className="p-2 rounded border">
                  <div className="font-medium">news_articles.xlsx</div>
                  <div className="text-muted-foreground">3 days ago • 89 KB</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}