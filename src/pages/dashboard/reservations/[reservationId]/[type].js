import { useEffect, useState } from "react";
import Head from "next/head";
import { Box, Container, Grid, Typography, makeStyles } from "@mui/material";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { gtm } from "../../../../lib/gtm";
import { useRouter } from "next/router";
import useAxios from "../../../../services/useAxios";
import { BackButton } from "../../../../components/dashboard/back-button";
import ReservationDetailView from "../../../../components/dashboard/reservation/reservation-view";

const ReservationView = () => {
    const router = useRouter();
    const customInstance = useAxios();
    const [reservationId, setReservationId] = useState();

    const { data, isLoading, isFetching } = useQuery(
        ["reservationsById", reservationId],
        () => customInstance.get(`reservations/${reservationId}`),
        { enabled: reservationId !== undefined }
    );

    useEffect(() => {
        gtm.push({ event: "page_view" });
    }, []);

    useEffect(() => {
        if (router) {
            setReservationId(router.query.reservationId);
        }
    }, [router]);

    return (
        <AuthGuard>
            <DashboardLayout isLoading={isLoading || isFetching}>
                <Head>
                    <title>Reservation Details</title>
                </Head>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        py: 5,
                    }}
                >
                    <Container maxWidth="md">
                        <BackButton
                            path={`/dashboard/reservations`}
                            as="/dashboard/reservations"
                            title="All Reservations"
                        />

                        <ReservationDetailView
                            data={data?.data || []}
                        />
                    </Container>
                </Box>
            </DashboardLayout>
        </AuthGuard>
    );
};

export default ReservationView;
