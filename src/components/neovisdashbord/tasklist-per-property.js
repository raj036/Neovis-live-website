import numeral from 'numeral';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
  TablePagination,
  TableContainer
} from '@mui/material';
import { useState } from 'react';
import { InformationCircleOutlined as InformationCircleOutlinedIcon } from "../../icons/information-circle-outlined"
import { ArrowRight as ArrowRightIcon } from '../../icons/arrow-right';

export const TasklistPerProperty = (props) => {
  const { listOfTask } = props;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Card>
      <CardHeader sx={{padding:3}}
        title="List Of Task Propertywise"
        action={(
          <Tooltip title="List Of Task Propertywise">
            <InformationCircleOutlinedIcon sx={{ color: 'action.active' }} />
          </Tooltip>
        )}
      />
      <TableContainer>
        <Table >
          <TableHead>
            <TableRow>
              <TableCell sx={{padding:1}}>
                Property Name
              </TableCell>
              <TableCell   align="center" sx={{padding:1}}>
                Total Task
              </TableCell>
              <TableCell  sx={{padding:1}}   align="center" >
                completed Task Percentage
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody >

            {/* {listData && Object.entries(listData).map(([propertyName, propertyValue]) => (
            <div key={propertyName}>
              <p>Property Name: {propertyName}</p>
              <p>Property Value: {JSON.stringify(propertyValue.count)}</p>
              <p>new:{(JSON.stringify(propertyValue.items.filter((d)=>{
                return d.inspection_status === "Complete"
              }).length) * 100 /JSON.stringify(propertyValue.count)).toFixed(2) }</p>
              <hr />
            </div> */}

            {listOfTask?.data?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((d) => {
              return (
                <TableRow key={d.id}
                  sx={{
                    '&:last-child td': {
                      border: 0
                    },
                  }}
                >
                  <TableCell  sx={{padding:1}}>
                    <Box
                      sx={{
                        alignItems: 'center',
                        display: 'flex'
                      }}
                    >
                      <Typography
                        sx={{ ml: 1 }}
                        variant="subtitle2"
                      >
                        {d.property_name}
                      </Typography>
                    </Box>
                  </TableCell >
                  <TableCell   align="center" sx={{padding:1}}>
                    {d.total_task_count}
                  </TableCell>

                  <TableCell align="center"  sx={{padding:1}}>
                    {d.task_completed}
                  </TableCell>
                </TableRow>
              )
            })
            }

          </TableBody>
        </Table>
      </TableContainer>
      {
        listOfTask?.data?.length > 0 && (<TablePagination
          rowsPerPageOptions={[10,20]}
          component="div"
          count={listOfTask?.data?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />)
      }

      <Divider />
    </Card>
  )
}