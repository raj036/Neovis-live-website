import { useEffect, useState } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../../components/dashboard/dashboard-layout";
import { UnitareaEditForm } from "../../../../../components/dashboard/property/unitareas/unitarea-edit-form";
import { gtm } from "../../../../../lib/gtm";
import { PencilAlt as PencilAltIcon } from "../../../../../icons/pencil-alt";
import { useRouter } from "next/router";
import useAxios from "../../../../../services/useAxios";
import { BackButton } from "../../../../../components/dashboard/back-button";
import { SeverityPill } from "../../../../../components/severity-pill";

const UnitareaCreate = () => {
  const router = useRouter();
  const customInstance = useAxios();

  const [isEdit, setIsEdit] = useState(false);
  const [unitareaId, setUnitareaId] = useState();
  const [propertyId, setPropertyId] = useState();

  const { data, isLoading, isFetching } = useQuery(
    ["unitareaById", unitareaId],
    () => customInstance.get(`unit-areas/${unitareaId}`),
    { enabled: unitareaId !== undefined }
  );

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  useEffect(() => {
    if (router) {
      setPropertyId(router.query.propertyId);
      if (router.query.unitareaId !== "newunitarea") {
        setUnitareaId(router.query.unitareaId);
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
          <title>Dashboard: Unitarea Create</title>
        </Head>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 5,
          }}
        >
          <Container maxWidth="md">
            <div>
              <BackButton
                path={`/dashboard/properties/unitareas`}
                as="/dashboard/properties/unitareas"
                title="Unit Area"
              />
              {unitareaId && (
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
                        <Typography variant="h4">
                          {data?.data?.area_name}
                        </Typography>
                        <SeverityPill color={"primary"}>
                          {data?.data?.area_type}
                        </SeverityPill>
                      </div>
                    </Grid>
                    {!isEdit && (
                      <Grid item sx={{ m: -1 }}>
                        <NextLink
                          href={`/dashboard/properties/unitareas/${unitareaId}/edit?propertyId=${propertyId}`}
                          as={`/dashboard/properties/unitareas/${unitareaId}/edit`}
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
              {!unitareaId && (
                <Typography variant="h4">Create a new unit area</Typography>
              )}
            </Box>
            <UnitareaEditForm
              isEdit={isEdit}
              propertyId={propertyId}
              unitarea={unitareaId ? data?.data : null}
            />
          </Container>
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
};

export default UnitareaCreate;
