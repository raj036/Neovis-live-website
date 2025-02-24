import { useEffect, useState } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../../components/dashboard/dashboard-layout";
import { gtm } from "../../../../../lib/gtm";
import { PencilAlt as PencilAltIcon } from "../../../../../icons/pencil-alt";
import { useRouter } from "next/router";
import useAxios from "../../../../../services/useAxios";
import { BackButton } from "../../../../../components/dashboard/back-button";
import { SeverityPill } from "../../../../../components/severity-pill";
import TaskPlanningEditForm from "../../../../../components/dashboard/task/task-planning/taskplanning-edit-from";
import { LoadingButton } from "@mui/lab";

const TaskPlanningCreate = () => {
    const router = useRouter();
    const customInstance = useAxios();

    const [isEdit, setIsEdit] = useState(false);
    const [taskPlanningId, setTaskPlanningId] = useState();
    const [mode, setMode] = useState("add")
    const [dialogStat, setDialogStat] = useState(false);
    const [execute, setExecute] = useState(false)
    const [isApiActive, setIsApiActive] = useState(false);

    const { data, isLoading, isFetching } = useQuery(
        ["planningById", taskPlanningId],
        () => customInstance.get(`task-planning/${taskPlanningId}`),
        { enabled: taskPlanningId !== undefined && mode !== "add" }
    );

    useEffect(() => {
        gtm.push({ event: "page_view" });
    }, []);

    useEffect(() => {
        if (router) {
            if (router.query.type === "edit") {
                setMode("edit");
            } else if (router.query.type === "detail") {
                setMode("detail");
            }
            if (router.query) {
                setTaskPlanningId(router?.query?.taskPlanningId)
            }
            if (router.query.type === "add" || router.query.type === "edit") {
                setIsEdit(true);
            }
        }
    }, [router])

    return (
        <AuthGuard>
            <DashboardLayout >
                <Head>
                    <title>Dashboard: Create Task Planning</title>
                </Head>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        py: 5,
                    }}
                >
                    <Container maxWidth="md">
                        <div>
                            <BackButton
                                path={`/dashboard/planning/task-planning`}
                                as="/dashboard/planning/task-planning"
                                title="Task Planning"
                            />
                        </div>

                        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="h4"> {`${mode === "add" ? "Create new" : mode === "edit" ? "Edit" : "View"} Planning`}</Typography>
                            {mode === "edit" && <Box>
                                <Button 
                                    variant="contained" 
                                    sx={{ m: 1 }} 
                                    onClick={() => { 
                                        setDialogStat(true); 
                                        setExecute(false) }
                                    }>
                                        Reject 
                                </Button>
                                <LoadingButton
                                    loading={isApiActive}
                                    loadingPosition="start"
                                    variant="contained" 
                                    sx={{ m: 1, width: isApiActive ? '125px' : '95px' }} 
                                    onClick={() => { 
                                        setDialogStat(true); 
                                        setExecute(true) 
                                        }} >
                                            Execute
                                </LoadingButton>
                            </Box>}
                            {mode === "detail" &&
                                <Grid item sx={{ m: -1 }}>
                                    <NextLink
                                        href={`/dashboard/planning/task-planning/${taskPlanningId}/edit`}
                                        as={`/dashboard/planning/task-planning/${taskPlanningId}/edit`}
                                        passHref
                                    >
                                        <Button
                                            component="a"
                                            endIcon={<PencilAltIcon fontSize="small" />}
                                            sx={{ m: 1 }}
                                            variant="outlined"
                                            onClick={() => setIsEdit(true)}
                                        >
                                            Edit
                                        </Button>
                                    </NextLink>
                                </Grid>

                            }
                        </Box>

                        <TaskPlanningEditForm
                            isEdit={isEdit}
                            dialogStat={dialogStat}
                            setDialogStat={setDialogStat}
                            execute={execute}
                            plannById={taskPlanningId ? data?.data : null}
                            setIsApiActive={setIsApiActive}
                        />
                    </Container>
                </Box>
            </DashboardLayout>
        </AuthGuard>
    );
};

export default TaskPlanningCreate;
