import { Fragment } from "react";
import PropTypes from "prop-types";
import {
    Link,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
} from "@mui/material";
import NextLink from "next/link";
import { Scrollbar } from "../../../scrollbar";
import { SeverityPill } from "../../../severity-pill";
import { useRouter } from "next/router";
import { ViewButton } from "../../view-button";
import { EditButton } from "../../edit-button";

export const UnitGroupListTable = (props) => {
    const {
        onPageChange,
        onRowsPerPageChange,
        page,
        unitgroups,
        unitgroupsCount,
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
                            <TableCell width="15%">Unit Group Name</TableCell>
                            <TableCell>Unit Group Code</TableCell>
                            <TableCell width="25%">Property Name</TableCell>
                            <TableCell align="center" width="20%">Unit Counts</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {unitgroups?.map((unitgroup) => {
                            return (
                                <Fragment key={unitgroup.id}>
                                    <TableRow hover>
                                        <TableCell width="15%">
                                            <NextLink
                                                href={`/dashboard/properties/unitgroups/${unitgroup.id}/detail`}
                                                as={`/dashboard/properties/unitgroups/${unitgroup.id}/detail`}
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
                                                    {unitgroup.name}
                                                </Link>
                                            </NextLink>
                                        </TableCell>
                                        <TableCell>{unitgroup.code}</TableCell>
                                        <TableCell width="25%">
                                            {unitgroup.property?.property_name}
                                        </TableCell>
                                        <TableCell align="center" width="20%">
                                            {unitgroup?.units?.length || 0}
                                        </TableCell>
                                        <TableCell align="center">
                                            <SeverityPill
                                                color={
                                                    unitgroup.status === "Active" ? "success" : "warning"
                                                }
                                            >
                                                {unitgroup.status}
                                            </SeverityPill>
                                        </TableCell>
                                        <TableCell align="center">
                                            {editable && (
                                                <EditButton
                                                    path={`/dashboard/properties/unitgroups/${unitgroup.id}/edit`}
                                                    title="Edit"
                                                />
                                            )}
                                            <ViewButton
                                                path={`/dashboard/properties/unitgroups/${unitgroup.id}/detail`}
                                                title="View"
                                            />
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
                count={unitgroupsCount}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </div>
    );
};

UnitGroupListTable.propTypes = {
    unitgroups: PropTypes.array.isRequired,
    unitgroupsCount: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onRowsPerPageChange: PropTypes.func,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};
