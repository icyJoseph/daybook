import { useEffect } from "react";
import {
  FieldValues,
  useForm,
  Controller,
  ControllerRenderProps
} from "react-hook-form";
import { Box, CheckBox, FormField, Form, TextInput, TextArea } from "grommet";

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
  const { register, handleSubmit, control, reset } = useForm({
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

      <Box margin={{ vertical: "2rem" }}>
        <Controller
          name="privacy"
          control={control}
          render={({ field }: { field: ControllerRenderProps }) => (
            <CheckBox checked={field.value} label="Private?" {...field} />
          )}
        />
      </Box>
      {children}
    </Form>
  );
}
