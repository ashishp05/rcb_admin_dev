import { Field, Form, Formik, type FormikHelpers } from "formik";
import { toast } from "react-toastify";
import { Button, Input, Modal } from "../../components/ui";
import type { ISetPasswordModel, IStaff } from "../../models/staff";
import { getErrorMessage, getFieldErrors } from "../../services/http-service";
import staffService from "../../services/staff-service";
import messages from "../../shared/constants/messages";
import { SetPasswordValidationSchema } from "../../validation/staff";
import FormAlert from "../account/components/FormAlert";

interface SetPasswordModalProps {
  staff: IStaff;
  openDialog: boolean;
  handleDialogClose: () => void;
}

const SetPasswordModal = ({ staff, openDialog, handleDialogClose }: SetPasswordModalProps) => {
  const handleSubmit = async (values: ISetPasswordModel, helpers: FormikHelpers<ISetPasswordModel>) => {
    await staffService
      .setPassword(staff.id, values.newPassword)
      .then(() => {
        toast.success(`Password set for ${staff.name}. They have been signed out everywhere.`);
        handleDialogClose();
      })
      .catch((err) => {
        const fieldErrors = getFieldErrors(err);
        if (Object.keys(fieldErrors).length) helpers.setErrors(fieldErrors);
        else helpers.setStatus(getErrorMessage(err));
      });
  };

  return (
    <Modal openDialog={openDialog} handleDialogClose={handleDialogClose} title={`Set a new password for ${staff.name}`} size="md" backdrop="blur">
      <Formik initialValues={{ newPassword: "", confirmPassword: "" }} onSubmit={handleSubmit} validationSchema={SetPasswordValidationSchema} validateOnBlur={false}>
        {({ isSubmitting, status }) => (
          <Form noValidate className="space-y-4">
            <FormAlert>This also clears a login lock and signs {staff.name.split(" ")[0]} out on every device.</FormAlert>
            {status && <FormAlert tone="danger">{status}</FormAlert>}
            <Field name="newPassword" type="password" label="New password" labelPlacement="outside" placeholder={messages.PasswordRules} autoComplete="new-password" isPasswordToggle component={Input} />
            <Field name="confirmPassword" type="password" label="Confirm password" labelPlacement="outside" autoComplete="new-password" isPasswordToggle component={Input} />
            <div className="flex justify-end gap-2 border-t border-default-100 pt-4">
              <Button variant="light" onClick={handleDialogClose}>Cancel</Button>
              <Button type="submit" isLoading={isSubmitting}>Set password</Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default SetPasswordModal;
