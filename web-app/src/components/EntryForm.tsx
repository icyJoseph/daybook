import { ComponentPropsWithoutRef, useEffect } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { Textarea, TextInput, Box } from "@mantine/core";

const empty = {};

const Fieldset = (props: ComponentPropsWithoutRef<"fieldset">) => (
  <Box component="fieldset" {...props} mb="lg" />
);

export function EntryForm({
  onSubmit,
  children,
  initialValues = empty,
}: {
  onSubmit: (data: FieldValues) => Promise<void>;
  children: React.ReactNode;
  initialValues?: FieldValues;
}) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Fieldset>
        <TextInput
          placeholder="title"
          autoComplete="off"
          {...register("title", { required: true })}
        />
      </Fieldset>

      <Fieldset>
        <Textarea
          rows={5}
          autosize
          minRows={4}
          placeholder="description"
          {...register("description", { required: true })}
        />
      </Fieldset>

      {children}
    </form>
  );
}
