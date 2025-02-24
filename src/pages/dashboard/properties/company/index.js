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
import { UnitareaListTable } from "../../../../components/dashboard/property/unitareas/unitarea-list-table";
import { UnitareaListFilter } from "../../../../components/dashboard/property/unitareas/unitarea-list-filters";
import { CompanyListTable } from "../../../../components/dashboard/property/company/company-list-table";
import { CompanyListFilter } from "../../../../components/dashboard/property/company/company-list-filters";

const CompanyList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchText, setSearchText] = useState("");
    const [search, setSearch] = useState("");
    const [propFilters, setPropFilters] = useState("");
    const [unitTypeFilters, setUnitTypeFilters] = useState("");
    const [typeFilters, setTypeFilters] = useState("");
    const [staFilters, setStaFilters] = useState("");

    const router = useRouter();

    const customInstance = useAxios();

    const { data: properties } = useQuery("allProperty", () =>
        customInstance.get(`properties`)
    );

    const { data, refetch, isLoading, isFetching } = useQuery("allCompany", () =>
        customInstance.get(
            `company?limit=${rowsPerPage}&page=${page + 1
            }&search=${searchText}&filter.status=${staFilters}`
            // &filter.property_id=${propFilters}&filter.unit_type_id=${unitTypeFilters}&filter.area_type=${typeFilters}&`
        )
    );

    const handleSearchChange = (event) => {
        event.preventDefault();
        setSearchText(search);
    };

    const handleFiltersChange = (filterSelection) => {
        if (filterSelection?.property?.length > 0) {
            setPropFilters(`$in:${filterSelection.property?.join(",")}`);
        } else {
            setPropFilters("");
        }
        if (filterSelection?.unittype?.length > 0) {
            setUnitTypeFilters(`$in:${filterSelection.unittype?.join(",")}`);
        } else {
            setUnitTypeFilters("");
        }
        if (filterSelection?.type?.length > 0) {
            setTypeFilters(`$in:${filterSelection.type?.join(",")}`);
        } else {
            setTypeFilters("");
        }
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
    }, [
        rowsPerPage,
        page,
        propFilters,
        unitTypeFilters,
        staFilters,
        typeFilters,
        searchText,
        refetch,
    ]);

    return (
        <AuthGuard>
            <DashboardLayout isLoading={isLoading || isFetching}>
                <Head>
                    <title>Dashboard: Company</title>
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
                                    <Typography variant="h4">Companies</Typography>
                                </Grid>
                                <Grid item>
                                    <Button
                                        component="a"
                                        startIcon={<PlusIcon fontSize="small" />}
                                        variant="contained"
                                        onClick={() =>
                                            router.push(
                                                "/dashboard/properties/company/newcompany/add"
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
                                <CompanyListFilter
                                    properties={properties?.data?.data || []}
                                    onChange={handleFiltersChange}
                                    handleSearchChange={handleSearchChange}
                                    setSearch={setSearch}
                                />
                                <CompanyListTable
                                    onPageChange={handlePageChange}
                                    onRowsPerPageChange={handleRowsPerPageChange}
                                    page={page}
                                    companyes={data ? data?.data?.data : []}
                                    companyesCount={data ? data?.data?.meta?.totalItems : 0}
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

export default CompanyList;
