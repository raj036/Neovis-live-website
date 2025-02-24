import { useEffect, useState } from "react";
import Head from "next/head";
import {
    Box,
    Button,
    Grid,
    Typography,
    Container,
} from "@mui/material";
import { AuthGuard } from "../../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../../components/dashboard/dashboard-layout";
import { PmsIntegrationForm } from "../../../../../components/dashboard/settings/pms-integration/pms-integration-form";
import { PencilAlt as PencilAltIcon } from "../../../../../icons/pencil-alt"
import { useRouter } from "next/router";
import { BackButton } from "../../../../../components/dashboard/back-button";

const PMSIntegration = () => {
    const [isDisabled, setIsDisabled] = useState(true)
    const [integrationId, setIntegrationId] = useState(0)
    const [integrationType, setIntegrationType] = useState("")
    const router = useRouter();

    useEffect(() => {
        if (router) {
            setIntegrationId(+router?.query?.integrationId)
            const type = router?.query?.type?.split('-')

            //upperCase word
            // setIntegrationType(type? type[0]?.toUpperCase():"")

            //First Letter Capital
            const firstCapital =type ? type[0].charAt(0).toUpperCase()+type[0].slice(1):"";
            setIntegrationType(firstCapital)
        }
    }, [router])
    
    return (
        <AuthGuard>
            <DashboardLayout >
                <Head>
                    <title>Dashboard: {integrationType} Integration</title>
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
                            path={`/dashboard/settings/integration`}
                            as="/dashboard/settings/integration"
                            title="Integration"
                        />

                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Box >
                                <Grid >
                                    <Grid item>
                                        <Typography variant="h4">{integrationType} Integration</Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Box >
                                <Button
                                    component="a"
                                    endIcon={<PencilAltIcon fontSize="small" />}
                                    sx={{ m: 1 }}
                                    variant="outlined"
                                    onClick={(e) => { setIsDisabled(false) }}
                                >
                                    Edit
                                </Button>
                            </Box>
                        </Box>
                        <PmsIntegrationForm
                            isDisabled={isDisabled}
                            integrationId={integrationId}
                            integrationType={integrationType}
                        />
                    </Container>
                </Box>
            </DashboardLayout>
        </AuthGuard>
    )
}

export default PMSIntegration;