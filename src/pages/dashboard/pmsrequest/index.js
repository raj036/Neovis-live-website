import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
    Autocomplete,
    Box,
    Button,
    Card,
    Container,
    Divider,
    Grid,
    TextField,
    Typography,
} from "@mui/material";
import * as dayjs from "dayjs"
import { useQuery } from "react-query";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { gtm } from "../../../lib/gtm";
import useAxios from "../../../services/useAxios";
import { PmsrequestFilter } from "../../../components/dashboard/pmsrequest/pmsrequest-list-filters";
import { addDays, format } from "date-fns";
import { PmsrequstTable } from "../../../components/dashboard/pmsrequest/pmrequest-list-table";
import { managerLogin, getUser } from "../../../utils/helper";

const AllPmsRequest = () => {
    const [searchText, setSearchText] = useState("");
    const [search, setSearch] = useState("");

    const [startDate, setStartDate] = useState(dayjs());
    const [endDate, setEndDate] = useState(dayjs());


    const handleSearchChange = (event) => {
        event.preventDefault();
        setSearchText(search);
    };

    const handleFiltersChange = (filterSelection) => {
        let filter = {
            name: "",
            dueby: "",
            status: "",
        };
        if (filterSelection?.name?.length > 0) {
            filter.name = `$in:${filterSelection.name?.join(",")}`;
        }
        if (filterSelection?.location?.length > 0) {
            filter.location = `$in:${filterSelection.location?.join(",")}`;
        }

        if (filterSelection?.status?.length > 0) {
            filter.status = `$in:${filterSelection.status?.join(",")}`;
        }
        if (filterSelection?.dueby?.length > 0) {
            let start_date = format(new Date(), "yyyy-MM-dd");
            let end_date = format(new Date(), "yyyy-MM-dd");

            if (filterSelection?.dueby?.includes("1")) {
                end_date = format(addDays(new Date(), 1), "yyyy-MM-dd");
            }
            if (filterSelection?.dueby?.includes("7")) {
                let curr = new Date(); // get current date
                let first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
                let last = first + 6; // last day is the first day + 6
                var lastday = new Date(curr.setDate(last));

                end_date = format(lastday, "yyyy-MM-dd");
            }
            filter.dueby = `$btw:${start_date},${end_date}`;
        }

        setReservationFilter(filter);
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


    return (
        <AuthGuard>
            <DashboardLayout
            >
                <Head>
                    <title>Dashboard: All Pms Request</title>
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
                            <Grid
                                container
                                spacing={3}
                                justifyContent="flex-start"
                                alignItems="center"
                            >
                                <Box ml={4}>
                                <Typography variant="h4">All PMS Request</Typography>
                                </Box>

                            </Grid>
                        </Box>
                        <Card>
                            <Card>
                                <PmsrequestFilter
                                    name={[]}
                                    location={[]}
                                    onChange={handleFiltersChange}
                                    handleSearchChange={handleSearchChange}
                                    setSearch={setSearch}
                                    startDate={startDate}
                                    endDate={endDate}
                                    setStartDate={setStartDate}
                                    setEndDate={setEndDate}
                                />
                                <PmsrequstTable />
                            </Card>
                            <Divider />
                        </Card>
                    </Container>
                </Box>
            </DashboardLayout>
        </AuthGuard>
    );
};

export default AllPmsRequest;
