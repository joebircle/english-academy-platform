import React from "react"
interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  action?: React.ReactNode
}

export function PageHeader({ title, description, children, action }: PageHeaderProps) {
  const actionContent = action || children
  return (
    <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actionContent && <div className="flex items-center gap-3">{actionContent}</div>}
    </div>
  )
}
