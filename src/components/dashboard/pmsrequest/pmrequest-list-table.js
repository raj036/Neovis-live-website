import { Fragment, useState } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import {
    Box,
    Button,
    Icon,
    IconButton,
    Link,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    Tooltip,
} from "@mui/material";
import { format } from "date-fns";
import { ConfirmDialog } from "../../dashboard/confim-dialog";
import NextLink from "next/link";
import * as dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { ArrowRight as ArrowRightIcon } from "../../../icons/arrow-right";
import { PencilAlt as PencilAltIcon } from "../../../icons/pencil-alt";
import { Eye as EyeIcon } from "../../../icons/eye";
import { Scrollbar } from "../../scrollbar";
import { useRouter } from "next/router";
import { SeverityPill } from "../../severity-pill";
import useAxios from "../../../services/useAxios";
import {
    VideoCameraFrontOutlined,
    SlideshowOutlined,
} from "@mui/icons-material";

var localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);

export const pmsrequestData = [
    {id:1, name: "john", start_date: "02/06/2023", end_date:"02/06/2023",status:"Active"},
    {id:2, name: "Peter", start_date: "02/06/2023", end_date:"02/06/2023",status:"Active"},
    {id:3, name: "Bruce", start_date: "02/06/2023", end_date:"02/06/2023",status:"Active"},
    {id:4, name: "Mark", start_date: "02/06/2023", end_date:"02/06/2023",status:"Active"},
    {id:5, name: "Stalin", start_date: "02/06/2023", end_date:"02/06/2023",status:"Active"},
   
  ];

export const PmsrequstTable = () => {
   
     const router = useRouter();


    return (
        <div >
            <Scrollbar>
                <Table sx={{ minWidth: 1200 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center"> Name</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="left">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <Fragment >

                        {
                            pmsrequestData && pmsrequestData.map((d)=>{
                                return(
                                    <TableRow key={d.id} hover>
                                <TableCell align="center" sx={{padding:1}}>
                                    {d.name}
                                </TableCell>
                                <TableCell sx={{padding:1}}>
                                   {d.start_date}
                                </TableCell>
                                <TableCell sx={{padding:1}}>
                                  {d.end_date}
                                </TableCell>

                                <TableCell sx={{padding:1}}>
                                    <SeverityPill color="success"> Active</SeverityPill>
                                </TableCell>
                                <TableCell align="left">
                                    <Box display="flex" alignItems="center">

                                        <Tooltip title="View PMS Request">
                                            <IconButton
                                                component="a"
                                                // onClick={() =>
                                                //     router.push(`/dashboard/pmsrequest/${d.id}/view`)
                                                // }
                                            >
                                                <ArrowRightIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow> 
                                )
                            })
                        }
                           
                        </Fragment>
                    </TableBody>
                </Table>
            </Scrollbar>
            {/* <TablePagination
                component="div"
                count={reservationsCount}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            /> */}
        </div >
    );
};

PmsrequstTable.propTypes = {
    reservations: PropTypes.array.isRequired,
    reservationsCount: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onRowsPerPageChange: PropTypes.func,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};
