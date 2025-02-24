import { useState, useEffect } from "react";
import Head from "next/head";
import {
  Box,
  Button,
  Container,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { AuthGuard } from "../../components/authentication/auth-guard";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { AnalyticsGeneralOverview } from "../../components/dashboard/analytics/analytics-general-overview";
import { Reports as ReportsIcon } from "../../icons/reports";
import { gtm } from "../../lib/gtm";
import { managerLogin } from "../../utils/helper";
import TaskList from "./tasks";
import { useQuery } from "react-query";
import useAxios from "../../services/useAxios";
import { TasklistPerProperty } from "../../components/neovisdashbord/tasklist-per-property"
import { AnalyticsTaskType } from "../../components/neovisdashbord/task-type-pichart";
import { TaskCountDash } from "../../components/neovisdashbord/task-count-dash";

const Analytics = () => {
  const isManager = managerLogin();
  const customInstance = useAxios();
  const [listData, setListData] = useState(null)

  const { data: Alltasks, isFetching, error } = useQuery("Alltasks", () =>
    customInstance.get(`tasks?limit=&page=`)
  )

  const { data: taskTypeSource, isLoading } = useQuery("taskTypeSource", () =>
    customInstance.post(`tasks/maintainence-housekeeping`)
  )

  const { data: statusCount } = useQuery("statusCount", () =>
    customInstance.post(`tasks/byStatusCount`)
  )

  const { data: listOfTask, refetch } = useQuery("listOfTask", () =>
    customInstance.post(`properties/completedtask`)
  )

  useEffect(() => {
    // Check if the Geolocation API is supported by the browser
    if ('geolocation' in navigator) {
      // Try to get the user's location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // If successful, set the location permission to true
          console.log('position', position);
          if (position) {
            localStorage.setItem('user location', JSON.stringify({
              lat: position?.coords?.latitude,
              lng: position?.coords?.longitude
            }))
          }
        },
        (error) => {
          // If there's an error (e.g., user denies permission), set the location permission to false
          console.error('Error getting location:', error);
        }
      );
    } else {
      // If the Geolocation API is not supported, set the location permission to null
      console.error('Geolocation is not supported by your browser.');
    }
  }, []);


  return (
    <AuthGuard>
      <Head>
        <title>Dashboard: Analytics</title>
      </Head>
      {isManager ? (
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 5,
          }}
        >
          <DashboardLayout isLoading={isLoading}>
            <Container maxWidth="xl">
              <Box sx={{ mb: 4 }}>
                <Grid container justifyContent="space-between" spacing={3}>
                  <Grid item>
                    <Typography variant="h4">Manager Dashboard</Typography>
                  </Grid>
                  {/* <Grid
                    item
                    sx={{
                      alignItems: "center",
                      display: "flex",
                      m: -1,
                    }}
                  >
                    <Button
                      startIcon={<ReportsIcon fontSize="small" />}
                      sx={{ m: 1 }}
                      variant="outlined"
                    >
                      Reports
                    </Button>
                    <TextField
                      defaultValue="week"
                      label="Period"
                      select
                      size="small"
                      sx={{ m: 1 }}
                    >
                      <MenuItem value="week">Last week</MenuItem>
                      <MenuItem value="month">Last month</MenuItem>
                      <MenuItem value="year">Last year</MenuItem>
                    </TextField>
                  </Grid> */}
                </Grid>
              </Box>
              <Box>
                <TaskCountDash
                  Alltasks={Alltasks}
                  statusCount={statusCount}
                />
              </Box>
              <Box sx={{ mt: 4 }}>
                <Grid container spacing={4}>
                  <Grid item lg={8} sm={8} xs={12}>
                    <TasklistPerProperty
                      listOfTask={listOfTask}
                    />
                  </Grid>
                  <Grid item lg={4} sm={4} xs={12}>
                    <AnalyticsTaskType
                      taskTypeSource={taskTypeSource}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Container>
          </DashboardLayout>
        </Box>
      ) : (
        <TaskList />
      )}
    </AuthGuard>
  );
};

// Analytics.getLayout = (page) => (
//   <AuthGuard>
//     <DashboardLayout>{page}</DashboardLayout>
//   </AuthGuard>
// );

export default Analytics;
