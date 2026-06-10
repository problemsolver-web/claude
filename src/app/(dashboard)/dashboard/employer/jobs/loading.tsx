export default function Loading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-28 bg-gray-100 rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 w-32 bg-primary-100 rounded-lg animate-pulse" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="h-6 w-56 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mt-2" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
                <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex gap-3 mt-3">
              <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
              <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
