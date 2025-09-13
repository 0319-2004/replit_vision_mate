import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { 
  Calendar, 
  MoreHorizontal, 
  Play, 
  Pause, 
  Trash2, 
  Eye, 
  Download,
  Search,
  Filter
} from "lucide-react"

export function JobManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  // todo: remove mock functionality
  const jobs = [
    {
      id: "job-001",
      name: "E-commerce Product Data",
      status: "running",
      progress: 75,
      source: "amazon.com",
      recordsExtracted: 1240,
      created: "2 hours ago",
      lastRun: "2 hours ago",
      schedule: "Daily"
    },
    {
      id: "job-002", 
      name: "Social Media Analytics",
      status: "completed",
      progress: 100,
      source: "twitter.com",
      recordsExtracted: 3420,
      created: "1 day ago",
      lastRun: "6 hours ago",
      schedule: "Hourly"
    },
    {
      id: "job-003",
      name: "News Articles Scrape",
      status: "pending",
      progress: 0,
      source: "reddit.com",
      recordsExtracted: 0,
      created: "3 days ago",
      lastRun: "Never",
      schedule: "Weekly"
    },
    {
      id: "job-004",
      name: "Real Estate Listings",
      status: "failed",
      progress: 45,
      source: "zillow.com",
      recordsExtracted: 892,
      created: "5 days ago",
      lastRun: "1 day ago",
      schedule: "Daily"
    },
    {
      id: "job-005",
      name: "Financial Data Feed",
      status: "paused",
      progress: 0,
      source: "yahoo.com",
      recordsExtracted: 5670,
      created: "1 week ago",
      lastRun: "3 days ago",
      schedule: "Hourly"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-blue-500"
      case "completed": return "bg-green-500"
      case "pending": return "bg-gray-500"
      case "failed": return "bg-red-500"
      case "paused": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "running": return "default"
      case "completed": return "secondary"
      case "pending": return "outline"
      case "failed": return "destructive"
      case "paused": return "secondary"
      default: return "outline"
    }
  }

  const handleJobAction = (action: string, jobId: string) => {
    console.log(`${action} job:`, jobId)
    // todo: remove mock functionality - integrate with actual API
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.source.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || job.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scraping Jobs</h1>
          <p className="text-muted-foreground">Manage and monitor your data extraction jobs</p>
        </div>
        <Button data-testid="button-create-new-job">Create New Job</Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by name or source..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search-jobs"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" data-testid="button-filter-status">
                  <Filter className="mr-2 h-4 w-4" />
                  Status: {selectedStatus === "all" ? "All" : selectedStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedStatus("all")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("running")}>Running</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("completed")}>Completed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("pending")}>Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("failed")}>Failed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("paused")}>Paused</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs Overview</CardTitle>
          <CardDescription>
            {filteredJobs.length} of {jobs.length} jobs shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id} data-testid={`row-job-${job.id}`}>
                  <TableCell>
                    <div className="font-medium">{job.name}</div>
                    <div className="text-xs text-muted-foreground">Created {job.created}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(job.status)}`} />
                      <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {job.status === "running" ? (
                      <div className="space-y-1">
                        <Progress value={job.progress} className="h-2" />
                        <div className="text-xs text-muted-foreground">{job.progress}%</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{job.source}</code>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{job.recordsExtracted.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {job.schedule}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {job.lastRun}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-actions-${job.id}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleJobAction("view", job.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleJobAction("run", job.id)}>
                          <Play className="mr-2 h-4 w-4" />
                          Run Now
                        </DropdownMenuItem>
                        {job.status === "running" && (
                          <DropdownMenuItem onClick={() => handleJobAction("pause", job.id)}>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleJobAction("export", job.id)}>
                          <Download className="mr-2 h-4 w-4" />
                          Export Data
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleJobAction("delete", job.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Job Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {jobs.filter(j => j.status === "running").length}
            </div>
            <div className="text-xs text-muted-foreground">Running Jobs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {jobs.filter(j => j.status === "completed").length}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {jobs.reduce((sum, job) => sum + job.recordsExtracted, 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Records</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {Math.round((jobs.filter(j => j.status === "completed").length / jobs.length) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}