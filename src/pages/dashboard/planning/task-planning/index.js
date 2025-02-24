import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Container,
  Box,
  Grid,
  Typography,
  Button,
  Card,
  Divider
} from "@mui/material";

import NextLink from "next/link";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { Plus as PlusIcon } from "../../../../icons/plus";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { gtm } from "../../../../lib/gtm";
import { managerLogin } from "../../../../utils/helper";
import useAxios from "../../../../services/useAxios";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import { TaskPlanningListFilter } from "../../../../components/dashboard/task/task-planning/task-planning-list-filter";
import { TaskPlanningListTable } from "../../../../components/dashboard/task/task-planning/task-planning-list-table";


const TaskPlanning = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [propFilters, setPropFilters] = useState("");
  const [unitTypeFilters, setUnitTypeFilters] = useState("");
  const [unitFilters, setUnitFilters] = useState("")
  const [unitGroupFilters, setUnitGroupFilters] = useState("");
  const [taskConfigFilters, setTaskConfigFilters] = useState("");
  const [statusFilters, setStatusFilters] = useState("");

  const [propertyId, setPropertyId] = useState()

  const customInstance = useAxios();
  const router = useRouter();

  const { data: properties } = useQuery("allProperty", () =>
    customInstance.get(`properties`)
  );

  const { data: unittypes, refetch: unitTypeRefetch } = useQuery("allUnitType", () =>
    customInstance.get(`unit-types/property/${propertyId}`),
    { enabled: propertyId !== undefined }
  );

  const { data: units, refetch: unitRefetch } = useQuery("allUnits", () =>
    customInstance.get(`units/unit-type-or-property?property_id=${propertyId}`),
    { enabled: propertyId !== undefined }
  );

  const { data: unitgroup, refetch: unitGroupRefetch } = useQuery(
    "unitsGroups",
    () => customInstance.get(`properties/${propertyId}`),
    { enabled: propertyId !== undefined }
  );

  const { data: taskConfig, refetch: taskConfigRefetch } = useQuery(
    "taskConfig",
    () => customInstance.get(`task-rule?filter.property_id=$in:${propertyId}`),
    { enabled: propertyId !== undefined }
  );

  const { data, refetch, isLoading, isFetching } = useQuery("allTaskPlanning", () =>
    customInstance.get(`task-planning?limit=${rowsPerPage}&page=${page + 1}&search=${searchText}&filter.property_id=${propFilters}
    &filter.unit_type_ids=${unitTypeFilters}&filter.unit_ids=${unitFilters}&filter.unit_group_ids=${unitGroupFilters}&filter.status=${statusFilters}`)
  );

  const handleSearchChange = (event) => {
    event.preventDefault();
    setSearchText(search);
  };

  const handleFiltersChange = (filterSelection) => {
    if (filterSelection?.property?.length > 0) {
      setPropertyId(filterSelection?.property[0])
      setPropFilters(`$in:${filterSelection.property?.join(",")}`);
    } else {
      setPropFilters("");
    }
    if (filterSelection?.unittype?.length > 0) {
      setUnitTypeFilters(`$in:${filterSelection.unittype?.join(",")}`);
    } else {
      setUnitTypeFilters("");
    }
    if (filterSelection?.units?.length > 0) {
      setUnitFilters(`$in:${filterSelection.units?.join(",")}`);
    } else {
      setUnitFilters("");
    }
    if (filterSelection?.unitgroup?.length > 0) {
      setUnitGroupFilters(`$in:${filterSelection.unitgroup?.join(",")}`);
    } else {
      setUnitGroupFilters("");
    }
    if (filterSelection?.taskConfig?.length > 0) {
      setTaskConfigFilters(`$in:${filterSelection.taskConfig?.join(",")}`);
    } else {
      setTaskConfigFilters("");
    }
    if (filterSelection?.status?.length > 0) {
      setStatusFilters(`$in:${filterSelection.status?.join(",")}`);
    } else {
      setStatusFilters("");
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
    unitFilters,
    statusFilters,
    taskConfigFilters,
    unitGroupFilters,
    searchText,
    refetch,

  ]);

  useEffect(() => {
    if (propertyId !== undefined) {
      unitRefetch()
      unitTypeRefetch()
      unitGroupRefetch()
      taskConfigRefetch()
    }
  }, [propertyId])

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);


  return (
    <AuthGuard>
      <DashboardLayout>
        <Head>
          <title>Dashboard: Task Planning</title>
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
                  <Typography variant="h4">Task Planning</Typography>
                </Grid>
                <Grid item>
                  <NextLink
                    href="/dashboard/planning/task-planning/newplannig/add"
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
              <Card>
                <TaskPlanningListFilter
                  properties={properties?.data?.data || []}
                  unittypes={unittypes?.data || []}
                  units={units?.data || []}
                  unitgroup={unitgroup?.data?.unit_groups || []}
                  taskConfig={taskConfig?.data?.data || []}
                  onChange={handleFiltersChange}
                  handleSearchChange={handleSearchChange}
                  setSearch={setSearch}
                  propertyId={propertyId}

                />
                <TaskPlanningListTable
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  page={page}
                  taskPlanning={data ? data?.data?.data : []}
                  taskPlanningCount={data ? data?.data?.meta?.totalItems : 0}
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

export default TaskPlanning;