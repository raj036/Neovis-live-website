import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
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
import { AREA_TYPES, STATUSES, TASK_TYPES } from "../../../utils/constants";
import { QuillEditor } from "../../quill-editor";
import useAxios from "../../../services/useAxios";
import { ConfirmDialog } from "../confim-dialog";

export const TemplateEditForm = (props) => {
    const router = useRouter();
    const [isDisabled, setIsDisabled] = useState(true);
    const [dialogStat, setDialogStat] = useState(false);
    const [loading, setLoading] = useState();
    // const [selProperty, setSelProprty] = useState();
    // const [selUnittype, setSelUnittype] = useState();
    const [areaChecklists, setAreaChecklist] = useState([])

    const { template } = props;

    const customInstance = useAxios();
    const queryClient = useQueryClient();

    // const { data: properties } = useQuery("allProperty", () =>
    //     customInstance.get(`properties`)
    // );

    const { data: unitareas } = useQuery("allUnitareas", () =>
        customInstance.get(`unit-areas`)
    );
    // console.log('unitareas', unitareas);

    const { mutateAsync: getAreaChecklists, data: checklistData } = useMutation((data) =>
        customInstance.post(`task-checklists/checklist-area`, { area_ids: data.area_ids, area_types: data.area_types, task_type: data.task_type })
    );
    console.log('checklistData', checklistData);


    // const { data: unittypes, refetch: unittypeRefetch } = useQuery(
    //     "unitTypesOnProperty",
    //     () => customInstance.get(`unit-types/property/${selProperty?.id}`),
    //     { enabled: selProperty?.id !== undefined }
    // );

    const { mutateAsync: addTasktemplate } = useMutation((data) =>
        customInstance.post(`task-templates`, data)
    );

    const { mutateAsync: updateTasktemplate } = useMutation((data) => {
        customInstance.patch(`task-templates/${data?.id}`, data);
    });

    const formik = useFormik({
        initialValues: {
            template_name: "",
            template_code: "",
            task_type: "",
            status: "Active",
            area_types: [],
            // unit_area_ids: [],
            task_checklist_ids: [],
        },
        validationSchema: Yup.object({
            task_checklist_ids: Yup.array().required().min(1),
            // unit_area_ids: Yup.array().required().min(1),
            area_types: Yup.array().required().min(1),
            template_code: Yup.string().max(15),
            template_name: Yup.string().max(50),
            task_type: Yup.string().max(50),
            status: Yup.string().max(50),
        }),
        onSubmit: async (values, helpers) => {
            let data = {
                ...values, task_checklist_ids: values.task_checklist_ids.map(item => item.id),
                // unit_area_ids: values.unit_area_ids.map(item => item.id),
                area_types: values.area_types.map(item => item.value)
            }
            console.log('values', values, data);
            try {
                setLoading(true);
                if (template) {
                    console.log('update template', data);
                    delete data.task_checklists;
                    delete data.unit_areas;
                    await updateTasktemplate(data);
                    await queryClient.refetchQueries(
                        ["tasktemplateById", template.id?.toString()],
                        {
                            active: true,
                            exact: true,
                        }
                    );
                    setLoading(false);
                    helpers.setStatus({ success: true });
                    helpers.setSubmitting(false);
                    toast.success("Template updated successfully!");
                } else {
                    await addTasktemplate(data);
                    formik.resetForm();
                    setLoading(false);
                    helpers.setStatus({ success: true });
                    helpers.setSubmitting(false);
                    toast.success("Template added successfully!");
                }
                router.push("/dashboard/templates");
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
            // let data = {...formik.values}
            delete formik.values.task_checklists;
            delete formik.values.unit_areas;
            await updateTasktemplate({ ...formik.values, status: "Delete" });
            toast.success("Task template deleted successfully!");
            router.push("/dashboard/templates");
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

    console.log('formik values checklist', formik.values.task_checklist_ids, 'areaChecklists', areaChecklists);
    // console.log('formik.values.area_types', formik.values.area_types);
    useEffect(() => {
        if (formik.values.area_types.length > 0) {
            (async () => {
                const data = await getAreaChecklists({ area_types: formik.values.area_types.map(item => item.value), task_type: formik.values.task_type })
                console.log('checklist data', data);
                if (data.data && data.data?.data) {
                    setAreaChecklist(data.data.data)
                }
                if (data.data.data.filter(item => item).length === 0) {
                    setAreaChecklist([])
                    formik.setFieldValue(
                        "task_checklist_ids", []
                    );
                }
            })()
        } else {
            setAreaChecklist([])
            formik.setFieldValue(
                "task_checklist_ids", []
            );
        }
    }, [formik.values.area_types, formik.values.task_type, getAreaChecklists])

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
        if (props?.template) {
            console.log('props.template', props.template);
            formik.setValues({
                ...props.template, task_checklist_ids: props.template.task_checklists.length > 0 ? props.template.task_checklists : [],
                area_types: props.template.area_types.length > 0 ? props.template.area_types.map(item => ({ label: item, value: item })) : []
                // unit_area_ids: props.template.unit_areas.length > 0 ? props.template.unit_areas : []
            });
            // setSelProprty(props?.unitarea.property);
            // setSelUnittype(props?.unitarea.unit_type);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.template]);

    return (
        <>
            <form onSubmit={formik.handleSubmit} {...props}>
                <Card>
                    <CardContent>
                        <ConfirmDialog
                            title="Delete confirm?"
                            message=" Are you sure you want to delete task template?"
                            dialogStat={dialogStat}
                            setDialogStat={setDialogStat}
                            onConfirmDialog={onConfirmDialog}
                        />
                        <Grid container spacing={3}>
                            <Grid item md={6} xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="status">Task type *</InputLabel>
                                    <Select
                                        error={Boolean(
                                            formik.touched.task_type && formik.errors.task_type
                                        )}
                                        helperText={formik.touched.task_type && formik.errors.task_type}
                                        label="Task type"
                                        labelId="task_type"
                                        name="task_type"
                                        required
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.task_type}
                                        disabled={isDisabled}
                                    >
                                        {TASK_TYPES?.map((_status) => (
                                            <MenuItem key={_status.value} value={_status.value}>
                                                {_status.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item md={6} xs={12}>
                                <Autocomplete
                                    options={AREA_TYPES ?? []}
                                    getOptionLabel={(option) =>
                                        option.label ? option.label : ""
                                    }
                                    value={formik.values.area_types}
                                    multiple={true}
                                    disabled={false}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            error={Boolean(
                                                formik.touched.area_types && formik.errors.area_types
                                            )}
                                            fullWidth
                                            name="area_types"
                                            helperText={
                                                formik.touched.area_types && formik.errors.area_types &&
                                                'Please select area type'
                                            }
                                            label="Select Area Type"
                                            placeholder="Select Area Type"
                                        />
                                    )}
                                    onChange={(event, newValue) => {
                                        console.log('newValue', newValue);
                                        formik.setFieldValue(
                                            "area_types",
                                            newValue ? newValue : []
                                        );
                                    }}
                                />
                            </Grid>
                            {/* <Grid item md={6} xs={12}>
                                <Autocomplete
                                    options={unitareas?.data?.data ?? []}
                                    getOptionLabel={(option) =>
                                        option.area_name ? option.area_name : ""
                                    }
                                    value={formik.values.unit_area_ids}
                                    multiple={true}
                                    disabled={false}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            error={Boolean(
                                                formik.touched.unit_area_ids && formik.errors.unit_area_ids
                                            )}
                                            fullWidth
                                            name="unit_areas"
                                            helperText={
                                                formik.touched.unit_area_ids && formik.errors.unit_area_ids &&
                                                'Please select unit area'
                                            }
                                            label="Select UnitArea"
                                            placeholder="Select Unit Area"
                                        />
                                    )}
                                    onChange={(event, newValue) => {
                                        console.log('newValue', newValue);
                                        // setSelProprty(newValue)
                                        formik.setFieldValue(
                                            "unit_area_ids",
                                            newValue ? newValue : []
                                        );
                                        // if(newValue.length > 0) {

                                        //     setAreaChecklist(areaChecklists.filter((item) => item.))
                                        // } else {
                                        //     setAreaChecklist([])
                                        // }
                                    }}
                                />
                            </Grid> */}
                            <Grid item md={6} xs={12}>
                                <Autocomplete
                                    options={areaChecklists ?? []}
                                    getOptionLabel={(option) =>
                                        option.checklist_title
                                            ? option.checklist_title
                                            : ""
                                    }
                                    value={formik.values.task_checklist_ids}
                                    multiple={true}
                                    disabled={false}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            error={Boolean(
                                                formik.touched.task_checklist_ids &&
                                                formik.errors.task_checklist_ids
                                            )}
                                            disabled={isDisabled}
                                            fullWidth
                                            // required
                                            helperText={
                                                formik.touched.task_checklist_ids &&
                                                formik.errors.task_checklist_ids
                                            }
                                            label="Select Template checklist"
                                            placeholder="Select Template Checklist"
                                        />
                                    )}
                                    onChange={(event, newValue) => {
                                        console.log('checklist value change', newValue);
                                        // formik.values.task_checklist_ids.includes()
                                        formik.setFieldValue(
                                            "task_checklist_ids", newValue ? newValue : []
                                        );
                                        // setSelUnittype(newValue);
                                        // formik.setFieldValue(
                                        //     "unit_type_id",
                                        //     newValue ? newValue.id : undefined
                                        // );
                                    }}
                                />
                            </Grid>
                            <Grid item md={6} xs={12}>
                                <TextField
                                    error={Boolean(
                                        formik.touched.template_name && formik.errors.template_name
                                    )}
                                    fullWidth
                                    helperText={
                                        formik.touched.template_name && formik.errors.template_name
                                    }
                                    label="Template Name"
                                    name="template_name"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    required
                                    value={formik.values.template_name}
                                    disabled={isDisabled}
                                />
                            </Grid>
                            <Grid item md={6} xs={12}>
                                <TextField
                                    error={Boolean(
                                        formik.touched.template_code && formik.errors.template_code
                                    )}
                                    fullWidth
                                    helperText={
                                        formik.touched.template_code && formik.errors.template_code
                                    }
                                    label="Template Code"
                                    name="template_code"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    required
                                    value={formik.values.template_code}
                                    disabled={isDisabled}
                                />
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
                            <Grid item md={6} xs={12}>
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
                            {/* <Grid item xs={12}>
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
                  placeholder="Enter unit area description"
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
              </Grid> */}
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
                        {template && (
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
                            ) : template ? (
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
