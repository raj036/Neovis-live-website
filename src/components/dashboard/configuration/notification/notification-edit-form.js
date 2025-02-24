import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Fab,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    FormControlLabel,
    Switch
} from "@mui/material";
import { useMutation, useQueryClient } from "react-query";
import { STATUSES, notification_TYPES } from "../../../../utils/constants";
import useAxios from "../../../../services/useAxios";
import { ConfirmDialog } from "../../confim-dialog";
import { CameraAlt } from "@mui/icons-material";
import {
    deleteFirebaseImage,
    uploadFirebaseImage,
} from "../../../../utils/helper";
import { QuillEditor } from "../../../quill-editor";

const NOTI_STATUSES = [
    { label: "Pending", value: "Pending" },
    { label: "Assigned", value: "Assigned" },
    { label: "Completed", value: "Completed" },
    { label: "Inspected", value: "Inspected" },
    { label: "On Hold", value: "On Hold" },
    { label: "Re Open", value: "ReOpen" },
    { label: "Re Open Completed", value: "ReOpenCompleted" },
    { label: "Approval From Owner", value: "Approval From Owner" },
    { label: "Approved By Owner", value: "Approved By Owner" },
    { label: "Rejected By Owner", value: "Rejected By Owner" },
    { label: "Task Update", value: "Task Update" }
]

export const NotificationEditForm = (props) => {
    const router = useRouter();
    const [isDisabled, setIsDisabled] = useState(true);
    const [dialogStat, setDialogStat] = useState(false);
    const [loading, setLoading] = useState();
    const [notificationPhoto, setnotificationPhoto] = useState();

    const { notification } = props;

    const customInstance = useAxios();
    const queryClient = useQueryClient();

    const { mutateAsync: addnotification } = useMutation((data) =>
        customInstance.post(`push-notification-config`, data)
    );

    const { mutateAsync: updatenotification } = useMutation((data) => {
        customInstance.patch(`push-notification-config/${data?.id}`, data);
    });

    const { mutateAsync: deletenotification } = useMutation((data) => {
        customInstance.delete(`push-notification-config/${data?.id}`);
    });

    const formik = useFormik({
        initialValues: {
            action_status: "",
            is_manager_access: false,
            is_executor_access: false,
            is_inspector_access: false,
            is_vendor_access: false,
            is_owner_access: false,
            is_email_access: false,
            is_mobile_access: false,
        },
        validationSchema: Yup.object({
            action_status: Yup.string(),
        }),
        onSubmit: async (values, helpers) => {
            try {
                // console.log('values', values);
                setLoading(true);
                if (notification) {
                    await updatenotification(values);
                    await queryClient.refetchQueries(
                        ["notificationById", notification.id?.toString()],
                        {
                            active: true,
                            exact: true,
                        }
                    );
                } else {
                    await addnotification(values);
                    formik.resetForm();
                }
                setLoading(false);
                helpers.setStatus({ success: true });
                helpers.setSubmitting(false);
                toast.success(
                    notification
                        ? "Notification updated successfully!"
                        : "Notification added successfully!"
                );
                router.push("/dashboard/configurations/notification")
            } catch (err) {
                setLoading(false);
                console.error(err);
                toast.error(err?.response?.data?.message || "Something went wrong!");
                helpers.setStatus({ success: false });
                helpers.setErrors({ submit: err?.response?.data?.message });
                helpers.setSubmitting(false);
            }
        },
    });

    const onConfirmDialog = async () => {
        try {
            setDialogStat(false);
            await deletenotification(notification)
            //   await updatenotification({ ...formik.values, status: "Delete" });
            toast.success("notification deleted!");
            router.push("/dashboard/configurations/notification");
        } catch (e) {
            setDialogStat(false);
            toast.error("Something went wrong!");
        }
    };

    useEffect(() => {
        if (props) {
            if (props?.isEdit) {
                setIsDisabled(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props]);

    useEffect(() => {
        formik.resetForm();
        if (props?.notification) {
            formik.setValues({ ...props.notification });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.notification]);

    return (
        <>
            <form onSubmit={formik.handleSubmit} {...props}>
                <Card>
                    <CardContent>
                        <ConfirmDialog
                            title="Delete confirm?"
                            message=" Are you sure you want to delete notification config?"
                            dialogStat={dialogStat}
                            setDialogStat={setDialogStat}
                            onConfirmDialog={onConfirmDialog}
                        />
                        <Grid container spacing={3}>
                            <FormControl fullWidth sx={{ mt: 3, ml: 3 }}>
                                <InputLabel id="status">Action/Status</InputLabel>
                                <Select
                                    error={Boolean(
                                        formik.touched.action_status && formik.errors.action_status
                                    )}
                                    helperText={formik.touched.action_status && formik.errors.action_status}
                                    label="Action/Status"
                                    labelId="action/status"
                                    name="action_status"
                                    required
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.action_status}
                                    disabled={isDisabled}
                                >
                                    {NOTI_STATUSES?.map((_status) => (
                                        <MenuItem key={_status.value} value={_status.value}>
                                            {_status.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControlLabel
                                sx={{ mt: 2, ml: 3 }}
                                control={
                                    <Switch
                                        checked={formik.values.is_manager_access}
                                        onChange={(e) => {
                                            formik.setFieldValue('is_manager_access', e.currentTarget.checked)
                                        }}
                                    />
                                }
                                label="Manager Access"
                            />
                            <FormControlLabel
                                sx={{ mt: 2, ml: 3 }}
                                control={
                                    <Switch
                                        checked={formik.values.is_executor_access}
                                        onChange={(e) => {
                                            formik.setFieldValue('is_executor_access', e.currentTarget.checked)
                                        }}
                                    />
                                }
                                label="Executor Access"
                            />
                            <FormControlLabel
                                sx={{ mt: 2, ml: 3 }}
                                control={
                                    <Switch
                                        checked={formik.values.is_inspector_access}
                                        onChange={(e) => {
                                            formik.setFieldValue('is_inspector_access', e.currentTarget.checked)
                                        }}
                                    />
                                }
                                label="Inspector Access"
                            />
                            <FormControlLabel
                                sx={{ mt: 2, ml: 3 }}
                                control={
                                    <Switch
                                        checked={formik.values.is_vendor_access}
                                        onChange={(e) => {
                                            formik.setFieldValue('is_vendor_access', e.currentTarget.checked)
                                        }}
                                    />
                                }
                                label="Vendor Access"
                            />
                            <FormControlLabel
                                sx={{ mt: 2, ml: 3 }}
                                control={
                                    <Switch
                                        checked={formik.values.is_owner_access}
                                        onChange={(e) => {
                                            formik.setFieldValue('is_owner_access', e.currentTarget.checked)
                                        }}
                                    />
                                }
                                label="Owner Access"
                            />
                            <FormControlLabel
                                sx={{ mt: 2, ml: 3 }}
                                control={
                                    <Switch
                                        checked={formik.values.is_email_access}
                                        onChange={(e) => {
                                            formik.setFieldValue('is_email_access', e.currentTarget.checked)
                                        }}
                                    />
                                }
                                label="Email Access"
                            />
                            <FormControlLabel
                                sx={{ mt: 2, ml: 3 }}
                                control={
                                    <Switch
                                        checked={formik.values.is_mobile_access}
                                        onChange={(e) => {
                                            formik.setFieldValue('is_mobile_access', e.currentTarget.checked)
                                        }}
                                    />
                                }
                                label="Mobile Access"
                            />
                        </Grid>
                    </CardContent>
                </Card>
                {!isDisabled && (
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "space-between",
                            mx: -1,
                            mb: -1,
                            mt: 3,
                        }}
                    >
                        {notification && !notification.default && (
                            <>
                                <Button
                                    color="error"
                                    sx={{
                                        m: 1,
                                        mr: "auto",
                                    }}
                                    onClick={() => setDialogStat(true)}
                                >
                                    Delete
                                </Button>
                            </>
                        )}
                        <Button
                            sx={{ m: 1, ml: "auto", minWidth: "100px" }}
                            type="submit"
                            variant="contained"
                        >
                            {loading ? (
                                <CircularProgress style={{ color: "white" }} size={26} />
                            ) : notification ? (
                                "Update"
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </Box>
                )}
            </form>
        </>
    );
};
