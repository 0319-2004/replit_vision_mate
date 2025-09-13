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
    { value: "text", label: "テキストコンテンツ" },
    { value: "links", label: "リンクとURL" },
    { value: "images", label: "画像" },
    { value: "tables", label: "テーブル" },
    { value: "forms", label: "フォームデータ" },
    { value: "metadata", label: "ページメタデータ" }
  ]

  const platforms = [
    { value: "website", label: "ウェブサイト", icon: Globe },
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
        <h1 className="text-3xl font-bold tracking-tight">スクレイピングジョブの作成</h1>
        <p className="text-muted-foreground">ウェブサイトやSNS用の新しいデータ抽出ジョブを設定</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>基本設定</CardTitle>
              <CardDescription>ターゲットと抽出パラメータを定義</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-name">ジョブ名</Label>
                <Input
                  id="job-name"
                  placeholder="例：EC商品データ"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-job-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-url">ターゲットURL</Label>
                <Input
                  id="target-url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  data-testid="input-target-url"
                />
              </div>

              <div className="space-y-2">
                <Label>プラットフォームタイプ</Label>
                <Select>
                  <SelectTrigger data-testid="select-platform">
                    <SelectValue placeholder="プラットフォームタイプを選択" />
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
                <Label>抽出するデータタイプ</Label>
                <Select value={formData.dataType} onValueChange={(value) => setFormData({ ...formData, dataType: value })}>
                  <SelectTrigger data-testid="select-data-type">
                    <SelectValue placeholder="抽出するデータのタイプ" />
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
              <CardTitle>カスタム抽出ルール</CardTitle>
              <CardDescription>正確なデータ抽出のCSSセレクタやXPath式を定義</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="extraction-rules">CSSセレクタ / XPath</Label>
                <Textarea
                  id="extraction-rules"
                  placeholder="h1.title, .price, article p"
                  value={formData.extractionRules}
                  onChange={(e) => setFormData({ ...formData, extractionRules: e.target.value })}
                  data-testid="textarea-extraction-rules"
                />
              </div>

              <div className="space-y-2">
                <Label>クイックセレクタ</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="CSSセレクタを追加"
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
                スケジューリングオプション
              </CardTitle>
              <CardDescription>自動繰り返しスクレイピングの設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="scheduled"
                  checked={formData.scheduled}
                  onCheckedChange={(checked) => setFormData({ ...formData, scheduled: checked })}
                  data-testid="switch-scheduled"
                />
                <Label htmlFor="scheduled">スケジュールされたスクレイピングを有効にする</Label>
              </div>

              {formData.scheduled && (
                <div className="space-y-2">
                  <Label>頻度</Label>
                  <Select value={formData.interval} onValueChange={(value) => setFormData({ ...formData, interval: value })}>
                    <SelectTrigger data-testid="select-interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">毎時</SelectItem>
                      <SelectItem value="daily">毎日</SelectItem>
                      <SelectItem value="weekly">毎週</SelectItem>
                      <SelectItem value="monthly">毎月</SelectItem>
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
              <CardTitle>ジョブプレビュー</CardTitle>
              <CardDescription>設定を確認</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">名前:</span> {formData.name || "無題のジョブ"}
                </div>
                <div>
                  <span className="font-medium">URL:</span> {formData.url || "未設定"}
                </div>
                <div>
                  <span className="font-medium">データタイプ:</span> {formData.dataType || "未選択"}
                </div>
                <div>
                  <span className="font-medium">スケジュール:</span> {formData.scheduled ? `はい (${formData.interval === 'hourly' ? '毎時' : formData.interval === 'daily' ? '毎日' : formData.interval === 'weekly' ? '毎週' : formData.interval === 'monthly' ? '毎月' : formData.interval})` : "いいえ"}
                </div>
                {customSelectors.length > 0 && (
                  <div>
                    <span className="font-medium">セレクタ:</span> {customSelectors.length} カスタムルール
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>アクション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={handleSubmit} data-testid="button-create-job">
ジョブ作成
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-test-config">
設定テスト
              </Button>
              <Button variant="ghost" className="w-full" data-testid="button-save-template">
テンプレートとして保存
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}