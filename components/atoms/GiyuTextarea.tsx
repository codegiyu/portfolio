import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { Textarea } from '../ui/textarea';

interface GiyuTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  subtext?: string;
  labelClassName?: string;
  wrapClassName?: string;
  errors?: string[];
}

const GiyuTextarea = forwardRef<HTMLTextAreaElement, GiyuTextareaProps>(
  (
    { className, label = '', labelClassName, wrapClassName, subtext = '', errors = [], ...props },
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
        <Textarea className={className} ref={ref} {...props} />
        {errors.length > 0 && (
          <p className={cn('text-[0.875rem] font-medium text-red')}>{errors[0]}</p>
        )}
      </label>
    );
  }
);
GiyuTextarea.displayName = 'GiyuTextarea';

export default GiyuTextarea;
