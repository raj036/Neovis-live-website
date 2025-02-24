import { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Typography,
    TextField
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

const WorkingHours = () => {
    const [workingHours, setWorkingHours] = useState({});

    const handleWorkingHoursChange = (day, key) => (value) => {
        setWorkingHours((prevWorkingHours) => ({
            ...prevWorkingHours,
            [day]: {
                ...prevWorkingHours[day],
                [key]: value,
            },
        }));
    };

    return (
        <Grid>
            <Typography mb={5} color={"#3832A0"} variant="h6" gutterBottom>
                Working Hours
            </Typography>
            <Box>
                <Grid container spacing={2}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <Grid item xs={12} sm={6} md={6} key={day}>
                            <Typography color={"#3832A0"} variant="subtitle1">{day}</Typography>
                            <Box display="flex" alignItems="center" mt={1}>
                                <TimePicker
                                    label="From"
                                    value={workingHours[day]?.from || null}
                                    onChange={handleWorkingHoursChange(day, 'from')}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                                <Typography variant="body2" mx={1}>
                                    to
                                </Typography>
                                <TimePicker
                                    label="To"
                                    value={workingHours[day]?.to || null}
                                    onChange={handleWorkingHoursChange(day, 'to')}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Grid>
    );
};

export default WorkingHours;
