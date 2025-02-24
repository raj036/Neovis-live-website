import { useEffect, useState } from "react";
import Head from "next/head";
import {
    Box,
    Button,
    Card,
    Container,
    Divider,
    Grid,
    Typography,
} from "@mui/material";
import WorkingHours from "../../../../components/dashboard/configuration/workinghours";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";

const EmployeeWorkingHours = () => {

    return (
        <AuthGuard>
            <DashboardLayout isLoading={false}>
                <Head>
                    <title>Dashboard: Working Hours</title>
                </Head>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        py: 8,
                    }}
                >
                    <Container maxWidth="xl">
                        <Card>
                            <Card>
                                <Box sx={{ m: 5 }}>
                                    <WorkingHours />
                                </Box>
                            </Card>
                            <Divider />
                        </Card>
                    </Container>
                </Box>
            </DashboardLayout>
        </AuthGuard>
    );
};

export default EmployeeWorkingHours;
