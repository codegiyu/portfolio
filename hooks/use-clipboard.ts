import { toast } from '@/components/atoms/Toast';
import { useEffect, useRef, useState } from 'react';

export const useClipboard = () => {
  const [state, setState] = useState('');

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const copy = (
    value: string,
    options?: { showToast?: boolean; clearAfter?: number /* in ms */ }
  ) => {
    const oldSchoolCopy = (text: string) => {
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = text;
      document.body.append(tempTextArea);
      tempTextArea.select();
      document.execCommand('copy');
      tempTextArea.remove();
    };

    const handleCopy = async () => {
      try {
        if (!navigator?.clipboard?.writeText) {
          throw new Error('writeText not supported');
        }

        await navigator.clipboard.writeText(value);
        setState(value);
      } catch (error) {
        console.warn(error);

        oldSchoolCopy(value);
        setState(value);
      } finally {
        if (options?.showToast) {
          toast({ description: 'Copied!', variant: 'success' });
        }

        if (typeof options?.clearAfter === 'number') {
          timeoutRef.current = setTimeout(() => {
            setState('');
          }, options.clearAfter);
        }
      }
    };

    void handleCopy();
  };

  useEffect(() => {
    const timeout = timeoutRef.current;

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return { copiedValue: state, copy };
};
