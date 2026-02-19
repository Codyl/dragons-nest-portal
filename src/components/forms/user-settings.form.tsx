import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import useLoggedInUser from "@/hooks/use-logged-in-user";
import useUpdateUserSettings from "@/hooks/use-update-user-account";
import { normalizePhoneNumber } from "@/utils/helpers/input-normalization.helpers";
import { formatPhoneNumber } from "@/utils/helpers/formatting.helpers";
import { useQueryClient } from "@tanstack/react-query";

const UserSettingsForm = () => {
  const queryClient = useQueryClient();
  const { data, isPending } = useLoggedInUser();
  const { mutate: updateSettings, error: updateSettingsError, isPending: isUpdating } = useUpdateUserSettings({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    }
  });

  const schema = z.object({
    email: z.email("Invalid email address"),
    given_name: z.string(),
    family_name: z.string(),
    middle_name: z.string(),
    phone_number: z
      .string()
      .refine((val) => val === "" || /^\d{10}$/.test(val), "Invalid phone number"),
  });

  const userData = data?.data;

  const form = useForm({
    defaultValues: {
      email: userData?.email || "",
      given_name: userData?.given_name || "",
      family_name: userData?.family_name || "",
      middle_name: userData?.middle_name || "",
      phone_number: userData?.phone_number?.replace("+1", "") || "",
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
          children={(field) => <InputField field={field} label="Email" required />}
        />

        <form.Field
          name="given_name"
          children={(field) => (
            <InputField field={field} label="First" />
          )}
        />
        <form.Field
          name="family_name"
          children={(field) => (
            <InputField field={field} label="Last" />
          )}
        />
        <form.Field
          name="middle_name"
          children={(field) => (
            <InputField field={field} label="Middle" />
          )}
        />

        <form.Field
          name="phone_number"
          children={(field) => (
            <InputField placeholder="(202) 555-0123" normalize={normalizePhoneNumber} format={formatPhoneNumber} field={field} label="Phone Number" />
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
        <Button type="submit" disabled={isPending || isUpdating} isPending={isPending || isUpdating}>
          Update
        </Button>
      </form>

      {updateSettingsError?.message && (
        <div className="p-4 bg-destructive/10 rounded-md" data-testid="error-message">
          <p className="text-red-600 dark:text-red-400">{updateSettingsError.message}</p>
        </div>
      )}
    </div>
  );
};

export default UserSettingsForm;
