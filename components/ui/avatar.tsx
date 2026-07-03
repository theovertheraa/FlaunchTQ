import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils/cn";

export function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return <AvatarPrimitive.Root className={cn("relative flex h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900", className)} {...props} />;
}

export function AvatarImage(props: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image className="aspect-square h-full w-full object-cover" {...props} />;
}

export function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return <AvatarPrimitive.Fallback className={cn("flex h-full w-full items-center justify-center bg-zinc-800 text-sm font-medium text-zinc-100", className)} {...props} />;
}
