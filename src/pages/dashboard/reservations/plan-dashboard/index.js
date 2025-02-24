import "@fullcalendar/common/main.css";
// import "@fullcalendar/daygrid/main.css";
// import "@fullcalendar/timegrid/main.css";
// import "@fullcalendar/list/main.css";
// import "@fullcalendar/timeline/main.css";
import { useCallback, useEffect, useRef, useState } from "react";
import Head from "next/head";
import FullCalendar from "@fullcalendar/react";

// import { Calendar, CalendarOptions } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
// import listPlugin from '@fullcalendar/list';
// import timelinePlugin from "@fullcalendar/timeline";
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { CalendarToolbar } from "../../../../components/dashboard/calendar/calendar-toolbar";
import { gtm } from "../../../../lib/gtm";
import { useDispatch } from "../../../../store";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { setHours, setMinutes, subDays } from "date-fns";
import { TaskDrawer } from "../../../../components/task-drawer";
import { Plus as PlusIcon } from '../../../../icons/plus';
import useAxios from "../../../../services/useAxios";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { SeverityPill } from "../../../../components/severity-pill";
import toast from "react-hot-toast";


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

const CalendarView = () => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const calendarRef = useRef(null);
    const smDown = useMediaQuery((theme) => theme.breakpoints.down("sm"));
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState("timeGridDay");
    const [reservationEvents, setReservationEvents] = useState([]);
    const [resources, setResources] = useState([]);
    const [isEditable, setIsEditable] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState();
    const [unitsObj, setUnitsObj] = useState();
    const [units, setUnits] = useState([]);
    const [taskAssigned, setTaskAssigned] = useState(true);
    const [isRefreshed, setIsRefreshed] = useState(false)
    const [dialog, setDialog] = useState({
        isOpen: false,
        eventId: undefined,
        isEdit: false,
        task: undefined,
        type: ''
    });
    const [dashboardFilters, setDashboardFilters] = useState({
        property_id: null,
        unit_id: []
    });

    // console.log('resources', resources, 'events', reservationEvents);
    console.log('units', units);

    const [initialLoad, setInitialLoad] = useState(false);

    const customInstance = useAxios();

    const { data: taskData, refetch: taskRefetch, isLoading: taskLoading } = useQuery(
        "allTasks",
        () =>
            customInstance.get(
                `tasks?limit=100&page=0&filter.property_id=${dashboardFilters?.property_id}&filter.unit_id=$in:${dashboardFilters.unit_id.join(",")}`
            ), { enabled: dashboardFilters.unit_id.length > 0 }
    );

    const { data, refetch, isLoading, isFetching } = useQuery(
        "allReservatios",
        () =>
            customInstance.get(
                `reservations?limit=100&page=0&filter.is_planed=$in:${0}&filter.is_hostaway=$in:${1}&filter.property_id=${dashboardFilters.property_id}
                &filter.unit_id=$in:${dashboardFilters.unit_id?.join(",")}`
            ),
        { enabled: dashboardFilters.unit_id.length > 0 }
    );

    const { data: unitData } = useQuery(
        ["unitById", dashboardFilters.unit_id[dashboardFilters.unit_id.length - 1]],
        () => customInstance.get(`units/${dashboardFilters.unit_id[dashboardFilters.unit_id.length - 1]}`),
        { enabled: dashboardFilters.unit_id.length > 0 }
    );

    const { mutateAsync: updateTask } = useMutation((data) =>
        customInstance.patch(`tasks/${data?.id}`, data)
    );

    useEffect(() => {
        if (unitData !== undefined) {
            const resourceArr = [...resources, { id: unitData.data.id, title: unitData.data.unit_name }]
            const resourceIds = [...new Set([...resourceArr].map(item => item.id))]
            const finalResources = resourceIds.map(item => resourceArr.find(ri => ri.id === item))
            console.log('finalResources', finalResources)
            setResources(finalResources)
            setUnits([...units, unitData.data])
        }
    }, [unitData])

    useEffect(() => {
        if (resources.length > dashboardFilters.unit_id.length) {
            const filterResources = [...resources].filter(item => dashboardFilters.unit_id.includes(item.id.toString()))
            setResources(filterResources)
            setUnits([...units].filter(item => dashboardFilters.unit_id.includes(item.id.toString())))
        }
    }, [dashboardFilters.unit_id, resources, units])

    // console.log('dashboardFilters.unit_id', dashboardFilters.unit_id, 'dashboardFilters?.property_id', dashboardFilters?.property_id);

    const handleFiltersChange = (filterSelection) => {
        let filter = {
            property_id: "",
            unit_id: []
        };

        if (filterSelection?.property?.length > 0) {
            filter.property_id = `$in:${filterSelection.property?.join(",")}`;
        }

        if (filterSelection?.unit?.length > 0) {
            filter.unit_id = filterSelection.unit;
        }

        setInitialLoad(true);
        setDashboardFilters(filter);
    };

    useEffect(() => {
        if ((dashboardFilters.property_id && dashboardFilters.unit_id.length > 0) || isRefreshed) {
            refetch();
            taskRefetch()
            setTimeout(() => {
                setIsRefreshed(false)
            }, 1000)
        }
    }, [dashboardFilters.property_id, dashboardFilters.unit_id, isRefreshed]);

    useEffect(() => {
        // console.log('reservation data', data?.data?.data);
        setEvents()
    }, [data, dashboardFilters.unit_id, taskData])

    const handleChangeUnit = useCallback((e, unitsData) => {
        console.log('unit callback');
        const foundUnitIds = unitsData.filter(item => item.unit_name.startsWith(e.target.value) || item.unit_name.includes(e.target.value))?.map(item => item.id.toString())
        console.log('foundUnit', foundUnitIds);
        if (foundUnitIds && foundUnitIds.length > 0) {
            setDashboardFilters({
                property_id: null,
                unit_id: foundUnitIds
            })
        }
        // setResources([{ id: foundUnit.id, title: foundUnit.unit_name }])
    }, [])

    useEffect(() => {

        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();

            calendarApi.updateSize();
        }

    }, [])

    useEffect(() => {
        gtm.push({ event: "page_view" });
    }, []);

    const setDateFilter = () => {
        const today = new Date(date);
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        return `${dayjs(today.toLocaleString()).format("YYYY-MM-DD")},${dayjs(tomorrow.toLocaleString()).format("YYYY-MM-DD")}`;
    }

    const cellHead = document.getElementsByClassName('fc-col-header-cell-cushion');
    useEffect(() => {
        if (cellHead[0] && taskAssigned === true && !isLoading && !isFetching) {
            cellHead[0].innerHTML = ""
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cellHead?.length])

    const setEvents = useCallback(() => {
        let events = [];
        let taskEvents = [];
        if (data?.data?.data && data?.data?.data?.length > 0
            && dashboardFilters.unit_id.length > 0
        ) {
            const filteredReservation = [...data?.data?.data]?.filter((item) => dashboardFilters.unit_id.includes(item?.unit_id?.toString())).sort((a, b) => new Date(a.arrivalDate).valueOf() - new Date(b.arrivalDate).valueOf())
            events = filteredReservation.map((item, idx) => {
                const nextReserv = filteredReservation[idx + 1]
                const nextArrivalDate = (nextReserv || nextReserv !== undefined) && nextReserv.unit_id === item.unit_id ? nextReserv.arrivalDate : null
                const reservationObj = {
                    id: item.id,
                    title: `${item.guestName} (${item.reservationId}) (depart: ${item?.departureDate})  ${nextArrivalDate ? `(next: ${nextArrivalDate})` : ''}`,
                    resourceId: item.unit_id,
                    type: 'Reservation',
                    allDay: false,
                    start: item?.arrivalDate,
                    end: item?.departureDate,
                    unit_name: item.unit?.unit_name,
                    property: item.property,
                    unit: item.unit,
                    unit_type: item.unit_type,
                    // color: idx === 0 ? "#FFFFFF" : "#424242",
                }
                return reservationObj
            })

        }
        if (taskData?.data?.data && taskData?.data?.data.length > 0 && dashboardFilters.unit_id.length > 0) {
            taskEvents = [...taskData?.data?.data]?.map(item => {
                const taskObj = {
                    id: item.id,
                    title: item.task_title,
                    resourceId: item.unit_id,
                    type: 'Task',
                    allDay: false,
                    date: item?.due_at,
                    color: "#424242",
                    ...item

                }
                return taskObj
            })
        }
        setReservationEvents([...events, ...taskEvents]);
        if (dashboardFilters.unit_id.length === 0) {
            setResources([])
            setReservationEvents([])
        }
    }, [data?.data?.data, dashboardFilters.unit_id, taskData?.data?.data])

    // const handleAddClick = (unit_id) => {
    //     let selunit;
    //     if (unitsObj[unit_id]) {
    //         selunit = {
    //             property: unitsObj[unit_id]?.property,
    //             unit: unitsObj[unit_id].unit,
    //             unit_type: unitsObj[unit_id].unit_type
    //         }
    //     }
    //     setDialog({
    //         task: selunit
    //     });
    //     setIsEditable(true);
    //     setTimeout(() => setDialog({
    //         isOpen: true,
    //         task: selunit
    //     }), 1000)
    // };

    const handleEventSelect = (arg) => {
        if (arg.event._def.extendedProps.type === 'Task') {
            let task
            if (arg.event._def.extendedProps.type === 'Task') {
                const extendedProps = JSON.parse(JSON.stringify(arg.event._def.extendedProps))
                delete extendedProps.type
                task = extendedProps
            }
            setDialog({
                ...dialog,
                isOpen: true,
                isEdit: task !== undefined ? true : false,
                task: task !== undefined ? task : null,
                type: arg.event._def.extendedProps.type
            });
        } else {
            const task = {
                property: arg.event._def.extendedProps.property,
                unit: arg.event._def.extendedProps.unit,
                unit_type: arg.event._def.extendedProps.unit_type
            }
            setDialog({ ...dialog, task })
            setTimeout(() => {
                setDialog({
                    ...dialog,
                    isOpen: true,
                    type: arg.event._def.extendedProps.type
                });
            }, 1000)
        }
    };

    // const handleEventDrop = async (arg) => {
    //     const { event } = arg;

    //     try {
    //         await dispatch(
    //             updateEvent(event.id, {
    //                 allDay: event.allDay,
    //                 start: event.start?.getTime(),
    //                 end: event.end?.getTime(),
    //             })
    //         );
    //     } catch (err) {
    //         console.error(err);
    //     }
    // };

    const handleCloseDialog = () => {
        setDialog({
            isOpen: false,
            eventId: undefined,
            isEdit: false,
            task: undefined
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
        const task_type = data?.extendedProps?.task_type
        return (
            <Box>
                {data?.extendedProps?.type === 'Task' ?
                    <Box sx={{ display: 'flex', gap: '10px', backgroundColor: '#eeeeee', boxShadow: 'revert', borderRadius: 1, position: 'relative' }}>
                        <Box sx={{ flex: 1.5, display: "flex", flexDirection: "column", gap: 0, lineHeight: 1, padding: 0.5 }}>
                            <Typography variant="subtitle2" color={'#424242'}>{data?.title.slice(0, 25)}{data?.title?.length > 25 && '...'} <Box sx={{ width: 50 }}>
                                <SeverityPill color="success"> {data?.extendedProps?.priority || ""}</SeverityPill>
                            </Box></Typography>
                            {data?.extendedProps?.assigned_to_team ?
                                <Typography color={'#424242'} sx={{ fontSize: 12 }}>{`${data?.extendedProps?.assigned_to?.first_name} ${data?.extendedProps?.assigned_to?.last_name}(${data?.extendedProps?.assigned_to_team?.team_name})`}</Typography>
                                : data?.extendedProps?.assigned_to ?
                                    <Typography color={'#424242'} sx={{ fontSize: 12 }}>{
                                        `${data?.extendedProps?.assigned_to?.first_name} ${data?.extendedProps?.assigned_to?.last_name}`}
                                    </Typography> :
                                    <Typography color={'#424242'} sx={{ fontSize: 12 }}>{
                                        `Not assigned`}
                                    </Typography>
                            }
                        </Box>
                        <Box sx={{ position: 'absolute', top: 4, right: 5 }}>
                            <SeverityPill color={task_type === 'Housekeeping' ? 'info' : task_type === 'Maintenance' ? 'warning' : task_type === 'Inspection' ? 'success' : 'error'}> {data?.extendedProps?.task_type.slice(0, 1) || ""}</SeverityPill>
                        </Box>
                    </Box>
                    :
                    <Box sx={{ display: 'flex', gap: '10px', backgroundColor: '#eeeeee' }}>
                        <Box id="unit">
                            <Box sx={{ flex: 1.5, display: "flex", flexDirection: "column", gap: 0, lineHeight: 1, }}>
                                <Typography variant="subtitle2" color={'#424242'}>{data?.title}</Typography>
                            </Box>
                        </Box>
                    </Box>
                }
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
                    // onAddClick={handleAddClick}
                    view={view}
                    mobile={smDown}
                    onChange={handleFiltersChange}
                    isLoading={isLoading}
                    handleChangeUnit={handleChangeUnit}
                    setResources={setResources}
                />
                <Box sx={{ display: 'flex', flexDirection: 'row', paddingLeft: 5, paddingRight: 5, position: 'relative' }}>
                    <FullCalendarWrapper style={{ width: '100%', marginLeft: 10, marginRight: 10 }}>
                        <FullCalendar
                            schedulerLicenseKey="0842071129-fcs-1715923642"
                            plugins={[resourceTimelinePlugin, dayGridPlugin, timeGridPlugin, interactionPlugin
                            ]}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'resourceTimelineMonth,resourceTimelineWeek,resourceTimelineDay'
                            }}
                            initialView="resourceTimelineMonth"

                            nowIndicator={true}
                            editable={true}
                            selectable={true}
                            selectMirror={true}
                            resources={resources}
                            resourceAreaWidth={'20%'}
                            resourceAreaColumns={[{
                                field: 'title',
                                headerContent: 'Units'
                            }]}
                            eventDrop={(eventinfo) => {
                                console.log('event info', eventinfo);
                                console.log('eventinfo.delta.milliseconds', eventinfo.delta.milliseconds);
                                const eventDate = new Date(eventinfo?.event?._instance?.range?.start)
                                let task_date = dayjs(eventDate).format("YYYY-MM-DD");
                                task_date = new Date(task_date)
                                let formatted_due_time = null;
                                const taskPayload = JSON.parse(JSON.stringify(eventinfo?.event?._def.extendedProps))
                                if (eventinfo.delta.milliseconds !== 0) {
                                    const task_date = taskPayload.due_at.split('T')[0]
                                    const task_hours = taskPayload.due_at.split('T')[1]
                                    console.log('task_date', task_date, 'task_hours', task_hours);
                                    const updated_hours = new Date(eventinfo.delta.milliseconds).getHours()
                                    formatted_due_time = `${task_date}T${task_hours}`;
                                    console.log('formatted_due_time', formatted_due_time);
                                }
                                delete taskPayload.property;
                                delete taskPayload.unit_type;
                                delete taskPayload.unit;
                                delete taskPayload.created_by;
                                delete taskPayload.rrulestr;
                                delete taskPayload.inspected_by;
                                delete taskPayload.assigned_to;
                                delete taskPayload.due_time;
                                delete taskPayload.task_inspection;
                                delete taskPayload.video_stream;
                                delete taskPayload.owner_querries
                                delete taskPayload.type
                                console.log('task payload', {
                                    id: eventinfo?.event?._def.publicId,
                                    ...taskPayload,
                                    due_at: task_date,
                                    due_time: formatted_due_time,
                                });
                                if (taskPayload.status === 'Pending') {
                                    (async () => {
                                        const taskData = await updateTask({
                                            id: eventinfo?.event?._def.publicId,
                                            ...taskPayload,
                                            due_at: task_date,
                                            due_time: formatted_due_time,
                                        })
                                        // console.log('taskData', taskData);
                                        if (taskData.status === 200) {
                                            toast.success("Task updated successfully!");
                                        } else {
                                            toast.error("Task updated failure!");
                                        }
                                    })()
                                }
                            }}

                            slotMinWidth={200}
                            slotLabelFormat={[
                                { day: '2-digit' },
                                { weekday: 'short', hour: '2-digit', omitCommas: true }
                            ]}
                            dateClick={(info) => {
                                console.log('date clicks', info);
                                const resourceUnitId = info?.resource?._resource?.id
                                const foundUnit = units.find(item => item.id.toString() === resourceUnitId)
                                console.log('foundUnit', foundUnit);
                                if (foundUnit) {
                                    const task = {
                                        property: foundUnit.property,
                                        unit: foundUnit,
                                        unit_type: foundUnit.unit_type
                                    }
                                    setDialog({ ...dialog, task })
                                    setDate(new Date(info.dateStr))
                                    setTimeout(() => {
                                        setDialog({
                                            ...dialog,
                                            isOpen: true,
                                            type: 'Unit'
                                        });
                                    }, 1000)
                                }
                            }}
                            events={reservationEvents}
                            eventContent={renderEventContent}
                            eventClick={(arg) => {
                                console.log('event click', arg);
                                // if (arg.event._def.extendedProps.type === 'Reservation') {
                                //     handleEventSelect(arg)
                                // }
                                handleEventSelect(arg)
                            }}
                        />

                    </FullCalendarWrapper>
                    <Box sx={{ cursor: 'pointer', position: "absolute", top: -15, right: 45 }} onClick={() => {
                        if (dashboardFilters.unit_id.length > 0) {
                            setIsRefreshed(true)
                        }
                    }}>
                        <SeverityPill sx={{ cursor: 'pointer' }} color={'error'}>{isRefreshed ? 'Loading...' : 'Refresh'}</SeverityPill>
                    </Box>
                </Box>
                <TaskDrawer
                    onClose={handleCloseDialog}
                    open={dialog.isOpen}
                    isEdit={true}
                    task={dialog.task && dialog.type === 'Task' ? dialog.task : null}
                    isManager={true}
                    currentDate={date}
                    dashboardTask={dialog.task}
                />
            </Box>
        </>
    );
};

CalendarView.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>{page}</DashboardLayout>
    </AuthGuard>
);

export default CalendarView;


//  <FullCalendar
//     schedulerLicenseKey="0842071129-fcs-1715923642"
//     allDaySlot={true}
//     dayMaxEventRows={3}
//     eventClick={handleEventSelect}
//     eventDisplay="block"
//     scrollTime={'00:00:00'}
//     slotDuration={'00:15:00'}
//     eventDrop={handleEventDrop}
//     eventContent={renderEventContent}
//     // events={reservationEvents
//     //     //     [
//     //     //     { title: 'event 1', date: '2024-04-01' },
//     //     //     { title: 'event 2', date: '2024-04-02' }
//     //     // ]
//     // }
//     headerToolbar={{
//         left: 'prev,next today',
//         center: 'title',
//         right: 'dayGridMonth,timeGridWeek,timeGridDay'
//     }}
//     height={800}
//     initialDate={date}
//     initialView="dayGridMonth"
//     plugins={[
//         dayGridPlugin,
//         interactionPlugin,
//         listPlugin,
//         timeGridPlugin,
//         timelinePlugin,
//         resourceTimelinePlugin
//     ]}
//     ref={calendarRef}
//     rerenderDelay={10}
//     selectable
// /> 