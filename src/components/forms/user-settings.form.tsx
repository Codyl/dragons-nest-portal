import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import UserServices from "@/api/services/user.services";

const UserSettingsForm = () => {
  const {
    mutate: updateSettings,
    data,
    error,
    isPending,
  } = useMutation({
    mutationFn: UserServices.updateUserSettings,
  });

  const schema = z.object({
    accessToken: z.string().min(1, "Access token is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().optional(),
    given_name: z.string().optional(),
    family_name: z.string().optional(),
    middle_name: z.string().optional(),
    address: z.string().optional(),
  });

  const form = useForm({
    defaultValues: {
      accessToken: "",
      email: "",
      password: "",
      given_name: "",
      family_name: "",
      middle_name: "",
      address: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      updateSettings(value);
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col tablet:w-md gap-4 mx-auto desktop:mx-0"
      >
        <form.Field
          name="accessToken"
          children={(field) => (
            <InputField field={field} label="Access Token" type="password" />
          )}
        />
        <form.Field
          name="email"
          children={(field) => <InputField field={field} label="Email" />}
        />
        <form.Field
          name="password"
          children={(field) => (
            <InputField
              field={field}
              label="Password (Optional)"
              type="password"
            />
          )}
        />
        <form.Field
          name="given_name"
          children={(field) => (
            <InputField field={field} label="First Name (Optional)" />
          )}
        />
        <form.Field
          name="family_name"
          children={(field) => (
            <InputField field={field} label="Last Name (Optional)" />
          )}
        />
        <form.Field
          name="middle_name"
          children={(field) => (
            <InputField field={field} label="Middle Name (Optional)" />
          )}
        />
        <form.Field
          name="address"
          children={(field) => (
            <InputField field={field} label="Address (Optional)" />
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Updating..." : "Update Settings"}
        </Button>
      </form>
      {data && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
          <p className="text-red-600 dark:text-red-400">
            Error: {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserSettingsForm;
