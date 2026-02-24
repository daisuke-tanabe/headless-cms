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
      to: "/content-types/ct-123/entries/new",
      mode: "create",
      data: { title: "Test Title", body: "Test Body" },
    }
    executeAction(action, mockHandlers)
    expect(mockHandlers.setPendingContent).toHaveBeenCalledWith({
      title: "Test Title",
      body: "Test Body",
    })
    expect(mockHandlers.navigate).toHaveBeenCalledWith("/content-types/ct-123/entries/new")
    expect(mockHandlers.addMessage).not.toHaveBeenCalled()
  })

  it("handles open_editor with empty data", () => {
    const action: ChatAction = {
      type: "open_editor",
      to: "/content-types/ct-123/entries/new",
      mode: "create",
      data: {},
    }
    executeAction(action, mockHandlers)
    expect(mockHandlers.setPendingContent).toHaveBeenCalledWith({})
    expect(mockHandlers.navigate).toHaveBeenCalledWith("/content-types/ct-123/entries/new")
  })

  it("calls addMessage with approval message for delete_entry action", () => {
    const action: ChatAction = {
      type: "delete_entry",
      data: { id: "entry-123", label: "Entry to Delete", contentTypeId: "ct-123" },
      requiresApproval: true,
    }
    executeAction(action, mockHandlers)
    expect(mockHandlers.addMessage).toHaveBeenCalledWith({
      type: "approval",
      entryId: "entry-123",
      entryLabel: "Entry to Delete",
      contentTypeId: "ct-123",
      status: "pending",
    })
    expect(mockHandlers.navigate).not.toHaveBeenCalled()
    expect(mockHandlers.setPendingContent).not.toHaveBeenCalled()
  })
})
