import { Field, Form, Formik, type FormikHelpers } from "formik";
import { toast } from "react-toastify";
import { Button, Checkbox, Input, SelectDropdown } from "../../components/ui";
import type { IStaff, IStaffFormModel } from "../../models/staff";
import { getErrorMessage, getFieldErrors } from "../../services/http-service";
import staffService from "../../services/staff-service";
import messages from "../../shared/constants/messages";
import { StaffRoleOptions } from "../../shared/enums/user";
import { CreateStaffValidationSchema, EditStaffValidationSchema } from "../../validation/staff";
import FormAlert from "../account/components/FormAlert";

interface StaffFormProps {
  staff: IStaff | null;
  isSelf: boolean;
  onStaffSaved: () => void;
  handleDialogClose: () => void;
}

const StaffForm = ({ staff, isSelf, onStaffSaved, handleDialogClose }: StaffFormProps) => {
  const isEdit = !!staff;
  const initialValues: IStaffFormModel = {
    name: staff?.name ?? "",
    email: staff?.email ?? "",
    role: staff?.role ?? "staff",
    password: "",
    sendInvite: true,
    active: staff?.active ?? true,
  };

  const handleSubmit = async (values: IStaffFormModel, helpers: FormikHelpers<IStaffFormModel>) => {
    const request = isEdit
      ? staffService.updateStaff(staff.id, { name: values.name.trim(), ...(isSelf ? {} : { role: values.role }) })
      : staffService.createStaff({ name: values.name.trim(), email: values.email.trim(), role: values.role, password: values.password, sendInvite: values.sendInvite });
    await request
      .then((response) => {
        toast.success(isEdit ? `${response.data.name} updated` : `${response.data.name} can now log in${values.sendInvite ? " — invite email sent" : ""}`);
        onStaffSaved();
      })
      .catch((err) => {
        const fieldErrors = getFieldErrors(err);
        if (Object.keys(fieldErrors).length) helpers.setErrors(fieldErrors);
        else helpers.setStatus(getErrorMessage(err));
      });
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={isEdit ? EditStaffValidationSchema : CreateStaffValidationSchema} validateOnBlur={false}>
      {({ isSubmitting, status, values }) => (
        <Form noValidate className="space-y-4">
          {status && <FormAlert tone="danger">{status}</FormAlert>}
          <Field name="name" label="Full name" labelPlacement="outside" placeholder="e.g. Ravi Patel" isRequired component={Input} />
          <Field name="email" type="email" label="Email (login)" labelPlacement="outside" placeholder="ravi@riverside.example" isRequired disabled={isEdit} component={Input} />
          <Field name="role" label="Role" component={SelectDropdown} options={StaffRoleOptions} isDisabled={isSelf} />
          {isSelf && <p className="-mt-2 text-xs text-default-700">You can't change your own role.</p>}
          {!isEdit && (
            <>
              <Field name="password" type="password" label="Temporary password" labelPlacement="outside" placeholder={messages.PasswordRules} autoComplete="new-password" isPasswordToggle isRequired component={Input} />
              <Field name="sendInvite" label="Email a welcome message with the login link" component={Checkbox} />
              <p className="text-xs text-default-700">
                {values.sendInvite ? "The password is not included in the email. " : ""}Share the temporary password in person and ask them to change it from My account.
              </p>
            </>
          )}
          <div className="flex justify-end gap-2 border-t border-default-100 pt-4">
            <Button variant="light" onClick={handleDialogClose}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>{isEdit ? "Save changes" : "Create account"}</Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default StaffForm;
