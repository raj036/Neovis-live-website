import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { ArrowRight as ArrowRightIcon } from "../../icons/arrow-right";
import { ChevronDown as ChevronDownIcon } from "../../icons/chevron-down";
import { ChevronUp as ChevronUpIcon } from "../../icons/chevron-up";
import { Chart } from "../chart";

// // const LineChart = () => {
// //   const theme = useTheme();

// //   const chartOptions = {
// //     chart: {
// //       background: 'transparent',
// //       toolbar: {
// //         show: false
// //       },
// //       zoom: {
// //         enabled: false
// //       }
// //     },
// //     colors: ['#2F3EB1'],
// //     dataLabels: {
// //       enabled: false
// //     },
// //     fill: {
// //       opacity: 1
// //     },
// //     grid: {
// //       show: false
// //     },
// //     stroke: {
// //       width: 3
// //     },
// //     theme: {
// //       mode: theme.palette.mode
// //     },
// //     tooltip: {
// //       enabled: false
// //     },
// //     xaxis: {
// //       labels: {
// //         show: false
// //       },
// //       axisBorder: {
// //         show: false
// //       },
// //       axisTicks: {
// //         show: false
// //       }
// //     },
// //     yaxis: {
// //       show: false
// //     }
// //   };

// //   const chartSeries = [{ data: [0, 60, 30, 60, 0, 30, 10, 30, 0] }];

// //   return (
// //     <Chart
// //       options={chartOptions}
// //       series={chartSeries}
// //       type="line"
// //       width={120}
// //     />
// //   );
// // };

// const BarChart = () => {
//   const theme = useTheme();

//   const chartOptions = {
//     chart: {
//       background: 'transparent',
//       toolbar: {
//         show: false
//       },
//       zoom: {
//         enabled: false
//       }
//     },
//     colors: ['#2F3EB1'],
//     dataLabels: {
//       enabled: false
//     },
//     fill: {
//       opacity: 1
//     },
//     grid: {
//       show: false
//     },
//     states: {
//       normal: {
//         filter: {
//           type: 'none',
//           value: 0
//         }
//       }
//     },
//     stroke: {
//       width: 0
//     },
//     theme: {
//       mode: theme.palette.mode
//     },
//     tooltip: {
//       enabled: false
//     },
//     xaxis: {
//       axisBorder: {
//         show: false
//       },
//       axisTicks: {
//         show: false
//       },
//       labels: {
//         show: false
//       }
//     },
//     yaxis: {
//       show: false
//     }
//   };

//   const chartSeries = [{ data: [10, 20, 30, 40, 50, 60, 5] }];

//   return (
//     <Chart
//       options={chartOptions}
//       series={chartSeries}
//       type="bar"
//       width={120}
//     />
//   );
// };

export const TaskCountDash = (props) => {
  const { Alltasks, statusCount } = props;

  return (
    <Box>
      <Grid container spacing={4}>
        <Grid item md={3} sm={6} xs={12}>
          <Card>
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
                px: 3,
                py: 2,
              }}
            >
              <div>
                <Typography
                  color="textSecondary"
                  variant="body2"
                  align="center"
                >
                  Completed Task
                </Typography>
                <Typography sx={{ mt: 1 }} variant="h5" align="center">
                  {statusCount?.data?.taskCompletedCount}
                </Typography>
              </div>
              {/* <LineChart /> */}
            </Box>
          </Card>
        </Grid>
        <Grid item md={3} sm={6} xs={12}>
          <Card>
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
                px: 3,
                py: 2,
              }}
            >
              <div>
                <Typography
                  color="textSecondary"
                  variant="body2"
                  align="center"
                >
                  Assigned Task
                </Typography>
                <Typography sx={{ mt: 1 }} variant="h5" align="center">
                  {statusCount?.data?.taskAssignedCount}
                </Typography>
              </div>
              {/* <LineChart /> */}
            </Box>
          </Card>
        </Grid>
        <Grid item md={3} sm={6} xs={12}>
          <Card>
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
                px: 3,
                py: 2,
              }}
            >
              <div>
                <Typography
                  color="textSecondary"
                  variant="body2"
                  align="center"
                >
                  Inspected Task
                </Typography>
                <Typography sx={{ mt: 1 }} variant="h5" align="center">
                  {statusCount?.data?.taskInspectedCount}
                </Typography>
              </div>
              {/* <LineChart /> */}
            </Box>
            <Divider />
          </Card>
        </Grid>
        <Grid item md={3} sm={6} xs={12}>
          <Card>
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
                px: 3,
                py: 2,
              }}
            >
              <div>
                <Typography
                  color="textSecondary"
                  variant="body2"
                  align="center"
                >
                  Pending Task
                </Typography>
                <Typography sx={{ mt: 1 }} variant="h5" align="center">
                  {statusCount?.data?.taskPendingCount}
                </Typography>
              </div>
              {/* <BarChart /> */}
            </Box>
          </Card>
        </Grid>
        <Grid item md={3} sm={6} xs={12}>
          <Card>
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
                px: 3,
                py: 2,
              }}
            >
              <div>
                <Typography
                  color="textSecondary"
                  variant="body2"
                  align="center"
                >
                  Ongoing Task
                </Typography>
                <Typography sx={{ mt: 1 }} variant="h5" align="center">
                  {statusCount?.data?.taskOngoingCount}
                </Typography>
              </div>
              {/* <BarChart /> */}
            </Box>
          </Card>
        </Grid>
        <Grid item md={3} sm={6} xs={12}>
          <Card>
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
                px: 3,
                py: 2,
              }}
            >
              <div>
                <Typography
                  color="textSecondary"
                  variant="body2"
                  align="center"
                >
                  On Hold Task
                </Typography>
                <Typography sx={{ mt: 1 }} variant="h5" align="center">
                  {statusCount?.data?.taskOnHoldCount}
                </Typography>
              </div>
              {/* <BarChart /> */}
            </Box>
          </Card>
        </Grid>

        <Grid item md={3} sm={6} xs={12}>
          <Card>
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
                px: 3,
                py: 2,
              }}
            >
              <div>
                <Typography
                  color="textSecondary"
                  variant="body2"
                  align="center"
                >
                  Overdue Task
                </Typography>
                <Typography sx={{ mt: 1 }} variant="h5" align="center">
                  {statusCount?.data?.taskOverdueCount}
                </Typography>
              </div>
              {/* <BarChart /> */}
            </Box>
          </Card>
        </Grid>

        <Grid item md={3} sm={6} xs={12}>
          <Card>
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
                px: 3,
                py: 2,
              }}
            >
              <div>
                <Typography
                  color="textSecondary"
                  variant="body2"
                  align="center"
                >
                  ReOpen Task
                </Typography>
                <Typography sx={{ mt: 1 }} variant="h5" align="center">
                  {statusCount?.data?.taskReOpenCount}
                </Typography>
              </div>
              {/* <BarChart /> */}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
