
import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, label, checked, onCheckedChange, disabled, ...props }, ref) => {
        return (
            <label className={cn("flex items-center gap-3 cursor-pointer", disabled && "cursor-not-allowed opacity-50", className)}>
                <div className="relative">
                    <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={(e) => onCheckedChange(e.target.checked)}
                        disabled={disabled}
                        ref={ref}
                        {...props}
                    />
                    <div className={cn(
                        "w-11 h-6 rounded-full transition-colors duration-200 ease-in-out",
                        checked ? "bg-primary" : "bg-slate-200"
                    )}></div>
                    <div className={cn(
                        "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out shadow-sm",
                        checked ? "translate-x-5" : "translate-x-0"
                    )}></div>
                </div>
                {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
            </label>
        );
    }
);
Switch.displayName = "Switch";

export { Switch };
