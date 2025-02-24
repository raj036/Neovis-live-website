import { useEffect, useState } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../../components/dashboard/dashboard-layout";
import { UnitareaEditForm } from "../../../../../components/dashboard/property/unitareas/unitarea-edit-form";
import { gtm } from "../../../../../lib/gtm";
import { PencilAlt as PencilAltIcon } from "../../../../../icons/pencil-alt";
import { useRouter } from "next/router";
import useAxios from "../../../../../services/useAxios";
import { BackButton } from "../../../../../components/dashboard/back-button";
import { SeverityPill } from "../../../../../components/severity-pill";
import { CompanyEditForm } from "../../../../../components/dashboard/property/company/company-edit-form";

const CompanyCreate = () => {
    const router = useRouter();
    const customInstance = useAxios();

    const [isEdit, setIsEdit] = useState(false);
    const [companyId, setCompanyId] = useState();
    const [propertyId, setPropertyId] = useState();

    const { data, isLoading, isFetching } = useQuery(
        ["companyById", companyId],
        () => customInstance.get(`company/${companyId}`),
        { enabled: companyId !== undefined }
    );

    useEffect(() => {
        gtm.push({ event: "page_view" });
    }, []);

    useEffect(() => {
        if (router) {
            setPropertyId(router.query.propertyId);
            if (router.query.companyId !== "newcompany") {
                setCompanyId(router.query.companyId);
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
                    <title>Dashboard: Company Create</title>
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
                                path={`/dashboard/properties/company`}
                                as="/dashboard/properties/company"
                                title="Company"
                            />
                            {companyId && (
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
                                                    {data?.data?.name}
                                                </Typography>
                                                {/* <SeverityPill color={"primary"}>
                                                    {data?.data?.area_type}
                                                </SeverityPill> */}
                                            </div>
                                        </Grid>
                                        {!isEdit && (
                                            <Grid item sx={{ m: -1 }}>
                                                <NextLink
                                                    href={`/dashboard/properties/company/${companyId}/edit?propertyId=${propertyId}`}
                                                    as={`/dashboard/properties/company/${companyId}/edit`}
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
                            {!companyId && (
                                <Typography variant="h4">Create a new company</Typography>
                            )}
                        </Box>
                        <CompanyEditForm
                            isEdit={isEdit}
                            propertyId={propertyId}
                            company={companyId ? data?.data : null}
                        />
                    </Container>
                </Box>
            </DashboardLayout>
        </AuthGuard>
    );
};

export default CompanyCreate;
