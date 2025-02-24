import { useEffect, useState } from "react";
import Head from "next/head";
import { Avatar, Box, Chip, Container, Fab, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { CameraAlt } from "@mui/icons-material";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { UserEditForm } from "../../../../components/dashboard/user/user-edit-form";
import { gtm } from "../../../../lib/gtm";
import { useRouter } from "next/router";
import useAxios from "../../../../services/useAxios";
import { BackButton } from "../../../../components/dashboard/back-button";
import { managerLogin } from "../../../../utils/helper";

const CustomerEdit = () => {
  const [userId, setUserId] = useState();
  const [isProfile, setIsProfile] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState();

  const router = useRouter();
  const customInstance = useAxios();
  const isManager = managerLogin();

  const { data, isLoading, isFetching } = useQuery(
    ["userById", userId],
    () => customInstance.get(
      // isProfile ? `auth/profile` : `users/${userId}`
      `users/${userId}`
    ),
    {
      enabled: isProfile || (userId !== undefined && userId !== "registerUser"),
    }
  );

  const { data: ownerData, isLoading: ownerLoading, isFetching: ownerFetching } = useQuery(
    ["ownerByuserId", userId],
    () => customInstance.get(`owner/findbyuser/${userId}`),
    { enabled: userId !== undefined }
  );

  const onImageSelect = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function (e) {
      setUserProfileImage({
        imageUrl: reader.result,
        _file: file,
        updated: true,
      });
    };
  };

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  useEffect(() => {
    if (router) {
      if (router.query.userId !== "registerUser") {
        setUserId(router.query.userId);
      }
      if (router.query.type === "profile") {
        setIsProfile(true);
      }
    }
  }, [router]);

  if (router.query.userId !== "registerUser" && !data) {
    return null;
  }

  return (
    <AuthGuard>
      <DashboardLayout isLoading={isLoading || isFetching}>
        <Head>
          <title>Dashboard: User Edit</title>
        </Head>
        <Box
          component="main"
          sx={{
            backgroundColor: "background.default",
            flexGrow: 1,
            py: 5,
          }}
        >
          <Container maxWidth="md">
            {!isProfile && <BackButton path="/dashboard/users" title="Users" />}
            {!isManager && isProfile && (
              <BackButton path="/dashboard" title="Home" />
            )}
            {userId && (
              <Box
                sx={{
                  alignItems: "center",
                  display: "flex",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "relative" }}>
                  <Avatar
                    src={
                      userProfileImage
                        ? userProfileImage?.imageUrl
                        : data?.data?.profile_image_url
                    }
                    sx={{
                      height: 64,
                      mr: 2,
                      width: 64,
                    }}
                  >
                    {data?.data?.first_name.charAt(0) +
                      data?.data?.last_name.charAt(0)}
                  </Avatar>
                  {isProfile && (
                    <>
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="user-image"
                        type="file"
                        onChange={onImageSelect}
                      />
                      <label htmlFor="user-image">
                        <Fab
                          //size="small"
                          component="div"
                          style={{
                            backgroundColor: "white",
                            width: "25px",
                            height: "25px",
                            position: "absolute",
                            top: "35px",
                            right: "5px",
                          }}
                          icon
                        >
                          <CameraAlt sx={{ width: "15px", height: "15px" }} />
                        </Fab>
                      </label>
                    </>
                  )}
                </div>
                <div>
                  <Typography noWrap variant="h4">
                    {data?.data?.first_name + " " + data?.data?.last_name}
                  </Typography>
                  <Chip label={data?.data?.email} size="small" />
                </div>
              </Box>
            )}
            <Box mt={3}>
              <UserEditForm
                user={userId ? data?.data : null}
                owner={ownerData?.data}
                userProfileImage={userProfileImage}
              />
            </Box>
          </Container>
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
};

export default CustomerEdit;
