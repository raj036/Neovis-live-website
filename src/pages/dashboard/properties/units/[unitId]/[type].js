import { Box, Container, Grid, Typography } from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../../../components/authentication/auth-guard";
import { BackButton } from "../../../../../components/dashboard/back-button";
import { DashboardLayout } from "../../../../../components/dashboard/dashboard-layout";
import { UnitEditForm } from "../../../../../components/dashboard/property/units/unit-edit-form";
import { SeverityPill } from "../../../../../components/severity-pill";
import { gtm } from "../../../../../lib/gtm";
import useAxios from "../../../../../services/useAxios";

const UnitCreate = () => {
  const router = useRouter();
  const customInstance = useAxios();

  const [isEdit, setIsEdit] = useState(false);
  const [unitId, setUnitId] = useState();
  const [propertyId, setPropertyId] = useState();
  const [isEditLoading, setIsEditLoading] = useState(false);

  const { data, isLoading, isFetching } = useQuery(
    ["unitById", unitId],
    () => customInstance.get(`units/${unitId}`),
    { enabled: unitId !== undefined }
  );

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  useEffect(() => {
    if (router) {
      setPropertyId(router.query.propertyId);
      if (router.query.unitId !== "newunit") {
        setUnitId(router.query.unitId);
      }
      if (router.query.type && router.query.type !== "detail") {
        setIsEdit(true);
      }
    }
  }, [router]);

  return (
    <AuthGuard>
      <DashboardLayout isLoading={isLoading || isFetching || isEditLoading}>
        <Head>
          <title>Dashboard: Unit Create</title>
        </Head>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 5,
            background:"white",
          }}
        >
          <Container maxWidth="lg">
            <div>
              <BackButton
                path={`/dashboard/properties/units`}
                as="/dashboard/properties/units"
                title="Unit"
              />
              {unitId && (
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
                          {data?.data?.unit_name}
                        </Typography>
                        <SeverityPill color={"primary"}>
                          {data?.data?.unit_condition}
                        </SeverityPill>
                      </div>
                    </Grid>
                  </Grid>
                </>
              )}
            </div>

            <Box sx={{ mb: 3 }}>
              {!unitId && (
                <Typography variant="h4">Create a new unit</Typography>
              )}
            </Box>
            <UnitEditForm
              setIsLoading={setIsEditLoading}
              isEdit={isEdit}
              propertyId={propertyId}
              unit={unitId ? data?.data : null}
            />
          </Container>
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
};

export default UnitCreate;
