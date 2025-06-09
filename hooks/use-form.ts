/* eslint-disable @typescript-eslint/no-unused-expressions */
import { FormErrors as FormErrorsType } from '@/lib/types/general';
import { formatInputNumber } from '@/lib/utils';
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { z, ZodType } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface UseFormProps<TSchema extends ZodType<any>> {
  formSchema: TSchema;
  defaultFormValues: z.infer<TSchema>;
  onSubmit: (values: z.infer<TSchema>) => Promise<boolean>;
  buttonIsFirstField?: boolean;
  submitStateResetInMS?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useForm = <TSchema extends ZodType<any>>({
  formSchema,
  defaultFormValues,
  onSubmit,
  buttonIsFirstField = false,
  submitStateResetInMS = 3000,
}: UseFormProps<TSchema>) => {
  type FormValues = typeof defaultFormValues;
  type FormErrors = FormErrorsType<FormValues>;

  const defaultFormErrors: FormErrors = useMemo(() => {
    const errors: FormErrors = {};

    for (const key in defaultFormValues) {
      errors[key] = [''];
    }

    return errors;
  }, [defaultFormValues]);

  const [formValues, setFormValues] = useState<FormValues>(defaultFormValues);
  const [formErrors, setFormErrors] = useState<FormErrors>(defaultFormErrors);
  const [errorsVisible, setErrorsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const firstFieldRef = useRef<HTMLInputElement>(null);
  const firstButtonFieldRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const isValid = useMemo(() => {
    const noErrors = Object.values(formErrors).every(item => !item);
    const valuesMatchSchema = formSchema.safeParse(formValues).success;

    return noErrors && valuesMatchSchema;
  }, [formErrors, formValues, formSchema]);

  const validateForm = (obj?: Partial<FormValues>) => {
    const errors =
      formSchema.safeParse({ ...formValues, ...obj }).error?.formErrors.fieldErrors ?? {};

    setFormErrors(() => {
      return errors as FormErrors;
    });

    obj ? setErrorsVisible(false) : setErrorsVisible(true);

    return errors;
  };

  const onChange = (
    name: keyof FormValues,
    value: string,
    options?: { clearFields?: (keyof FormValues)[] }
  ) => {
    setFormValues(prev => {
      const prevCopy = { ...prev };
      prevCopy[name] = value;

      if (!options || !options.clearFields || options.clearFields.length === 0) {
        return prevCopy;
      }

      for (const key of options.clearFields) {
        prevCopy[key] = defaultFormValues[key];
      }

      return prevCopy;
    });
  };

  const setErrors = (obj: Partial<FormErrors>, noShow?: boolean) => {
    setFormErrors(prev => {
      return { ...prev, ...obj };
    });

    if (!noShow) setErrorsVisible(true);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    options?: { clearFields?: (keyof FormValues)[] }
  ) => {
    const { name, dataset } = e.target;
    const fieldName = name as keyof FormValues;
    let value = e.target.value;
    const { type, maxLength, noDecimalsAllowed } = dataset;

    if (type === 'number') {
      value = formatInputNumber(value, { noDecimalsAllowed: noDecimalsAllowed === 'true' });
    }

    if (Number(maxLength) > 0) {
      value = value.slice(0, Number(maxLength));
    }

    onChange(fieldName, value, options);
  };

  const handleSubmit = async (e?: FormEvent) => {
    e && e.preventDefault();

    const formValid = formSchema.safeParse(formValues);

    if (!formValid.success) {
      setErrorsVisible(true);
      return;
    }

    setLoading(true);

    const wasSubmittedSuccessfully = await onSubmit(formValues);

    setSubmitted(wasSubmittedSuccessfully);
  };

  const resetForm = () => {
    setFormValues(defaultFormValues);
    setFormErrors(defaultFormErrors);
    setSubmitted(false);
    firstFieldRef.current?.focus();
  };

  useEffect(() => {
    buttonIsFirstField ? firstButtonFieldRef.current?.focus() : firstFieldRef.current?.focus();
  }, [buttonIsFirstField]);

  useEffect(() => {
    const nonEmptyValues: Partial<FormValues> = {};

    for (const key in formValues) {
      if (formValues[key]) {
        nonEmptyValues[key] = formValues[key];
      }
    }

    validateForm(nonEmptyValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues]);

  useEffect(() => {
    if (submitted) {
      if (timeoutRef.current) {
        setSubmitted(false);
        clearTimeout(timeoutRef.current);
      } else {
        timeoutRef.current = setTimeout(() => {
          setSubmitted(false);
        }, submitStateResetInMS);
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [submitted, submitStateResetInMS, formValues]);

  return {
    formValues,
    formErrors,
    setFormValues,
    setFormErrors: setErrors,
    resetForm,
    errorsVisible,
    setErrorsVisible,
    loading,
    setLoading,
    firstFieldRef,
    firstButtonFieldRef,
    isValid,
    handleInputChange,
    onChange,
    validateForm,
    handleSubmit,
    submitted,
  };
};
