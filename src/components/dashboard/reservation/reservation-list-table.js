import { Fragment, useState } from "react";
import PropTypes from "prop-types";
import {
    Box,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    Tooltip,
} from "@mui/material";
import { format } from "date-fns";
import * as dayjs from "dayjs";
import { useQueryClient } from "react-query";
import { ArrowRight as ArrowRightIcon } from "../../../icons/arrow-right";
import { Scrollbar } from "../../scrollbar";
import { useRouter } from "next/router";
import { SeverityPill } from "../../severity-pill";
import useAxios from "../../../services/useAxios";

const zone = dayjs(new Date()).format("Z").split(":");
const offset = parseInt(zone[0].substring(1)) * 60 + parseInt(zone[1]);

var utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
dayjs().utcOffset(offset);

export const ReservationTable = (props) => {
    const {
        onViewTask,
        onInspectionView,
        onPageChange,
        onRowsPerPageChange,
        page,
        reservations,
        reservationsCount,
        rowsPerPage,
        editable,
        isManager,
        isVendor,
        isOwner,
        ...other
    } = props;

    const router = useRouter();
    const customInstance = useAxios();
    const queryClient = useQueryClient();

    return (
        <div {...other}>
            <Scrollbar>
                <Table sx={{ minWidth: 1500 }}>
                    <TableHead>
                        <TableRow>
                            {/* {!isOwner &&
                                <TableCell >Reservation Number</TableCell>
                            } */}
                            <TableCell >Reservation Date</TableCell>
                            {!isOwner &&
                                <>
                                    <TableCell >Customer Name</TableCell>
                                    <TableCell >Property</TableCell>
                                    <TableCell >Unit Type</TableCell>
                                    <TableCell >Unit Area</TableCell>
                                </>
                            }
                            <TableCell >Unit</TableCell>
                            <TableCell >Arrival Date</TableCell>
                            <TableCell >Departure Date</TableCell>
                            {isOwner &&
                                <>
                                    <TableCell >Channel Name</TableCell>
                                    <TableCell >Guest Name</TableCell>
                                    <TableCell >Total Guest</TableCell>
                                </>
                            }
                            <TableCell >Owner Amount</TableCell>
                            <TableCell >Property Management Amount</TableCell>
                            <TableCell >Total Amount</TableCell>
                            {!isOwner &&
                                <>
                                    <TableCell >Number of dates</TableCell>
                                    <TableCell >First month date</TableCell>
                                    <TableCell >Second month date</TableCell>

                                    <TableCell >Owner payout per night</TableCell>
                                    <TableCell >PM payout per night</TableCell>
                                    <TableCell >Owner payout first month</TableCell>
                                    <TableCell >PM payout first month</TableCell>
                                    <TableCell >Owner payout second month</TableCell>
                                    <TableCell >PM payout Second month</TableCell>
                                </>
                            }
                            {!isOwner &&
                                <TableCell align="center">Status</TableCell>
                            }
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reservations?.map((reservation) => {
                            return (
                                <Fragment key={reservation?.id}>
                                    <TableRow hover>
                                        {/* {!isOwner &&
                                            <TableCell>
                                                {reservation?.reservationNumber}
                                            </TableCell>
                                        } */}
                                        <TableCell>
                                            {reservation?.reservationDate && format(new Date(reservation?.reservationDate), 'dd/MM/yyyy')}
                                        </TableCell>
                                        {!isOwner &&
                                            <>
                                                <TableCell>
                                                    {reservation?.tncSigneeCustomerName || ""}
                                                </TableCell>
                                                <TableCell>
                                                    {reservation?.property?.property_name || ""}
                                                </TableCell>
                                                <TableCell>
                                                    {reservation?.unit_type?.unit_type_name}
                                                </TableCell>
                                                <TableCell>
                                                    {reservation?.unit_area?.area_name}
                                                </TableCell>
                                            </>
                                        }
                                        <TableCell>
                                            {reservation?.unit?.unit_name}
                                        </TableCell>
                                        <TableCell>
                                            {reservation?.arrivalDate && format(new Date(reservation?.arrivalDate), 'dd/MM/yyyy')}
                                        </TableCell>
                                        <TableCell>
                                            {reservation?.departureDate && format(new Date(reservation?.departureDate), 'dd/MM/yyyy')}
                                        </TableCell>
                                        {isOwner &&
                                            <>
                                                <TableCell>
                                                    {reservation?.channelName}
                                                </TableCell>
                                                <TableCell>
                                                    {reservation?.guestName}
                                                </TableCell>
                                                <TableCell>
                                                    {reservation?.numberOfGuests}
                                                </TableCell>
                                            </>
                                        }
                                        <TableCell>
                                            {parseFloat(reservation?.owner_payout).toFixed(3)}
                                        </TableCell>
                                        <TableCell>
                                            {parseFloat(reservation?.property_management_payout).toFixed(3)}
                                        </TableCell>
                                        <TableCell>
                                            {parseInt(reservation?.owner_payout) + parseInt(reservation?.property_management_payout)}
                                        </TableCell>
                                        {!isOwner &&
                                            <>
                                                <TableCell>
                                                    {reservation?.number_of_dates}
                                                </TableCell>
                                                <TableCell>
                                                    {reservation?.number_of_dates_first_month}
                                                </TableCell>
                                                <TableCell>
                                                    {reservation?.number_of_dates_last_month}
                                                </TableCell>

                                                <TableCell>
                                                    {reservation?.finance_data?.owner_payout_per_night}
                                                </TableCell>
                                                <TableCell>
                                                    {reservation?.finance_data?.pm_payout_per_night}
                                                </TableCell>
                                                <TableCell>
                                                    {reservation?.finance_data?.owner_payout_first_month}
                                                </TableCell>
                                                <TableCell>
                                                    {reservation?.finance_data?.pm_payout_first_month}
                                                </TableCell>
                                                <TableCell>
                                                    {reservation?.finance_data?.owner_payout_last_month}
                                                </TableCell>
                                                <TableCell>
                                                    {reservation?.finance_data?.pm_payout_last_month}
                                                </TableCell>
                                            </>}
                                        {!isOwner &&
                                            <TableCell align="center">
                                                <SeverityPill color="success"> {reservation?.status || ""}</SeverityPill>
                                            </TableCell>
                                        }
                                        <TableCell align="center">
                                            <Box display="flex" alignItems="center" justifyContent="center">

                                                <Tooltip title="View Reservation Details">
                                                    <IconButton
                                                        component="a"
                                                        onClick={() =>
                                                            router.push(`/dashboard/reservations/${reservation.id}/view`)
                                                        }
                                                    >
                                                        <ArrowRightIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                </Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </Scrollbar>
            <TablePagination
                component="div"
                count={reservationsCount}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </div >
    );
};

ReservationTable.propTypes = {
    reservations: PropTypes.array.isRequired,
    reservationsCount: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onRowsPerPageChange: PropTypes.func,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};
