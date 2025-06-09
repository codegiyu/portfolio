'use client';
import {
  type KeyboardEvent,
  type SVGProps,
  type JSX,
  ComponentPropsWithRef,
  useRef,
  useEffect,
} from 'react';
import { buttonVariants } from '../ui/button';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { LoadingLine } from '../icons';
import Link from 'next/link';
import { omit } from 'lodash';

export interface GiyuButtonProps
  extends ComponentPropsWithRef<'button'>,
    VariantProps<typeof buttonVariants> {
  LeftIcon?: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  RightIcon?: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  leftIconClass?: string;
  rightIconClass?: string;
  leftIconProps?: SVGProps<SVGSVGElement>;
  rightIconProps?: SVGProps<SVGSVGElement>;
  text?: string;
  textClassName?: string;
  children?: React.ReactNode;
  loading?: boolean;
  loadingIconBesideText?: boolean;
  loadingIconClassName?: string;
  onDisabledClick?: () => void;
  wrapClassName?: string;
  href?: string;
}

export const GiyuButton = ({
  LeftIcon,
  RightIcon,
  leftIconClass = '',
  rightIconClass = '',
  leftIconProps = {},
  rightIconProps = {},
  className = '',
  text = '',
  textClassName = '',
  children,
  variant = 'default',
  size = 'default',
  loading = false,
  loadingIconBesideText = false,
  loadingIconClassName,
  onDisabledClick,
  disabled = false,
  wrapClassName = '',
  href,
  ref,
  ...props
}: GiyuButtonProps) => {
  const localRef = useRef<HTMLButtonElement>(null);

  const fullWrapClassName = cn(
    `inline-block ${!!onDisabledClick && disabled ? 'cursor-pointer focus-visible:outline-primary/50 focus-visible:outline-1 outline-offset-2' : 'cursor-default'}`,
    size === 'full' ? 'w-full' : '',
    wrapClassName
  );
  const wrapProps = {
    ...(disabled && {
      tabIndex: 0,
      role: 'button',
      onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); // Prevent scrolling when pressing Space
          onDisabledClick?.();
        }
      },
      onClick: () => onDisabledClick?.(),
    }),
  };
  const mainEl = (
    <button
      className={cn(buttonVariants({ size, variant, className }))}
      ref={localRef}
      disabled={loading || disabled}
      aria-label={props['aria-label'] || text || 'button'}
      {...omit(props, ['aria-label'])}>
      {loading && children ? (
        <i className={cn('text-xl text-white animate-spin', loadingIconClassName)}>
          <LoadingLine />
        </i>
      ) : !loading && children ? (
        children
      ) : loading && !loadingIconBesideText ? (
        <i className={cn('text-xl text-white animate-spin', loadingIconClassName)}>
          <LoadingLine />
        </i>
      ) : (
        <>
          {LeftIcon && (
            <i className={cn('text-xl', leftIconClass)}>
              <LeftIcon {...leftIconProps} />
            </i>
          )}
          <div className="flex items-center gap-3">
            <span className={cn('', textClassName)}>{text}</span>
            {loading && (
              <i className={cn('text-xl text-white animate-spin', loadingIconClassName)}>
                <LoadingLine />
              </i>
            )}
          </div>
          {RightIcon && (
            <i className={cn('text-xl', rightIconClass)}>
              <RightIcon {...rightIconProps} />
            </i>
          )}
        </>
      )}
    </button>
  );

  useEffect(() => {
    if (!ref) return;

    if (typeof ref === 'function') {
      ref(localRef.current);
    } else if (typeof ref === 'object' && ref !== null) {
      ref.current = localRef.current;
    }
  }, [ref]);

  return (
    <>
      {href && !disabled ? (
        <Link href={href} className={fullWrapClassName}>
          {mainEl}
        </Link>
      ) : (
        <div className={fullWrapClassName} {...wrapProps}>
          {mainEl}
        </div>
      )}
    </>
  );
};
