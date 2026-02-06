
import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
    value: number;
    onValueChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
    ({ className, label, value, onValueChange, min = 0, max = 100, step = 1, disabled, ...props }, ref) => {
        return (
            <div className={cn("space-y-3", className)}>
                {label && (
                    <div className="flex justify-between">
                        <label className="text-sm font-medium text-slate-700">{label}</label>
                        <span className="text-sm text-slate-500 font-mono">{value}%</span>
                    </div>
                )}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onValueChange(Number(e.target.value))}
                    disabled={disabled}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    ref={ref}
                    {...props}
                />
            </div>
        );
    }
);
Slider.displayName = "Slider";

export { Slider };
