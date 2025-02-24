import { Box, Card, Drawer, Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { WEEKDAYS } from '../../utils/constants';
import { X as XIcon } from "../../icons/x";
import { useQuery } from 'react-query';
import useAxios from '../../services/useAxios';
import dayjs from 'dayjs';

const HistoryDrawer = ({
  isOpen,
  planningId,
  handleClose
}) => {
  const [logs, setLogs] = useState([]);
  const [planning, setPlanning] = useState();
  const customInstance = useAxios();

  const { data: planningData, isLoading } = useQuery("planningData",
    () => customInstance.get(`task-planning/${planningId}`),
    { enabled: planningId !== undefined }
  );

  useEffect(() => {
    if (planningData) {
      setPlanning(planningData);
      planningData.data?.execution_time?.forEach((time) => convertTimeToLogs(time));
    }

    return (() => {
      setLogs([]);
      setPlanning();
    })
  }, [planningData])

  const convertTimeToLogs = (time) => {
    const milTime = +time;
    const execDate = new Date(milTime);
    const date = execDate.toLocaleDateString('en-US');
    const execTime = execDate.toLocaleTimeString('en-US');
    const day = WEEKDAYS[execDate.getDay()]?.value;
    const logsObj = {
      date: `${date}, ${day}`,
      time: `${execTime}`
    }
    setLogs((prevData => [...prevData, logsObj]));
  }

  const ExecutionLogTable = ({ logsData }) => {
    return (
      <>
        <TableContainer
          sx={{
            maxHeight: 305,
            '&::-webkit-scrollbar': {
              width: 10
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#d6dee1',
              borderRadius: 20,
              border: '6px solid #d6dee1',
              backgroundClip: 'content-box'
            }
          }}>
          <Table stickyHeader sx={{ minWidth: 300 }} aria-label="simple table">
            <TableHead sx={{ backgroundColor: '#e9ebf0 !important' }}>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align='left'>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logsData?.map((log, ind) => (
                <TableRow
                  key={ind}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row" sx={{ py: 1 }}>
                    {log.date}
                  </TableCell>
                  <TableCell align="left" sx={{ py: 1 }}>{log.time}</TableCell>
                </TableRow>
              ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      </>
    )
  }

  return (
    <Box component='span' sx={{ position: 'relative' }}>
      <Drawer
        anchor="right"
        onClose={handleClose}
        open={isOpen}
        ModalProps={{ sx: { zIndex: 2000 } }}
        PaperProps={{
          sx: {
            width: 620,
            backgroundColor: "#e9ebf0",
            maxHeight: "100%",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            paddingLeft: 3,
            paddingRight: 1,
            py: 2,
          }}
        >
          <Typography color="inherit" variant="h6">
            Task Planning
          </Typography>
          <IconButton color="inherit" onClick={handleClose}>
            <XIcon fontSize="small" />
          </IconButton>
        </Box>
        {
          isLoading ? (
            <Typography textAlign='center' variant='h6' sx={{ mt: 2 }}>
              Loading...
            </Typography>
          ) : (
            <Box sx={{ p: 2 }}>
              <Card variant='outlined' sx={{ p: 2 }}>
                <Grid container spacing={1}>
                  <Grid item md={4}>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      Property :
                    </Typography>
                  </Grid>
                  <Grid item md={8}>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      {planning?.data?.property?.property_name}
                    </Typography>
                  </Grid>
                  <Grid item md={4}>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      Unit Type :
                    </Typography>
                  </Grid>
                  <Grid item md={8}>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      {planning?.data?.unit_types?.map(ut => ut?.unit_type_name)?.join(', ')}
                    </Typography>
                  </Grid>
                  <Grid item md={4}>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      Unit Groups :
                    </Typography>
                  </Grid>
                  <Grid item md={8}>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      {planning?.data?.unit_groups?.map(ug => ug?.name)?.join(', ')}
                    </Typography>
                  </Grid>
                  <Grid item md={4}>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      Units :
                    </Typography>
                  </Grid>
                  <Grid item md={8}>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      {planning?.data?.units?.map(u => u?.unit_name)?.join(', ')}
                    </Typography>
                  </Grid>
                  <Grid item md={4}>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      Task Configs :
                    </Typography>
                  </Grid>
                  <Grid item md={8}>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      {planning?.data?.task_configs?.map(tc => tc?.name)?.join(', ')}
                    </Typography>
                  </Grid>
                  <Grid item md={4}>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      Arrival Date :
                    </Typography>
                  </Grid>
                  <Grid item md={8}>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      {dayjs(planning?.data?.start_date).format("MM-DD-YYYY")}
                    </Typography>
                  </Grid>
                  <Grid item md={4}>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      Departure Date :
                    </Typography>
                  </Grid>
                  <Grid item md={8}>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      {dayjs(planning?.data?.end_date).format("MM-DD-YYYY")}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
              {
                logs.length ? (
                  <Card variant='outlined' sx={{ p: 2, mt: 2 }}>
                    <Typography variant='body1' sx={{ pl: 1, pb: 1, fontWeight: 600 }}>
                      Execution Logs
                    </Typography>
                    <ExecutionLogTable logsData={logs} />
                  </Card>
                ) : (
                  <Typography variant='h6' textAlign='center' sx={{ mt: 2 }}>
                    No execution logs found.
                  </Typography>
                )
              }
            </Box>
          )
        }
      </Drawer>
    </Box >
  )
}

export default HistoryDrawer