import { Toaster } from '@/components/ui/sonner';
import { ChildrenOnly } from '@/lib/types/general';

export default function Providers({ children }: ChildrenOnly) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
