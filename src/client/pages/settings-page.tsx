import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { PageContainer } from "@/components/page-container"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from "@/hooks/use-api-keys"
import { formatDate } from "@/lib/format"
import { AlertCircle, Check, Copy, Key, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

export function SettingsPage() {
  const { data, isLoading, isError, refetch } = useApiKeys()
  const createApiKey = useCreateApiKey()
  const deleteApiKey = useDeleteApiKey()

  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    const result = await createApiKey.mutateAsync()
    setCreatedKey(result.data.key)
    setCopied(false)
  }

  const handleCopy = async () => {
    if (!createdKey) return
    await navigator.clipboard.writeText(createdKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDialogClose = () => {
    setCreatedKey(null)
    setCopied(false)
  }

  return (
    <PageContainer>
      <PageBreadcrumb items={[{ label: "ダッシュボード", to: "/dashboard" }, { label: "設定" }]} />

      <h1 className="text-lg font-semibold mb-6">設定</h1>

      {/* API Keys Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-medium">APIキー</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              外部アプリから記事を取得するためのAPIキーを管理します
            </p>
          </div>
          <Button
            size="sm"
            className="h-8 text-[13px]"
            onClick={handleCreate}
            disabled={createApiKey.isPending}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {createApiKey.isPending ? "作成中..." : "作成"}
          </Button>
        </div>

        {isError ? (
          <div className="text-center py-12">
            <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium mb-1">読み込みに失敗しました</p>
            <p className="text-[13px] text-muted-foreground mb-4">
              ネットワーク接続を確認してください
            </p>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-[13px]"
              onClick={() => refetch()}
            >
              再試行
            </Button>
          </div>
        ) : isLoading ? (
          <div className="border rounded-lg divide-y">
            {Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              <div key={`skeleton-${i}`} className="px-4 py-3">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <Key className="h-8 w-8 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium mb-1">APIキーがありません</p>
            <p className="text-[13px] text-muted-foreground mb-4">
              APIキーを作成して外部アプリと連携しましょう
            </p>
            <Button
              size="sm"
              className="h-8 text-[13px]"
              onClick={handleCreate}
              disabled={createApiKey.isPending}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              作成する
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg divide-y">
            {data?.data.map((apiKey) => (
              <div key={apiKey.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-mono">
                    {apiKey.prefix}
                    {"..."}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-xs text-muted-foreground">
                      作成: {formatDate(apiKey.createdAt)}
                    </p>
                    {apiKey.lastUsedAt ? (
                      <p className="text-xs text-muted-foreground">
                        最終使用: {formatDate(apiKey.lastUsedAt)}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">未使用</p>
                    )}
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">削除</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>APIキーを削除しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        このAPIキーを使用しているアプリケーションは動作しなくなります。この操作は取り消せません。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="h-8 text-[13px]">キャンセル</AlertDialogCancel>
                      <AlertDialogAction
                        className="h-8 text-[13px]"
                        onClick={() => deleteApiKey.mutate(apiKey.id)}
                      >
                        削除する
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Created Key Dialog */}
      <Dialog open={createdKey !== null} onOpenChange={(open) => !open && handleDialogClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>APIキーを作成しました</DialogTitle>
            <DialogDescription>
              このキーは二度と表示されません。安全な場所にコピーして保存してください。
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md border bg-muted px-3 py-2 text-xs font-mono break-all">
              {createdKey}
            </code>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 flex-shrink-0"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">コピー</span>
            </Button>
          </div>
          <DialogFooter>
            <Button size="sm" className="h-8 text-[13px]" onClick={handleDialogClose}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
