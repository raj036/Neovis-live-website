import { useEffect, useState } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../../components/dashboard/dashboard-layout";
import { ElementEditForm } from "../../../../../components/dashboard/configuration/element/element-edit-form";
import { gtm } from "../../../../../lib/gtm";
import { PencilAlt as PencilAltIcon } from "../../../../../icons/pencil-alt";
import { useRouter } from "next/router";
import useAxios from "../../../../../services/useAxios";
import { BackButton } from "../../../../../components/dashboard/back-button";

const ChecklistCreate = () => {
  const router = useRouter();
  const customInstance = useAxios();

  const [isEdit, setIsEdit] = useState(false);
  const [elementId, setElementId] = useState();

  const { data, isLoading, isFetching } = useQuery(
    ["elementById", elementId],
    () => customInstance.get(`elements/${elementId}`),
    { enabled: elementId !== undefined }
  );

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  useEffect(() => {
    if (router) {
      if (router.query.elementId !== "newelement") {
        setElementId(router.query.elementId);
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
          <title>Dashboard: Element Create</title>
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
                path={`/dashboard/configurations/elements`}
                as="/dashboard/configurations/elements"
                title="Element"
              />
              {elementId && (
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
                          href={`/dashboard/configurations/elements/${elementId}/edit`}
                          as={`/dashboard/configurations/elements/${elementId}/edit`}
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
              {!elementId && (
                <Typography variant="h4">Create a new element</Typography>
              )}
            </Box>
            <ElementEditForm
              isEdit={isEdit}
              element={elementId ? data?.data : null}
            />
          </Container>
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
};

export default ChecklistCreate;
