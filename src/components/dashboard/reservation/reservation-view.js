import React, { useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Grid, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import dayjs from 'dayjs';


const ReservationDetailView = ({ data }) => {
  return (
    <Card >
      <CardContent>
        <Grid container spacing={3}>
          <Grid item sm={4} md={4} lg={4} xl={4}>
            <Typography variant='h6' sx={{ mt: 2 }}>
              Reservation Details :
            </Typography>
          </Grid>
          <Grid container item sm={8} md={8} lg={8} xl={8}>
            <TextField
              fullWidth
              label="Reservation Number"
              name="reservation_number"
              disabled
              value={data?.reservationNumber ?? ''}
            />
            <TextField
              sx={{ mt: 3 }}
              fullWidth
              label="Reservation Date"
              name="reservation_date"
              disabled
              value={data?.reservationDate ? dayjs(data?.reservationDate).format('DD/MM/YYYY') : ''}
            />
            <TextField
              sx={{ mt: 3 }}
              fullWidth
              label="Property"
              name="property"
              disabled
              value={data?.property?.property_name ?? ''}
            />
            <TextField
              sx={{ mt: 3 }}
              fullWidth
              label="Location"
              name="location"
              disabled
              value={data?.location ?? ''}
            />
            <TextField
              sx={{ mt: 3 }}
              fullWidth
              label="Arrival Date"
              name="arrivalDate"
              disabled
              value={data?.arrivalDate ? dayjs(data?.arrivalDate).format('DD/MM/YYYY') : ''}
            />
            <TextField
              sx={{ mt: 3 }}
              fullWidth
              label="Departure Date"
              name="departureDate"
              disabled
              value={data?.departureDate ? dayjs(data?.departureDate).format('DD/MM/YYYY') : ''}
            />
            <TextField
              sx={{ mt: 3 }}
              fullWidth
              label="Channel Name"
              name="channelName"
              disabled
              value={data?.channelName ?? ''}
            />
            <TextField
              sx={{ mt: 3 }}
              fullWidth
              label="Guest Name"
              name="guestName"
              disabled
              value={data?.guestName ?? ''}
            />
            <TextField
              sx={{ mt: 3 }}
              fullWidth
              label="Number Of Guests"
              name="numberOfGuests"
              disabled
              value={data?.numberOfGuests ?? ''}
            />
            <TextField
              sx={{ mt: 3 }}
              fullWidth
              label="Owner Payout"
              name="owner_payout"
              disabled
              value={data?.owner_payout ?? ''}
            />
            <TextField
              sx={{ mt: 3 }}
              fullWidth
              label="Property Management Payout"
              name="property_management_payout"
              disabled
              value={data?.property_management_payout ?? ''}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ReservationDetailView;
