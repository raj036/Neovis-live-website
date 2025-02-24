import { useEffect, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { Box, Button, Card, Container, Grid, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { PropertyListFilters } from "../../../components/dashboard/property/property-list-filters";
import { PropertyListTable } from "../../../components/dashboard/property/property-list-table";
import { Plus as PlusIcon } from "../../../icons/plus";
import { gtm } from "../../../lib/gtm";
import useAxios from "../../../services/useAxios";

const PropertyList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [catFilters, setCatFilters] = useState("");
  const [staFilters, setStaFilters] = useState("");

  const customInstance = useAxios();

  const { data, refetch, isLoading, isFetching } = useQuery("allProperty", () =>
    customInstance.get(
      `properties?limit=${rowsPerPage}&page=${
        page + 1
      }&search=${searchText}&filter.property_type=${catFilters}&filter.status=${staFilters}`
    )
  );

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
          <title>Dashboard: Property List</title>
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
                  <Typography variant="h4">Properties</Typography>
                </Grid>
                <Grid item>
                  <NextLink
                    href="/dashboard/properties/newproperty/add"
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
              <PropertyListFilters
                onChange={handleFiltersChange}
                handleSearchChange={handleSearchChange}
                setSearch={setSearch}
              />
              <PropertyListTable
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                page={page}
                properties={data ? data?.data?.data : []}
                propertiesCount={data ? data?.data?.meta?.totalItems : 0}
                rowsPerPage={rowsPerPage}
              />
            </Card>
          </Container>
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
};

export default PropertyList;
