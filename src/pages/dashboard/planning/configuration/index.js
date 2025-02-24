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
import { Plus as PlusIcon } from "../../../../icons/plus";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { gtm } from "../../../../lib/gtm";
import useAxios from "../../../../services/useAxios";
import { useQuery } from "react-query";
import { TaskConfigurationListFilter } from "../../../../components/dashboard/task/configuration/task-configuration-list-filters";
import { TaskConfigurationListTable } from "../../../../components/dashboard/task/configuration/task-configuration-table";
import { useRouter } from "next/router";


const TaskConfiguration = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [propFilters, setPropFilters] = useState("");
  const [taskTypeFilters, setTaskTypeFilters] = useState("");
  const [unitGroupFilters, setUnitGroupFilters] = useState("");
  const [priorityFilters, setPriorityFilters] = useState("");
  const [executionMomentFilters, setExecutionMomentFilters] = useState("");

  const customInstance = useAxios();
  const router = useRouter();

  const { data: configs, refetch, isLoading, isFetching } = useQuery(
    "allConfigs",
    () =>
      customInstance.get(
        `task-rule?limit=${rowsPerPage}&page=${page + 1}&search=${searchText}&filter.property_id=${propFilters}&filter.execution_moment=${executionMomentFilters}&filter.priority=${priorityFilters}&filter.task_type=${taskTypeFilters}&filter.unit_groups=${unitGroupFilters}`
      ),
  );

  const { data: properties } = useQuery("allProperty", () =>
    customInstance.get(`properties`)
  );

  const { data: unitgroup } = useQuery("allUnitGroup", () =>
    customInstance.get(`unit-group`)
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
    if (filterSelection?.tasktype?.length > 0) {
      setTaskTypeFilters(`$in:${filterSelection.tasktype?.join(",")}`);
    } else {
      setTaskTypeFilters("");
    }
    if (filterSelection?.unit_group?.length > 0) {
      setUnitGroupFilters(`$in:${filterSelection.unit_group?.join(",")}`);
    } else {
      setUnitGroupFilters("");
    }
    if (filterSelection?.priority?.length > 0) {
      setPriorityFilters(`$in:${filterSelection.priority?.join(",")}`);
    } else {
      setPriorityFilters("");
    }
    if (filterSelection?.exec_moment?.length > 0) {
      setExecutionMomentFilters(`$in:${filterSelection.exec_moment?.join(",")}`);
    } else {
      setExecutionMomentFilters("");
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
    propFilters,
    priorityFilters,
    taskTypeFilters,
    unitGroupFilters,
    executionMomentFilters,
    searchText,
    refetch,
  ]);

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);


  return (
    <AuthGuard>
      <DashboardLayout
        isLoading={isFetching || isLoading}
      >
        <Head>
          <title>Dashboard: Task Configurations</title>
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
                  <Typography variant="h4">Task Configurations</Typography>
                </Grid>
                <Grid item>
                  <NextLink
                    href="/dashboard/planning/configuration/newconfig/add"
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
                <TaskConfigurationListFilter
                  properties={properties?.data?.data || []}
                  unitgroup={unitgroup?.data?.data || []}
                  onChange={handleFiltersChange}
                  handleSearchChange={handleSearchChange}
                  setSearch={setSearch}
                />
                <TaskConfigurationListTable
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  page={page}
                  configs={configs?.data?.data || []}
                  totalCount={configs?.data?.meta.totalItems}
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

export default TaskConfiguration;
