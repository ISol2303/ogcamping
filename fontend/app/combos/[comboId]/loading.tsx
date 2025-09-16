export default function ComboDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content skeleton */}
            <div className="lg:col-span-2">
              {/* Image gallery skeleton */}
              <div className="mb-8">
                <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>

              {/* Title and info skeleton */}
              <div className="mb-8">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="flex gap-4 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>

              {/* Tabs skeleton */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
                  ))}
                </div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-soft">
                <div className="text-center mb-6">
                  <div className="h-8 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-24 mx-auto"></div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
