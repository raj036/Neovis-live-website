import { useEffect, useState } from "react";
import {
    Autocomplete,
    Box,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,

} from "@mui/material";
import * as dayjs from "dayjs"
import toast from "react-hot-toast";
import * as Yup from "yup";
import useAxios from "../../../../services/useAxios";
import { useFormik } from "formik";
import { DatePicker } from '@mui/x-date-pickers';
import { useMutation, useQuery, useQueries } from "react-query";
import { ConfirmDialog } from "../../confim-dialog";
import { useRouter } from "next/router";
import { LoadingButton } from "@mui/lab";

const TaskPlanningEditForm = (props) => {
    const customInstance = useAxios();
    const router = useRouter();

    const { dialogStat, setDialogStat, execute, plannById, setIsApiActive } = props;
    const [isDisabled, setIsDisabled] = useState(true)
    const [selProperty, setSelProprty] = useState(undefined);
    const [selUnitGroup, setSelUnitGroup] = useState([])
    const [action, setAction] = useState("save");
    const [selUnitType, setSelUnitType] = useState([])
    const [unitsApiData, setUnitsApiData] = useState([]);
    const [unitOptions, setUnitOptions] = useState();
    const [units, setUnits] = useState([])
    const [selectedUnits, setSelectedUnits] = useState([])
    const [filteredConfigs, setFilteredConfigs] = useState();

    const { data: properties } = useQuery("allProperty", () =>
        customInstance.get(`properties`)
    );
    const { data: unittypes, refetch: unittypeRefetch } = useQuery(
        "unitTypesOnProperty",
        () => customInstance.get(`unit-types/property/${selProperty?.id}`),
        { enabled: selProperty?.id !== undefined }
    );

    const { data: unitgroups, refetch: unitGroupRefetch } = useQuery(
        "unitsGroups",
        () => customInstance.get(`properties/${selProperty?.id}`),
        { enabled: selProperty?.id !== undefined }
    );

    // const { data: units, refetch: unitsRefetch } = useQuery(
    //     "units",
    //     () => customInstance.get(`unit-group/${selUnitGroup[0]?.id}`),
    //     { enabled: selUnitGroup?.id !== undefined }
    // );

    const unitData = useQueries(
        selUnitGroup.map(ug => {
            return {
                queryKey: ['units', ug.id],
                queryFn: () => customInstance.get(`unit-group/${ug.id}`),
                enabled: selUnitGroup.length > 0,
                onSuccess: (data) => setUnitsApiData((prevData) => [...prevData, data])
            }
        })
    );

    const { mutateAsync: getFilteredTaskConfigs } = useMutation((data) =>
        customInstance.post(`task-rule/tsak-rule-filter`, data)
    );

    const { mutateAsync: addTaskPlanning } = useMutation((data) =>
        customInstance.post(`task-planning/create-task-plan`, data)
    );

    const { mutateAsync: executeTaskPlanning, isLoading: loadingExecute } = useMutation((data) =>
        customInstance.post(`task-planning/execute-plan`, data)
    );

    const { mutateAsync: updateTaskPlanning, isLoading: loadingEdit } = useMutation((data) =>
        customInstance.patch(`task-planning/${plannById?.id}`, data)
    );

    useEffect(() => {
        if (unitsApiData?.every(api => api.status === 200)) {
            const data = new Set();
            unitsApiData?.forEach(u =>
                u?.data?.units?.forEach(unitObj =>
                    data.add(JSON.stringify(unitObj))
                )
            );
            let _unitData = [];
            for (const item of data) {
                _unitData.push(JSON.parse(item));
            }
            setUnits(_unitData);
        }
    }, [unitsApiData]);

    const formik = useFormik({
        initialValues: {
            property_id: null,
            unit_types: [],
            unit_groups: [],
            units: [],
            task_configs: [],
            start_date: null,
            end_date: null,
        },
        validationSchema: Yup.object({
            property_id: Yup.string().required(),
            unit_types: Yup.array().required().min(1),
            unit_groups: Yup.array().required().min(1),
            units: Yup.array().required().min(1),
            task_configs: Yup.array().required().min(1),
            start_date: Yup.string().required(),
            end_date: Yup.string().required()
        }),
        onSubmit: async (values, helpers) => {
            let data = { ...values };
            try {
                if (plannById) {
                    let createPlanning = getPayloadData(data, action === "save" ? "Created" : "Executed", plannById.id)
                    if (action === "save") {
                        await updateTaskPlanning(createPlanning)
                    } else {
                        await executeTaskPlanning(createPlanning)
                    }
                    toast.success(`Plan has been ${action === "save" ? "updated" : "executed"}`);
                    formik.resetForm()
                } else {
                    let createPlanning = getPayloadData(data, action === "save" ? "Created" : "Executed")
                    if (action === "save") {
                        await addTaskPlanning(createPlanning)
                    } else {
                        await executeTaskPlanning(createPlanning)
                    }
                    toast.success(`Plan has been ${action === "save" ? "saved" : "executed"}`);
                    formik.resetForm()
                }
                router.push("/dashboard/planning/task-planning")
            } catch (err) {
                console.error(err);
                toast.error(`${err?.response?.data?.message ?? "Something went wrong!"}`);
                helpers.setStatus({ success: false });
                helpers.setErrors({ submit: err.message });
                helpers.setSubmitting(false);
            }
        },
    });

    const onConfirmDialog = async () => {
        let data = { ...formik.values };
        let executePlanningData = getPayloadData(data, 'Executed', plannById.id);
        try {
            setDialogStat(false);
            setIsApiActive(true);
            await executeTaskPlanning(executePlanningData);
            setIsApiActive(false);
            toast.success(`Planning ${execute ? "Executed" : "Rejected"} successfully!`);
            router.push("/dashboard/planning/task-planning");
        } catch (err) {
            console.log(err)
            setDialogStat(false);
            setIsApiActive(false);
            toast.error(`${err?.response?.data?.message ?? "Something went wrong!"}`);
        }
    };

    const getPayloadData = (data, status, id) => {
        const payload = {
            property_id: data.property_id,
            end_date: dayjs(data.end_date).format("YYYY-MM-DD"),
            start_date: dayjs(data.start_date).format("YYYY-MM-DD"),
            unit_group_ids: data?.unit_groups.map((d) => d.id),
            unit_ids: data?.units.map((d) => d.id),
            unit_type_ids: data?.unit_types.map((d) => d.id),
            task_config_ids: data?.task_configs.map((d) => d.id),
            status: status
        };

        if (status === 'save' && id) {
            payload['planning_id'] = id;
        };

        return payload;
    }

    useEffect(() => {
        if (plannById) {
            setSelProprty(plannById?.property);
            formik.setFieldValue("property_id", plannById?.property_id)
            formik.setFieldValue("unit_types", plannById?.unit_types)
            formik.setFieldValue("unit_groups", plannById?.unit_groups)
            formik.setFieldValue("units", plannById?.units)
            formik.setFieldValue("task_configs", plannById?.task_configs)
            formik.setFieldValue("start_date", plannById?.start_date)
            formik.setFieldValue("end_date", plannById?.end_date)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [plannById])

    useEffect(async () => {
        if (formik.values.property_id && formik.values.units.length > 0) {
            const configData = await getFilteredTaskConfigs({
                property_id: formik.values.property_id,
                unit_ids: formik.values.units.map(u => u.id)
            })
            setFilteredConfigs(configData?.data)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selProperty, selectedUnits]);

    useEffect(() => {
        if (units) {
            let data = [{
                unit_name: "All",
                id: 0
            },
            ...units];
            setUnitOptions(data);
        }
    }, [units])

    useEffect(() => {
        if (selProperty?.id) {
            unitGroupRefetch();
        }
        if (selProperty?.id) {
            unittypeRefetch()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selProperty, unitGroupRefetch, selUnitGroup, unittypeRefetch]);

    useEffect(() => {
        if (props) {
            if (props?.isEdit) {
                setIsDisabled(false);
            }
            if (props?.unit?.id !== undefined) {
                setUnitId(props?.unit?.id);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props]);


    return (

        <Box sx={{ mb: 4, mt: 4 }}>
            <Grid
                spacing={3}
            >
                <Grid item md={10} mt={4} >
                    <form onSubmit={formik.handleSubmit} >
                        <Card>
                            <CardContent>
                                <ConfirmDialog
                                    title={execute ? "Execute Confirm" : "Reject Confirm"}
                                    message={`Are you sure you want to ${execute ? "execute" : "reject"} this planning ? `}
                                    dialogStat={dialogStat}
                                    setDialogStat={setDialogStat}
                                    onConfirmDialog={onConfirmDialog}
                                />
                                <Grid container spacing={4}>
                                    <Grid item md={4} xs={12}>
                                        <Typography variant="h6">Task planning details</Typography>
                                    </Grid>
                                    <Grid item md={8} xs={12}>
                                        <Box>
                                            <Autocomplete
                                                options={properties?.data?.data ?? []}
                                                getOptionLabel={(option) =>
                                                    option.property_name ? option.property_name : ""
                                                }
                                                disabled={plannById ? true : false}
                                                value={
                                                    selProperty
                                                        ? properties?.data?.data?.find(
                                                            (_) => _.id === selProperty?.id
                                                        )
                                                        : ""
                                                }
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        error={Boolean(
                                                            formik.touched.property_id && formik.errors.property_id
                                                        )}
                                                        fullWidth
                                                        name="property_id"
                                                        id="property_id"
                                                        onBlur={formik.onBlur}
                                                        helperText={
                                                            formik.touched.property_id && formik.errors.property_id &&
                                                            'Please select proprty'
                                                        }
                                                        label="Select Property"
                                                        placeholder="Select Property"
                                                    />
                                                )}
                                                onChange={(event, newValue) => {
                                                    setSelProprty(newValue);
                                                    formik.setFieldValue(
                                                        "property_id",
                                                        newValue ? newValue.id : undefined
                                                    );
                                                    formik.setFieldValue(
                                                        "unit_types", []
                                                    );
                                                    formik.setFieldValue(
                                                        "unit_groups", []
                                                    );
                                                    formik.setFieldValue(
                                                        "units", []
                                                    );
                                                    formik.setFieldValue(
                                                        "start_date", null
                                                    );
                                                    formik.setFieldValue(
                                                        "end_date", null
                                                    );
                                                    formik.setFieldValue(
                                                        "task_configs", []
                                                    );
                                                }}
                                            />

                                        </Box>

                                        <Box mt={3}>
                                            <Autocomplete
                                                options={unittypes?.data ?? []}
                                                getOptionLabel={(option) =>
                                                    option.unit_type_name ? option.unit_type_name : ""
                                                }
                                                value={formik.values.unit_types}
                                                multiple={true}
                                                disabled={plannById ? true : false}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        error={Boolean(
                                                            formik.touched.unit_types && formik.errors.unit_types
                                                        )}
                                                        fullWidth
                                                        name="unit_types"
                                                        helperText={
                                                            formik.touched.unit_types && formik.errors.unit_types &&
                                                            'Please select unit type'
                                                        }
                                                        label="Select UnitType"
                                                        placeholder="Select Unit Type"

                                                    />
                                                )}
                                                onChange={(event, newValue) => {
                                                    console.log('plan newValue', formik.values.unit_types, newValue);
                                                    setSelUnitType(newValue);
                                                    formik.setFieldValue(
                                                        "unit_types",
                                                        newValue ? newValue : []
                                                    );
                                                    formik.setFieldValue(
                                                        "unit_groups", []
                                                    );
                                                    formik.setFieldValue(
                                                        "units", []
                                                    );
                                                    formik.setFieldValue(
                                                        "start_date", null
                                                    );
                                                    formik.setFieldValue(
                                                        "end_date", null
                                                    );
                                                    formik.setFieldValue(
                                                        "task_configs", []
                                                    );
                                                }}
                                            />
                                        </Box>

                                        <Box mt={3}>
                                            <Autocomplete
                                                options={unitgroups?.data?.unit_groups ?? []}
                                                getOptionLabel={(option) =>
                                                    option.name ? option.name : ""
                                                }
                                                multiple={true}
                                                value={formik.values.unit_groups}
                                                disabled={plannById ? true : false}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        error={Boolean(
                                                            formik.touched.unit_groups && formik.errors.unit_groups
                                                        )}
                                                        fullWidth
                                                        name="unit_groups"
                                                        helperText={
                                                            formik.touched.unit_groups && formik.errors.unit_groups &&
                                                            'Please select unit group'
                                                        }
                                                        label="Select Unitgroup"
                                                        placeholder="Select Unitgroup"
                                                    />
                                                )}
                                                onChange={(event, newValue) => {
                                                    setSelUnitGroup(newValue);
                                                    formik.setFieldValue(
                                                        "unit_groups",
                                                        newValue ? newValue : []
                                                    );
                                                    formik.setFieldValue(
                                                        "units", []
                                                    );
                                                    formik.setFieldValue(
                                                        "start_date", null
                                                    );
                                                    formik.setFieldValue(
                                                        "end_date", null
                                                    );
                                                    formik.setFieldValue(
                                                        "task_configs", []
                                                    );

                                                }}
                                            />
                                        </Box>

                                        <Box mt={3}>
                                            <Autocomplete
                                                options={unitOptions ?? []}
                                                getOptionLabel={(option) =>
                                                    option.unit_name ? option.unit_name : ""
                                                }
                                                disabled={plannById ? true : false}
                                                multiple={true}
                                                value={formik.values.units}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        error={Boolean(
                                                            formik.touched.units && formik.errors.units
                                                        )}
                                                        fullWidth
                                                        name="units"
                                                        helperText={
                                                            formik.touched.units && formik.errors.units &&
                                                            'Please select units'
                                                        }
                                                        label="Select Unit"
                                                        placeholder="Select Unit"
                                                    />
                                                )}
                                                onChange={(event, newValue) => {
                                                    if (newValue[newValue.length - 1]?.id === 0) {
                                                        setSelectedUnits([...units]);
                                                        formik.setFieldValue(
                                                            "units",
                                                            [...units]
                                                        );
                                                    } else {
                                                        setSelectedUnits(newValue);
                                                        formik.setFieldValue(
                                                            "units",
                                                            newValue ? newValue : []
                                                        );
                                                    }
                                                    setFilteredConfigs();
                                                    formik.setFieldValue(
                                                        "task_configs", []
                                                    );
                                                }}
                                            />
                                        </Box>

                                        <Box mt={3}>
                                            <Autocomplete
                                                options={filteredConfigs ?? []}
                                                getOptionLabel={(option) =>
                                                    option.name ? option.name : ""
                                                }
                                                disabled={plannById ? true : false}
                                                multiple={true}
                                                value={formik.values.task_configs}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        error={Boolean(
                                                            formik.touched.task_configs && formik.errors.task_configs
                                                        )}
                                                        fullWidth
                                                        name="units"
                                                        helperText={
                                                            formik.touched.task_configs && formik.errors.task_configs &&
                                                            'Please select Config'
                                                        }
                                                        label="Select Config"
                                                        placeholder="Select Config"
                                                    />
                                                )}
                                                onChange={(event, newValue) => {
                                                    formik.setFieldValue(
                                                        "task_configs",
                                                        newValue ? newValue : undefined
                                                    );

                                                }}
                                            />
                                        </Box>

                                        <Box mt={3}>
                                            <DatePicker
                                                onChange={(newDate) => {
                                                    let start_date = dayjs(newDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
                                                    formik.setFieldValue(
                                                        "start_date",
                                                        start_date ? start_date : undefined
                                                    );
                                                }}
                                                disabled={isDisabled}
                                                value={formik.values.start_date}
                                                label="Start date"
                                                renderInput={(inputProps) => (
                                                    <TextField
                                                        error={Boolean(
                                                            formik.touched.start_date && formik.errors.start_date
                                                        )}
                                                        fullWidth
                                                        name="start_date"
                                                        onBlur={formik.onBlur}
                                                        helperText={
                                                            formik.touched.start_date && formik.errors.start_date &&
                                                            'Please select start date.'
                                                        }
                                                        sx={{ borderColor: '#d14343 !important' }}
                                                        // style={{ height: "35px !important", borderColor: '#d14343 !important' }}
                                                        {...inputProps} />
                                                )}
                                            />
                                        </Box>
                                        <Box mt={3}>
                                            <DatePicker
                                                onChange={(newDate) => {
                                                    let end_date = dayjs(newDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
                                                    formik.setFieldValue(
                                                        "end_date",
                                                        end_date ? end_date : undefined
                                                    );
                                                }}
                                                disabled={isDisabled}
                                                value={formik.values.end_date}
                                                label="End date"
                                                placeholder="End Date"
                                                className="datePicker"
                                                renderInput={(inputProps) => (
                                                    <TextField
                                                        error={
                                                            formik.touched.end_date && formik.errors.end_date
                                                        }
                                                        // sx={{
                                                        //     // '& .MuiOutlinedInput-notchedOutline': {
                                                        //     //     borderColor: '#d14343',
                                                        //     //     '&:hover': {
                                                        //     //         borderColor: '#d14343'
                                                        //     //     }
                                                        //     // },
                                                        //     '& .MuiInputBase-root .MuiOutlinedInput-root': {
                                                        //         borderColor: '#d14343',
                                                        //         '&:hover': {
                                                        //             borderColor: '#d14343 !important'
                                                        //         }
                                                        //     }
                                                        // }}
                                                        fullWidth
                                                        name="end_date"
                                                        onBlur={formik.onBlur}
                                                        helperText={
                                                            formik.touched.end_date && formik.errors.end_date && "Please select end date."
                                                        }
                                                        style={{ height: "35px !important" }}
                                                        {...inputProps} />
                                                )}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                        <Box mt={2} sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "space-between",
                            mx: -1,
                            mb: -1,
                            mt: 3,
                        }}>
                            <LoadingButton
                                loading={loadingEdit}
                                sx={{ m: 1, ml: "auto", minWidth: "100px" }}
                                type="submit"
                                size="medium"
                                variant="contained"
                                onClick={() => setAction("save")}
                            >
                                Save
                            </LoadingButton>
                            <LoadingButton
                                loading={loadingExecute}
                                loadingPosition="start"
                                sx={{ m: 1, width: `${loadingExecute ? '180px' : '145px'}` }}
                                type="submit"
                                variant="contained"
                                onClick={() => setAction("save&execute")}
                            >
                                Save & Execute
                            </LoadingButton>
                        </Box>
                    </form>
                </Grid>
            </Grid>
        </Box>
    )
}

export default TaskPlanningEditForm;