import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-colors", {
  variants: {
    variant: {
      default: "border-transparent bg-primary text-primary-foreground",
      secondary: "border-transparent bg-secondary text-secondary-foreground",
      outline: "text-foreground border-border",
      critical: "border-red-500/30 bg-red-500/8 text-red-600 dark:text-red-400 shadow-sm shadow-red-500/5",
      high: "border-orange-500/30 bg-orange-500/8 text-orange-600 dark:text-orange-400 shadow-sm shadow-orange-500/5",
      medium: "border-amber-500/30 bg-amber-500/8 text-amber-600 dark:text-amber-400 shadow-sm shadow-amber-500/5",
      low: "border-emerald-500/30 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/5"
    }
  },
  defaultVariants: { variant: "default" }
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}
