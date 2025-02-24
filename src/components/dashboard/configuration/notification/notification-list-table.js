import { Fragment } from "react";
import PropTypes from "prop-types";
import {
    Box,
    Link,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
} from "@mui/material";
import NextLink from "next/link";
import { Image as ImageIcon } from "../../../../icons/image";
import { Scrollbar } from "../../../scrollbar";
import { SeverityPill } from "../../../severity-pill";
import { useRouter } from "next/router";
import { ViewButton } from "../../view-button";
import { EditButton } from "../../edit-button";

export const NotificationTable = (props) => {
    const {
        onPageChange,
        onRowsPerPageChange,
        page,
        notifications,
        notificationsCount,
        rowsPerPage,
        editable,
        ...other
    } = props;

    const router = useRouter();

    return (
        <div {...other}>
            <Scrollbar>
                <Table sx={{ minWidth: 1200 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell width="20%">Name</TableCell>
                            <TableCell>Email Access</TableCell>
                            <TableCell>Mobile Access</TableCell>
                            <TableCell>Manager Access</TableCell>
                            <TableCell>Executor Access</TableCell>
                            <TableCell>Inspector Access</TableCell>
                            <TableCell>Vendor Access</TableCell>
                            <TableCell>Owner Access</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {notifications.map((notification) => {
                            return (
                                <Fragment key={notification.id}>
                                    <TableRow hover>
                                        <TableCell width="20%">
                                            <Box
                                                sx={{
                                                    alignItems: "center",
                                                    display: "flex",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        cursor: "pointer",
                                                        ml: 2,
                                                    }}
                                                >
                                                    <NextLink
                                                        href={`/dashboard/configurations/notification/${notification.id}/detail`}
                                                        as={`/dashboard/configurations/notification/${notification.id}/detail`}
                                                        passHref
                                                    >
                                                        <Link
                                                            color="inherit"
                                                            variant="subtitle2"
                                                            sx={{
                                                                fontWeight: 600,
                                                                fontSize: "0.875rem",
                                                                color: "black",
                                                            }}
                                                        >
                                                            {notification.action_status}
                                                        </Link>
                                                    </NextLink>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            <SeverityPill
                                                color={
                                                    notification.is_email_access ? "success" : "error"
                                                }
                                            >
                                                {notification.is_email_access ? 'Active' : 'Inactive'}
                                            </SeverityPill>
                                        </TableCell>

                                        <TableCell>
                                            <SeverityPill
                                                color={
                                                    notification.is_mobile_access ? "success" : "error"
                                                }
                                            >
                                                {notification.is_mobile_access ? 'Active' : 'Inactive'}
                                            </SeverityPill>
                                        </TableCell>

                                        <TableCell>
                                            <SeverityPill
                                                color={
                                                    notification.is_manager_access ? "success" : "error"
                                                }
                                            >
                                                {notification.is_manager_access ? 'Active' : 'Inactive'}
                                            </SeverityPill>
                                        </TableCell>

                                        <TableCell>
                                            <SeverityPill
                                                color={
                                                    notification.is_executor_access ? "success" : "error"
                                                }
                                            >
                                                {notification.is_executor_access ? 'Active' : 'Inactive'}
                                            </SeverityPill>
                                        </TableCell>

                                        <TableCell>
                                            <SeverityPill
                                                color={
                                                    notification.is_inspector_access ? "success" : "error"
                                                }
                                            >
                                                {notification.is_inspector_access ? 'Active' : 'Inactive'}
                                            </SeverityPill>
                                        </TableCell>

                                        <TableCell>
                                            <SeverityPill
                                                color={
                                                    notification.is_vendor_access ? "success" : "error"
                                                }
                                            >
                                                {notification.is_vendor_access ? 'Active' : 'Inactive'}
                                            </SeverityPill>
                                        </TableCell>

                                        <TableCell>
                                            <SeverityPill
                                                color={
                                                    notification.is_owner_access ? "success" : "error"
                                                }
                                            >
                                                {notification.is_owner_access ? 'Active' : 'Inactive'}
                                            </SeverityPill>
                                        </TableCell>
                                        <TableCell align="right">
                                            {editable && !notification.default && (
                                                <EditButton
                                                    path={`/dashboard/configurations/notification/${notification.id}/edit`}
                                                    title="Edit"
                                                />
                                            )}
                                            <ViewButton
                                                path={`/dashboard/configurations/notification/${notification.id}/detail`}
                                                title="View"
                                            />
                                        </TableCell>
                                    </TableRow>
                                </Fragment>
                            )
                        })}
                    </TableBody>
                </Table>
            </Scrollbar>
            {/* <TablePagination
                component="div"
                count={notificationsCount}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            /> */}
        </div>
    );
};

NotificationTable.propTypes = {
    notifications: PropTypes.array.isRequired,
    notificationsCount: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onRowsPerPageChange: PropTypes.func,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};
