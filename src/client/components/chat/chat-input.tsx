import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Loader2, Send } from "lucide-react"
import { type FormEvent, useState } from "react"
import { MAX_CHAT_INPUT_LENGTH } from "~/shared"

type ChatInputProps = {
  readonly onSend: (message: string) => void
  readonly disabled?: boolean
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
  }

  return (
    <div className="border-t">
      <form onSubmit={handleSubmit} className="flex gap-2 p-4 pb-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX_CHAT_INPUT_LENGTH))}
          placeholder="メッセージを入力..."
          disabled={disabled}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="submit" size="icon" disabled={disabled || !value.trim()}>
              {disabled ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">送信</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>送信</TooltipContent>
        </Tooltip>
      </form>
      <div className="px-4 pb-3 text-right">
        <span className="text-xs text-muted-foreground">
          {value.length}/{MAX_CHAT_INPUT_LENGTH}
        </span>
      </div>
    </div>
  )
}
