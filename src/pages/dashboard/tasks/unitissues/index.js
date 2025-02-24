import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Autocomplete,
  Box,
  Card,
  Container,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { gtm } from "../../../../lib/gtm";
import useAxios from "../../../../services/useAxios";
import { UnitIssueListTable } from "../../../../components/dashboard/task/unitissues/unitissue-list-table";
import { UnitIssueListFilter } from "../../../../components/dashboard/task/unitissues/unitissue-list-filters";

const UnitIssueList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selProperty, setSelProprty] = useState();
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [issueFilter, setIssueFilter] = useState({
    unit: "",
    unittype: "",
    unitarea: "",
    issuetype: "",
    element: "",
    status: "",
  });

  const router = useRouter();

  const customInstance = useAxios();

  const { data: properties } = useQuery("allProperty", () =>
    customInstance.get(`properties`)
  );

  const { data: unittypes, refetch: unitTypesRefetch } = useQuery(
    "propertyUnitTypes",
    () => customInstance.get(`unit-types/property/${selProperty?.id}`),
    { enabled: selProperty?.id !== undefined }
  );

  const { data: units, refetch: unitsRefetch } = useQuery(
    "propertyUnits",
    () =>
      customInstance.get(
        `units/unit-type-or-property?property_id=${selProperty?.id}`
      ),
    { enabled: selProperty?.id !== undefined }
  );

  const { data: unitareas, refetch: unitAreaRefetch } = useQuery(
    "propertyUnitAreas",
    () =>
      customInstance.get(
        `unit-areas/unit-type-or-property?property_id=${selProperty?.id}`
      ),
    { enabled: selProperty?.id !== undefined }
  );

  const { data: issuetypes, refetch: issueTypeRefetch } = useQuery(
    "propertyIssueTypes",
    () =>
      customInstance.get(
        `issue-types?filter.property_id=$in:${selProperty?.id}`
      ),
    { enabled: selProperty?.id !== undefined }
  );

  const { data: elements } = useQuery("allElements", () =>
    customInstance.get(`elements`)
  );

  const { data, refetch, isLoading, isFetching } = useQuery(
    "allUnitIssues",
    () =>
      customInstance.get(
        `unit-issues?limit=${rowsPerPage}&page=${
          page + 1
        }&search=${searchText}&filter.property_id=$in:${
          selProperty?.id
        }&filter.element_id=${issueFilter.element}&filter.unit_id=${
          issueFilter.unit
        }&filter.unit_type_id=${issueFilter.unittype}&filter.unit_area_id=${
          issueFilter.unitarea
        }&filter.issue_type_id=${issueFilter.issuetype}&filter.status=${
          issueFilter.status
        }`
      ),
    {
      enabled: selProperty?.id !== undefined,
    }
  );

  const handleSearchChange = (event) => {
    event.preventDefault();
    setSearchText(search);
  };

  const handleFiltersChange = (filterSelection) => {
    let filter = {
      unit: "",
      unittype: "",
      unitarea: "",
      issuetype: "",
      element: "",
      status: "",
    };
    if (filterSelection?.element?.length > 0) {
      filter.element = `$in:${filterSelection.element?.join(",")}`;
    }
    if (filterSelection?.unit?.length > 0) {
      filter.unit = `$in:${filterSelection.unit?.join(",")}`;
    }
    if (filterSelection?.unittype?.length > 0) {
      filter.unittype = `$in:${filterSelection.unittype?.join(",")}`;
    }
    if (filterSelection?.unitarea?.length > 0) {
      filter.unitarea = `$in:${filterSelection.unitarea?.join(",")}`;
    }
    if (filterSelection?.issuetype?.length > 0) {
      filter.issuetype = `$in:${filterSelection.issuetype?.join(",")}`;
    }
    if (filterSelection?.status?.length > 0) {
      filter.status = `$in:${filterSelection.status?.join(",")}`;
    }
    setIssueFilter(filter);
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
    if (selProperty?.id) {
      unitsRefetch();
      unitTypesRefetch();
      unitAreaRefetch();
      issueTypeRefetch();
    }
  }, [
    selProperty,
    unitsRefetch,
    unitTypesRefetch,
    unitAreaRefetch,
    issueTypeRefetch,
  ]);

  useEffect(() => {
    if (properties?.data?.data) {
      setSelProprty(properties?.data?.data[0]);
    }
  }, [properties]);

  useEffect(() => {
    if (selProperty?.id) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowsPerPage, page, selProperty, issueFilter, searchText, refetch]);

  return (
    <AuthGuard>
      <DashboardLayout isLoading={isLoading || isFetching}>
        <Head>
          <title>Dashboard: Unit Issues</title>
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
                <Grid item xs={12} md={5}>
                  <Typography variant="h4">Unit Issues</Typography>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Autocomplete
                    options={properties?.data?.data ?? []}
                    getOptionLabel={(option) =>
                      option.property_name ? option.property_name : ""
                    }
                    sx={{ pl: 5 }}
                    fullWidth
                    disableClearable
                    value={
                      selProperty && properties
                        ? properties?.data?.data?.find(
                            (_) => _.id === selProperty?.id
                          )
                        : ""
                    }
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label="Select Property"
                        placeholder="Select Property"
                      />
                    )}
                    onChange={(event, newValue) => setSelProprty(newValue)}
                  />
                </Grid>
              </Grid>
            </Box>
            <Card>
              <Card>
                <UnitIssueListFilter
                  units={units?.data || []}
                  unittypes={unittypes?.data || []}
                  unitareas={unitareas?.data || []}
                  issuetypes={issuetypes?.data?.data || []}
                  elements={elements?.data?.data || []}
                  onChange={handleFiltersChange}
                  handleSearchChange={handleSearchChange}
                  setSearch={setSearch}
                />
                <UnitIssueListTable
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  page={page}
                  unitIssues={data ? data?.data?.data : []}
                  unitsIssueCount={data ? data?.data?.meta?.totalItems : 0}
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

export default UnitIssueList;
