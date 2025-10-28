import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveFormProps {
  children: ReactNode;
  className?: string;
}

interface ResponsiveFormGroupProps {
  children: ReactNode;
  className?: string;
}

interface ResponsiveFormLabelProps {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
  required?: boolean;
}

interface ResponsiveFormInputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
}

interface ResponsiveFormSelectProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
}

interface ResponsiveFormTextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  rows?: number;
}

interface ResponsiveFormCheckboxProps {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
}

interface ResponsiveFormRadioProps {
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
}

export function ResponsiveForm({ children, className }: ResponsiveFormProps) {
  return <form className={cn("w-full space-y-4", className)}>{children}</form>;
}

export function ResponsiveFormGroup({
  children,
  className,
}: ResponsiveFormGroupProps) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

export function ResponsiveFormLabel({
  children,
  htmlFor,
  className,
  required = false,
}: ResponsiveFormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "block text-sm font-medium text-foreground mb-2",
        required && "required",
        className
      )}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

export function ResponsiveFormInput({
  type = "text",
  placeholder,
  value,
  onChange,
  className,
  disabled = false,
  required = false,
  error = false,
}: ResponsiveFormInputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={cn(
        "w-full px-4 py-3 border border-input rounded-md text-base bg-background ring-offset-background file:ring-2 file:ring-ring file:ring-offset-2 focus-visible:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "min-h-[44px]", // WCAG compliance
        error && "border-red-500 focus:ring-red-500",
        className
      )}
      style={{ fontSize: "16px" }} // Prevent zoom on iOS
    />
  );
}

export function ResponsiveFormSelect({
  value,
  onChange,
  children,
  className,
  disabled = false,
  required = false,
  error = false,
}: ResponsiveFormSelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={cn(
        "w-full px-4 py-3 border border-input rounded-md text-base bg-background ring-offset-background file:ring-2 file:ring-ring file:ring-offset-2 focus-visible:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "min-h-[44px]", // WCAG compliance
        error && "border-red-500 focus:ring-red-500",
        className
      )}
      style={{ fontSize: "16px" }} // Prevent zoom on iOS
    >
      {children}
    </select>
  );
}

export function ResponsiveFormTextarea({
  placeholder,
  value,
  onChange,
  className,
  disabled = false,
  required = false,
  error = false,
  rows = 4,
}: ResponsiveFormTextareaProps) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      rows={rows}
      className={cn(
        "w-full px-4 py-3 border border-input rounded-md text-base bg-background ring-offset-background file:ring-2 file:ring-ring file:ring-offset-2 focus-visible:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        "min-h-[44px]", // WCAG compliance
        error && "border-red-500 focus:ring-red-500",
        className
      )}
      style={{ fontSize: "16px" }} // Prevent zoom on iOS
    />
  );
}

export function ResponsiveFormCheckbox({
  checked,
  onChange,
  children,
  className,
  disabled = false,
  required = false,
  error = false,
}: ResponsiveFormCheckboxProps) {
  return (
    <div className="flex items-center space-x-2 min-h-[44px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={cn(
          "h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-ring",
          "min-h-[44px] min-w-[44px]", // WCAG compliance
          error && "border-red-500 focus:ring-red-500",
          className
        )}
      />
      <label className="text-sm font-medium text-foreground">
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    </div>
  );
}

export function ResponsiveFormRadio({
  name,
  value,
  onChange,
  children,
  className,
  disabled = false,
  required = false,
  error = false,
}: ResponsiveFormRadioProps) {
  return (
    <div className="flex items-center space-x-2 min-h-[44px]">
      <input
        type="radio"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={cn(
          "h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-ring",
          "min-h-[44px] min-w-[44px]", // WCAG compliance
          error && "border-red-500 focus:ring-red-500",
          className
        )}
      />
      <label className="text-sm font-medium text-foreground">
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    </div>
  );
}

export function ResponsiveFormError({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-sm text-red-600 mt-1", className)}>{children}</p>
  );
}

export function ResponsiveFormHelper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-xs text-muted-foreground mt-1", className)}>
      {children}
    </p>
  );
}
