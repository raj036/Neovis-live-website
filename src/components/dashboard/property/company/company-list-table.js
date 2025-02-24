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
import { Image as ImageIcon } from "../../../../icons/image";
import { Scrollbar } from "../../../scrollbar";
import { SeverityPill } from "../../../severity-pill";
import { useRouter } from "next/router";
import { ViewButton } from "../../view-button";
import { EditButton } from "../../edit-button";
import { Box } from "@mui/system";

export const CompanyListTable = (props) => {
    const {
        onPageChange,
        onRowsPerPageChange,
        page,
        companyes,
        companyesCount,
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
                            <TableCell width="15%">Name</TableCell>
                            <TableCell>Code</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {companyes?.map((company) => {
                            return (
                                <Fragment key={company.id}>
                                    <TableRow hover>
                                        <TableCell width="25%">
                                            <Box
                                                sx={{
                                                    alignItems: "center",
                                                    display: "flex",
                                                }}
                                            >
                                                {company.logo ? (
                                                    <Box
                                                        sx={{
                                                            alignItems: "center",
                                                            backgroundColor: "background.default",
                                                            backgroundImage: `url("${company.logo}")`,
                                                            backgroundPosition: "center",
                                                            backgroundSize: "cover",
                                                            borderRadius: 1,
                                                            display: "flex",
                                                            minHeight: 80,
                                                            justifyContent: "center",
                                                            overflow: "hidden",
                                                            minWidth: 80,
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                ) : (
                                                    <Box
                                                        sx={{
                                                            alignItems: "center",
                                                            backgroundColor: "background.default",
                                                            borderRadius: 1,
                                                            display: "flex",
                                                            height: 80,
                                                            justifyContent: "center",
                                                            width: 80,
                                                        }}
                                                    >
                                                        <ImageIcon fontSize="small" />
                                                    </Box>
                                                )}
                                                <Box
                                                    sx={{
                                                        cursor: "pointer",
                                                        ml: 2,
                                                    }}
                                                >
                                                    <NextLink
                                                        href={`/dashboard/properties/company/${company.id}/detail`}
                                                        as={`/dashboard/properties/company/${company.id}/detail`}
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
                                                            {company.name}
                                                        </Link>
                                                    </NextLink>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{company.code}</TableCell>
                                        <TableCell>
                                            <SeverityPill
                                                color={
                                                    company.status === "Active" ? "success" : "warning"
                                                }
                                            >
                                                {company.status}
                                            </SeverityPill>
                                        </TableCell>
                                        <TableCell align="right">
                                            {editable && (
                                                <EditButton
                                                    path={`/dashboard/properties/company/${company.id}/edit`}
                                                    title="Edit"
                                                />
                                            )}
                                            <ViewButton
                                                path={`/dashboard/properties/company/${company.id}/detail`}
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
                count={companyesCount}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </div>
    );
};

CompanyListTable.propTypes = {
    companyes: PropTypes.array.isRequired,
    companyesCount: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onRowsPerPageChange: PropTypes.func,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};
