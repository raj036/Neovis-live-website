import "@fullcalendar/common/main.css";
// import "@fullcalendar/daygrid/main.css";
// import "@fullcalendar/timegrid/main.css";
// import "@fullcalendar/list/main.css";
// import "@fullcalendar/timeline/main.css";
import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import timelinePlugin from "@fullcalendar/timeline";
import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { CalendarToolbar } from "../../../../components/dashboard/calendar/calendar-toolbar";
import { gtm } from "../../../../lib/gtm";
import { useDispatch } from "../../../../store";
import { useQuery } from "react-query";
import { setHours, setMinutes, subDays } from "date-fns";
import { TaskDrawer } from "../../../../components/task-drawer";
import { Plus as PlusIcon } from '../../../../icons/plus';
import useAxios from "../../../../services/useAxios";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

const FullCalendarWrapper = styled("div")(({ theme }) => ({
  marginTop: theme.spacing(3),
  "& .fc-license-message": {
    display: "none",
  },
  "& .fc": {
    "--fc-bg-event-opacity": 1,
    "--fc-border-color": theme.palette.divider,
    "--fc-daygrid-event-dot-width": "10px",
    "--fc-event-text-color": theme.palette.primary.contrastText,
    "--fc-list-event-hover-bg-color": theme.palette.background.default,
    "--fc-neutral-bg-color": theme.palette.background.default,
    "--fc-page-bg-color": theme.palette.background.default,
    "--fc-today-bg-color": alpha(theme.palette.primary.main, 0.25),
    color: theme.palette.text.primary,
    fontFamily: theme.typography.fontFamily,
  },
  "& .fc .fc-col-header-cell-cushion": {
    paddingBottom: "10px",
    paddingTop: "10px",
    fontSize: theme.typography.overline.fontSize,
    fontWeight: theme.typography.overline.fontWeight,
    letterSpacing: theme.typography.overline.letterSpacing,
    lineHeight: theme.typography.overline.lineHeight,
    textTransform: theme.typography.overline.textTransform,
  },
  "& .fc .fc-day-other .fc-daygrid-day-top": {
    color: theme.palette.text.secondary,
  },
  "& .fc-daygrid-event": {
    borderRadius: theme.shape.borderRadius,
    padding: "0px 4px",
    fontSize: theme.typography.subtitle2.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
    lineHeight: theme.typography.subtitle2.lineHeight,
  },
  "& .fc-daygrid-block-event .fc-event-time": {
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.body2.fontWeight,
    lineHeight: theme.typography.body2.lineHeight,
  },
  "& .fc-daygrid-day-frame": {
    padding: "12px",
  },
}));

const Calendar = () => {
  const dispatch = useDispatch();
  const calendarRef = useRef(null);
  const smDown = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("timeGridDay");
  const [taskEvents, setTaskEvents] = useState([]);
  const [isEditable, setIsEditable] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState();
  const [unitsObj, setUnitsObj] = useState();
  const [taskAssigned, setTaskAssigned] = useState(true);
  const [dialog, setDialog] = useState({
    isOpen: false,
    eventId: undefined,
    isEdit: false,
    task: undefined
  });
  const [dashboardFilters, setDashboardFilters] = useState({
    property_id: "",
    unit_id: "",
    executor: ""
  });
  const [initialLoad, setInitialLoad] = useState(false);

  let isSidebarOpen = useSelector((state) => state.sidebar.sidebarOpen);

  const customInstance = useAxios();

  const { data, refetch, isLoading, isFetching } = useQuery(
    "allTasks",
    () =>
      customInstance.get(
        `tasks?&filter.property_id=${dashboardFilters?.property_id}&filter.unit_id=${dashboardFilters?.unit_id}&filter.due_at=$btw:${setDateFilter()}&filter.assigned_to_id=${dashboardFilters?.executor}`
      )
  );

  const handleFiltersChange = (filterSelection) => {
    let filter = {
      property_id: "",
      unit_id: "",
      executor: ""
    };

    if (filterSelection?.property?.length > 0) {
      filter.property_id = `$in:${filterSelection.property?.join(",")}`;
    }

    if (filterSelection?.unit?.length > 0) {
      filter.unit_id = `$in:${filterSelection.unit?.join(",")}`;
    }

    if (filterSelection?.executor?.length > 0) {
      filter.executor = `$in:${filterSelection.executor?.join(",")}`;
    }

    setInitialLoad(true);
    setDashboardFilters(filter);
  };

  useEffect(() => {
    refetch();
  }, [dashboardFilters]);

  useEffect(() => {
    setEvents();
  }, [data])

  useEffect(() => {
    if (data?.data?.data.length > 0 || data?.data?.data === undefined) {
      setTaskAssigned(true);
    } else if (initialLoad === true) {
      setTaskAssigned(true);
    } else {
      setTaskAssigned(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => {
    if (isSidebarOpen !== null || isSidebarOpen !== undefined) {
      const calendarEl = calendarRef.current;

      if (calendarEl) {
        const calendarApi = calendarEl.getApi();

        calendarApi.updateSize();
      }
    }
  }, [isSidebarOpen])

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const setDateFilter = () => {
    const today = new Date(date);
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    return `${dayjs(today.toLocaleString()).format("YYYY-MM-DD")},${dayjs(tomorrow.toLocaleString()).format("YYYY-MM-DD")}`;
  }

  const getAssignee = (taskType, task) => {
    let assignee;
    if (taskType === "Inspection") {
      assignee = task?.inspected_by?.first_name + " " +
        task?.inspected_by?.last_name
    } else {
      assignee = task?.assigned_to?.first_name + " " +
        task?.assigned_to?.last_name
    }
    if (assignee.includes('undefined')) assignee = "Unassigned";
    return assignee;
  }

  const cellHead = document.getElementsByClassName('fc-col-header-cell-cushion');
  useEffect(() => {
    if (cellHead[0] && taskAssigned === true && !isLoading && !isFetching) {
      cellHead[0].innerHTML = ""
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellHead?.length])

  const setEvents = () => {
    const events = [];
    if (data?.data) {
      const tasks = data?.data?.data;
      const units = {};
      tasks?.forEach(task => {
        if (Object.keys(units).includes(task.unit_id.toString())) {
          return;
        } else {
          units[`${task.unit_id}`] = {
            unit_id: task?.unit_id,
            unit_code: task?.unit?.unit_code,
            unit_name: task?.unit?.unit_name,
            status: task.status,
            unit: task?.unit,
            property: task?.property,
            unit_type: task?.unit_type,
            taskData: task
          }
        }
      })
      setUnitsObj(units);
      Object.keys(units)?.forEach((unit, ind) => {
        const taskObj = {
          id: units[unit].unit_id,
          title: units[unit].unit_code,
          name: units[unit].unit_name,
          color: "#FFFFFF",
          allDay: false,
          taskData: units[unit]?.taskData,
          unitTasks: tasks.filter(t => t?.unit_id === units[unit].unit_id)
            .map(d => {
              console.log(d)
              return {
                id: d.id,
                unit_id: units[unit].unit_id,
                task_title: d.task_title,
                executor: getAssignee(d.task_type, d),
                duration: d.estimated_time || 0,
              }
            }),
          status: units[unit].status,
          start: setHours(setMinutes(date, 0), 0 + (ind * 1)).getTime(),
          end: setHours(setMinutes(date, 15), 0 + (ind * 1)).getTime(),
        }

        events.push(taskObj);
      })
    }
    setTaskEvents(events);
  }

  const handleAddClick = (unit_id) => {
    let selunit;
    if (unitsObj[unit_id]) {
      selunit = {
        property: unitsObj[unit_id]?.property,
        unit: unitsObj[unit_id].unit,
        unit_type: unitsObj[unit_id].unit_type
      }
    }
    setDialog({
      task: selunit
    });
    setIsEditable(true);
    setTimeout(() => setDialog({
      isOpen: true,
      task: selunit
    }), 1000)
  };

  const handleEventSelect = (arg) => {
    setDialog({
      isOpen: false,
    });
  };

  const handleEventDrop = async (arg) => {
    const { event } = arg;

    try {
      await dispatch(
        updateEvent(event.id, {
          allDay: event.allDay,
          start: event.start?.getTime(),
          end: event.end?.getTime(),
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseDialog = () => {
    setDialog({
      isOpen: false,
    });
  };

  const handleClick = (event) => {
    if (event.currentTarget.id === "unit") {
      event.preventDefault();
    } else {
      const id = +event.currentTarget.id;
      const selectedTask = data?.data?.data.filter(t => t.id === id);
      setSelectedEvent(selectedTask[0]);
      setTimeout(() => setDialog({
        isOpen: true,
      }), 1000)
      setIsEditable(false);
    }
  }

  const renderEventContent = ({ event: { _def: data } }) => {
    return (
      <Box sx={{ display: 'flex', gap: '10px', marginLeft: 2 }}>
        <Box id="unit" onClick={handleClick} className="unitSection">
          <Box sx={{ flex: 1.5, display: "flex", flexDirection: "column", gap: 0, lineHeight: 1 }}>
            <Typography variant="h6">{data?.title}</Typography>
            <Typography variant="caption" sx={{ p: 0 }}>{data?.extendedProps.name}</Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: 'column', flex: 1, gap: '5px' }}>
            <span style={{
              padding: '2px 4px', backgroundColor: '#c7c717', color: 'white',
              fontWeight: 500, borderRadius: '5px'
            }}>
              {data?.extendedProps?.status}
            </span>
          </Box>
        </Box>
        <Box sx={{ width: `${isSidebarOpen ? "615px" : "1020px"}` }} className="taskBox">
          {
            data.extendedProps.unitTasks?.map((t) => (
              <>
                <Box
                  className="taskWrapper"
                  onClick={handleClick}
                  id={`${t.id}`} key={t.id}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <b>{t.task_title}</b>
                    <span>{t.executor}</span>
                  </Box>
                  <Box sx={{
                    padding: '3px',
                    backgroundColor: 'whitesmoke',
                    color: 'black',
                    height: '25px',
                    borderRadius: '5px',
                    fontWeight: 500
                  }} >
                    {t.duration}
                  </Box>
                </Box>
              </>
            ))
          }
        </Box>
        <Button
          onClick={() => handleAddClick(+data.publicId)}
          startIcon={<PlusIcon fontSize="small" />}
          sx={{
            order: {
              xs: -1,
              md: 0
            },
            width: {
              xs: '100%',
              md: 'auto'
            },
            height: '51px',
            position: 'absolute',
            right: 0
          }}
          variant="contained"
        >
          Add Task
        </Button>
      </Box>
    )
  }

  return (
    <>
      <Head>
        <title>Dashboard: Calendar</title>
      </Head>
      <Box
        component="main"
        sx={{
          backgroundColor: "background.paper",
          flexGrow: 1,
          py: 2,
        }}
      >
        <CalendarToolbar
          date={date}
          taskAssigned={taskAssigned}
          onAddClick={handleAddClick}
          view={view}
          mobile={smDown}
          onChange={handleFiltersChange}
          isLoading={isLoading}
        />
        {
          taskAssigned && !isLoading && !isFetching && (
            <FullCalendarWrapper>
              <FullCalendar
                allDaySlot={false}
                dayMaxEventRows={3}
                eventClick={handleEventSelect}
                eventDisplay="block"
                scrollTime={'00:00:00'}
                slotDuration={'00:15:00'}
                eventDrop={handleEventDrop}
                eventContent={renderEventContent}
                events={taskEvents}
                headerToolbar={false}
                height={800}
                initialDate={date}
                initialView="timeGridDay"
                plugins={[
                  dayGridPlugin,
                  interactionPlugin,
                  listPlugin,
                  timeGridPlugin,
                  timelinePlugin,
                ]}
                ref={calendarRef}
                rerenderDelay={10}
                selectable
              />
            </FullCalendarWrapper>
          )
        }
      </Box>
      <TaskDrawer
        onClose={handleCloseDialog}
        open={dialog.isOpen}
        isEdit={isEditable}
        task={!isEditable ? selectedEvent : null}
        isManager={true}
        currentDate={date}
        dashboardTask={dialog.task}
      />
    </>
  );
};

Calendar.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default Calendar;
