import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Tooltip,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { InformationCircleOutlined as InformationCircleOutlinedIcon } from "../../icons/information-circle-outlined"
import { ArrowRight as ArrowRightIcon } from '../../icons/arrow-right';
import { Chart } from "../chart"



export const AnalyticsTaskType = (props) => {
  const { taskTypeSource } = props;

  const theme = useTheme();

  const data = {
    series: [
      {
        color: 'rgba(86, 100, 210, 0.5)',
        data: taskTypeSource?.data ? taskTypeSource?.data?.housekeepingCount : "",
        label: 'Houskeeping'
      },
      {
        color: '#FFB547',
        data: taskTypeSource?.data ? taskTypeSource?.data?.maintenanceCount : "",
        label: 'Maintenance'
      },

    ]
  };




  const chartOptions = {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    colors: data.series.map((item) => item.color),
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        return opts.w.config.series[opts.seriesIndex];
      },
      postion: "center",

      style: {
        fontSize: "8px",

      }
    },

    fill: {
      opacity: 1
    },
    labels: data.series.map((item) => item.label),
    legend: {
      show: false
    },
    stroke: {
      width: 0
    },
    theme: {
      mode: theme.palette.mode
    }
  };

  const chartSeries = data.series.map((item) => item.data);


  return (
    <Card >
      <CardHeader
        title="Task Type Source"
        action={(
          <Tooltip title="Task Type Source">
            <InformationCircleOutlinedIcon sx={{ color: 'action.active' }} />
          </Tooltip>
        )}
      />
      <Divider />
      <CardContent>
        <Box>
          <Chart
            height={200}
            options={chartOptions}
            series={chartSeries}
            type="donut"
          />
        </Box>
        <Grid container>
          {data.series.map((item) => (
            <Grid
              item
              key={item.label}
              sx={{
                alignItems: 'center',
                display: 'flex',
                p: 1
              }}
              xs={6}
            >
              <Box
                sx={{
                  border: 3,
                  borderColor: item.color,
                  borderRadius: '50%',
                  height: 12,
                  mr: 1,
                  width: 12
                }}
              />
              <Typography variant="subtitle2">
                {item.label}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
