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
import TaskBulkUploadContent from "../../../../components/dashboard/task/bulk-upload";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";

const TaskBulkUpload = () => {

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
                        py: 5,
                    }}
                >
                    <Container maxWidth="xl">
                        <Card>
                            <Card>
                                <Box sx={{ m: 5 }}>
                                    <TaskBulkUploadContent />
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

export default TaskBulkUpload;
