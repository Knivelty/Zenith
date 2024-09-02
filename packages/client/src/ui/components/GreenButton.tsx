import { cn } from "../lib/utils";

export function GreenButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "bg-[#06FF00]",
        "text-black",
        "rounded",
        "w-80 h-20",
        "hover:cursor-pointer",
        className
      )}
      {...props}
    />
  );
}
