import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
    Autocomplete,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Fab,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { AREA_TYPES, STATUSES } from "../../../../utils/constants";
import { QuillEditor } from "../../../quill-editor";
import useAxios from "../../../../services/useAxios";
import { ConfirmDialog } from "../../confim-dialog";
import { CameraAlt } from "@mui/icons-material";
import { deleteFirebaseImage, uploadFirebaseImage } from "../../../../utils/helper";

export const CompanyEditForm = (props) => {
    const router = useRouter();
    const [isDisabled, setIsDisabled] = useState(true);
    const [dialogStat, setDialogStat] = useState(false);
    const [loading, setLoading] = useState();
    const [companyLogo, setCompanyLogo] = useState();

    // const [selProperty, setSelProprty] = useState();
    // const [selUnittype, setSelUnittype] = useState();

    const { company } = props;

    const customInstance = useAxios();
    const queryClient = useQueryClient();

    // const { data: properties } = useQuery("allProperty", () =>
    //     customInstance.get(`properties`)
    // );

    // const { data: unittypes, refetch: unittypeRefetch } = useQuery(
    //     "unitTypesOnProperty",
    //     () => customInstance.get(`unit-types/property/${selProperty?.id}`),
    //     { enabled: selProperty?.id !== undefined }
    // );

    const { mutateAsync: addcompany } = useMutation((data) =>
        customInstance.post(`company`, data)
    );

    const { mutateAsync: updatecompany } = useMutation((data) => {
        customInstance.patch(`company/${data?.id}`, data);
    });

    const formik = useFormik({
        initialValues: {
            name: "",
            code: "",
            description: "",
            logo: "",
            address: "",
            status: "Active",
        },
        validationSchema: Yup.object({
            // property_id: Yup.string().required(),
            // unit_type_id: Yup.string().required(),
            code: Yup.string().max(15),
            name: Yup.string().max(50),
            address: Yup.string().max(50),
            description: Yup.string().max(5000),
        }),
        onSubmit: async (values, helpers) => {
            try {
                setLoading(true);
                if (company) {
                    let data = { ...values };
                    // delete data.property;
                    // delete data.unit_type;
                    let logo = await uploadPhoto();
                    await updatecompany({ ...data, logo });
                    await queryClient.refetchQueries(
                        ["companyById", company.id?.toString()],
                        {
                            active: true,
                            exact: true,
                        }
                    );
                } else {
                    let logo = await uploadPhoto();
                    await addcompany({ ...values, logo });
                    formik.resetForm();
                }
                setLoading(false);
                helpers.setStatus({ success: true });
                helpers.setSubmitting(false);
                toast.success(
                    company
                        ? "Company updated successfully!"
                        : "Company added successfully!"
                );
                router.push("/dashboard/properties/company");
            } catch (err) {
                console.error(err);
                toast.error("Something went wrong!");
                helpers.setStatus({ success: false });
                helpers.setErrors({ submit: err.message });
                helpers.setSubmitting(false);
            }
        },
    });

    const onConfirmDialog = async () => {
        try {
            setDialogStat(false);
            await updatecompany({ ...formik.values, status: "Delete" });
            toast.success("Company deleted successfully!");
            router.push("/dashboard/properties/company");
        } catch (e) {
            setDialogStat(false);
            toast.error("Something went wrong!");
        }
    };

    // useEffect(() => {
    //     if (selProperty?.id) {
    //         unittypeRefetch();
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [selProperty, unittypeRefetch]);

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
        if (props?.company) {
            formik.setValues({ ...props.company });
            // setSelProprty(props?.company.property);
            // setSelUnittype(props?.company.unit_type);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.company]);

    const uploadPhoto = async () => {
        let photo_uri;
        const company = formik.values;
        if (companyLogo && companyLogo.updated === true) {
            try {
                if (company?.logo) {
                    await deleteFirebaseImage("config", company.logo);
                }
                photo_uri = await uploadFirebaseImage("config", companyLogo);
            } catch (e) {
                console.log("Error", e);
            }
        }
        return photo_uri;
    };

    const onImageSelect = async (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = function (e) {
            setCompanyLogo({
                url: reader.result,
                _file: file,
                updated: true,
            });
        };
    };

    return (
        <>
            <form onSubmit={formik.handleSubmit} {...props}>
                <Card>
                    <CardContent>
                        <ConfirmDialog
                            title="Delete confirm?"
                            message=" Are you sure you want to delete company?"
                            dialogStat={dialogStat}
                            setDialogStat={setDialogStat}
                            onConfirmDialog={onConfirmDialog}
                        />
                        <Grid container spacing={3}>
                            <Grid item md={4} xs={12}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        overflow: "hidden",
                                        //mt: "-25px",
                                        ml: 5,
                                        mb: 3,
                                    }}
                                >
                                    <div style={{ position: "relative" }}>
                                        <Avatar
                                            src={
                                                companyLogo ? companyLogo?.url : formik?.values?.logo
                                            }
                                            sx={{
                                                height: 150,
                                                width: 150,
                                                ml: 2,
                                                mt: 1,
                                            }}
                                        >
                                            Company
                                        </Avatar>
                                        <Typography
                                            color="textSecondary"
                                            variant="subtitle2"
                                            sx={{ mt: 1, ml: 5 }}
                                        >
                                            Company Logo
                                        </Typography>
                                        <>
                                            <input
                                                accept="image/*"
                                                style={{ display: "none" }}
                                                id="user-image"
                                                type="file"
                                                onChange={onImageSelect}
                                            />
                                            <label htmlFor="user-image">
                                                <Fab
                                                    component="div"
                                                    style={{
                                                        backgroundColor: "white",
                                                        width: "35px",
                                                        height: "25px",
                                                        position: "absolute",
                                                        top: "110px",
                                                        right: "2px",
                                                    }}
                                                    icon
                                                    disabled={isDisabled}
                                                >
                                                    <CameraAlt sx={{ width: "15px", height: "15px" }} />
                                                </Fab>
                                            </label>
                                        </>
                                    </div>
                                </Box>
                            </Grid>
                            <Grid item md={8} xs={12}>
                                <TextField
                                    error={Boolean(
                                        formik.touched.name && formik.errors.name
                                    )}
                                    fullWidth
                                    helperText={
                                        formik.touched.name && formik.errors.name
                                    }
                                    label="Company Name"
                                    name="name"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    required
                                    value={formik.values.name}
                                    disabled={isDisabled}
                                    style={{ marginBottom: 20 }}
                                />
                                <TextField
                                    error={Boolean(
                                        formik.touched.code && formik.errors.code
                                    )}
                                    fullWidth
                                    helperText={
                                        formik.touched.code && formik.errors.code
                                    }
                                    label="Company Code"
                                    name="code"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    required
                                    value={formik.values.code}
                                    disabled={isDisabled}
                                    style={{ marginBottom: 20 }}
                                />
                                <TextField
                                    error={Boolean(
                                        formik.touched.address && formik.errors.address
                                    )}
                                    fullWidth
                                    helperText={
                                        formik.touched.address && formik.errors.address
                                    }
                                    label="Company address"
                                    name="address"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    // required
                                    value={formik.values.address}
                                    disabled={isDisabled}
                                    style={{ marginBottom: 20 }}
                                />
                                <FormControl fullWidth>
                                    <InputLabel id="status">Status *</InputLabel>
                                    <Select
                                        error={Boolean(
                                            formik.touched.status && formik.errors.status
                                        )}
                                        helperText={formik.touched.status && formik.errors.status}
                                        label="Status"
                                        labelId="status"
                                        name="status"
                                        required
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.status}
                                        disabled={isDisabled}
                                    >
                                        {STATUSES?.map((_status) => (
                                            <MenuItem key={_status.value} value={_status.value}>
                                                {_status.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* <Grid item md={6} xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="area_type">Area Type *</InputLabel>
                                    <Select
                                        error={Boolean(
                                            formik.touched.area_type && formik.errors.area_type
                                        )}
                                        helperText={
                                            formik.touched.area_type && formik.errors.area_type
                                        }
                                        label="Area Type"
                                        labelId="area_type"
                                        name="area_type"
                                        required
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.area_type}
                                        disabled={isDisabled}
                                        MenuProps={{ PaperProps: { sx: { maxHeight: 195 } } }}
                                    >
                                        {AREA_TYPES?.map((_area) => (
                                            <MenuItem key={_area.value} value={_area.value}>
                                                {_area.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid> */}
                            <Grid item xs={12}>
                                <Typography
                                    color="textSecondary"
                                    sx={{
                                        mb: 1,
                                    }}
                                    variant="subtitle2"
                                >
                                    Description
                                </Typography>
                                <QuillEditor
                                    onChange={(value) => {
                                        formik.setFieldValue("description", value);
                                    }}
                                    placeholder="Enter Company description"
                                    sx={{ height: 300 }}
                                    value={formik.values.description}
                                    disabled={isDisabled}
                                />
                                {Boolean(
                                    formik.touched.description && formik.errors.description
                                ) && (
                                        <Box sx={{ mt: 2 }}>
                                            <FormHelperText error>
                                                {formik.errors.description}
                                            </FormHelperText>
                                        </Box>
                                    )}
                            </Grid>
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
                        {company && (
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
                            ) : company ? (
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
