import { useEffect, useState } from "react";
import Head from "next/head";
import { Box, Container, Grid, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../../components/dashboard/dashboard-layout";
import { UnitissueEditForm } from "../../../../../components/dashboard/task/unitissues/unitissue-edit-form";
import { gtm } from "../../../../../lib/gtm";
import { useRouter } from "next/router";
import useAxios from "../../../../../services/useAxios";
import { BackButton } from "../../../../../components/dashboard/back-button";
import { SeverityPill } from "../../../../../components/severity-pill";

const UnitCreate = () => {
  const router = useRouter();
  const customInstance = useAxios();

  const [unitIssueId, setUnitIssueId] = useState();
  const [propertyId, setPropertyId] = useState();

  const { data, isLoading, isFetching } = useQuery(
    ["unitIssuesById", unitIssueId],
    () => customInstance.get(`unit-issues/${unitIssueId}`),
    { enabled: unitIssueId !== undefined }
  );

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  useEffect(() => {
    if (router) {
      setPropertyId(router.query.propertyId);
      if (router.query.unitIssueId !== "newunit") {
        setUnitIssueId(router.query.unitIssueId);
      }
    }
  }, [router]);

  return (
    <AuthGuard>
      <DashboardLayout isLoading={isLoading || isFetching}>
        <Head>
          <title>Dashboard: Unit Issue</title>
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
                path={`/dashboard/tasks/unitissues`}
                as="/dashboard/tasks/unitissues"
                title="Unit Issue"
              />
              {unitIssueId && (
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
            <UnitissueEditForm
              isEdit={false}
              propertyId={propertyId}
              unitIssue={unitIssueId ? data?.data : null}
            />
          </Container>
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
};

export default UnitCreate;
