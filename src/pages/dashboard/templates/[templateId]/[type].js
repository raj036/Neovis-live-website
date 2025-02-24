import { useEffect, useState } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { TemplateEditForm } from "../../../../components/dashboard/template/template-edit-form";
import { gtm } from "../../../../lib/gtm";
import { PencilAlt as PencilAltIcon } from "../../../../icons/pencil-alt";
import { useRouter } from "next/router";
import useAxios from "../../../../services/useAxios";
import { BackButton } from "../../../../components/dashboard/back-button";
import { SeverityPill } from "../../../../components/severity-pill";

const TemplateCreate = () => {
    const router = useRouter();
    const customInstance = useAxios();

    const [isEdit, setIsEdit] = useState(false);
    const [templateId, settemplateId] = useState();
    //   const [propertyId, setPropertyId] = useState();

    const { data, isLoading, isFetching } = useQuery(
        ["templateById", templateId],
        () => customInstance.get(`task-templates/${templateId}`),
        { enabled: templateId !== undefined }
    );

    useEffect(() => {
        gtm.push({ event: "page_view" });
    }, []);

    useEffect(() => {
        if (router) {
            //   setPropertyId(router.query.propertyId);
            if (router.query.templateId !== "newtemplate") {
                settemplateId(router.query.templateId);
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
                    <title>Dashboard: template Create</title>
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
                                path={`/dashboard/templates`}
                                as="/dashboard/templates"
                                title="Task Template"
                            />
                            {templateId && (
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
                                                    {data?.data?.template_name}
                                                </Typography>
                                                <SeverityPill color={"primary"}>
                                                    {data?.data?.template_code}
                                                </SeverityPill>
                                            </div>
                                        </Grid>
                                        {!isEdit && (
                                            <Grid item sx={{ m: -1 }}>
                                                <NextLink
                                                    href={`/dashboard/templates/${templateId}/edit`}
                                                    as={`/dashboard/templates/${templateId}/edit`}
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
                            {!templateId && (
                                <Typography variant="h4">Create a new task template</Typography>
                            )}
                        </Box>
                        <TemplateEditForm
                            isEdit={isEdit}
                            // propertyId={propertyId}
                            template={templateId ? data?.data : null}
                        />
                    </Container>
                </Box>
            </DashboardLayout>
        </AuthGuard>
    );
};

export default TemplateCreate;
