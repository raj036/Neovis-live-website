import { useEffect, useState } from "react";
import Head from "next/head";
import {
    Box,
    Button,
    Card,
    Container,
    Divider,
    FormControlLabel,
    Grid,
    Input,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "react-query";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { Plus as PlusIcon } from "../../../icons/plus";
import { Search as SearchIcon } from "../../../icons/search";
import { gtm } from "../../../lib/gtm";
import useAxios from "../../../services/useAxios";
import toast from "react-hot-toast";
import { OwnerDocListTable } from "../../../components/dashboard/user/owner-doc-list-table";

const sortOptions = [
    {
        label: "Last update (newest)",
        value: "updated_at:DESC",
    },
    {
        label: "Last update (oldest)",
        value: "updated_at:ASC",
    },
];

const OwnerDocsList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sort, setSort] = useState(sortOptions[0].value);
    const [search, setSearch] = useState("");
    const [filters, setFilter] = useState("");
    const [isChecked, setIsChecked] = useState(false)

    const router = useRouter();
    const customInstance = useAxios();

    let user = localStorage.getItem('vInspection-user')
    if (user) {
        user = JSON.parse(user)?.user
        // setIsChecked(user?.is_team_unique_member)
    }
    console.log('user', user);

    const { data: ownerData, isLoading, refetch, isFetching, error } = useQuery(
        ["ownerByuserId", user?.id],
        () => customInstance.get(`owner/findbyuser/${user?.id}`),
        { enabled: user?.id !== undefined }
    );
    console.log('ownerData', ownerData?.data);
    useEffect(() => {
        if (error) {
            const errMsg = error.response.data.message;
            toast.error(errMsg ?? "Something went wrong!");
        }
    }, [error])

    useEffect(() => {
        gtm.push({ event: "page_view" });
    }, []);

    useEffect(() => {
        refetch();
    }, [rowsPerPage, page, filters, sort, refetch]);

    const handleSearchChange = (event) => {
        event.preventDefault();
        setFilter(search);
    };

    const handleSortChange = (event) => {
        setSort(event.target.value);
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
    };

    return (
        <AuthGuard>
            <DashboardLayout isLoading={isLoading || isFetching}>
                <Head>
                    <title>Dashboard: Owner Documents</title>
                </Head>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        py: 5,
                    }}
                >
                    <Container maxWidth="xl">
                        <Box sx={{ mb: 4 }}>
                            <Grid container justifyContent="space-between" spacing={3}>
                                <Grid item>
                                    <Typography variant="h4">Owner Documents</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                        <Card>
                            <OwnerDocListTable
                                ownerDocs={ownerData ? ownerData?.data?.docs : []}
                                ownerDocsCount={0}
                                onPageChange={handlePageChange}
                                onRowsPerPageChange={handleRowsPerPageChange}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                refreshTable={() => refetch()}
                            />
                        </Card>
                    </Container>
                </Box>
            </DashboardLayout>
        </AuthGuard>
    );
};

export default OwnerDocsList;
