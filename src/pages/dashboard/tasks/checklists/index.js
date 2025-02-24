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
import { ChecklistTable } from "../../../../components/dashboard/task/checklist/checklist-list-table";
import { ChecklistFilter } from "../../../../components/dashboard/task/checklist/checklist-list-filters";

const TaskChecklist = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [areaFilters, setAreaFilters] = useState("");
  const [taskTypeFilters, setTaskTypeFilters] = useState("");
  const [staFilters, setStaFilters] = useState("");

  const router = useRouter();

  const customInstance = useAxios();

  const { data, refetch, isLoading, isFetching } = useQuery(
    "allTaskChecklist",
    () =>
      customInstance.get(
        `task-checklists?limit=${rowsPerPage}&page=${
          page + 1
        }&search=${searchText}&filter.area_type=${areaFilters}&filter.task_type=${taskTypeFilters}&filter.status=${staFilters}`
      )
  );

  const handleSearchChange = (event) => {
    event.preventDefault();
    setSearchText(search);
  };

  const handleFiltersChange = (filterSelection) => {
    if (filterSelection?.areatype?.length > 0) {
      setAreaFilters(`$in:${filterSelection.areatype?.join(",")}`);
    } else {
      setAreaFilters("");
    }
    if (filterSelection?.tasktype?.length > 0) {
      setTaskTypeFilters(`$in:${filterSelection.tasktype?.join(",")}`);
    } else {
      setTaskTypeFilters("");
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
    areaFilters,
    taskTypeFilters,
    staFilters,
    searchText,
    refetch,
  ]);

  return (
    <AuthGuard>
      <DashboardLayout isLoading={isLoading || isFetching}>
        <Head>
          <title>Dashboard: Checklist</title>
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
                  <Typography variant="h4">Checklist</Typography>
                </Grid>
                <Grid item>
                  <Button
                    component="a"
                    startIcon={<PlusIcon fontSize="small" />}
                    variant="contained"
                    onClick={() =>
                      router.push(
                        "/dashboard/tasks/checklists/newtaskchecklist/add"
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
                <ChecklistFilter
                  onChange={handleFiltersChange}
                  handleSearchChange={handleSearchChange}
                  setSearch={setSearch}
                />
                <ChecklistTable
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  page={page}
                  checklists={data ? data?.data?.data : []}
                  checklistsCount={data ? data?.data?.meta?.totalItems : 0}
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

export default TaskChecklist;
