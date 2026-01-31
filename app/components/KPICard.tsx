'use client'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  icon?: React.ReactNode
}

export default function KPICard({
  title,
  value,
  subtitle,
  trend,
  icon,
}: KPICardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="mt-2 flex items-center">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4 flex-shrink-0 text-zinc-400 dark:text-zinc-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
