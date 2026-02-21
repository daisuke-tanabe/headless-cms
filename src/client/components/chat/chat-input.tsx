import { MAX_CHAT_INPUT_LENGTH } from "~/shared"
import { Loader2, Send } from "lucide-react"
import { type FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
		<form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
			<Input
				value={value}
				onChange={(e) => setValue(e.target.value.slice(0, MAX_CHAT_INPUT_LENGTH))}
				placeholder="メッセージを入力..."
				disabled={disabled}
			/>
			<Button type="submit" size="icon" disabled={disabled || !value.trim()}>
				{disabled ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<Send className="h-4 w-4" />
				)}
				<span className="sr-only">送信</span>
			</Button>
		</form>
	)
}
