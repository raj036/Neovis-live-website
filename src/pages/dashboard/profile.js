import { useEffect, useState } from "react";
import NextLink from "next/link";
import Head from "next/head";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Fab,
  Grid,
  Link,
  Typography,
} from "@mui/material";
import { AuthGuard } from "../../components/authentication/auth-guard";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { UserBasicDetails } from "../../components/dashboard/user/user-basic-details";
import { BackButton } from "../../components/dashboard/back-button";
import { PencilAlt as PencilAltIcon } from "../../icons/pencil-alt";
import { gtm } from "../../lib/gtm";
import { getUser, managerLogin } from "../../utils/helper";

const Profile = () => {
  const [isEdit, setIsEdit] = useState(false);
  const user = getUser();
  const isManager = managerLogin();

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  if (!user) {
    return null;
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <Head>
          <title>Dashboard: Profile</title>
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
              <Box sx={{ mb: 4 }}>
                {!isManager && <BackButton path="/dashboard" title="Home" />}
                <Grid container justifyContent="space-between" spacing={3}>
                  <Grid item>
                    <Typography variant="h4">Profile</Typography>
                  </Grid>
                </Grid>
              </Box>
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
                    src={user?.profile_image_url}
                    sx={{
                      height: 64,
                      mr: 2,
                      width: 64,
                    }}
                  >
                    {user?.first_name.charAt(0) + user?.last_name.charAt(0)}
                  </Avatar>
                  <div>
                    <Typography variant="h4">
                      {user?.first_name + " " + user?.last_name}
                    </Typography>
                    <Chip label={user?.email} size="small" />
                  </div>
                </Grid>
                <Grid item sx={{ m: -1 }}>
                  <NextLink
                    href={`/dashboard/users/${user?.id}/profile`}
                    passHref
                  >
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
                  <UserBasicDetails {...user} />
                </Grid>
              </Grid>
            </Box>
            {isEdit && (
              <Box
                sx={{
                  flexWrap: "wrap",
                  marginTop: 1,
                }}
              >
                <Button type="submit" sx={{ m: 1 }} variant="contained">
                  Update
                </Button>

                <Button
                  component="a"
                  sx={{
                    m: 1,
                    mr: "auto",
                  }}
                  variant="outlined"
                  onClick={() => setIsEdit(false)}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Container>
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
};

export default Profile;
