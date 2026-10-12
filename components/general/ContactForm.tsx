'use client';

import { GiyuButton } from '../atoms/GiyuButton';
import { Checkmark } from '../icons';
import { z } from 'zod';
import { useForm } from '@/hooks/use-form';
import GiyuInput from '../atoms/GiyuInput';
import GiyuTextarea from '../atoms/GiyuTextarea';
import { useRef } from 'react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Please enter at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email' }),
  message: z.string().min(10, { message: 'Message too short' }),
  website: z.string().max(0).optional(),
});
const defaultFormValues: z.infer<typeof formSchema> = {
  name: '',
  email: '',
  message: '',
  website: '',
};

export const ContactForm = () => {
  const {
    formValues,
    formErrors,
    loading,
    setLoading,
    // firstFieldRef,
    isValid,
    errorsVisible,
    handleInputChange,
    validateForm,
    setFormValues,
    setFormErrors,
    handleSubmit,
    submitted,
  } = useForm({
    formSchema: formSchema,
    defaultFormValues,
    onSubmit,
    submitStateResetInMS: 10000,
  });
  const messageRef = useRef<HTMLTextAreaElement>(null);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const response = (await res.json()) as { success?: boolean; message?: string };

      if (res.ok && response.success) {
        setFormValues(defaultFormValues);
        return true;
      }

      setFormErrors({ message: [response.message || 'Unable to send your message.'] });
      return false;
    } catch {
      setFormErrors({ message: ['Network error. Please try again.'] });
      return false;
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-darkBg rounded-[20px] py-12 px-4 sm:px-12 font-montserrat">
      <div className="grid gap-7">
        <GiyuInput
          label="Name"
          name="name"
          placeholder="eg. John Doe"
          value={formValues.name}
          onChange={handleInputChange}
          errors={errorsVisible ? formErrors.name : undefined}
          // ref={firstFieldRef}
        />
        <GiyuInput
          label="Email"
          type="email"
          name="email"
          placeholder="eg. johndoe@gmail.com"
          value={formValues.email}
          onChange={handleInputChange}
          errors={errorsVisible ? formErrors.email : undefined}
        />
        <GiyuTextarea
          label="Message"
          name="message"
          placeholder=""
          value={formValues.message}
          onChange={handleInputChange}
          errors={errorsVisible ? formErrors.message : undefined}
          ref={messageRef}
        />
        <label className="sr-only" htmlFor="website">
          Website
        </label>
        <input
          id="website"
          name="website"
          value={formValues.website}
          onChange={handleInputChange}
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
        />
      </div>
      <div className="flex justify-center mt-8">
        <GiyuButton
          type="submit"
          disabled={!isValid}
          text="Submit Form"
          loading={loading}
          loadingIconBesideText
          className="px-12"
          RightIcon={submitted ? Checkmark : undefined}
          rightIconClass="text-green-500"
          onDisabledClick={validateForm}
        />
      </div>
      {submitted ? (
        <p className="text-base font-semibold text-center text-green-600 my-8">
          Mail Sent Successfully!
        </p>
      ) : (
        ''
      )}
      <p className="sr-only" aria-live="polite">
        {submitted ? 'Message sent successfully.' : ''}
      </p>
    </form>
  );
};
