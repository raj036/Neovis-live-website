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
import { UnitListTable } from "../../../../components/dashboard/property/units/unit-list-table";
import { UnitListFilter } from "../../../../components/dashboard/property/units/unit-list-filters";
import { managerLogin } from "../../../../utils/helper";
import UnitBulkUpload from "../../../../components/dashboard/property/units/bulk-upload";
const UnitList = () => {
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false)
  const isManager = managerLogin();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [propFilters, setPropFilters] = useState("");
  const [unitTypeFilters, setUnitTypeFilters] = useState("");
  const [conditionFilters, setConditionFilters] = useState("");
  const [staFilters, setStaFilters] = useState("");

  const router = useRouter();

  const customInstance = useAxios();

  const { data: properties } = useQuery("allProperty", () =>
    customInstance.get(`properties`)
  );

  const { data: unittypes } = useQuery("allUnitType", () =>
    customInstance.get(`unit-types`)
  );

  const { data, refetch, isLoading, isFetching, refetch: unitsRefetch } = useQuery("allUnit", () =>
    customInstance.get(
      `units?limit=${rowsPerPage}&page=${page + 1
      }&search=${searchText}&filter.property_id=${propFilters}&filter.unit_type_id=${unitTypeFilters}&filter.unit_condition=${conditionFilters}&filter.status=${staFilters}`
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
    if (filterSelection?.condition?.length > 0) {
      setConditionFilters(`$in:${filterSelection.condition?.join(",")}`);
    } else {
      setConditionFilters("");
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
    conditionFilters,
    searchText,
    refetch,
  ]);

  return (
    <AuthGuard>
      <DashboardLayout isLoading={isLoading || isFetching}>
        <Head>
          <title>Dashboard: Unit Types</title>
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
                display="flex"
                justifyContent="end"
                alignItems="center"
                spacing={1}>
                <Grid item md={6} lg={6}>
                  <Typography variant="h4">Units</Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={6} sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "5px"
                }}>
                  {isManager && (
                    <Button
                      component="a"
                      variant="contained"
                      onClick={() => {
                        setOpen(true)
                      }}
                    >
                      Bulk Upload
                    </Button>
                  )}
                    <Button
                    component="a"
                    startIcon={<PlusIcon fontSize="small" />}
                    variant="contained"
                    onClick={() =>
                      router.push("/dashboard/properties/units/newunit/add")
                    }
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Box>
            <Card>
              <Card>
                <UnitBulkUpload unitsRefetch={unitsRefetch} open={open}
                  setOpen={setOpen} />
                <UnitListFilter
                  properties={properties?.data?.data || []}
                  unittypes={unittypes?.data?.data || []}
                  onChange={handleFiltersChange}
                  handleSearchChange={handleSearchChange}
                  setSearch={setSearch}
                />
                <UnitListTable
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  page={page}
                  units={data ? data?.data?.data : []}
                  unitsCount={data ? data?.data?.meta?.totalItems : 0}
                  rowsPerPage={rowsPerPage}
                  editable={true}
                />
              </Card>
              <Divider />
            </Card>
          </Container>
        </Box>
      </DashboardLayout >
    </AuthGuard >
  );
};

export default UnitList;