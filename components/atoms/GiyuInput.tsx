import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { Input } from '../ui/input';

interface GiyuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  subtext?: string;
  labelClassName?: string;
  wrapClassName?: string;
  errors?: string[];
}

const GiyuInput = forwardRef<HTMLInputElement, GiyuInputProps>(
  (
    {
      className,
      type,
      label = '',
      labelClassName,
      wrapClassName,
      subtext = '',
      errors = [],
      ...props
    },
    ref
  ) => {
    return (
      <label className={cn('w-full grid gap-2.5', wrapClassName)}>
        <div className="flex items-center justify-between">
          {label && (
            <span
              className={cn(
                'text-[1rem] leading-none -tracking-[0.32px] text-white/70',
                labelClassName
              )}>
              {label}
            </span>
          )}
          {subtext && (
            <span
              className={cn(
                'text-[1rem] leading-none -tracking-[0.32px] text-white/70',
                labelClassName
              )}>
              {subtext}
            </span>
          )}
        </div>
        <div className="relative">
          <Input type={type} className={cn('', className)} ref={ref} {...props} />
        </div>
        {errors.length > 0 && (
          <p className={cn('text-[0.875rem] font-medium text-red')}>{errors[0]}</p>
        )}
      </label>
    );
  }
);
GiyuInput.displayName = 'GiyuInput';

export default GiyuInput;
