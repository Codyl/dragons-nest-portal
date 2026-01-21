import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
// import { useMutation } from "@tanstack/react-query";
// import UserServices from "@/api/services/user.services";
import useLoggedInUser from "@/hooks/use-logged-in-user";
import useUpdateUserSettings from "@/hooks/use-update-user-account";

const UserSettingsForm = () => {
  const { data, error, isPending } = useLoggedInUser();
  const { mutate: updateSettings } = useUpdateUserSettings();

  const schema = z.object({
    email: z.email("Invalid email address"),
    given_name: z.string().optional(),
    family_name: z.string().optional(),
    middle_name: z.string().optional(),
    phone_number: z
      .string()
      .regex(/^\d{10}$/, "Invalid phone number")
      .optional(),
  });

  const userData = data?.response;

  const form = useForm({
    defaultValues: {
      email: userData?.email || "",
      given_name: userData?.given_name || "",
      family_name: userData?.family_name || "",
      middle_name: userData?.middle_name || "",
      phone_number: userData?.phone_number || "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      updateSettings({
        ...value,
        phone_number: value.phone_number
          ? `+1${value.phone_number}`
          : undefined,
      });
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
          name="email"
          children={(field) => <InputField field={field} label="Email" />}
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
          name="phone_number"
          children={(field) => (
            <InputField field={field} label="Phone Number (Optional)" />
          )}
        />
        <div>
          By providing your phone number, you agree to receive a one-time
          passcode for identity verification. Message and data rates may apply.
          Message frequency varies. Text HELP for help or STOP to cancel.
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            window.open("localhost:5173/privacy-policy", "_blank");
          }}
        >
          Privacy Policy
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            window.open("localhost:5173/terms-of-service", "_blank");
          }}
        >
          Terms of Service
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Updating..." : "Update Settings"}
        </Button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
          <p className="text-red-600 dark:text-red-400">{error?.message}</p>
        </div>
      )}
    </div>
  );
};

export default UserSettingsForm;
