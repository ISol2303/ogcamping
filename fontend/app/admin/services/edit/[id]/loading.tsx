import { Loader2 } from "lucide-react"

export default function ServiceEditLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
        <p className="text-gray-600">Đang tải thông tin dịch vụ...</p>
      </div>
    </div>
  )
}
