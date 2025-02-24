import { useEffect, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { Box, Button, Card, Container, Grid, Typography, Input, Divider } from "@mui/material";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
// import { PropertyListFilters } from "../../../components/dashboard/property/property-list-filters";
// import { PropertyListTable } from "../../../components/dashboard/property/property-list-table";
import { Plus as PlusIcon } from "../../../icons/plus";
import { Search as SearchIcon } from "../../../icons/search";
import { gtm } from "../../../lib/gtm";
import useAxios from "../../../services/useAxios";
import { TemplateListTable } from "../../../components/dashboard/template/template-list-table";

const TemplateList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchText, setSearchText] = useState("");
    const [search, setSearch] = useState("");
    const [catFilters, setCatFilters] = useState("");
    const [staFilters, setStaFilters] = useState("");

    const customInstance = useAxios();

    const { data, refetch, isLoading, isFetching } = useQuery("allTemplate", () =>
        customInstance.get(
            `task-templates?limit=${rowsPerPage}&page=${page + 1
            }&search=${searchText}&filter.status=${staFilters}`
        )
    );
    console.log('template data', data)
    const handleSearchChange = (event) => {
        event.preventDefault();
        setSearchText(search);
    };

    const handleFiltersChange = (filterSelection) => {
        if (filterSelection?.category?.length > 0) {
            setCatFilters(`$in:${filterSelection.category?.join(",")}`);
        } else {
            setCatFilters("");
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
    }, [rowsPerPage, page, catFilters, staFilters, searchText, refetch]);

    return (
        <AuthGuard>
            <DashboardLayout isLoading={isLoading || isFetching}>
                <Head>
                    <title>Dashboard: Template List</title>
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
                                    <Typography variant="h4">Templates</Typography>
                                </Grid>
                                <Grid item>
                                    <NextLink
                                        href="/dashboard/templates/newtemplate/add"
                                        passHref
                                    >
                                        <Button
                                            component="a"
                                            startIcon={<PlusIcon fontSize="small" />}
                                            variant="contained"
                                        >
                                            Add
                                        </Button>
                                    </NextLink>
                                </Grid>
                            </Grid>
                        </Box>
                        <Card>
                            <Box
                                sx={{
                                    alignItems: "center",
                                    display: "flex",
                                    flexWrap: "wrap",
                                    m: -1.5,
                                    p: 1,
                                }}
                            >
                                <SearchIcon fontSize="small" sx={{ ml: 2 }} />
                                <Box
                                    component="form"
                                    onSubmit={handleSearchChange}
                                    sx={{
                                        flexGrow: 1,
                                        m: 1.5,
                                    }}
                                >
                                    <Input
                                        disableUnderline
                                        fullWidth
                                        onChange={(e) => setSearch(e.currentTarget.value)}
                                        placeholder="Search templates"
                                    />
                                </Box>
                            </Box>
                            <Divider sx={{ mb: 1 }} />
                            <TemplateListTable
                                onPageChange={handlePageChange}
                                onRowsPerPageChange={handleRowsPerPageChange}
                                page={page}
                                templates={data ? data?.data?.data : []}
                                templatesCount={data ? data?.data?.meta?.totalItems : 0}
                                rowsPerPage={rowsPerPage}
                            />
                        </Card>
                    </Container>
                </Box>
            </DashboardLayout>
        </AuthGuard>
    );
};

export default TemplateList;
