interface MatchScoreProps {
  percentage: number
  label?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

function getScoreColor(percentage: number): string {
  if (percentage >= 85) return 'text-green-700 bg-green-100'
  if (percentage >= 70) return 'text-blue-700 bg-blue-100'
  if (percentage >= 55) return 'text-primary-700 bg-primary-100'
  if (percentage >= 40) return 'text-yellow-700 bg-yellow-100'
  return 'text-red-700 bg-red-100'
}

function getProgressColor(percentage: number): string {
  if (percentage >= 85) return 'bg-green-500'
  if (percentage >= 70) return 'bg-blue-500'
  if (percentage >= 55) return 'bg-primary-500'
  if (percentage >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
}

export function MatchScore({ percentage, label, showLabel = true, size = 'md' }: MatchScoreProps) {
  const colorClass = getScoreColor(percentage)
  const displayLabel = label || getDefaultLabel(percentage)

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center rounded-full font-semibold ${colorClass} ${sizeClasses[size]}`}>
        {percentage}%
      </span>
      {showLabel && (
        <span className="text-xs text-gray-500">{displayLabel}</span>
      )}
    </div>
  )
}

export function MatchScoreBar({ percentage }: { percentage: number }) {
  const progressColor = getProgressColor(percentage)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-600">Match Score</span>
        <span className="text-xs font-semibold text-gray-700">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${progressColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function getDefaultLabel(percentage: number): string {
  if (percentage >= 85) return 'Excellent Match'
  if (percentage >= 70) return 'Strong Match'
  if (percentage >= 55) return 'Good Match'
  if (percentage >= 40) return 'Fair Match'
  if (percentage >= 25) return 'Weak Match'
  return 'Poor Match'
}
