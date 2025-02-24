import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "react-query";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { Plus as PlusIcon } from "../../../icons/plus";
import { gtm } from "../../../lib/gtm";
import useAxios from "../../../services/useAxios";
import { TaskTable } from "../../../components/dashboard/task/task-list-table";
import { TaskFilter } from "../../../components/dashboard/task/task-list-filters";
import { TaskDrawer } from "../../../components/task-drawer";
import { InspectionDrawer } from "../../../components/inspection-drawer";
import { InspectionCallDialog } from "../../../components/dashboard/inspection-call-dialog";
import { addDays, format } from "date-fns";
import { managerLogin, getUser } from "../../../utils/helper";
import useNotificationStore from "../../../contexts/zustand-store";
import localforage from "localforage";
import useSound from "use-sound";
import TaskBulkUpload from "../../../components/dashboard/task/bulk-upload";
import { toast } from "react-hot-toast";
import { LoadingButton } from "@mui/lab";
import { Loader } from "../../../components/loader";

const TaskList = () => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [isAdd, setIsAdd] = useState(true);
  const [isEdit, setIsEdit] = useState(true);
  const [taskId, setTaskId] = useState();
  const [videoMode, setVideoMode] = useState(true);
  const [selProperty, setSelProprty] = useState();
  const [inspectionCallDiag, setInspectionCallDiag] = useState(false);
  const [newCall, setNewCall] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinCall, setJoinCall] = useState(false);
  const [taskFilter, setTaskFilter] = useState({
    element: "",
    unit: "",
    priority: "",
    executor: "",
    inspector: "",
    tasktype: "",
    dueby: "",
    status: "",
    inspection: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isInspection, setIsInspection] = useState(false);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [isTaskRefresh, setIsTaskRefresh] = useState(false);
  const [selTasks, setSelTasks] = useState([]);
  const [getUnassigned, setGetUnassigned] = useState(false);
  const [assignEmplDate, setAssignEmlDate] = useState({
    startDate: null,
    endDate: null
  })

  const [play] = useSound("/calling-tone.wav");

  const isManager = managerLogin();
  const user = getUser();
  const customInstance = useAxios();
  const router = useRouter();
  const { notifications } = useNotificationStore();
  const isVendor = user?.user_role?.role === "Vendor";

  const { data, refetch: taskRefetch, isLoading } = useQuery(
    "allTasks",
    () =>
      customInstance.get(
        // 'tasks'
        `tasks?limit=${rowsPerPage}&page=${page + 1
        }&search=${searchText}&filter.property_id=$in:${selProperty?.id
        }&filter.unit_id=${taskFilter.unit}&filter.inspected_by_id=${isManager ? taskFilter.inspector : !isVendor ? `$in:${user?.id}` : ""
        }&filter.vendor_id=${isManager ? "" : isVendor ? `$in:${user?.id}` : ""
        }&filter.assigned_to_id=${taskFilter.executor}&filter.element_id=${taskFilter.element
        }&filter.due_at=${taskFilter.dueby}&filter.priority=${taskFilter.priority
        }&filter.task_type=${taskFilter.tasktype}&filter.status=${taskFilter.status
        }&filter.inspection_status=${isVendor ? "$in:Complete" : taskFilter.inspection
        }&filter.isAssigned=$in:${taskFilter.isAssigned || 0}`
      ),
    { enabled: selProperty?.id !== undefined, refetchInterval: 20000 }
  );

  const { data: properties } = useQuery("allProperty", () =>
    customInstance.get(`properties`)
  );

  const { data: units, refetch: unitsRefetch } = useQuery(
    "propertyUnits",
    () =>
      customInstance.get(
        `units/unit-type-or-property?property_id=${selProperty?.id}`
      ),
    { enabled: selProperty?.id !== undefined }
  );

  const { data: users } = useQuery(
    "allUsers",
    () => customInstance.get(`users`),
    {
      enabled: isManager,
    }
  );

  const { data: elements } = useQuery("allElements", () =>
    customInstance.get(`elements`)
  );

  const { data: streamingToken, refetch: streamTokenRefetch } = useQuery(
    "streamingToken",
    () =>
      customInstance.get(
        `auth/generate-100ms-token?token_type=App&room_id=${task?.data?.video_stream?.room_id}&user_id=${user.id}&role=broadcaster`
      ),
    {
      enabled: false,
    }
  );

  const { mutateAsync: addEmployees, isLoading: assigningEmp } = useMutation((data) =>
    customInstance.post(`tasks/assignEmployee`, data)
  );

  const { mutateAsync: addTeams, isLoading: assigningTeam } = useMutation((data) =>
    customInstance.post(`tasks/assignTeam`, data)
  );

  const { mutateAsync: copytasks, isLoading: copytasksLoading, data: copytaskData } = useMutation((data) =>
    customInstance.post(`tasks/copytasks`, data)
  );
  // console.log('copytaskData', copytaskData);
  useEffect(() => {
    if (copytaskData !== undefined) {
      setSelTasks([])
    }
  }, [copytaskData])

  const {
    data: task,
    isLoading: isTaskLoading,
    isFetching: isTaskFetching,
  } = useQuery(
    ["taskById", taskId],
    () => customInstance.get(`tasks/${taskId}`),
    { enabled: taskId !== undefined }
  );

  const handleSearchChange = (event) => {
    event.preventDefault();
    setSearchText(search);
  };

  const handleFiltersChange = (filterSelection) => {
    let filter = {
      element: "",
      unit: "",
      priority: "",
      executor: "",
      inspector: "",
      tasktype: "",
      dueby: "",
      status: "",
      inspection: "",
    };
    if (filterSelection?.element?.length > 0) {
      filter.element = `$in:${filterSelection.element?.join(",")}`;
    }
    if (filterSelection?.unit?.length > 0) {
      filter.unit = `$in:${filterSelection.unit?.join(",")}`;
    }
    if (filterSelection?.priority?.length > 0) {
      filter.priority = `$in:${filterSelection.priority?.join(",")}`;
    }
    if (filterSelection?.executor?.length > 0) {
      filter.executor = `$in:${filterSelection.executor?.join(",")}`;
    }
    if (filterSelection?.inspector?.length > 0) {
      filter.inspector = `$in:${filterSelection.inspector?.join(",")}`;
    }
    if (filterSelection?.tasktype?.length > 0) {
      filter.tasktype = `$in:${filterSelection.tasktype?.join(",")}`;
    }
    if (filterSelection?.status?.length > 0) {
      filter.status = `$in:${filterSelection.status?.join(",")}`;
    }
    if (filterSelection?.inspection?.length > 0) {
      filter.inspection = `$in:${filterSelection.inspection?.join(",")}`;
    }
    if (filterSelection?.dueby?.length > 0) {
      let start_date = format(new Date(), "yyyy-MM-dd");
      let end_date = format(new Date(), "yyyy-MM-dd");

      if (filterSelection?.dueby?.includes("0")) {
        end_date = format(addDays(new Date(), 1), "yyyy-MM-dd");
        console.log('filter today', start_date, end_date)
      }
      if (filterSelection?.dueby?.includes("1")) {
        end_date = format(addDays(new Date(), 3), "yyyy-MM-dd");
        console.log('filter tomorrow', start_date, end_date)
      }
      if (filterSelection?.dueby?.includes("7")) {
        let curr = new Date(); // get current date
        let first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        let last = first + 7; // last day is the first day + 6
        var lastday = new Date(curr.setDate(last));

        end_date = format(lastday, "yyyy-MM-dd");
        console.log('filter 7 days', start_date, end_date)
      }
      filter.dueby = `$btw:${start_date},${end_date}`;
    }
    if (getUnassigned === true) {
      filter.isAssigned = 1;
    } else {
      filter.isAssigned = 0;
    }

    setTaskFilter(filter);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const startInspection = (property_id, task_id, newCall) => {
    if (property_id && properties?.data?.data) {
      const prop_data = properties?.data?.data?.find(
        (_) => _.id === parseInt(property_id)
      );
      if (prop_data) {
        setSelProprty(prop_data);
      }
    }
    if (task_id) {
      setTaskId(parseInt(task_id));
      if (newCall) {
      } else {
        setIsInspection(true);
      }
    }
  };

  const onJoinInspectionCall = () => {
    streamTokenRefetch();
    setJoining(true);
    setNewCall(false);
    setJoinCall(false);
    setInspectionCallDiag(false);
    setIsInspection(true);
    setIsInspectionOpen(true);
  };

  const onViewTask = (edit, id) => {
    setTaskId(id);
    setIsAdd(false);
    setIsEdit(edit);
    setIsInspection(false);
  };

  const onInspectionView = (id, liveCall) => {
    setJoinCall(liveCall);
    setTaskId(id);
    setIsInspection(true);
  };

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  useEffect(() => {
    if (selProperty?.id) {
      setIsTaskRefresh(true);
      taskRefetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowsPerPage, page, taskFilter, searchText, selProperty, taskRefetch]);

  useEffect(() => {
    if (task && taskId) {
      // if (task?.data?.video_stream && !task?.data.video_stream?.recording_url) {
      //   streamTokenRefetch();
      // }
      if (!isInspection && !newCall) {
        setIsOpen(true);
      } else {
        if (newCall) {
          setInspectionCallDiag(true);
        } else {
          if (joinCall) {
            onJoinInspectionCall();
          } else {
            setIsInspectionOpen(true);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, taskId]);

  useEffect(() => {
    setIsTaskRefresh(false);
  }, [data]);

  useEffect(() => {
    if (router) {
      const property_id = router.query.property_id;
      const task_id = router.query.task_id;
      if (property_id && task_id) {
        startInspection(property_id, task_id, false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (properties?.data?.data) {
      setSelProprty(properties?.data?.data[0]);
    }
  }, [properties]);

  useEffect(() => {
    if (selProperty?.id) {
      unitsRefetch();
    }
  }, [selProperty, unitsRefetch]);

  const checkNotification = async () => {
    let notification_store = await localforage.getItem("v-inspect-zustand");
    notification_store = JSON.parse(notification_store);
    const newNotifications = notification_store?.state?.notifications ?? [];

    if (JSON.stringify(notifications) !== JSON.stringify(newNotifications)) {
      setNewCall(true);
      startInspection(
        newNotifications[0].roomInfo.property_id,
        newNotifications[0].roomInfo.task_id,
        true
      );
    }
  };

  useEffect(() => {
    let notif = setTimeout(() => {
      checkNotification();
    }, 2000);

    return () => {
      clearTimeout(notif);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  useEffect(() => {
    if (notifications?.length > 0 && notifications[0].newCall) {
      setNewCall(true);
      startInspection(
        notifications[0].roomInfo.property_id,
        notifications[0].roomInfo.task_id,
        true
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  const addEmployeesHandler = async (isAssignTeam) => {
    const data = {
      property_id: selProperty?.id,
    }

    if (selTasks.length > 0) {
      data.task_ids = selTasks;
    }

    if (assignEmplDate.startDate && assignEmplDate.endDate) {
      data.start_date = new Date(assignEmplDate.startDate).toISOString();
      data.end_date = new Date(assignEmplDate.endDate).toISOString();
    }

    try {
      if (isAssignTeam && isAssignTeam === 'assignTeam') {
        await addTeams(data)
      } else {
        await addEmployees(data);
      }
      if (selTasks.length > 0) {
        setSelTasks([]);
      }
      if (assignEmplDate.startDate && assignEmplDate.endDate) {
        setAssignEmlDate({
          startDate: null,
          endDate: null
        })
      }
      if (isAssignTeam && isAssignTeam === 'assignTeam') {
        toast.success('Assigned teams successfully.')
      } else {
        toast.success('Assigned employees successfully.')
      }
      taskRefetch();
    } catch (err) {
      console.error(err);
      toast.error(`${err?.response?.data?.message ?? "Something went wrong!"}`);
    }
  }

  return (
    <AuthGuard>
      <DashboardLayout
        isLoading={
          isLoading || isTaskLoading || isTaskFetching || isTaskRefresh || copytasksLoading
        }
      >
        <Head>
          <title>Dashboard: Tasks</title>
        </Head>
        {
          (assigningTeam || assigningEmp) && <Loader />
        }
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 5,
          }}
        >

          <TaskBulkUpload
            taskRefetch={taskRefetch}
            open={open}
            setOpen={setOpen} />
          {inspectionCallDiag && play()}
          <Container maxWidth="xl">
            <InspectionCallDialog
              task={task?.data}
              inspectionCallDiag={inspectionCallDiag}
              setInspectionCallDiag={() => {
                setInspectionCallDiag(false);
                setNewCall(false);
              }}
              onJoinInspectionCall={onJoinInspectionCall}
              joining={joining}
            />
            <TaskDrawer
              onClose={() => {
                setTaskId();
                setIsOpen(false);
              }}
              open={isOpen}
              isEdit={isEdit}
              task={isAdd ? null : task?.data}
              isManager={isManager}
            />
            <InspectionDrawer
              onClose={() => {
                setTaskId();
                setVideoMode(true)
                setIsInspectionOpen(false);
              }}
              videoMode={videoMode}
              setVideoMode={setVideoMode}
              open={isInspectionOpen}
              isEdit={isEdit}
              task={task?.data}
              streamingToken={streamingToken}
            />
            <Box sx={{ mb: 4 }}>
              <Grid
                container
                justifyContent="center"
                alignItems="center"
                columnSpacing={{ xs: 0, sm: 2, md: 2 }}
                rowSpacing={{ xs: 1 }}
              >
                <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
                  <Typography variant="h4">Tasks</Typography>
                </Grid>
                <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
                  <Autocomplete
                    options={properties?.data?.data ?? []}
                    getOptionLabel={(option) =>
                      option.property_name ? option.property_name : ""
                    }
                    fullWidth
                    disableClearable
                    value={
                      selProperty && properties
                        ? properties?.data?.data?.find(
                          (_) => _.id === selProperty?.id
                        )
                        : ""
                    }
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label="Select Property"
                        placeholder="Select Property"
                      />
                    )}
                    onChange={(event, newValue) => setSelProprty(newValue)}
                  />
                </Grid>
                {!isManager && <Grid item xs={12} md={4} lg={4}></Grid>}

                {user && user?.user_role?.role === 'Manager' ? (
                  <React.Fragment>
                    <Grid item xs={12} sm={7} md={7} lg={7} xl={7} sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "5px"
                    }}>
                      <LoadingButton
                        loading={assigningEmp}
                        component="a"
                        variant="contained"
                        onClick={addEmployeesHandler}
                        disabled={(selTasks.length === 0 && assignEmplDate.endDate === null) || data === null}
                        sx={{
                          minHeight: '41px',
                          maxWidth: '164px'
                        }}
                      >
                        {`${assigningEmp ? '' : 'Assign Employees'}`}
                      </LoadingButton>
                      <LoadingButton
                        loading={assigningEmp}
                        component="a"
                        variant="contained"
                        onClick={() => addEmployeesHandler('assignTeam')}
                        disabled={(selTasks.length === 0 && assignEmplDate.endDate === null) || data === null}
                        sx={{
                          minHeight: '41px',
                          maxWidth: '164px'
                        }}
                      >
                        {`${assigningEmp ? '' : 'Assign Teams'}`}
                      </LoadingButton>
                      <LoadingButton
                        loading={copytasksLoading}
                        component="a"
                        variant="contained"
                        disabled={selTasks.length === 0}
                        onClick={() => {
                          if (selTasks.length > 0) {
                            copytasks({ task_ids: selTasks })
                            toast.success("Task copied successfully!");
                          }
                        }}
                      >
                        Copy
                      </LoadingButton>
                      <Button
                        component="a"
                        variant="contained"

                        onClick={() => {
                          setOpen(true)
                        }}
                      >
                        Bulk Upload
                      </Button>
                      <Button
                        component="a"
                        startIcon={<PlusIcon fontSize="small" />}
                        variant="contained"
                        style={{ float: "right" }}
                        onClick={() => {
                          setIsAdd(true);
                          setIsEdit(true);
                          setIsOpen(true);
                        }}
                      >
                        Add
                      </Button>
                    </Grid>
                  </React.Fragment>
                ) : <Grid item xs={12} md={4} lg={4}></Grid>}
              </Grid>
            </Box>
            <Card>
              <Card>
                <TaskFilter
                  elements={elements?.data?.data || []}
                  units={units?.data || []}
                  users={users?.data?.data || []}
                  onChange={handleFiltersChange}
                  handleSearchChange={handleSearchChange}
                  setSearch={setSearch}
                  isManager={isManager}
                  isVendor={isVendor}
                  getUnassigned={getUnassigned}
                  setGetUnassigned={setGetUnassigned}
                  assignEmplDate={assignEmplDate}
                  setAssignEmlDate={setAssignEmlDate}
                />
                <TaskTable
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  page={page}
                  tasks={data ? data?.data?.data : []}
                  tasksCount={data ? data?.data?.meta?.totalItems : 0}
                  rowsPerPage={rowsPerPage}
                  editable={true}
                  onViewTask={onViewTask}
                  onInspectionView={onInspectionView}
                  isManager={isManager}
                  isVendor={isVendor}
                  selTasks={selTasks}
                  setSelTasks={setSelTasks}
                />
              </Card>
              <Divider />
            </Card>
          </Container>
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
};

export default TaskList;