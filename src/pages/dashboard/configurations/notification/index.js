import { useEffect, useState } from "react";
import Head from "next/head";
import {
    Box,
    Button,
    Card,
    Container,
    Divider,
    Grid,
    Typography,
} from "@mui/material";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { Plus as PlusIcon } from "../../../../icons/plus";
import { gtm } from "../../../../lib/gtm";
import useAxios from "../../../../services/useAxios";
import { NotificationTable } from "../../../../components/dashboard/configuration/notification/notification-list-table";
// import { NotificationFilter } from "../../../../components/dashboard/configuration/Notification/Notification-list-filters";

const NotificationList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchText, setSearchText] = useState("");
    const [search, setSearch] = useState("");
    const [staFilters, setStaFilters] = useState("");

    const router = useRouter();

    const customInstance = useAxios();

    const { data, refetch, isLoading, isFetching } = useQuery(
        "allnotificationconfigList",
        () =>
            customInstance.get(
                `push-notification-config?limit=100&page=0`
            )
    );
    // console.log('notification data', data);
    const handleSearchChange = (event) => {
        event.preventDefault();
        setSearchText(search);
    };

    const handleFiltersChange = (filterSelection) => {
        if (filterSelection?.status?.length > 0) {
            setStaFilters(`$in:${filterSelection.status?.join(",")}`);
        } else {
            setStaFilters("");
        }
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
    };

    useEffect(() => {
        gtm.push({ event: "page_view" });
    }, []);

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowsPerPage, page, searchText, staFilters, refetch]);

    return (
        <AuthGuard>
            <DashboardLayout isLoading={isLoading || isFetching}>
                <Head>
                    <title>Dashboard: Notification Configurations</title>
                </Head>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        py: 8,
                    }}
                >
                    <Container maxWidth="xl">
                        <Box sx={{ mb: 4 }}>
                            <Grid container justifyContent="space-between" spacing={3}>
                                <Grid item>
                                    <Typography variant="h4">Notification Configurations</Typography>
                                </Grid>
                                <Grid item>
                                    <Button
                                        component="a"
                                        startIcon={<PlusIcon fontSize="small" />}
                                        variant="contained"
                                        onClick={() =>
                                            router.push(
                                                "/dashboard/configurations/notification/newNotification/add"
                                            )
                                        }
                                    >
                                        Add
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                        <Card>
                            <Card>
                                {/* <NotificationFilter
                  onChange={handleFiltersChange}
                  handleSearchChange={handleSearchChange}
                  setSearch={setSearch}
                /> */}
                                <NotificationTable
                                    onPageChange={handlePageChange}
                                    onRowsPerPageChange={handleRowsPerPageChange}
                                    page={page}
                                    notifications={data ? data?.data : []}
                                    notificationsCount={data ? data?.meta?.totalItems : 0}
                                    rowsPerPage={rowsPerPage}
                                    editable={true}
                                />
                            </Card>
                            <Divider />
                        </Card>
                    </Container>
                </Box>
            </DashboardLayout>
        </AuthGuard>
    );
};

export default NotificationList;
