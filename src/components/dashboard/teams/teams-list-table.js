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
    Typography,
} from "@mui/material";
import NextLink from "next/link";
import { Image as ImageIcon } from "../../../icons/image";
import { Scrollbar } from "../../scrollbar";
import { SeverityPill } from "../../severity-pill";
import { EditButton } from "../edit-button";
import { ViewButton } from "../view-button";

export const TeamsListTable = (props) => {
    const {
        onPageChange,
        onRowsPerPageChange,
        page,
        teams,
        teamsCount,
        rowsPerPage,
        ...other
    } = props;

    return (
        <div {...other}>
            <Scrollbar>
                <Table sx={{ minWidth: 1200 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell width="25%">Name</TableCell>
                            <TableCell>Code</TableCell>
                            <TableCell>Team Leader</TableCell>
                            <TableCell>Property</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {teams.map((team, idx) => {
                            return (
                                <Fragment key={idx}>
                                    <TableRow hover>
                                        <TableCell width="25%">
                                            <Box
                                                sx={{
                                                    alignItems: "center",
                                                    display: "flex",
                                                }}
                                            >
                                                {team.images ? (
                                                    <Box
                                                        sx={{
                                                            alignItems: "center",
                                                            backgroundColor: "background.default",
                                                            backgroundImage: `url("${team?.main_image
                                                                ? team?.main_image
                                                                : team.images[0]
                                                                }")`,
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
                                                        href={`/dashboard/teams/${team.id}/detail`}
                                                        passHref
                                                    >
                                                        <Link
                                                            color="inherit"
                                                            variant="subtitle2"
                                                            sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                                                        >
                                                            {team.team_name}
                                                        </Link>
                                                    </NextLink>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{team.team_code}</TableCell>
                                        <TableCell>
                                            {`${team.team_leader?.first_name} ${team.team_leader?.last_name}`}
                                        </TableCell>
                                        <TableCell>{team.property?.property_name}</TableCell>
                                        <TableCell>
                                            <EditButton
                                                path={`/dashboard/teams/${team.id}/edit`}
                                                title="Edit"
                                            />
                                            <ViewButton
                                                path={`/dashboard/teams/${team.id}/detail`}
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
                count={teamsCount}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </div>
    );
};

TeamsListTable.propTypes = {
    teams: PropTypes.array.isRequired,
    teamsCount: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onRowsPerPageChange: PropTypes.func,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};
