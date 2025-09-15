import { Link } from "wouter"
import { Bell, BriefcaseBusiness, Home, MessageCircle, Search, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type LinkedInShellProps = {
  children: React.ReactNode
}

export function LinkedInShell({ children }: LinkedInShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-600 text-white rounded grid place-items-center font-bold">V</div>
            <span className="font-semibold hidden sm:inline">VisionMates</span>
          </Link>
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="検索" className="pl-8" />
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/" className="flex items-center gap-1 hover:text-foreground"><Home className="h-4 w-4" />ホーム</Link>
            <Link href="/discover" className="flex items-center gap-1 hover:text-foreground"><Users className="h-4 w-4" />発見</Link>
            <Link href="/projects/mine" className="flex items-center gap-1 hover:text-foreground"><BriefcaseBusiness className="h-4 w-4" />プロジェクト</Link>
            <Link href="/messages" className="flex items-center gap-1 hover:text-foreground"><MessageCircle className="h-4 w-4" />メッセージ</Link>
            <button className="flex items-center gap-1 hover:text-foreground" aria-label="通知"><Bell className="h-4 w-4" /></button>
          </nav>
          <Avatar className="h-8 w-8">
            <AvatarImage alt="user" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Body: 3 columns */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left rail */}
        <aside className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">あなたのプロフィール</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10"><AvatarFallback>U</AvatarFallback></Avatar>
                <div>
                  <div className="font-medium">ビジョナリー</div>
                  <div className="text-xs text-muted-foreground">データ志向クリエイター</div>
                </div>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground">閲覧者: 0 • 投稿の反応: 0</div>
              <Button asChild className="w-full" size="sm">
                <Link href="/profile">プロフィールを見る</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">コミュニティ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Link href="/likes" className="block text-muted-foreground hover:text-foreground">いいね</Link>
              <Link href="/projects/mine" className="block text-muted-foreground hover:text-foreground">マイプロジェクト</Link>
              <Link href="/settings" className="block text-muted-foreground hover:text-foreground">設定</Link>
            </CardContent>
          </Card>
        </aside>

        {/* Center feed */}
        <main className="md:col-span-6 min-w-0">
          {children}
        </main>

        {/* Right rail */}
        <aside className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">おすすめ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>人気のプロジェクト</span>
                <Button variant="ghost" size="sm">表示</Button>
              </div>
              <div className="flex items-center justify-between">
                <span>新着コミュニティ</span>
                <Button variant="ghost" size="sm">表示</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">広告</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              あなたのプロジェクトを宣伝しませんか？
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

export default LinkedInShell


