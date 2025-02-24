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
    MenuItem
} from "@mui/material";
import UnitBulkUploadContent from "../../../../../components/dashboard/property/units/bulk-upload";
import { AuthGuard } from "../../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../../components/dashboard/dashboard-layout";

const UnitBulkUpload = () => {

    return (
        <AuthGuard>
            <DashboardLayout isLoading={false}>
                <Head>
                    <title>Dashboard: Bulk Upload(Tasks)</title>
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
                                    <UnitBulkUploadContent />
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

export default UnitBulkUpload;
