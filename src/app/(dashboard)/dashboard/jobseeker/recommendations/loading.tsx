export default function Loading() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-72 bg-gray-100 rounded animate-pulse mt-2" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="h-6 w-64 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mt-2" />
              </div>
              <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
            </div>
            <div className="flex gap-3 mt-3">
              <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
              <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
