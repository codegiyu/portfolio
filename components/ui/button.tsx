import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap leading-none transition-all cursor-pointer focus:outline-none focus-visible:outline-white focus-visible:outline-2 outline-offset-2 disabled:pointer-events-none disabled:opacity-50 blur-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-dark-secondary',
        secondary: 'bg-dark-primary text-primary-green',
        ghost: '',
      },
      size: {
        default: 'px-[1.875rem] py-5 rounded-full gap-2',
        icon: '',
        full: 'w-full px-[1.875rem] py-5 rounded-full gap-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
