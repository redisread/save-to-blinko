import { useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage"
import "./style.css"

const storage = new Storage()

interface BlinkoConfig {
  blinkoInstance: string
  blinkoToken: string
}

function OptionsPage() {
  const [config, setConfig] = useState<BlinkoConfig>({
    blinkoInstance: "",
    blinkoToken: ""
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    const savedConfig = await storage.get("blinkoConfig")
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
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

  const handleUpdate = async () => {
    setError("")
    setIsLoading(true)

    const isValid = await validateConfig(config)
    if (!isValid) {
      setError("blinko实例地址或者token错误，请检查")
      setIsLoading(false)
      return
    }

    await storage.set("blinkoConfig", JSON.stringify(config))
    setIsLoading(false)
  }

  const handleClose = () => {
    window.close()
  }

  const handleCancel = () => {
    loadConfig()
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
          <h2 className="text-xl font-medium text-gray-800 mb-4">config</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                blinko instance address:
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                value={config.blinkoInstance}
                onChange={(e) =>
                  setConfig({ ...config, blinkoInstance: e.target.value })
                }
                placeholder="https://blinko.jiahongw.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                blinko access token:
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                value={config.blinkoToken}
                onChange={(e) =>
                  setConfig({ ...config, blinkoToken: e.target.value })
                }
                placeholder="token..."
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-between gap-4">
          <button
            onClick={handleCancel}
            className="flex-1 py-2 px-4 bg-yellow-100 hover:bg-yellow-200 text-gray-800 font-medium rounded-lg transition-colors">
            cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={isLoading}
            className="flex-1 py-2 px-4 bg-yellow-100 hover:bg-yellow-200 text-gray-800 font-medium rounded-lg transition-colors">
            {isLoading ? "updating..." : "update"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OptionsPage 