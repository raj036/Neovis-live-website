import { useEffect, useState } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { gtm } from "../../../../lib/gtm";
import { PencilAlt as PencilAltIcon } from "../../../../icons/pencil-alt";
import { useRouter } from "next/router";
import useAxios from "../../../../services/useAxios";
import { BackButton } from "../../../../components/dashboard/back-button";

const TaskDetail = () => {
  const router = useRouter();
  const customInstance = useAxios();

  const [isEdit, setIsEdit] = useState(false);
  const [taskId, setTaskId] = useState();

  const { data, isLoading, isFetching } = useQuery(
    ["taskDetailById", taskId],
    () => customInstance.get(`tasks/${taskId}`),
    { enabled: taskId !== undefined }
  );

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  useEffect(() => {
    if (router) {
      if (router.query.taskId) {
        setTaskId(router.query.taskId);
      }
      if (router.query.type && router.query.type !== "detail") {
        setIsEdit(true);
      }
    }
  }, [router]);

  return (
    <AuthGuard>
      <DashboardLayout isLoading={isLoading || isFetching}>
        <Head>
          <title>Dashboard: Task Detail</title>
        </Head>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 8,
          }}
        >
          <Container>
            <div>
              <BackButton
                path={`/dashboard/tasks`}
                as="/dashboard/tasks"
                title="Task"
              />
              {taskId && (
                <>
                  <Grid container justifyContent="space-between" spacing={3}>
                    <Grid
                      item
                      sx={{
                        alignItems: "center",
                        display: "flex",
                        overflow: "hidden",
                      }}
                    >
                      <div>
                        <Typography variant="h4">
                          {data?.data?.task_title}
                        </Typography>
                      </div>
                    </Grid>
                    {!isEdit && !data?.data?.default && (
                      <Grid item sx={{ m: -1 }}>
                        <NextLink
                          href={`/dashboard/tasks/checklists/${taskId}/edit`}
                          as={`/dashboard/tasks/checklists/${taskId}/edit`}
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
                    )}
                  </Grid>
                </>
              )}
            </div>

            {/* <Box sx={{ mb: 3 }}>
              {!taskId && (
                <Typography variant="h4">Create a new checklist</Typography>
              )}
            </Box>
            <ChecklistEditForm
              isEdit={isEdit}
              checklist={taskId ? data?.data : null}
            /> */}
          </Container>
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
};

export default TaskDetail;
