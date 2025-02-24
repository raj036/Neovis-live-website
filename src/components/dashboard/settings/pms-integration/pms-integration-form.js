import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "react-query";
import useAxios from "../../../../services/useAxios";

export const PmsIntegrationForm = (props) => {
    const router = useRouter();
    const customInstance = useAxios();
    const { isDisabled, integrationId, integrationType } = props;

    const { data: pmsData } = useQuery("pmsDataById", () =>
        customInstance.get(`pms-integration/${integrationId}`), { enabled: integrationId !== undefined }
    );

    const { mutateAsync: addPms } = useMutation((data) =>
        customInstance.post(`pms-integration`, data)
    );

    const { mutateAsync: updatePms } = useMutation((data) =>
        customInstance.patch(`pms-integration/${integrationId}`, data)
    );

    const formik = useFormik({
        initialValues: {
            api_url: "",
            client_id: "",
            client_secret: "",
        },
        validationSchema: Yup.object({
            api_url: Yup.string().required(),
            client_id: Yup.string().required(),
            client_secret: Yup.string().required(),
        }),
        onSubmit: (values, helpers) => {
            try {
                const code = 12;
                const data = { ...values, }
                if (isDisabled === false) {
                    updatePms({ ...data, code: code, pms_id: integrationId });
                    helpers.setStatus({ success: true });
                    helpers.setSubmitting(false);
                    toast.success(`${integrationType} integration updated successfully!`);
                } else {
                    addPms({ ...data, code: code, pms_id: integrationId });
                    helpers.setStatus({ success: true });
                    helpers.setSubmitting(false);
                    toast.success(`${integrationType} integration added successfully!`);
                }
                router.push("/dashboard/settings/integration")
            } catch (err) {
                console.error(err);
                toast.error("Something went wrong!");
                helpers.setStatus({ success: false });
                helpers.setErrors({ submit: err.message });
                helpers.setSubmitting(false);
            }
        }
    })

    useEffect(() => {
        if (pmsData) {
            formik.setFieldValue("api_url", pmsData.data.api_url);
            formik.setFieldValue("client_id", pmsData.data.client_id);
            formik.setFieldValue("client_secret", pmsData.data.client_secret);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pmsData])

    return (
        <>
            <form onSubmit={formik.handleSubmit} {...props}>
                <Card>
                    <CardContent>
                        <Grid item container spacing={3}>
                            <Grid item md={4} xs={12}>
                                <Typography variant="h6">Integration Details</Typography>
                            </Grid>
                            <Grid item md={8} xs={12}>
                                <Box>
                                    <TextField
                                        error={Boolean(
                                            formik.touched.client_id && formik.errors.client_id
                                        )}
                                        fullWidth
                                        helperText={
                                            formik.touched.client_id && formik.errors.client_id &&
                                            'Please enter client Id'
                                        }
                                        label="Client Id"
                                        name="client_id"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        required
                                        value={formik.values.client_id}
                                        disabled={isDisabled}
                                    />
                                </Box>
                                <Box mt={3}>
                                    <TextField
                                        error={Boolean(
                                            formik.touched.client_secret && formik.errors.client_secret
                                        )}
                                        fullWidth
                                        helperText={
                                            formik.touched.client_secret && formik.errors.client_secret &&
                                            'Please enter client secret'
                                        }
                                        label="Client Secret"
                                        name="client_secret"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        required
                                        value={formik.values.client_secret}
                                        disabled={isDisabled}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                
                {
                    isDisabled === false &&
                    <Button
                    sx={{ justifyContent: "center", float: "right", mt: 4 }}
                    type="submit"
                    variant="contained"
                >
                    Submit
                </Button>
                }
            </form>
        </>
    );
};
