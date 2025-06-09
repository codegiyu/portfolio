import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatInputNumber = (
  val: string | number | readonly string[],
  options?: {
    noDecimalsAllowed: boolean;
    // returnNumber: boolean;
  }
) => {
  const str = String(val);
  const value = str.startsWith('.') ? '0' + str : str;
  const pattern = options?.noDecimalsAllowed ? /[^\d]/g : /[^\d.]|(?<=\.\d*)\./g;
  const formattedVal = value.replace(pattern, '');

  return formattedVal;
};

export const countStartingChar = (str: string, char: string) => {
  let count = 0;

  for (let i = 0; i < str.length; i++) {
    if (str[i] !== char) {
      break;
    }

    count++;
  }

  return count;
};
