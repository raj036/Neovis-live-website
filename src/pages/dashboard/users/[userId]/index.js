import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NextLink from "next/link";
import Head from "next/head";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { UserBasicDetails } from "../../../../components/dashboard/user/user-basic-details";
import { PencilAlt as PencilAltIcon } from "../../../../icons/pencil-alt";
import { gtm } from "../../../../lib/gtm";
import useAxios from "../../../../services/useAxios";
import { BackButton } from "../../../../components/dashboard/back-button";

const CustomerDetails = () => {
  const [userId, setUserId] = useState();

  const router = useRouter();
  const customInstance = useAxios();

  const { data, isLoading, isFetching } = useQuery(
    ["userById", userId],
    () => customInstance.get(`users/${userId}`),
    { enabled: userId !== undefined }
  );

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  useEffect(() => {
    if (router) {
      setUserId(router.query.userId);
    }
  }, [router]);

  if (!data) {
    return null;
  }

  return (
    <AuthGuard>
      <DashboardLayout isLoading={isLoading || isFetching}>
        <Head>
          <title>Dashboard: User</title>
        </Head>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 8,
          }}
        >
          <Container maxWidth="md">
            <div>
              <BackButton path="/dashboard/users" title="Users" />
              <Grid container justifyContent="space-between" spacing={3}>
                <Grid
                  item
                  sx={{
                    alignItems: "center",
                    display: "flex",
                    overflow: "hidden",
                  }}
                >
                  <Avatar
                    src={data?.data?.image}
                    sx={{
                      height: 64,
                      mr: 2,
                      width: 64,
                    }}
                  >
                    {data?.data?.first_name.charAt(0) +
                      data?.data?.last_name.charAt(0)}
                  </Avatar>
                  <div>
                    <Typography variant="h4">
                      {data?.data?.first_name + " " + data?.data?.last_name}
                    </Typography>
                    <Chip label={data?.data?.email} size="small" />
                  </div>
                </Grid>
                <Grid item sx={{ m: -1 }}>
                  <NextLink href={`/dashboard/users/${userId}/edit`} passHref>
                    <Button
                      component="a"
                      endIcon={<PencilAltIcon fontSize="small" />}
                      sx={{ m: 1 }}
                      variant="outlined"
                    >
                      Edit
                    </Button>
                  </NextLink>
                </Grid>
              </Grid>
            </div>
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <UserBasicDetails {...data?.data} />
                </Grid>
              </Grid>
            </Box>
          </Container>
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
};

export default CustomerDetails;
