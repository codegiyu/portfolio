'use client';

import React, { useState } from 'react';

export type TextareaProps = React.ComponentProps<'textarea'>;

export const TextArea = ({ name, value, onChange, ...props }: TextareaProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = isFocused ? 'border-[#2E7D32]' : 'border-dark';

  const handleInputFocus = () => setIsFocused(true);

  const handleInputBlur = () => setIsFocused(false);

  return (
    <div className="w-full h-56 lg:h-full font-montserrat text-base leading-[18px] text-[#333]">
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className={`w-full h-textarea bg-[#FAFAFA] border-2 ${borderColor} 
        rounded-[8px] px-4 py-[14px] placeholder:text-ash focus:outline-none`}
        {...props}
      />
    </div>
  );
};

export type InputProps = React.ComponentProps<'input'> & {
  hasError?: boolean;
  errorValue?: string;
  errorText?: boolean;
};

export const Input = ({
  type,
  name,
  placeholder,
  errorText,
  value,
  hasError,
  errorValue,
  onChange,
  ...props
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = hasError
    ? 'border-[#EB1414]'
    : isFocused
      ? 'border-[#2E7D32]'
      : 'border-dark';

  const handleInputFocus = () => setIsFocused(true);

  const handleInputBlur = () => setIsFocused(false);

  return (
    <div className="w-full font-montserrat text-base leading-[18px] text-[#333]">
      <div className="relative w-full">
        <label className="">
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className={`w-full bg-[#FAFAFA] border-2 ${borderColor} 
            rounded-[8px] px-4 py-[16px] placeholder:text-ash focus:outline-none`}
            {...props}
          />
        </label>
      </div>
      {errorText && (
        <div className="h-[20px]">
          <p className={`text-[11px] text-[#EB1414] leading-[12px] my-1`}>{errorValue}</p>
        </div>
      )}
    </div>
  );
};
