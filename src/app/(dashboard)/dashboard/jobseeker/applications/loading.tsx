export default function Loading() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-36 bg-gray-100 rounded animate-pulse mt-2" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="h-6 w-56 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mt-2" />
              </div>
              <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
            </div>
            <div className="flex gap-4 mt-4">
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
