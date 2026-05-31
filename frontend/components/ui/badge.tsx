import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold", {
  variants: {
    variant: {
      default: "border-transparent bg-primary text-primary-foreground",
      secondary: "border-transparent bg-secondary text-secondary-foreground",
      outline: "text-foreground",
      critical: "border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-300",
      high: "border-orange-500/30 bg-orange-500/15 text-orange-700 dark:text-orange-300",
      medium: "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300",
      low: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
    }
  },
  defaultVariants: { variant: "default" }
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}
