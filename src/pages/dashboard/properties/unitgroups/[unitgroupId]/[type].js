import { useEffect, useState } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../../components/dashboard/dashboard-layout";
import { UnitGroupEditForm } from "../../../../../components/dashboard/property/unitgroups/unitgroup-edit-form";
import { gtm } from "../../../../../lib/gtm";
import { PencilAlt as PencilAltIcon } from "../../../../../icons/pencil-alt";
import { useRouter } from "next/router";
import useAxios from "../../../../../services/useAxios";
import { BackButton } from "../../../../../components/dashboard/back-button";
import { SeverityPill } from "../../../../../components/severity-pill";

const UnitgroupCreate = () => {
    const router = useRouter();
    const customInstance = useAxios();

    const [isEdit, setIsEdit] = useState(false);
    const [unitgroupId, setUnitGroupId] = useState();
    const [propertyId, setPropertyId] = useState();

    const { data, isLoading, isFetching } = useQuery(
        ["unitgroupById", unitgroupId],
        () => customInstance.get(`unit-group/${unitgroupId}`),
        { enabled: unitgroupId !== undefined }
    );

    useEffect(() => {
        gtm.push({ event: "page_view" });
    }, []);

    useEffect(() => {
        if (router) {
            setPropertyId(router.query.propertyId);
            if (router.query.unitgroupId !== "newunitgroup") {
                setUnitGroupId(router.query.unitgroupId);
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
                    <title>Dashboard: Unit group Create</title>
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
                                path={`/dashboard/properties/unitgroups`}
                                as="/dashboard/properties/unitgroups"
                                title="Unit Groups"
                            />
                            {unitgroupId && (
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
                                                    {data?.data?.area_name}
                                                </Typography>
                                            </div>
                                        </Grid>
                                        {!isEdit && (
                                            <Grid item sx={{ m: -1 }}>
                                                <NextLink
                                                    href={`/dashboard/properties/unitgroups/${unitgroupId}/edit?propertyId=${propertyId}`}
                                                    as={`/dashboard/properties/unitgroups/${unitgroupId}/edit`}
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
                            {!unitgroupId && (
                                <Typography variant="h4">Create a new unit group</Typography>
                            )}
                        </Box>
                        <UnitGroupEditForm
                            isEdit={isEdit}
                            propertyId={propertyId}
                            unitgroup={unitgroupId ? data?.data : null}
                        />
                    </Container>
                </Box>
            </DashboardLayout>
        </AuthGuard>
    );
};

export default UnitgroupCreate;
