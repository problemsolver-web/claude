export default function Loading() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-8 w-36 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-56 bg-gray-100 rounded animate-pulse mt-1" />
            </div>
            <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
