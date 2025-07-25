"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    onValueChange?: (value: string) => void;
  }
>(({ className, value, onValueChange, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("grid gap-2", className)}
    role="radiogroup"
    {...props}
  >
    {React.Children.map(children, (child, index) =>
      React.isValidElement(child)
        ? React.cloneElement(child, {
            key: index,
            'data-group-value': value,
            'data-group-onchange': onValueChange,
          } as any)
        : child
    )}
  </div>
));
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  const groupValue = (props as any)['data-group-value'];
  const groupOnChange = (props as any)['data-group-onchange'];
  
  return (
    <input
      ref={ref}
      type="radio"
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      checked={groupValue === props.value}
      onChange={(e) => {
        if (e.target.checked) {
          groupOnChange?.(props.value as string);
        }
        props.onChange?.(e);
      }}
      {...props}
    />
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem }; 