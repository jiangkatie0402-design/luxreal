'use client';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;

export function SheetContent({
  className,
  children,
  side = 'right',
  closeLabel,
  ...props
}: ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'left' | 'right';
  closeLabel: string;
}) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="sheet-overlay fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'sheet-panel fixed inset-y-0 z-50 flex h-dvh w-[86vw] max-w-sm flex-col gap-4 overflow-y-auto border-border bg-background p-6 shadow-card',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          className,
        )}
        data-side={side}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          aria-label={closeLabel}
          className="absolute right-4 top-4 grid size-11 place-items-center rounded-btn text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <X className="size-5" aria-hidden />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={cn('text-base font-semibold text-foreground', className)}
      {...props}
    />
  );
}
