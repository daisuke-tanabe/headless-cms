import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ChatAction } from "~/shared"
import { executeAction } from "./action-executor"

describe("executeAction", () => {
  const mockHandlers = {
    navigate: vi.fn(),
    addMessage: vi.fn(),
    setPendingContent: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("does nothing when action is null", () => {
    executeAction(null, mockHandlers)
    expect(mockHandlers.navigate).not.toHaveBeenCalled()
    expect(mockHandlers.addMessage).not.toHaveBeenCalled()
    expect(mockHandlers.setPendingContent).not.toHaveBeenCalled()
  })

  it("calls setPendingContent and navigate for open_editor action", () => {
    const action: ChatAction = {
      type: "open_editor",
      to: "/articles/new",
      mode: "create",
      data: { title: "Test Title", body: "Test Body" },
    }
    executeAction(action, mockHandlers)
    expect(mockHandlers.setPendingContent).toHaveBeenCalledWith({
      title: "Test Title",
      body: "Test Body",
    })
    expect(mockHandlers.navigate).toHaveBeenCalledWith("/articles/new")
    expect(mockHandlers.addMessage).not.toHaveBeenCalled()
  })

  it("handles open_editor with optional title/body being undefined", () => {
    const action: ChatAction = {
      type: "open_editor",
      to: "/articles/new",
      mode: "create",
      data: {},
    }
    executeAction(action, mockHandlers)
    expect(mockHandlers.setPendingContent).toHaveBeenCalledWith({
      title: undefined,
      body: undefined,
    })
    expect(mockHandlers.navigate).toHaveBeenCalledWith("/articles/new")
  })

  it("calls addMessage with approval message for delete_article action", () => {
    const action: ChatAction = {
      type: "delete_article",
      data: { id: "article-123", title: "Article to Delete" },
      requiresApproval: true,
    }
    executeAction(action, mockHandlers)
    expect(mockHandlers.addMessage).toHaveBeenCalledWith({
      type: "approval",
      articleId: "article-123",
      articleTitle: "Article to Delete",
      status: "pending",
    })
    expect(mockHandlers.navigate).not.toHaveBeenCalled()
    expect(mockHandlers.setPendingContent).not.toHaveBeenCalled()
  })
})
