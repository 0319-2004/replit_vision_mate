import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Clock, Globe, Plus, X } from "lucide-react"

export function JobCreator() {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    dataType: "",
    extractionRules: "",
    scheduled: false,
    interval: "daily"
  })

  const [customSelectors, setCustomSelectors] = useState<string[]>([])
  const [newSelector, setNewSelector] = useState("")

  const dataTypes = [
    { value: "text", label: "Text Content" },
    { value: "links", label: "Links & URLs" },
    { value: "images", label: "Images" },
    { value: "tables", label: "Tables" },
    { value: "forms", label: "Form Data" },
    { value: "metadata", label: "Page Metadata" }
  ]

  const platforms = [
    { value: "website", label: "Website", icon: Globe },
    { value: "twitter", label: "Twitter/X", icon: Globe },
    { value: "linkedin", label: "LinkedIn", icon: Globe },
    { value: "reddit", label: "Reddit", icon: Globe }
  ]

  const addSelector = () => {
    if (newSelector.trim()) {
      setCustomSelectors([...customSelectors, newSelector.trim()])
      setNewSelector("")
    }
  }

  const removeSelector = (index: number) => {
    setCustomSelectors(customSelectors.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    console.log("Creating scraping job:", { ...formData, customSelectors })
    // todo: remove mock functionality - integrate with actual API
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Scraping Job</h1>
        <p className="text-muted-foreground">Configure a new data extraction job for websites or social media</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Configuration</CardTitle>
              <CardDescription>Define the target and extraction parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-name">Job Name</Label>
                <Input
                  id="job-name"
                  placeholder="e.g., E-commerce Product Data"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-job-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-url">Target URL</Label>
                <Input
                  id="target-url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  data-testid="input-target-url"
                />
              </div>

              <div className="space-y-2">
                <Label>Platform Type</Label>
                <Select>
                  <SelectTrigger data-testid="select-platform">
                    <SelectValue placeholder="Select platform type" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data Type to Extract</Label>
                <Select value={formData.dataType} onValueChange={(value) => setFormData({ ...formData, dataType: value })}>
                  <SelectTrigger data-testid="select-data-type">
                    <SelectValue placeholder="What type of data to extract" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Custom Extraction Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Extraction Rules</CardTitle>
              <CardDescription>Define CSS selectors or XPath expressions for precise data extraction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="extraction-rules">CSS Selectors / XPath</Label>
                <Textarea
                  id="extraction-rules"
                  placeholder="h1.title, .price, article p"
                  value={formData.extractionRules}
                  onChange={(e) => setFormData({ ...formData, extractionRules: e.target.value })}
                  data-testid="textarea-extraction-rules"
                />
              </div>

              <div className="space-y-2">
                <Label>Quick Selectors</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add CSS selector"
                    value={newSelector}
                    onChange={(e) => setNewSelector(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSelector()}
                    data-testid="input-new-selector"
                  />
                  <Button onClick={addSelector} size="icon" variant="outline" data-testid="button-add-selector">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {customSelectors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {customSelectors.map((selector, index) => (
                      <Badge key={index} variant="secondary" className="gap-1" data-testid={`badge-selector-${index}`}>
                        <code className="text-xs">{selector}</code>
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeSelector(index)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Scheduling Options
              </CardTitle>
              <CardDescription>Configure automatic recurring scraping</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="scheduled"
                  checked={formData.scheduled}
                  onCheckedChange={(checked) => setFormData({ ...formData, scheduled: checked })}
                  data-testid="switch-scheduled"
                />
                <Label htmlFor="scheduled">Enable scheduled scraping</Label>
              </div>

              {formData.scheduled && (
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={formData.interval} onValueChange={(value) => setFormData({ ...formData, interval: value })}>
                    <SelectTrigger data-testid="select-interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Preview</CardTitle>
              <CardDescription>Review your configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {formData.name || "Untitled Job"}
                </div>
                <div>
                  <span className="font-medium">URL:</span> {formData.url || "Not set"}
                </div>
                <div>
                  <span className="font-medium">Data Type:</span> {formData.dataType || "Not selected"}
                </div>
                <div>
                  <span className="font-medium">Scheduled:</span> {formData.scheduled ? `Yes (${formData.interval})` : "No"}
                </div>
                {customSelectors.length > 0 && (
                  <div>
                    <span className="font-medium">Selectors:</span> {customSelectors.length} custom rules
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={handleSubmit} data-testid="button-create-job">
                Create Job
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-test-config">
                Test Configuration
              </Button>
              <Button variant="ghost" className="w-full" data-testid="button-save-template">
                Save as Template
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}