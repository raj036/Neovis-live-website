import NextLink from "next/link";
import PropTypes from "prop-types";
import {
    Avatar,
    Box,
    IconButton,
    Link,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import { Scrollbar } from "../../scrollbar";
import { SeverityPill } from "../../severity-pill";
import { EditButton } from "../edit-button";
import { ViewButton } from "../view-button";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

export const OwnerDocListTable = (props) => {
    const {
        ownerDocs,
        ownerDocsCount,
        onPageChange,
        onRowsPerPageChange,
        page,
        rowsPerPage,
        refreshTable,
        ...other
    } = props;

    const router = useRouter()
    const [isOwnerRoute, setIsOwnerRoute] = useState(false)

    useEffect(() => {
        if (router.pathname.includes('/owner')) {
            setIsOwnerRoute(true)
        } else {
            setIsOwnerRoute(false)
        }
    }, [router])

    return (
        <div {...other}>
            <Scrollbar>
                <Table sx={{ minWidth: 700 }}>
                    <TableHead
                    // sx={{ visibility: "visible" }}
                    >
                        <TableRow>
                            <TableCell >Document Link</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ownerDocs.map((item, idx) => {
                            return (
                                <TableRow hover key={idx}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 3, my: 1 }}>
                                        <NextLink href={item.url} passHref>
                                            <Link color="inherit" variant="subtitle2">
                                                {item.url.split('https://firebasestorage.googleapis.com/v0/b/virtual-inspect-5390b.appspot.com/o/ownerDoc%2F')[1]?.split('?alt=media&token=')[0]}
                                            </Link>
                                        </NextLink>
                                    </Box>

                                    <TableCell align="right">
                                        <NextLink href={item.url} passHref>
                                            <Tooltip title={"Download"}>
                                                <IconButton component="a">
                                                    <CloudDownloadIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </NextLink>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Scrollbar>
            {/* <TablePagination
        component="div"
        count={ownerDocsCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      /> */}
        </div>
    );
};

OwnerDocListTable.propTypes = {
    ownerDocs: PropTypes.array.isRequired,
    ownerDocsCount: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onRowsPerPageChange: PropTypes.func,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};
