import { useState, useEffect } from "react";
import Head from "next/head";
import {
    Box,
    Button,
    Divider,
    Grid,
    Typography,
    Container,
    Card,
    CardActions,
    Switch,
    FormControl,
    FormGroup,
    FormControlLabel,
    Avatar
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "react-query";
import useAxios from "../../../../services/useAxios";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { ArrowRight as ArrowRightIcon } from '../../../../icons/arrow-right';
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { ConfirmDialog } from "../../../../components/dashboard/confim-dialog";

const IntegrationCard = () => {
    const [pmsId, setPmsId] = useState(0)
    const [dialogStat, setDialogStat] = useState(false);
    const [data, setData] = useState(null)
    const [integration, setIntegration] = useState(null)
    const [pmsData, setPmsData] = useState(null)
    const [noIntegration, setNoIntegration] = useState(false)

    const customInstance = useAxios();
    const router = useRouter();

    const { data: pms, refetch: refetchPMS, isLoading, isFetching } = useQuery("allPMS", () =>
        customInstance.get(`pms`),
    );

    const { mutateAsync: updateFlag } = useMutation((data) => {
        customInstance.patch(`pms/${data.id}`, data);
    });

    const handleFlag = async (e, id, name) => {
        setIntegration(name)
        if (id) {
            setDialogStat(true)
            const data = {
                active: e.target.checked,
                id: id
            }
            setData(data)
        }
    }

    const onConfirmDialog = async () => {
        try {
            setDialogStat(false);
            await updateFlag(data);
            refetchPMS();
            // toast.success("Switched successfully!");
        } catch (e) {
            setDialogStat(false);
            toast.error("Something went wrong!");
        }
    };

    useEffect(() => {
        if (!isLoading && !isFetching) {
            if (pms?.data && pms?.data?.length === 0 || pms?.data === undefined) {
                setNoIntegration(true);
            } else if (pms?.data) {
                setPmsData(pms?.data?.sort((a, b) => a.id - b.id));
                setNoIntegration(false);
            }
        }
    }, [pms])

    return (
        <AuthGuard>
            <DashboardLayout isLoading={isLoading || isFetching}>
                <Head>
                    <title>Dashboard: Integration</title>
                </Head>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        py: 5,
                    }}
                >
                    {!isLoading && !isFetching && noIntegration ?
                    (
                        <Box sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            minHeight: "70vh"
                        }}>
                            <Typography color="GrayText" variant="h5">No integrations available</Typography>
                        </Box>
                    ) : (
                        <Container maxwidth="md">
                            <Box sx={{ mb: 4 }}>
                                <Grid container justifyContent="space-between" spacing={3}>
                                    <Grid item>
                                        <Typography variant="h4">Integration</Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                            <Grid container spacing={4}>
                                {
                                    pmsData && pmsData?.map((d, index) => {
                                        return (
                                            <Grid key={index} item md={6} xs={12}>
                                                <Card key={d?.id}>
                                                    <ConfirmDialog
                                                        title="Activate Integration"
                                                        message={`This action will ${d?.active ? 'deactivate' : 'activate'} ${integration} Integration. Proceed ?`}
                                                        dialogStat={dialogStat}
                                                        setDialogStat={setDialogStat}
                                                        onConfirmDialog={onConfirmDialog}
                                                    />
                                                    <Grid container>
                                                        <Grid item md={9} xs={12}>
                                                            <Box
                                                                sx={{
                                                                    alignItems: 'center',
                                                                    display: 'flex',
                                                                    px: 3,
                                                                    py: 2
                                                                }}
                                                            >
                                                                <Avatar
                                                                    src={
                                                                        d?.imageUrl
                                                                    }
                                                                    sx={{
                                                                        height: 60,
                                                                        mr: 2,
                                                                        width: 60,
                                                                    }}
                                                                >
                                                                </Avatar>
                                                                <div>
                                                                    <Typography color="textSecondary" variant="h5" >
                                                                        {d?.pms_name} Integration
                                                                    </Typography>
                                                                </div>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={3} xs={12}>
                                                            <Box mt={4} sx={{ display: "flex", alignItems: 'center', justifyContent: "end" }}>
                                                                <FormControl component="fieldset" variant="standard">
                                                                    <FormGroup>
                                                                        <FormControlLabel
                                                                            control={
                                                                                <Switch 
                                                                                    checked={d?.active} 
                                                                                    name="active"
                                                                                    onChange={(e) => 
                                                                                        handleFlag(e, d?.id, d?.pms_name)
                                                                                    }
                                                                                />
                                                                            }
                                                                        />
                                                                    </FormGroup>
                                                                </FormControl>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item md={12} xs={12}>
                                                            <Box sx={{ px: 3, mb: 2 }}>
                                                                <Typography sx={{ mt: 1 }} variant="h6">
                                                                    {d?.pms_name}
                                                                </Typography>
                                                                <Typography sx={{ mt: 1 }} variant="body2" >
                                                                    {d?.pms_description}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                    <Divider />
                                                    <CardActions  >
                                                        <Button variant="contained" endIcon={<ArrowRightIcon fontSize="small" />}
                                                            onClick={() =>
                                                                router.push(`/dashboard/settings/integration/${d?.id}/${d?.pms_name?.toLowerCase()}-integration`)
                                                            }
                                                        >
                                                            {d?.pms_name} Integration
                                                        </Button>
                                                    </CardActions>
                                                </Card>
                                            </Grid>
                                        )
                                    })
                                }
                            </Grid>
                        </Container>
                    )

                    }
                </Box>
            </DashboardLayout>
        </AuthGuard>
    )
}

export default IntegrationCard;