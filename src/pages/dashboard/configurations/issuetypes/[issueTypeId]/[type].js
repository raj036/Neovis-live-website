import { useEffect, useState } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../../components/dashboard/dashboard-layout";
import { IssuetypeEditForm } from "../../../../../components/dashboard/configuration/issuetype/issuetype-edit-form";
import { gtm } from "../../../../../lib/gtm";
import { PencilAlt as PencilAltIcon } from "../../../../../icons/pencil-alt";
import { useRouter } from "next/router";
import useAxios from "../../../../../services/useAxios";
import { BackButton } from "../../../../../components/dashboard/back-button";

const IssueTypeCreate = () => {
  const router = useRouter();
  const customInstance = useAxios();

  const [isEdit, setIsEdit] = useState(false);
  const [issueTypeId, setIssueTypeId] = useState();

  const { data, isLoading, isFetching } = useQuery(
    ["issuetypeById", issueTypeId],
    () => customInstance.get(`issue-types/${issueTypeId}`),
    { enabled: issueTypeId !== undefined }
  );

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  useEffect(() => {
    if (router) {
      if (router.query.issueTypeId !== "newissuetype") {
        setIssueTypeId(router.query.issueTypeId);
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
          <title>Dashboard: IssueType Create</title>
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
                path={`/dashboard/configurations/issuetypes`}
                as="/dashboard/configurations/issuetypes"
                title="Issue Type"
              />
              {issueTypeId && (
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
                          href={`/dashboard/configurations/issuetypes/${issueTypeId}/edit`}
                          as={`/dashboard/configurations/issuetypes/${issueTypeId}/edit`}
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
              {!issueTypeId && (
                <Typography variant="h4">Create a new Issue Type</Typography>
              )}
            </Box>
            <IssuetypeEditForm
              isEdit={isEdit}
              issuetype={issueTypeId ? data?.data : null}
            />
          </Container>
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
};

export default IssueTypeCreate;
