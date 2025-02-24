import { useEffect, useState } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../../components/dashboard/dashboard-layout";
import { NotificationEditForm } from "../../../../../components/dashboard/configuration/notification/notification-edit-form";
import { gtm } from "../../../../../lib/gtm";
import { PencilAlt as PencilAltIcon } from "../../../../../icons/pencil-alt";
import { useRouter } from "next/router";
import useAxios from "../../../../../services/useAxios";
import { BackButton } from "../../../../../components/dashboard/back-button";

const ChecklistCreate = () => {
    const router = useRouter();
    const customInstance = useAxios();

    const [isEdit, setIsEdit] = useState(false);
    const [notificationId, setNotificationId] = useState();

    const { data, isLoading, isFetching } = useQuery(
        ["notificationById", notificationId],
        () => customInstance.get(`push-notification-config/${notificationId}`),
        { enabled: notificationId !== undefined }
    );

    useEffect(() => {
        gtm.push({ event: "page_view" });
    }, []);

    useEffect(() => {
        if (router) {
            if (router.query.notificationId !== "newNotification") {
                setNotificationId(router.query.notificationId);
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
                    <title>Dashboard: Notification Create</title>
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
                                path={`/dashboard/configurations/notification`}
                                as="/dashboard/configurations/notification"
                                title="Notification"
                            />
                            {notificationId && (
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
                                                    href={`/dashboard/configurations/notification/${notificationId}/edit`}
                                                    as={`/dashboard/configurations/notification/${notificationId}/edit`}
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
                            {!notificationId && (
                                <Typography variant="h4">Create a new Notification Config</Typography>
                            )}
                        </Box>
                        <NotificationEditForm
                            isEdit={isEdit}
                            notification={notificationId ? data?.data : null}
                        />
                    </Container>
                </Box>
            </DashboardLayout>
        </AuthGuard>
    );
};

export default ChecklistCreate;
