import { useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage"
import "./style.css"
import SavePopup from "./save"

const storage = new Storage()

interface BlinkoConfig {
  blinkoInstance: string
  blinkoToken: string
}

function ConfigPopup({ onConfigured }: { onConfigured: () => void }) {
  const [config, setConfig] = useState<BlinkoConfig>({
    blinkoInstance: "",
    blinkoToken: ""
  })
  const [apiInput, setApiInput] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const parseApiInput = (input: string): BlinkoConfig | null => {
    try {
      const instanceMatch = input.match(/https:\/\/[^\/]+/)
      const tokenMatch = input.match(/Bearer\s+([^\s']+)/)

      if (!instanceMatch || !tokenMatch) {
        throw new Error("Invalid API format")
      }

      return {
        blinkoInstance: instanceMatch[0],
        blinkoToken: tokenMatch[1]
      }
    } catch (e) {
      return null
    }
  }

  const validateConfig = async (config: BlinkoConfig): Promise<boolean> => {
    try {
      const response = await fetch(`${config.blinkoInstance}/api/v1/note/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.blinkoToken}`
        },
        body: JSON.stringify({
          page: 1,
          size: 1,
          orderBy: "desc",
          type: -1,
          isArchived: false,
          isRecycle: false,
          searchText: ""
        })
      })

      return response.ok
    } catch (e) {
      return false
    }
  }

  const handleSave = async () => {
    setError("")
    setIsLoading(true)

    const parsedConfig = parseApiInput(apiInput)
    if (!parsedConfig) {
      setError("无法解析API格式，请检查输入")
      setIsLoading(false)
      return
    }

    const isValid = await validateConfig(parsedConfig)
    if (!isValid) {
      setError("接口地址或者token错误，请检查")
      setIsLoading(false)
      return
    }

    await storage.set("blinkoConfig", JSON.stringify(parsedConfig))
    setConfig(parsedConfig)
    onConfigured()
    setIsLoading(false)
  }

  const handleClose = () => {
    window.close()
  }

  return (
    <div className="w-[600px] min-h-[400px] bg-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">save to blinko</h1>
        <button 
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-medium text-gray-800 mb-4">
            config the blinko open api
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <textarea
              className="w-full h-32 bg-transparent resize-none focus:outline-none text-gray-600 font-mono text-sm"
              value={apiInput}
              onChange={(e) => setApiInput(e.target.value)}
              placeholder="//blinko api document:https://blinko.jiahongw.com/api-doc&#10;curl -X 'POST' 'https://blinko.jiahongw.com/api/v1/note/upsert' \&#10;     -H 'Content-Type: application/json' \&#10;     -H 'Authorization: Bearer secret' \&#10;     -d '{ &quot;content&quot;: &quot;🎉Hello,Blinko! --send from api &quot;, &quot;type&quot;:0 }'"
            />
          </div>
        </div>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-yellow-100 hover:bg-yellow-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors">
          {isLoading ? "验证中..." : "save"}
        </button>
      </div>
    </div>
  )
}

function IndexPopup() {
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    checkConfig()
  }, [])

  const checkConfig = async () => {
    const savedConfig = await storage.get("blinkoConfig")
    setIsConfigured(!!savedConfig)
  }

  return isConfigured ? (
    <SavePopup />
  ) : (
    <ConfigPopup onConfigured={() => setIsConfigured(true)} />
  )
}

export default IndexPopup
