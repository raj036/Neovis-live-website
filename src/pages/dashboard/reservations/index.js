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
import { ReservationFilter } from "../../../components/dashboard/reservation/reservation-list-filters";
import { addDays, format, setDate } from "date-fns";
import { ReservationTable } from "../../../components/dashboard/reservation/reservation-list-table";
import { managerLogin, getUser } from "../../../utils/helper";

const ReservationList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchText, setSearchText] = useState("");
    const [search, setSearch] = useState("");
    const [taskId, setTaskId] = useState();
    const [selProperty, setSelProprty] = useState();
    const [isUnplanned, setIsUnplanned] = useState(true);

    const [reservationFilter, setReservationFilter] = useState({
        location: "",
        property_id: "",
        unit_id: "",
        status: "",
    });
    const [isTaskRefresh, setIsTaskRefresh] = useState(false);
    const [startDate, setStartDate] = useState({
        from: null,
        to: null
    });
    const [endDate, setEndDate] = useState({
        from: null,
        to: null
    });
    const [dateFilter, setDateFilter] = useState({
        arrivalDateFilter: null,
        departureDateFilter: null
    });
    const isManager = managerLogin();
    const user = getUser();
    const customInstance = useAxios();
    const router = useRouter();
    const isVendor = user?.user_role?.role === "Vendor";
    const isOwner = user?.user_role?.role === "Owner";

    const { data: ownerData, isLoading: ownerLoading, isFetching: ownerFetching } = useQuery(
        ["ownerByuserId", user?.id],
        () => customInstance.get(`owner/findbyuser/${user?.id}`),
        { enabled: user?.id !== undefined && isOwner }
    );

    const { data, refetch, isLoading, isFetching } = useQuery(
        "allReservatios",
        () =>
            customInstance.get(
                `reservations?limit=${rowsPerPage}&page=${page + 1}&search=${searchText}&filter.is_planed=$in:${isUnplanned ? 0 : 1}&filter.is_hostaway=$in:${isOwner ? 1 : 1}&filter.location=${reservationFilter.location}&filter.status=${reservationFilter.status}&filter.property_id=${reservationFilter.property_id}&filter.unit_id=${reservationFilter.unit_id}&filter.arrivalDate=${dateFilter.arrivalDateFilter ?? ""}&filter.departureDate=${dateFilter.departureDateFilter ?? ""}
                `
            ),
    );

    useEffect(() => {
        if (startDate.to) {
            const startDateFilter =
                `$btw:${dayjs(startDate.from).format('YYYY-MM-DD')},${dayjs(startDate.to).format('YYYY-MM-DD')}`;
            setDateFilter(prevState => {
                return { ...prevState, arrivalDateFilter: startDateFilter }
            });
        } else {
            setDateFilter(prevState => {
                return { ...prevState, arrivalDateFilter: null }
            });
        }

        if (endDate.to) {
            const endDateFilter =
                `$btw:${dayjs(endDate.from).format('YYYY-MM-DD')},${dayjs(endDate.to).format('YYYY-MM-DD')}`;
            setDateFilter(prevState => {
                return { ...prevState, departureDateFilter: endDateFilter }
            });
        } else {
            setDateFilter(prevState => {
                return { ...prevState, departureDateFilter: null }
            });
        }

    }, [startDate.to, endDate.to])

    const handleSearchChange = (event) => {
        event.preventDefault();
        setSearchText(search);
    };

    const handleFiltersChange = (filterSelection) => {
        let filter = {
            property_id: "",
            unit_id: "",
            status: "",
            location: ""
        };

        if (filterSelection?.property_id?.length > 0) {
            filter.property_id = `$in:${filterSelection.property_id?.join(",")}`;
        }

        if (filterSelection?.unit_id?.length > 0) {
            filter.unit_id = `$in:${filterSelection.unit_id?.join(",")}`;
        }

        if (filterSelection?.location?.length > 0) {
            filter.location = `$in:${filterSelection.location?.join(",")}`;
        }

        if (filterSelection?.status?.length > 0) {
            filter.status = `${filterSelection.status?.join(",")}`;
        }

        setReservationFilter(filter);
    };

    const checkBoxHandler = () => {
        setIsUnplanned(prevVal => !prevVal)
    }

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
        setIsTaskRefresh(true);
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowsPerPage, page, reservationFilter, searchText, dateFilter, selProperty, isUnplanned, refetch]);

    return (
        <AuthGuard>
            <DashboardLayout
                isLoading={
                    isLoading || isFetching
                }
            >
                <Head>
                    <title>Dashboard: Reservations</title>
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
                                <Grid item xs={12} md={1}>
                                    <Typography variant="h4">Reservations</Typography>
                                </Grid>

                            </Grid>
                        </Box>
                        <Card>
                            <Card>
                                <ReservationFilter
                                    name={[]}
                                    location={[]}
                                    onChange={handleFiltersChange}
                                    handleSearchChange={handleSearchChange}
                                    setSearch={setSearch}
                                    startDate={startDate}
                                    endDate={endDate}
                                    setStartDate={setStartDate}
                                    setEndDate={setEndDate}
                                    handleIsPlanned={checkBoxHandler}
                                    checked={isUnplanned}
                                    isOwner={isOwner}
                                    ownerData={ownerData?.data}
                                />
                                <ReservationTable
                                    onPageChange={handlePageChange}
                                    onRowsPerPageChange={handleRowsPerPageChange}
                                    page={page}
                                    reservations={data ? data?.data?.data : []}
                                    reservationsCount={data ? data?.data?.meta?.totalItems : 0}
                                    rowsPerPage={rowsPerPage}
                                    editable={true}
                                    isManager={isManager}
                                    isVendor={isVendor}
                                    isOwner={isOwner}
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

export default ReservationList;
