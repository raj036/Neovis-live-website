import {
    Box,
    Button,
    Divider,
    Grid,
    Item,
    Typography,
    Container,
    Card,
    CardContent
} from "@mui/material";
import { useQuery } from "react-query";
import useAxios from "../../services/useAxios";
import { useEffect } from "react";

export const AnalyticsTaskCount = (props) => {

    const {Alltasks, statusCount} =props;
   
    return (
        <Grid
            container
            spacing={3}
        >
            <Grid
                item
                md={3}
                sm={6}
                xs={12}
            >
                <Card sx={{ width: 200, height: 125 }}>
                    <Box
                        sx={{
                            alignItems: 'center',
                            display: 'flex',
                            justifyContent: 'space-between',

                            direction: "column",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <CardContent >
                            <div>
                                <Typography
                                    // color={}
                                    variant="body2"
                                    align="center"

                                >
                                    Completed Task
                                </Typography>
                                <Typography
                                    align="center"
                                    sx={{ mt: 1 }}
                                    variant="h5"
                                >
                                    {Alltasks?.data?.data.filter((d) => d.status === "Completed").length}
                                </Typography>


                            </div>
                        </CardContent>
                    </Box>
                </Card>
            </Grid>

            <Grid
                item
                md={3}
                sm={6}
                xs={12}
            >
                <Card sx={{ width: 200, height: 125 }}>
                    <Box
                        sx={{
                            alignItems: 'center',
                            display: 'flex',
                            justifyContent: 'space-between',

                            direction: "column",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <CardContent>
                            <div>
                                <Typography
                                    // color={status.color}
                                    variant="body2"
                                    align="center"
                                >
                                    Assigned Task
                                </Typography>
                                <Typography
                                    sx={{ mt: 1, }}
                                    variant="h5"
                                    align="center"
                                >
                                    {Alltasks?.data?.data.filter((d) => d.status === "Assigned").length}
                                </Typography>

                            </div>
                        </CardContent>
                    </Box>
                </Card>
            </Grid>

            <Grid
                item
                md={3}
                sm={6}
                xs={12}
            >
                <Card sx={{ width: 200, height: 125 }}>
                    <Box
                        sx={{
                            alignItems: 'center',
                            display: 'flex',
                            justifyContent: 'space-between',

                            direction: "column",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <CardContent>
                            <div>
                                <Typography
                                    // color={status.color}
                                    variant="body2"
                                    align="center"
                                >
                                    Inspected Task
                                </Typography>
                                <Typography
                                    align="center"
                                    sx={{ mt: 1, }}
                                    variant="h5"
                                >
                                    {Alltasks?.data?.data.filter((d) => d.status === "Inspected").length}
                                </Typography>

                                <Typography
                                    sx={{ mt: 1 }}
                                    variant="h6"
                                    align="center"
                                >
                                </Typography>
                            </div>
                        </CardContent>
                    </Box>
                </Card>
            </Grid>

            <Grid
                item
                md={3}
                sm={6}
                xs={12}
            >
                <Card sx={{ width: 200, height: 125 }}>
                    <Box
                        sx={{
                            alignItems: 'center',
                            display: 'flex',
                            justifyContent: 'space-between',

                            direction: "column",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <CardContent>
                            <div>
                                <Typography
                                    // color={status.color}
                                    variant="body2"
                                    align="center"
                                >
                                    Pending Task
                                </Typography>
                                <Typography
                                    sx={{ mt: 1, }}
                                    variant="h5"
                                    align="center"
                                >
                                    {Alltasks?.data?.data.filter((d) => d.status === "Pending").length}
                                </Typography>
                            </div>
                        </CardContent>
                    </Box>
                </Card>
            </Grid>

            <Grid
                item
                md={3}
                sm={6}
                xs={12}
            >
                <Card sx={{ width: 200, height: 125 }}>
                    <Box
                        sx={{
                            alignItems: 'center',
                            display: 'flex',
                            justifyContent: 'space-between',

                            direction: "column",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <CardContent>
                            <div>
                                <Typography
                                    // color={status.color}
                                    variant="body2"
                                    align="center"
                                >
                                    Ongoing Task
                                </Typography>
                                <Typography
                                    align="center"
                                    sx={{ mt: 1, }}
                                    variant="h5"
                                >
                                    {Alltasks?.data?.data.filter((d) => d.status === "Ongoing").length}
                                </Typography>

                            </div>
                        </CardContent>
                    </Box>
                </Card>
            </Grid>

            <Grid
                item
                md={3}
                sm={6}
                xs={12}
            >
                <Card sx={{ width: 200, height: 125 }}>
                    <Box
                        sx={{
                            alignItems: 'center',
                            display: 'flex',
                            justifyContent: 'space-between',

                            direction: "column",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <CardContent>
                            <div>
                                <Typography
                                    align="center"
                                    // color={status.color}
                                    variant="body2"
                                >
                                    On Hold Task
                                </Typography>
                                <Typography
                                    align="center"
                                    sx={{ mt: 1, }}
                                    variant="h5"
                                >
                                    {Alltasks?.data?.data.filter((d) => d.status === "Onhold").length}
                                </Typography>
                            </div>
                        </CardContent>
                    </Box>
                </Card>
            </Grid>

            <Grid
                item
                md={3}
                sm={6}
                xs={12}
            >
                <Card sx={{ width: 200, height: 125 }}>
                    <Box
                        sx={{
                            alignItems: 'center',
                            display: 'flex',
                            justifyContent: 'space-between',

                            direction: "column",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <CardContent>
                            <div>
                                <Typography
                                    align="center"
                                    // color={status.color}
                                    variant="body2"
                                >
                                    Overdue Task
                                </Typography>
                                <Typography
                                    align="center"
                                    sx={{ mt: 1, }}
                                    variant="h5"
                                >
                                    {Alltasks?.data?.data.filter((d) => d.status === "Overdue").length}
                                </Typography>
                            </div>
                        </CardContent>
                    </Box>
                </Card>
            </Grid>

        </Grid>
    );
};
