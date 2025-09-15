import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-0 py-4 md:py-6">
      <div className="px-4">
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-semibold">設定</h1>
          <p className="text-sm text-muted-foreground mt-1">
            アカウントとアプリケーションの設定を管理します
          </p>
        </div>

        <div className="grid gap-4 md:gap-6">
          {/* アカウント設定 */}
          <Card>
            <CardHeader>
              <CardTitle>アカウント設定</CardTitle>
              <CardDescription>
                プロフィール情報とアカウントの設定
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">プロフィール</h3>
                  <p className="text-sm text-muted-foreground">
                    プロフィール情報の編集は「プロフィール」ページから行えます。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 通知設定 */}
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>
                メールとアプリ内通知の設定
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">メール通知</h3>
                  <p className="text-sm text-muted-foreground">
                    新しいプロジェクトやメッセージの通知設定（実装予定）
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* アプリケーション設定 */}
          <Card>
            <CardHeader>
              <CardTitle>アプリケーション設定</CardTitle>
              <CardDescription>
                表示とテーマの設定
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">テーマ</h3>
                  <p className="text-sm text-muted-foreground">
                    ライト/ダークモードの切り替えは右上のボタンから行えます。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* データとプライバシー */}
          <Card>
            <CardHeader>
              <CardTitle>データとプライバシー</CardTitle>
              <CardDescription>
                データの管理とプライバシー設定
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">データエクスポート</h3>
                  <p className="text-sm text-muted-foreground">
                    あなたのプロジェクトデータのエクスポート機能（実装予定）
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
