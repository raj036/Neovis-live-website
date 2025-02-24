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

export const TemplateListTable = (props) => {
    const {
        onPageChange,
        onRowsPerPageChange,
        page,
        templates,
        templatesCount,
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
                            <TableCell>Status</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {templates.map((template) => {
                            return (
                                <Fragment key={template.id}>
                                    <TableRow hover>
                                        <TableCell width="25%">
                                            <Box
                                                sx={{
                                                    alignItems: "center",
                                                    display: "flex",
                                                }}
                                            >
                                                {template.images ? (
                                                    <Box
                                                        sx={{
                                                            alignItems: "center",
                                                            backgroundColor: "background.default",
                                                            backgroundImage: `url("${template?.main_image
                                                                ? template?.main_image
                                                                : template.images[0]
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
                                                        href={`/dashboard/templates/${template.id}/detail`}
                                                        passHref
                                                    >
                                                        <Link
                                                            color="inherit"
                                                            variant="subtitle2"
                                                            sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                                                        >
                                                            {template.template_name}
                                                        </Link>
                                                    </NextLink>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{template.template_code}</TableCell>
                                        <TableCell>
                                            <SeverityPill
                                                color={
                                                    template.status === "Active" ? "success" : "warning"
                                                }
                                            >
                                                {template.status}
                                            </SeverityPill>
                                        </TableCell>
                                        <TableCell>{template.task_type}</TableCell>
                                        <TableCell>
                                            <EditButton
                                                path={`/dashboard/templates/${template.id}/edit`}
                                                title="Edit"
                                            />
                                            <ViewButton
                                                path={`/dashboard/templates/${template.id}/detail`}
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
                count={templatesCount}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </div>
    );
};

TemplateListTable.propTypes = {
    templates: PropTypes.array.isRequired,
    templatesCount: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onRowsPerPageChange: PropTypes.func,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};
