import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import DualListBox from 'react-dual-listbox';
import 'react-dual-listbox/lib/react-dual-listbox.css';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom'
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
import { STATUSES } from "../../../../utils/constants";
import { QuillEditor } from "../../../quill-editor";
import useAxios from "../../../../services/useAxios";
import { ConfirmDialog } from "../../confim-dialog";


export const UnitGroupEditForm = (props) => {
    const router = useRouter();
    const [isDisabled, setIsDisabled] = useState(true);
    const [dialogStat, setDialogStat] = useState(false);
    const [loading, setLoading] = useState();
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [selProperty, setSelProprty] = useState();
    const [allUnits, setAllUnits] = useState([]);
    const [propertyTeams, setPropertyTeams] = useState([])
    const [propertyUsers, setPropertyUsers] = useState([])
    const { unitgroup } = props;

    console.log('propertyTeams', propertyTeams, 'propertyUsers', propertyUsers);

    const customInstance = useAxios();
    const queryClient = useQueryClient();

    const { data: properties } = useQuery("allProperty", () =>
        customInstance.get(`properties`)
    );

    const { data: teamData } = useQuery("allTeams", () =>
        customInstance.get(`team`)
    );

    const { data: units, refetch: unitsRefetch } = useQuery(
        "unitsOnProperty",
        () =>
            customInstance.get(
                `units/unit-group-filtered?property_id=${selProperty?.id}`
            ),
        { enabled: selProperty?.id !== undefined }
    );

    useEffect(() => {
        if (units) {
            if (units?.data && props?.unitgroup?.units) {
                let uniqueUnits = [];
                const UnitSet = new Set();
                units.data.forEach(unit => {
                    UnitSet.add(JSON.stringify(unit));
                })
                props?.unitgroup?.units.forEach(unit => {
                    UnitSet.add(JSON.stringify(unit));
                })
                UnitSet.forEach(unit => uniqueUnits.push(JSON.parse(unit)))
                setAllUnits(uniqueUnits);
            } else {
                setAllUnits(units?.data)
            }
        }
    }, [units, props?.unitgroup?.units]);

    const { data: users } = useQuery("users", () =>
        customInstance.get(`users`)
    );
    const { mutateAsync: addUnitGroup } = useMutation((data) =>
        customInstance.post(`unit-group`, data)
    );

    const { mutateAsync: updateUnitGroup, isSuccess } = useMutation((data) => {
        return customInstance.patch(`unit-group/${unitgroup.id}`, data);
    }, {
    });

    useEffect(() => {
        if (selProperty?.id) {
            unitsRefetch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selProperty, unitsRefetch]);

    useEffect(() => {
        if (users && users?.data && users?.data?.data && selProperty) {
            const propertyusers = users?.data?.data?.map(item => {
                if (item.properties &&
                    Array.isArray(item.properties) && item.properties.length > 0) {
                    const filteredData = []
                    item.properties.forEach(propitem => {
                        if (propitem.id === selProperty?.id) {
                            filteredData.push(item)
                            // console.log('propitem', propitem.id, selProperty?.id);
                        }
                    })
                    return filteredData
                }
            })?.filter(item => item?.length > 0)?.flat()
            // console.log('propertyusersss', propertyusers);
            setPropertyUsers(propertyusers)
        }
    }, [users, selProperty])

    useEffect(() => {
        if (teamData && teamData?.data && teamData?.data?.data && selProperty) {
            const propertyTeams = teamData?.data?.data?.filter(item => item.property_id === selProperty?.id)
            setPropertyTeams(propertyTeams)
        }
    }, [teamData, selProperty])

    function arraysHaveSameValues(arr1, arr2) {
        if (arr1?.length !== arr2?.length) {
            return false;
        }

        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    }

    const formik = useFormik({
        initialValues: {
            name: "",
            code: "",
            description: "",
            units: [],
            employees: [],
            team_ids: [],
            status: "Active",
            property_id: 0,
        },
        validationSchema: Yup.object({
            property_id: Yup.string().required(),
            code: Yup.string().max(15),
            name: Yup.string().max(50),
            description: Yup.string().max(5000),
        }),
        onSubmit: async (values, helpers) => {
            try {
                setLoading(true);
                if (props?.unitgroup !== null) {
                    // var unit_ids = values && values?.units && values?.units?.length > 0 &&
                    //     values?.units?.map((item) => parseInt(item));
                    // unit_ids = unit_ids && unit_ids?.length > 0 &&
                    //     unit_ids?.filter((item) => item !== false);
                    // unit_ids = unit_ids?.reduce((accumulator, value) => {
                    //     if (!accumulator.includes(value)) {
                    //         accumulator.push(value);
                    //     }
                    //     return accumulator;
                    // }, []);

                    const unit_ids = selectedUnits.map(id => id)

                    var employee_ids = values && values?.employees && values?.employees?.length > 0 &&
                        values?.employees?.map((item) => item?.id)
                    var unitgroup = { ...values };

                    var existingEmpIds = props && props?.unitgroup?.employees?.map((item => item?.id));
                    var existingUnitIds = props && props?.unitgroup?.units?.map((item => parseInt(item?.id)));

                    var _data = {
                        code: unitgroup?.code || "",
                        name: unitgroup?.name || "",
                        description: unitgroup?.description || "",
                        property_id: unitgroup?.property?.id || null,
                        status: unitgroup?.status || "",
                        unit_ids: unit_ids,
                        unit_sequence: unit_ids,
                        employee_ids: employee_ids,
                        team_ids: unitgroup?.team_ids.map(item => item?.id)
                    }
                    if (arraysHaveSameValues(unit_ids, existingUnitIds)) {
                        delete _data.unit_ids;
                    }
                    if (arraysHaveSameValues(employee_ids, existingEmpIds)) {
                        delete _data.employee_ids
                    } else {
                    }
                    delete unitgroup.property;
                    await updateUnitGroup(_data);
                    await queryClient.refetchQueries(
                        ["unitgroupById", unitgroup.id?.toString()],
                        {
                            active: true,
                            exact: true,
                        }
                    );
                    setLoading(false);
                    helpers.setStatus({ success: true });
                    helpers.setSubmitting(false);
                    toast.success(
                        unitgroup
                            ? "Unit group updated successfully!"
                            : "Unit group added successfully!"
                    );
                    router.push('/dashboard/properties/unitgroups')

                } else {
                    // var unit_ids = values && values?.units && values?.units?.length > 0 &&
                    //     values?.units?.map((item) => parseInt(item?.id ?? item));
                    // unit_ids = unit_ids && unit_ids?.length > 0 &&
                    //     unit_ids?.filter((item) => item !== false);

                    const unit_ids = selectedUnits?.map(id => id)

                    var employee_ids = values && values?.employees && values?.employees?.length > 0 &&
                        values?.employees?.map((item) => item?.id ?? item)
                    var _data = { ...values, unit_ids: unit_ids, unit_sequence: unit_ids, employee_ids: employee_ids, team_ids: values?.team_ids?.map(item => item?.id) }
                    delete _data["units"];
                    delete _data["employees"];
                    await addUnitGroup(_data);
                    formik.resetForm();
                    setLoading(false);
                    helpers.setStatus({ success: true });
                    helpers.setSubmitting(false);
                    toast.success(
                        unitgroup
                            ? "Unit group updated successfully!"
                            : "Unit group added successfully!"
                    );
                }

            } catch (err) {
                console.error(err);
                const errMsg = err.response.data.message;
                setLoading(false);
                toast.error(errMsg ?? "Something went wrong!");
                helpers.setStatus({ success: false });
                helpers.setErrors({ submit: err.message });
                helpers.setSubmitting(false);
            }
        },
    });


    const onConfirmDialog = async () => {
        try {
            setDialogStat(false);
            var data = { ...formik.values }
            var unit_ids = data && data?.units && data?.units?.length > 0 &&
                data?.units?.map((item) => item?.id)
            var employee_ids = data && data?.employees && data?.employees?.length > 0 &&
                data?.employees?.map((item) => item?.id)
            var _data = {
                code: data?.code || "",
                name: data?.name || "",
                description: data?.description || "",
                property_id: data?.property?.id || null,
                status: data?.status || "",
                unit_ids: unit_ids,
                employee_ids: employee_ids,
                status: "Delete"
            }
            delete data.property;
            await updateUnitGroup(_data);
            toast.success("Unit groups deleted successfully!");
            router.push("/dashboard/properties/unitgroups");
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
        if (props?.unitgroup) {
            formik.setValues({ ...props.unitgroup });
            setSelectedUnits(props.unitgroup.units?.map(unit => unit.id))
            var units = props?.unitgroup?.units || [];
            var sortOrder = props?.unitgroup?.unit_sequence || [];
            if (sortOrder?.length === 0) {
                units = units?.map((item => item?.id));
                formik.setFieldValue("units", units)
            } else {
                var sortedArray = units?.sort((a, b) => {
                    const indexA = sortOrder.findIndex(id => id === a.id);
                    const indexB = sortOrder.findIndex(id => id === b.id);
                    return indexA - indexB;
                });
                sortedArray = sortedArray?.map((item => item?.id?.toString()));
                formik.setFieldValue("units", sortedArray || [])
            }

            setSelProprty(props?.unitgroup.property);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.unitgroup]);

    console.log('units =>', allUnits)

    const _assignEmployee = (value, role) => {
        const selected_employees = formik.values.employees || [];
        if (!props?.isEdit) {
            var employees = selected_employees.concat(value);
            employees = employees?.filter((obj, index) => {
                return (
                    index ===
                    employees.findIndex((item) => {
                        return item["id"] === obj["id"];
                    })
                );
            });
            formik.setFieldValue("employees", employees ? employees : value);
        } else if (role === 'executor') {
            formik.setFieldValue("employees", value)
        }
        else {
            var _selectedEmpLength = selected_employees.filter(item => item?.user_role?.role?.toLowerCase() === role)?.length || 0;
            var _currentEmpLength = value.filter(item => item?.user_role?.role?.toLowerCase() === role)?.length || 0;
            if (_selectedEmpLength <= _currentEmpLength) {
                var employees = [...selected_employees, ...value];
                employees = employees?.filter((obj, index) => {
                    return (
                        index ===
                        employees.findIndex((item) => {
                            return item["id"] === obj["id"];
                        })
                    );
                });
                formik.setFieldValue("employees", employees ? employees : value);
            } else {
                if (value?.length === 0) {
                    var employees = selected_employees.filter((item) => item?.user_role?.role.toLowerCase() !== role);
                    employees = employees?.filter((obj, index) => {
                        return (
                            index ===
                            employees.findIndex((item) => {
                                return item["id"] === obj["id"];
                            })
                        );
                    });
                    formik.setFieldValue("employees", employees ? employees : value);
                } else {
                    const filteredEmployee = selected_employees && selected_employees.filter(item => item?.user_role?.role?.toLowerCase() !== role);
                    var _employee = [...filteredEmployee, ...value];
                    formik.setFieldValue("employees", _employee || []);
                }
            }
        }
    }

    // const handleChangeUnits = (option) => {
    //     let _option = option && option.map((item => item?.toString()));
    //     formik.setFieldValue('units', _option)
    // }

    const handleChangeUnits = (value) => {
        setSelectedUnits(value)
    }

    return (
        <>
            <form onSubmit={formik.handleSubmit} {...props}>
                <Card>
                    <CardContent>
                        <ConfirmDialog
                            title="Delete confirm?"
                            message=" Are you sure you want to delete unitgroup?"
                            dialogStat={dialogStat}
                            setDialogStat={setDialogStat}
                            onConfirmDialog={onConfirmDialog}
                        />
                        <Grid container spacing={3}>
                            <Grid item md={6} xs={12}>
                                <Autocomplete
                                    options={properties?.data?.data ?? []}
                                    getOptionLabel={(option) =>
                                        option.property_name ? option.property_name : ""
                                    }
                                    value={
                                        selProperty
                                            ? properties?.data?.data?.find(
                                                (_) => _.id === selProperty?.id
                                            )
                                            : ""
                                    }
                                    disabled={isDisabled || unitgroup}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            error={Boolean(
                                                formik.touched.property_id && formik.errors.property_id
                                            )}
                                            fullWidth
                                            disabled={isDisabled || unitgroup}
                                            required
                                            helperText={
                                                formik.touched.property_id && formik.errors.property_id
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
                                        formik.setFieldValue('units', [])
                                        formik.setFieldValue('employees', [])

                                    }}
                                />
                            </Grid>

                            <Grid item md={6} xs={12}>
                                <TextField
                                    error={Boolean(
                                        formik.touched.name && formik.errors.name
                                    )}
                                    fullWidth
                                    helperText={
                                        formik.touched.name && formik.errors.name
                                    }
                                    label="Unit Group Name"
                                    name="name"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    required
                                    value={formik.values.name}
                                    disabled={isDisabled}
                                />
                            </Grid>
                            <Grid item md={6} xs={12}>
                                <TextField
                                    error={Boolean(
                                        formik.touched.code && formik.errors.code
                                    )}
                                    fullWidth
                                    helperText={
                                        formik.touched.code && formik.errors.code
                                    }
                                    label="Unit Group Code"
                                    name="code"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    required
                                    value={formik.values.code}
                                    disabled={isDisabled}
                                />
                            </Grid>

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
                                    placeholder="Enter Unit group description"
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
                <Card style={{ marginTop: "10px" }}>
                    <CardContent>
                        <Grid container spacing={3}>
                            <Grid item md={12} xs={12}>
                                <DualListBox
                                    showHeaderLabels
                                    options={allUnits && allUnits.sort((a, b) => a?.unit_type?.unit_type_name - b?.unit_type?.unit_type_name).map((item) => {
                                        return {
                                            value: item?.id,
                                            key: item?.id,
                                            label: `${item?.unit_name}(${item?.unit_type?.unit_type_name})`,
                                        }
                                    }) || []}
                                    style={{
                                        option: { color: '#000', fontWeight: 'bold' },
                                    }}
                                    label={{
                                        available: 'Available Units',
                                        selected: 'Selected Unit'
                                    }}
                                    lang={{
                                        availableFilterHeader: 'Filter available',
                                        availableHeader: 'Available Units',
                                        filterPlaceholder: 'Search...',
                                        moveAllLeft: 'Move all to available',
                                        moveAllRight: 'Move all to selected',
                                        moveLeft: 'Move to available',
                                        moveRight: 'Move to selected',
                                        moveBottom: 'Rearrange to bottom',
                                        moveDown: 'Rearrange down',
                                        moveUp: 'Rearrange up',
                                        moveTop: 'Rearrange to top',
                                        noAvailableOptions: 'No available options',
                                        noSelectedOptions: 'No selected options',
                                        requiredError: 'Please select at least one option.',
                                        selectedFilterHeader: 'Filter selected',
                                        selectedHeader: 'Selected Units'
                                    }}
                                    selected={selectedUnits}
                                    showOrderButtons
                                    preserveSelectOrder
                                    onChange={handleChangeUnits}
                                    icons={{
                                        moveLeft: <ArrowBackIcon key={"ml"} onChange={handleChangeUnits} />,
                                        moveAllLeft: [
                                            <ArrowBackIcon key={"ml1"} onChange={handleChangeUnits} />,
                                            <ArrowBackIcon key={"ml2"} onChange={handleChangeUnits} />,
                                        ],
                                        moveRight: <ArrowForwardIcon key={"mr"} onChange={handleChangeUnits} />,
                                        moveAllRight: [
                                            <ArrowForwardIcon key={"mr1"} onChange={handleChangeUnits} />,
                                            <ArrowForwardIcon key={"mr2"} onChange={handleChangeUnits} />
                                        ],
                                        moveTop: <KeyboardArrowUpIcon key={"mt"} onChange={handleChangeUnits} />,
                                        moveUp: <VerticalAlignTopIcon key={"mup"} onChange={handleChangeUnits} />,
                                        moveDown: <VerticalAlignBottomIcon key={"md"} onChange={handleChangeUnits} />,
                                        moveBottom: <KeyboardArrowDownIcon key={"mb"} onChange={handleChangeUnits} />,
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                <Card style={{ marginTop: "10px" }}>
                    <CardContent>
                        <Grid container spacing={1}>
                            <Grid item md={4} xs={12}>
                                <Autocomplete
                                    multiple
                                    options={propertyTeams || []}
                                    value={formik.values.team_ids || []}
                                    id="teams"
                                    name="team_ids"
                                    getOptionLabel={(option) => `${option?.team_name}`}
                                    onChange={(event, value) => formik.setFieldValue('team_ids', value)}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Select Teams" />
                                    )}
                                />
                            </Grid>
                            <Grid item md={4} xs={12}>
                                <Autocomplete
                                    multiple
                                    options={propertyUsers.filter(
                                        (item) => item?.user_role?.role.toLowerCase() === "executor" || item?.user_role?.role.toLowerCase() === "manager" || item?.user_role?.role.toLowerCase() === "owner"
                                    ) || []}
                                    value={formik.values.employees?.filter(
                                        (item) => item?.user_role?.role.toLowerCase() === "executor" || item?.user_role?.role.toLowerCase() === "manager" || item?.user_role?.role.toLowerCase() === "owner"
                                    ) || []}
                                    id="executor"
                                    name="executor"
                                    getOptionLabel={(option) => `${option?.first_name} ${option?.last_name}`}
                                    onChange={(event, value) => {
                                        console.log('selected value', value)
                                        _assignEmployee(value, "executor")
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Select Executors" />
                                    )}
                                />
                            </Grid>
                            <Grid item md={4} xs={12}>
                                <Autocomplete
                                    multiple
                                    options={propertyUsers.filter(
                                        (item) => item?.user_role?.role.toLowerCase() === "inspector"
                                    ) || []}
                                    id="inspector"
                                    name="employees"
                                    getOptionLabel={(option) => `${option?.first_name} ${option?.last_name}`}
                                    value={formik.values.employees?.filter(
                                        (item) => item?.user_role?.role.toLowerCase() === "inspector"
                                    ) || []}
                                    onChange={(event, value) => _assignEmployee(value, "inspector")}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Select Inspectors" />
                                    )}
                                />
                            </Grid>
                            <Grid item md={4} xs={12}>
                                <Autocomplete
                                    multiple
                                    options={propertyUsers.filter(
                                        (item) => item?.user_role?.role.toLowerCase() === "vendor"
                                    ) || []}
                                    id="vendor"
                                    name="employees"
                                    getOptionLabel={(option) => `${option?.first_name} ${option?.last_name}`}
                                    value={formik.values.employees?.filter(
                                        (item) => item?.user_role?.role.toLowerCase() === "vendor"
                                    ) || []}
                                    onChange={(event, value) => _assignEmployee(value, "vendor")}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Select Vendor" />
                                    )}
                                />
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
                        {unitgroup && (
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
                            ) : unitgroup ? (
                                "Update"
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </Box>
                )}
            </form >
        </>
    );
};