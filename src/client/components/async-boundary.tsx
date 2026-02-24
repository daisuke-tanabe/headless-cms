import { QueryErrorResetBoundary } from "@tanstack/react-query"
import { AlertCircle } from "lucide-react"
import { Component, type ReactNode, Suspense } from "react"
import { Button } from "@/components/ui/button"

type ErrorFallbackProps = {
  readonly error: Error
  readonly reset: () => void
}

type Props = {
  readonly children: ReactNode
  readonly fallback: ReactNode
  readonly renderError?: (props: ErrorFallbackProps) => ReactNode
}

type BoundaryState = { readonly error: Error | null }

type BoundaryProps = {
  readonly children: ReactNode
  readonly onReset: () => void
  readonly renderError?: (props: ErrorFallbackProps) => ReactNode
}

function DefaultErrorFallback({ reset }: ErrorFallbackProps) {
  return (
    <div className="text-center py-20">
      <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/30 mb-4" />
      <p className="text-sm font-medium mb-1">読み込みに失敗しました</p>
      <p className="text-[13px] text-muted-foreground mb-4">ネットワーク接続を確認してください</p>
      <Button size="sm" variant="outline" className="h-8 text-[13px]" onClick={reset}>
        再試行
      </Button>
    </div>
  )
}

class InnerErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error }
  }

  render() {
    if (this.state.error !== null) {
      const reset = () => {
        this.props.onReset()
        this.setState({ error: null })
      }
      return this.props.renderError
        ? this.props.renderError({ error: this.state.error, reset })
        : DefaultErrorFallback({ error: this.state.error, reset })
    }
    return this.props.children
  }
}

export function AsyncBoundary({ children, fallback, renderError }: Props) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <InnerErrorBoundary onReset={reset} renderError={renderError}>
          <Suspense fallback={fallback}>{children}</Suspense>
        </InnerErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
