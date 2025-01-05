import { useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage"
import "./style.css"

const storage = new Storage()

interface BlinkoConfig {
  blinkoInstance: string
  blinkoToken: string
}

interface Tag {
  id: number
  text: string
}

function SavePopup() {
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<Tag[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [config, setConfig] = useState<BlinkoConfig | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    const savedConfig = await storage.get("blinkoConfig")
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      setTags([...tags, { id: Date.now(), text: tagInput.trim() }])
      setTagInput("")
    }
  }

  const handleRemoveTag = (id: number) => {
    setTags(tags.filter((tag) => tag.id !== id))
  }

  const formatContent = () => {
    const tagSection = tags.map((tag) => `#${tag.text}`).join(" ")
    return `${tagSection}\n\n${content}`
  }

  const handleSave = async () => {
    if (!config) return
    setIsLoading(true)

    try {
      const response = await fetch(`${config.blinkoInstance}/api/v1/note/upsert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.blinkoToken}`
        },
        body: JSON.stringify({
          content: formatContent(),
          type: 0
        })
      })

      if (response.ok) {
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          setContent("")
          setTags([])
        }, 2000)
      }
    } catch (error) {
      console.error("Failed to save note:", error)
    }

    setIsLoading(false)
  }

  const handleCancel = () => {
    setContent("")
    setTags([])
  }

  return (
    <div className="w-[600px] min-h-[400px] bg-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">save to blinko</h1>
        <button className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">content</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <textarea
              className="w-full h-32 bg-transparent resize-none focus:outline-none text-gray-600"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="something......"
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">tags</h2>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {tag.text}
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  className="text-blue-600 hover:text-blue-800">
                  ×
                </button>
              </div>
            ))}
          </div>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Press Enter to add tag"
          />
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={handleCancel}
            className="flex-1 py-2 px-4 bg-red-100 hover:bg-red-200 text-red-800 font-medium rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 py-2 px-4 bg-yellow-100 hover:bg-yellow-200 text-gray-800 font-medium rounded-lg transition-colors">
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-green-600 font-medium">保存成功</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SavePopup 