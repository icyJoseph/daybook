import { useEffect } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { FormField, Form, TextInput, TextArea } from "grommet";

const empty = {};

export function EntryForm({
  onSubmit,
  children,
  initialValues = empty
}: {
  onSubmit: (data: FieldValues) => Promise<void>;
  children: React.ReactNode;
  initialValues?: FieldValues;
}) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: initialValues
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormField>
        <TextInput
          placeholder="title"
          autoComplete="off"
          {...register("title", { required: true })}
        />
      </FormField>
      <FormField>
        <TextArea
          rows={5}
          resize="vertical"
          placeholder="description"
          {...register("description", { required: true })}
        />
      </FormField>

      {children}
    </Form>
  );
}
