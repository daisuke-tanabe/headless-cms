import { Button } from "@/components/ui/button"
import { SignInButton, useAuth } from "@clerk/clerk-react"
import { ArrowRight, MessageSquare, Pencil, Zap } from "lucide-react"
import { Navigate } from "react-router"

const features = [
  {
    icon: MessageSquare,
    label: "チャットで指示",
    description: "自然言語で記事の作成・編集・削除を依頼",
  },
  {
    icon: Pencil,
    label: "AIが自動生成",
    description: "タイトルと本文をAIが生成し、承認後に公開",
  },
  {
    icon: Zap,
    label: "即座に反映",
    description: "面倒なUI操作不要。チャット一つで完結",
  },
] as const

export function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth()

  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-10 py-20">
        <div className="space-y-4">
          <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight leading-tight text-foreground">
            AIチャットで
            <br />
            記事を管理する
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed max-w-sm mx-auto">
            チャットで指示するだけで、記事の作成・編集・削除が完了します。
          </p>
        </div>

        <SignInButton mode="modal">
          <Button className="group h-10 px-6 text-[13px] font-medium">
            ログインして始める
            <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Button>
        </SignInButton>

        <div className="pt-4 border-t">
          <div className="grid gap-4 text-left">
            {features.map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <f.icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-foreground">{f.label}</p>
                  <p className="text-[13px] text-muted-foreground">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
