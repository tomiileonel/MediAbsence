import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/15 text-destructive border-destructive/20 dark:bg-destructive/20 dark:border-destructive/30",
        outline: "text-foreground",
        pending:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 dark:bg-amber-500/15 dark:border-amber-500/30",
        approved:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/15 dark:border-emerald-500/30",
        rejected:
          "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 dark:bg-rose-500/15 dark:border-rose-500/30",
        info:
          "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 dark:bg-blue-500/15 dark:border-blue-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
