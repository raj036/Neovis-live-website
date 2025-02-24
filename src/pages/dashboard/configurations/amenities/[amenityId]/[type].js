import { useEffect, useState } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../../components/dashboard/dashboard-layout";
import { AmenityEditForm } from "../../../../../components/dashboard/configuration/amenity/amenity-edit-form";
import { gtm } from "../../../../../lib/gtm";
import { PencilAlt as PencilAltIcon } from "../../../../../icons/pencil-alt";
import { useRouter } from "next/router";
import useAxios from "../../../../../services/useAxios";
import { BackButton } from "../../../../../components/dashboard/back-button";

const IssueTypeCreate = () => {
  const router = useRouter();
  const customInstance = useAxios();

  const [isEdit, setIsEdit] = useState(false);
  const [amenityId, setAmenityId] = useState();

  const { data, isLoading, isFetching } = useQuery(
    ["amenityById", amenityId],
    () => customInstance.get(`amentities/${amenityId}`),
    { enabled: amenityId !== undefined }
  );

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  useEffect(() => {
    if (router) {
      if (router.query.amenityId !== "newamenity") {
        setAmenityId(router.query.amenityId);
      }
      if (router.query.type && router.query.type !== "detail") {
        setIsEdit(true);
      }
    }
  }, [router]);

  return (
    <AuthGuard>
      <DashboardLayout isLoading={isLoading || isFetching}>
        <Head>
          <title>Dashboard: Amenity Create</title>
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
              <BackButton
                path={`/dashboard/configurations/amenities`}
                as="/dashboard/configurations/amenities"
                title="Amenities"
              />
              {amenityId && (
                <>
                  <Grid container justifyContent="space-between" spacing={3}>
                    <Grid
                      item
                      sx={{
                        alignItems: "center",
                        display: "flex",
                        overflow: "hidden",
                      }}
                    >
                      <div>
                        <Typography variant="h4">{data?.data?.name}</Typography>
                      </div>
                    </Grid>
                    {!isEdit && !data?.data?.default && (
                      <Grid item sx={{ m: -1 }}>
                        <NextLink
                          href={`/dashboard/configurations/amenities/${amenityId}/edit`}
                          as={`/dashboard/configurations/amenities/${amenityId}/edit`}
                          passHref
                        >
                          <Button
                            component="a"
                            endIcon={<PencilAltIcon fontSize="small" />}
                            sx={{ m: 1 }}
                            variant="outlined"
                            onClick={() => setIsEdit(true)}
                          >
                            Edit
                          </Button>
                        </NextLink>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </div>

            <Box sx={{ mb: 3 }}>
              {!amenityId && (
                <Typography variant="h4">Create a new Amenity</Typography>
              )}
            </Box>
            <AmenityEditForm
              isEdit={isEdit}
              amenity={amenityId ? data?.data : null}
            />
          </Container>
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
};

export default IssueTypeCreate;
