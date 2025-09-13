import { Activity, Clock, Database, Download, TrendingUp, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function Dashboard() {
  // todo: remove mock functionality
  const metrics = [
    {
      title: "アクティブジョブ",
      value: "12",
      change: "昨日から+3",
      icon: Zap,
      trend: "up"
    },
    {
      title: "抽出データポイント",
      value: "1.2M",
      change: "今週+180k",
      icon: Database,
      trend: "up"
    },
    {
      title: "成功率",
      value: "98.5%",
      change: "今月+0.3%",
      icon: TrendingUp,
      trend: "up"
    },
    {
      title: "平均処理時間",
      value: "2.3s",
      change: "-0.5s改善",
      icon: Clock,
      trend: "down"
    }
  ]

  // todo: remove mock functionality
  const recentJobs = [
    {
      id: "job-001",
      name: "EC商品データ",
      status: "running",
      progress: 75,
      source: "amazon.com",
      recordsExtracted: 1240
    },
    {
      id: "job-002",
      name: "SNS分析データ",
      status: "completed",
      progress: 100,
      source: "twitter.com",
      recordsExtracted: 3420
    },
    {
      id: "job-003",
      name: "ニュース記事収集",
      status: "pending",
      progress: 0,
      source: "reddit.com",
      recordsExtracted: 0
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-blue-500"
      case "completed": return "bg-green-500"
      case "pending": return "bg-gray-500"
      case "failed": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} data-testid={`card-metric-${metric.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`text-metric-value-${metric.title.toLowerCase().replace(/\s+/g, '-')}`}>
                {metric.value}
              </div>
              <p className="text-xs text-muted-foreground">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              最近のジョブ
            </CardTitle>
            <CardDescription>
              最新のスクレイピング操作を監視
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 rounded-lg border" data-testid={`job-${job.id}`}>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(job.status)}`} />
                    <span className="font-medium text-sm">{job.name}</span>
                    <Badge variant="secondary" className="text-xs">{job.status === 'running' ? '実行中' : job.status === 'completed' ? '完了' : job.status === 'pending' ? '保留中' : job.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {job.source} • {job.recordsExtracted.toLocaleString()} 件
                  </div>
                  {job.status === "running" && (
                    <Progress value={job.progress} className="h-1 mt-2" />
                  )}
                </div>
                <Button variant="ghost" size="sm" data-testid={`button-view-${job.id}`}>
                  表示
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>クイックアクション</CardTitle>
            <CardDescription>
              データ抽出の一般的なタスク
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" data-testid="button-new-web-scrape">
              <Zap className="mr-2 h-4 w-4" />
              新しいWebスクレイピング
            </Button>
            <Button className="w-full justify-start" variant="outline" data-testid="button-social-extract">
              <Database className="mr-2 h-4 w-4" />
              SNSデータ抽出
            </Button>
            <Button className="w-full justify-start" variant="outline" data-testid="button-bulk-export">
              <Download className="mr-2 h-4 w-4" />
              一括データエクスポート
            </Button>
            <Button className="w-full justify-start" variant="outline" data-testid="button-schedule-job">
              <Clock className="mr-2 h-4 w-4" />
              定期実行ジョブ設定
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}