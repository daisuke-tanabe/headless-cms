import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowUp, Loader2 } from "lucide-react"
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

  const canSubmit = !disabled && value.trim().length > 0

  return (
    <div className="border-t p-3">
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-ring transition-all duration-150"
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX_CHAT_INPUT_LENGTH))}
          placeholder="メッセージを入力..."
          disabled={disabled}
          className="flex-1 bg-transparent text-[13px] placeholder:text-muted-foreground/50 outline-none py-0.5 disabled:opacity-50"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 flex-shrink-0 ${
                canSubmit
                  ? "bg-foreground text-background hover:opacity-80"
                  : "bg-secondary text-muted-foreground/40"
              }`}
            >
              {disabled ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowUp className="h-3.5 w-3.5" />
              )}
              <span className="sr-only">送信</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>送信</TooltipContent>
        </Tooltip>
      </form>
      <div className="flex justify-end mt-1 px-1">
        <span className="text-[10px] text-muted-foreground/40 tabular-nums">
          {value.length}/{MAX_CHAT_INPUT_LENGTH}
        </span>
      </div>
    </div>
  )
}
