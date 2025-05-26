'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { Icon } from '@iconify/react';
import { Input, TextArea } from '@/components/atoms/Inputs';
import ErrorBoundary from './ErrorBoundary';

export const ContactForm = () => {
  const [disabled, setDisabled] = useState(true);
  const [inputValue, setInputValue] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'Your message',
  });
  const [hasError, setHasError] = useState({ name: false, email: false, phone: false });
  const [errorValue, setErrorValue] = useState({ name: '', email: '', phone: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isMailSending, setIsMailSending] = useState(false);

  const disabledColor = disabled ? 'opacity-40' : '';

  const inputsAllGood = (obj: Record<string, boolean>) =>
    Object.values(obj).every(item => item === false);
  const inputsNotEmpty = (obj: Record<string, string>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { phone, ...newObj } = obj;
    return Object.values(newObj).every(item => item != '');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    try {
      setFormSubmitted(false);
      setInputValue({ ...inputValue, [e.target.name]: e.target.value });
      if (e.target.value) {
        if (e.target.type === 'email') {
          if (
            !/(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@[*[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+]*/.test(
              e.target.value
            )
          ) {
            throw new Error('Email address format is invalid');
          }
        } else if (e.target.type === 'text' && e.target.name.includes('name')) {
          if (!/^[a-zA-Z- ]{3,}$/i.test(e.target.value)) throw new Error('Name issues');
        }
      }
      setHasError({ ...hasError, [e.target.name]: false });
      setErrorValue({ ...errorValue, [e.target.name]: '' });
      if (
        inputsAllGood({ ...hasError, [e.target.name]: false }) &&
        inputsNotEmpty({ ...inputValue, [e.target.name]: e.target.value })
      ) {
        setDisabled(false);
      } else setDisabled(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.message === 'Name issues') {
        if (e.target.value.length < 3) {
          setHasError({ ...hasError, [e.target.name]: true });
          setErrorValue({
            ...errorValue,
            [e.target.name]: 'Name cannot be less than 3 characters',
          });
          err.message = 'Name cannot be less than 3 characters';
        } else {
          setHasError({ ...hasError, [e.target.name]: true });
          setErrorValue({
            ...errorValue,
            [e.target.name]: 'This field can only contain A to Z and -',
          });
          err.message = 'This field can only contain A to Z and -';
        }
      } else {
        setHasError({ ...hasError, [e.target.name]: true });
        setErrorValue({ ...errorValue, [e.target.name]: err.message });
      }
      setDisabled(true);
    }
  };

  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue({ ...inputValue, message: e.target.value });
    if (
      inputsAllGood({ ...hasError, [e.target.name]: false }) &&
      inputsNotEmpty({ ...inputValue, [e.target.name]: e.target.value })
    ) {
      setDisabled(false);
    } else setDisabled(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsMailSending(true);

    fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify(inputValue),
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        const reader = response.body?.getReader();

        return new ReadableStream({
          start(controller) {
            function push() {
              reader?.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                controller.enqueue(value);
                push();
              });
            }
            push();
          },
        });
      })
      .then(stream => new Response(stream, { headers: { 'Content-Type': 'text/html' } }).text())
      .then(resultRes => {
        const result = JSON.parse(resultRes);
        console.log({ result });
        if (result.accepted.length) {
          setInputValue({ name: '', email: '', phone: '', message: 'Your message' });
          setIsMailSending(false);
          setFormSubmitted(true);
        } else {
          setHasError({ ...hasError, email: true });
          setErrorValue({ ...errorValue, email: result.response });
        }
      })
      .catch(error => {
        console.error({ error });
      });
  };

  return (
    <form method="post" onSubmit={handleSubmit} className="font-montserrat">
      <div
        className="flex flex-col lg:flex-row gap-1 justify-start lg:gap-6 lg:justify-between 
                items-stretch">
        <div className="w-full lg:w-1/2 flex flex-col gap-1">
          <ErrorBoundary>
            <Input
              type="text"
              name="name"
              placeholder="Your name"
              errorText={true}
              value={inputValue.name}
              hasError={hasError.name}
              errorValue={errorValue.name}
              onChange={handleInputChange}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <Input
              type="email"
              name="email"
              placeholder="Your email address"
              errorText={true}
              value={inputValue.email}
              hasError={hasError.email}
              errorValue={errorValue.email}
              onChange={handleInputChange}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <Input
              type="tel"
              name="phone"
              placeholder="Your phone number (Optional)"
              errorText={true}
              value={inputValue.phone}
              hasError={hasError.phone}
              errorValue={errorValue.phone}
              onChange={handleInputChange}
            />
          </ErrorBoundary>
        </div>
        <div className="w-full lg:w-1/2">
          <ErrorBoundary>
            <TextArea name="message" value={inputValue.message} onChange={handleTextAreaChange} />
          </ErrorBoundary>
        </div>
      </div>
      {formSubmitted ? (
        <p className="text-base font-semibold text-center text-green-600 my-8">
          Mail Sent Successfully!
        </p>
      ) : (
        ''
      )}
      <div className="flex justify-center mt-8">
        <button
          type="submit"
          className={`bg-red text-[#FAFAFA] text-base leading-[100%] font-medium 
          px-12 py-4 rounded-[10px] ${disabledColor} flex gap-3 items-center justify-center`}
          disabled={disabled}>
          <span>Submit Form</span>
          {isMailSending ? (
            <span className="text-2xl rounded-full bg-white">
              <Icon icon="line-md:loading-twotone-loop" color="green" />
            </span>
          ) : formSubmitted ? (
            <span className="text-2xl rounded-full bg-white">
              <Icon icon="mdi:tick-circle" color="green" />
            </span>
          ) : (
            ''
          )}
        </button>
      </div>
    </form>
  );
};
