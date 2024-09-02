import { cn } from "../lib/utils";

export function Dialog({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border bg-black border-[#06FF00] flex items-center justify-start w-2/3 z-30 h-[65%] flex-col",
        className
      )}
      {...props}
    ></div>
  );
}
