import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Input,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "react-query";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { UserListTable } from "../../../components/dashboard/user/user-list-table";
import { Plus as PlusIcon } from "../../../icons/plus";
import { Search as SearchIcon } from "../../../icons/search";
import { gtm } from "../../../lib/gtm";
import useAxios from "../../../services/useAxios";
import toast from "react-hot-toast";

const sortOptions = [
  {
    label: "Last update (newest)",
    value: "updated_at:DESC",
  },
  {
    label: "Last update (oldest)",
    value: "updated_at:ASC",
  },
];

const UserList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sort, setSort] = useState(sortOptions[0].value);
  const [search, setSearch] = useState("");
  const [filters, setFilter] = useState("");
  const [isChecked, setIsChecked] = useState(false)

  const router = useRouter();
  const customInstance = useAxios();

  let user = localStorage.getItem('vInspection-user')
  if (user) {
    user = JSON.parse(user)?.user
    // setIsChecked(user?.is_team_unique_member)
  }
  console.log('user', user);

  const { data, refetch, isLoading, isFetching } = useQuery("allUser", () =>
    customInstance.get(
      `users/owner?limit=${rowsPerPage}&page=${page + 1
      }&search=${filters}&sortBy=${sort}`
    )
  );

  const { data: userData, refetch: userRefetch } = useQuery(
    ["userById", user?.id],
    () => customInstance.get(`users/${user?.id}`)
  );


  const { mutateAsync: updateUser, error } = useMutation((data) =>
    customInstance.patch(`users/${user?.id}`, data)
  );
  useEffect(() => {
    if (error) {
      const errMsg = error.response.data.message;
      toast.error(errMsg ?? "Something went wrong!");
    }
    if (userData !== undefined) {
      console.log('sds', userData.data);
      setIsChecked(userData.data?.is_team_unique_member)
    }
  }, [error, userData])

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  useEffect(() => {
    refetch();
  }, [rowsPerPage, page, filters, sort, refetch]);

  const handleSearchChange = (event) => {
    event.preventDefault();
    setFilter(search);
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  return (
    <AuthGuard>
      <DashboardLayout isLoading={isLoading || isFetching}>
        <Head>
          <title>Dashboard: Owners</title>
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
                  <Typography variant="h4">Owners</Typography>
                </Grid>
                <Grid item>
                  <Button
                    startIcon={<PlusIcon fontSize="small" />}
                    variant="contained"
                    onClick={() =>
                      router.push(`/dashboard/owner/registerUser/add`)
                    }
                  >
                    Add
                  </Button>
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
                    placeholder="Search users"
                  />
                </Box>
                <TextField
                  label="Sort By"
                  name="sort"
                  onChange={handleSortChange}
                  select
                  SelectProps={{ native: true }}
                  sx={{ m: 1.5 }}
                  value={sort}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </TextField>
              </Box>
              <Divider sx={{ mb: 1 }} />
              <UserListTable
                users={data ? data?.data?.data : []}
                usersCount={data ? data?.data?.meta?.totalItems : 0}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPage={rowsPerPage}
                page={page}
                refreshTable={() => refetch()}
              />
            </Card>
          </Container>
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
};

export default UserList;
