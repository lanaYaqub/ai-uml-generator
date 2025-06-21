'use client'
import { Button } from '@/components/ui/button'

interface ConversationViewerProps {
  conversation: {
    story: string
    diagramType: string
    steps: {
      input: string
      umlCode: string
      rawResponse?: string
      basedOnStepIndex?: number // NEW: optional tracking
    }[]
  }
  setUmlCode: (code: string) => void
  onViewClick: (umlCode: string, index: number) => void // NEW: handler from parent
}

const ConversationViewer = ({ conversation, setUmlCode, onViewClick }: ConversationViewerProps) => {
  return (
    <div className="p-4 border-t space-y-4">
      <h2 className="text-md font-semibold">🧠 Conversation History</h2>

      <div className="text-sm text-muted-foreground">
        <p>
          <strong>Original Prompt:</strong> {conversation.story}
        </p>
        <p className="text-xs mt-1 italic">Type: {conversation.diagramType} diagram</p>
      </div>

      {/* Scrollable list */}
      <ul className="space-y-3 mt-4 max-h-80 overflow-y-auto pr-2">
        {conversation.steps.map((step, index) => (
          <li
            key={index}
            className="border rounded-md p-3 bg-muted/30 space-y-2"
          >
            <div className="flex justify-between items-start">
              <div className="text-sm max-w-md">
                <p>
                  <strong>Step {index + 1}:</strong> {step.input}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setUmlCode(step.umlCode)
                  onViewClick(step.umlCode, index) // NEW: trigger logging
                }}
              >
                View
              </Button>
            </div>

            {step.rawResponse && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                💬 AI said: {step.rawResponse}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ConversationViewer
