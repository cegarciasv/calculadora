"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface KeypadButtonProps extends React.ComponentProps<typeof Button> {
    variant?: "default" | "secondary" | "operator" | "accent";
}

export const KeypadButton = ({ className, variant = "default", ...props }: KeypadButtonProps) => {
    return (
        <Button
            variant="ghost"
            className={cn(
                "h-20 w-full text-2xl font-semibold rounded-none border-0 active:scale-95 transition-transform duration-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                {
                    "bg-card text-card-foreground hover:bg-muted": variant === "default",
                    "bg-muted text-card-foreground/80 hover:bg-secondary": variant === "secondary",
                    "bg-primary/80 text-primary-foreground hover:bg-primary/90 data-[active=true]:bg-primary data-[active=true]:ring-2 data-[active=true]:ring-primary-foreground/50": variant === "operator",
                    "bg-accent text-accent-foreground hover:bg-accent/90": variant === "accent",
                },
                className
            )}
            {...props}
        />
    )
}
