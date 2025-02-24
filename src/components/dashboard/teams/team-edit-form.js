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
import { STATUSES } from "../../../utils/constants";
import { QuillEditor } from "../../quill-editor";
import useAxios from "../../../services/useAxios";
import { ConfirmDialog } from "../confim-dialog";


export const TeamEditForm = (props) => {
    const router = useRouter();
    const [isDisabled, setIsDisabled] = useState(true);
    const [dialogStat, setDialogStat] = useState(false);
    const [loading, setLoading] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selProperty, setSelProprty] = useState();
    const [allUsers, setAllUsers] = useState([]);
    const { Team } = props;

    const customInstance = useAxios();
    const queryClient = useQueryClient();

    const { data: properties } = useQuery("allProperty", () =>
        customInstance.get(`properties`)
    );

    // const { data: users } = useQuery("users", () =>
    //     customInstance.get(`users`)
    // );

    const { mutateAsync: findPropertyUsers, isLoading: findPropertyUsersLoading, data: findPropertyUsersData } = useMutation((data) =>
        customInstance.post(`properties/get-property-users`, data))


    useEffect(() => {
        if (findPropertyUsersData) {
            // if (findPropertyUsersData !== undefined && props?.Team?.team_members.length > 0) {
            //     console.log('team members', props?.Team?.team_members);
            // } else {
            // }
            setAllUsers(findPropertyUsersData?.data?.data[0]?.users)
        }
    }, [findPropertyUsersData]);

    const { mutateAsync: addTeam } = useMutation((data) =>
        customInstance.post(`team`, data)
    );

    const { mutateAsync: updateTeam, isSuccess } = useMutation((data) => {
        return customInstance.patch(`team/${Team.id}`, data);
    });

    const { mutateAsync: deleteTeam } = useMutation(() =>
        customInstance.delete(`team/${Team.id}`, { enabled: Team?.id !== undefined })
    );


    useEffect(() => {
        if (selProperty?.id) {
            console.log('selProperty', selProperty);
            // unitsRefetch();
            (async () => {
                await findPropertyUsers({ property_ids: [selProperty?.id] })
            })()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selProperty]);

    const formik = useFormik({
        initialValues: {
            team_name: "",
            team_code: "",
            description: "",
            team_leader_id: 0,
            property_id: 0,
            team_members: []
        },
        validationSchema: Yup.object({
            property_id: Yup.string().required(),
            team_leader_id: Yup.string().required(),
            team_code: Yup.string().max(15),
            team_name: Yup.string().max(50),
            description: Yup.string().max(5000),
            team_members: Yup.array().min(1)
        }),
        onSubmit: async (values, helpers) => {
            try {
                setLoading(true);
                if (props?.Team !== undefined && props?.Team !== null) {
                    console.log('props?.Team', props?.Team);

                    var data = { ...values }

                    delete data?.property;
                    delete data?.team_leader;
                    delete data?.unit_groups;
                    console.log('members', data.team_members, 'leader', data.team_leader_id)
                    if (Array.isArray(data.team_members) && data.team_members.length > 0 && !data.team_members.includes(data.team_leader_id)) {
                        toast.error("Please select a team leader");
                        setLoading(false);
                        return
                    }
                    await updateTeam(data);
                    await queryClient.refetchQueries(
                        ["teamById", Team.id?.toString()],
                        {
                            active: true,
                            exact: true,
                        }
                    );
                    setLoading(false);
                    helpers.setStatus({ success: true });
                    helpers.setSubmitting(false);
                    toast.success(
                        Team
                            ? "Team updated successfully!"
                            : "Team added successfully!"
                    );
                    router.push('/dashboard/teams')

                } else {
                    // console.log('formik values', values);
                    await addTeam(values);
                    formik.resetForm();
                    setLoading(false);
                    helpers.setStatus({ success: true });
                    helpers.setSubmitting(false);
                    toast.success(
                        Team
                            ? "Team updated successfully!"
                            : "Team added successfully!"
                    );
                    router.back()
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
            await deleteTeam();
            toast.success("Team deleted successfully!");
            setDialogStat(false);
            router.push("/dashboard/teams");
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
        if (props?.Team) {
            formik.setValues({
                ...props.Team, property_id: props.Team.property_id, team_leader_id: props.Team.team_leader_id, team_members: props.Team.team_members?.map(user => user.id)
            });
            setSelectedUsers(props.Team.team_members?.map(user => user.id))
            setSelectedUserList(props.Team.team_members)
            setSelProprty(props?.Team.property);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.Team]);

    const handleChangeUsers = (value) => {
        // console.log('team leader', props?.Team?.team_leader_id, 'value', value);
        if (props?.Team?.team_leader_id && Array.isArray(value) && !value.includes(props?.Team?.team_leader_id)) {
            toast.error("Team leader has been removed from selected members. Please select another leader");
        }
        setSelectedUsers(value)
        formik.setFieldValue('team_members', value)
    }
    // console.log('selectedUserList', selectedUserList, 'selectedUsers', selectedUsers, 'allUsers', allUsers);
    const [selectedUserList, setSelectedUserList] = useState([])
    useEffect(() => {
        if (allUsers.length > 0 && selectedUsers.length > 0) {
            const usersForLeader = allUsers.filter(item => selectedUsers.includes(item.id))
            setSelectedUserList(usersForLeader)
        } else {
            setSelectedUserList([])
        }
    }, [selectedUsers, allUsers])

    return (
        <>
            <form onSubmit={formik.handleSubmit} {...props}>
                <Card>
                    <CardContent>
                        <ConfirmDialog
                            title="Delete confirm?"
                            message=" Are you sure you want to delete Team?"
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
                                    disabled={isDisabled || Team}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            error={Boolean(
                                                formik.touched.property_id && formik.errors.property_id
                                            )}
                                            fullWidth
                                            disabled={isDisabled || Team}
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
                                        formik.setFieldValue('team_members', [])
                                        setSelectedUserList([])
                                        setAllUsers([])
                                    }}
                                />
                            </Grid>

                            <Grid item md={6} xs={12}>
                                <TextField
                                    error={Boolean(
                                        formik.touched.team_name && formik.errors.team_name
                                    )}
                                    fullWidth
                                    helperText={
                                        formik.touched.team_name && formik.errors.team_name
                                    }
                                    label="Team Name"
                                    name="team_name"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    required
                                    value={formik.values.team_name}
                                    disabled={isDisabled}
                                />
                            </Grid>
                            <Grid item md={6} xs={12}>
                                <TextField
                                    error={Boolean(
                                        formik.touched.team_code && formik.errors.team_code
                                    )}
                                    fullWidth
                                    helperText={
                                        formik.touched.team_code && formik.errors.team_code
                                    }
                                    label="Team code"
                                    name="team_code"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    required
                                    value={formik.values.team_code}
                                    disabled={isDisabled}
                                />
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
                                    options={allUsers.length > 0 && allUsers.filter(item => item.user_role?.role === 'Executor' || item.user_role?.role === 'Vendor').map((item) => {
                                        return {
                                            value: item?.id,
                                            key: item?.id,
                                            label: `${item?.first_name}(${item?.last_name})`,
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
                                        availableHeader: 'Available Users',
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
                                        selectedHeader: 'Selected Users'
                                    }}
                                    selected={selectedUsers}
                                    showOrderButtons
                                    preserveSelectOrder
                                    onChange={handleChangeUsers}
                                    icons={{
                                        moveLeft: <ArrowBackIcon key={"ml"} onChange={handleChangeUsers} />,
                                        moveAllLeft: [
                                            <ArrowBackIcon key={"ml1"} onChange={handleChangeUsers} />,
                                            <ArrowBackIcon key={"ml2"} onChange={handleChangeUsers} />,
                                        ],
                                        moveRight: <ArrowForwardIcon key={"mr"} onChange={handleChangeUsers} />,
                                        moveAllRight: [
                                            <ArrowForwardIcon key={"mr1"} onChange={handleChangeUsers} />,
                                            <ArrowForwardIcon key={"mr2"} onChange={handleChangeUsers} />
                                        ],
                                        moveTop: <KeyboardArrowUpIcon key={"mt"} onChange={handleChangeUsers} />,
                                        moveUp: <VerticalAlignTopIcon key={"mup"} onChange={handleChangeUsers} />,
                                        moveDown: <VerticalAlignBottomIcon key={"md"} onChange={handleChangeUsers} />,
                                        moveBottom: <KeyboardArrowDownIcon key={"mb"} onChange={handleChangeUsers} />,
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
                                    // multiple
                                    options={selectedUserList}
                                    value={selectedUserList.length > 0 && formik.values.team_leader_id ? selectedUserList.find((item) => item.id === formik.values.team_leader_id) : null}
                                    id="Team leader"
                                    name="team_leader_id"
                                    getOptionLabel={(option) => `${option?.first_name} ${option?.last_name}`}
                                    onChange={(event, value) => {
                                        if (value) {
                                            formik.setFieldValue('team_leader_id', value.id)
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Select Team Leader" />
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
                        {Team && (
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
                            ) : Team ? (
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