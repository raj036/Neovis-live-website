import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Box, Typography } from '@mui/material';
import { DashboardTaskFilter } from './calendar-dashboard-filters';
import useAxios from '../../../services/useAxios';
import { useQuery } from 'react-query';
import { useEffect, useState } from 'react';
import { managerLogin } from '../../../utils/helper';

export const CalendarToolbar = (props) => {
  const {
    mobile,
    onAddClick,
    onChange,
    date,
    view,
    taskAssigned,
    isLoading,
    handleChangeUnit,
    setResources,
    ...other
  } = props;

  const isManager = managerLogin();
  const customInstance = useAxios();
  const [selProperty, setSelProperty] = useState();

  const { data: properties } = useQuery("allProperty", () =>
    customInstance.get(`properties`)
  );

  const { data: units, refetch: unitsRefetch } = useQuery(
    "propertyUnits",
    () =>
      customInstance.get(
        `units/unit-type-or-property?property_id=${selProperty}`
      ),
    { enabled: selProperty !== undefined }
  );
  const { data: users } = useQuery(
    "allUsers",
    () => customInstance.get(`users`),
    {
      enabled: isManager,
    }
  );

  useEffect(() => {
    unitsRefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selProperty]);

  return (
    <Box
      sx={{
        alignItems: 'start',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        px: 3,
        py: taskAssigned ? 0 : 4,
        flexDirection: {
          xs: 'column',
          md: 'column'
        }
      }}
      {...other}>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          mb: {
            xs: 2,
            md: 2
          },
          mr: 2,
          ml: 3
        }}
      >
        <Typography variant="h5">
          {format(date, 'MMMM d,')}
        </Typography>
        <Typography
          sx={{
            fontWeight: 400,
            ml: 1
          }}
          variant="h5"
        >
          {format(date, 'y')}
        </Typography>
      </Box>
      {
        taskAssigned === false && !isLoading &&
        <Box
          sx={{ width: '100%', height: '65vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <Typography variant='h5' sx={{ fontWeight: 500, color: 'grey' }}>
            No task found for this date
          </Typography>
        </Box>
      }
      {/* {
        isLoading &&
        <Box
          sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <Typography variant='h5' sx={{ fontWeight: 500, color: 'grey' }}>
            Loading...
          </Typography>
        </Box>
      } */}
      {
        taskAssigned && (
          <DashboardTaskFilter
            properties={properties?.data?.data || []}
            units={units?.data || []}
            setSelProperty={setSelProperty}
            users={users?.data?.data || []}
            onChange={onChange}
            handleChangeUnit={handleChangeUnit}
            setResources={setResources}
          />
        )
      }
    </Box>
  );
};

CalendarToolbar.propTypes = {
  children: PropTypes.node,
  date: PropTypes.instanceOf(Date).isRequired,
  mobile: PropTypes.bool,
  onAddClick: PropTypes.func,
  onDateNext: PropTypes.func,
  onDatePrev: PropTypes.func,
  onDateToday: PropTypes.func,
  onViewChange: PropTypes.func,
  view: PropTypes.oneOf([
    'timeGridDay',
    'listWeek'
  ]).isRequired
};
