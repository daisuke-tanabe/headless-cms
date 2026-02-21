import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SignInButton, useAuth } from "@clerk/clerk-react"
import { MessageSquare, Pencil, Sparkles, Trash2 } from "lucide-react"
import { Navigate } from "react-router"

const features = [
  {
    icon: MessageSquare,
    title: "チャットで指示",
    description: "自然な会話で記事の操作を依頼できます",
  },
  {
    icon: Pencil,
    title: "記事を自動作成",
    description: "AIがタイトルと本文を生成して提案します",
  },
  {
    icon: Trash2,
    title: "編集・削除も簡単",
    description: "チャットから記事の編集・削除が可能です",
  },
] as const

export function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth()

  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="max-w-2xl mx-auto text-center space-y-10">
        <div className="space-y-6">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            AIでCMS操作を簡単に
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">AI CMS</h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto">
            AIチャットでCMS操作を代行。記事の作成・編集・削除をチャットで指示するだけで完了します。
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 text-left">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-lg border bg-card p-4 space-y-2">
              <feature.icon className="h-5 w-5 text-muted-foreground" />
              <p className="font-medium text-sm">{feature.title}</p>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <SignInButton mode="modal">
            <Button size="lg" className="text-base px-8 py-6">
              ログインして始める
            </Button>
          </SignInButton>
        </div>
      </div>
    </div>
  )
}
