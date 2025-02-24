import { useEffect, useState } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { gtm } from "../../../../lib/gtm";
import { PencilAlt as PencilAltIcon } from "../../../../icons/pencil-alt";
import { useRouter } from "next/router";
import useAxios from "../../../../services/useAxios";
import { BackButton } from "../../../../components/dashboard/back-button";
import { SeverityPill } from "../../../../components/severity-pill";
import { TeamEditForm } from "../../../../components/dashboard/teams/team-edit-form";

const TeamCreate = () => {
    const router = useRouter();
    const customInstance = useAxios();

    const [isEdit, setIsEdit] = useState(false);
    const [teamId, setteamId] = useState();
    //   const [propertyId, setPropertyId] = useState();

    const { data, isLoading, isFetching } = useQuery(
        ["teamById", teamId],
        () => customInstance.get(`team/${teamId}`),
        { enabled: teamId !== undefined }
    );

    useEffect(() => {
        gtm.push({ event: "page_view" });
    }, []);

    useEffect(() => {
        if (router) {
            //   setPropertyId(router.query.propertyId);
            if (router.query.teamId !== "newteam") {
                setteamId(router.query.teamId);
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
                    <title>Dashboard: team Create</title>
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
                                path={`/dashboard/teams`}
                                as="/dashboard/teams"
                                title="Task team"
                            />
                            {teamId && (
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
                                                    {data?.data?.team_name}
                                                </Typography>
                                                <SeverityPill color={"primary"}>
                                                    {data?.data?.team_code}
                                                </SeverityPill>
                                            </div>
                                        </Grid>
                                        {!isEdit && (
                                            <Grid item sx={{ m: -1 }}>
                                                <NextLink
                                                    href={`/dashboard/teams/${teamId}/edit`}
                                                    as={`/dashboard/teams/${teamId}/edit`}
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
                            {!teamId && (
                                <Typography variant="h4">Create a new task team</Typography>
                            )}
                        </Box>
                        <TeamEditForm
                            isEdit={isEdit}
                            // propertyId={propertyId}
                            Team={teamId ? data?.data : null}
                        />
                    </Container>
                </Box>
            </DashboardLayout>
        </AuthGuard>
    );
};

export default TeamCreate;
