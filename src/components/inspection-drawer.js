import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  FormControlLabel,
  Card,
  Checkbox,
  Drawer,
  Fab,
  Grid,
  IconButton,
  List,
  ListItem,
  TextField,
  Typography,
  Autocomplete,
} from "@mui/material";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
import {
  useHMSActions,
  useVideo,
  selectPeers,
  useHMSStore,
  selectIsConnectedToRoom,
} from "@100mslive/react-sdk";
import { useAVToggle } from "@100mslive/react-sdk";
import { X as XIcon } from "../icons/x";
import useAxios from "../services/useAxios";
import {
  CallEndOutlined,
  ExpandMore,
  Add, Remove,
  MicNoneOutlined,
  MicOffOutlined,
  VideocamOffOutlined,
  VideocamOutlined,
} from "@mui/icons-material";
import * as dayjs from "dayjs";
import { PropertyList } from "./property-list";
import { PropertyListItem } from "./property-list-item";
import StarRatings from "react-star-ratings";
import { ImageDialog } from "./dashboard/image-dialog";
import { InspectionStatusDialog } from "./dashboard/inspection-status-dialog";
import { getUser } from "../utils/helper";
import { ConfirmDialog } from "./dashboard/confim-dialog";
import { INSPECTOR_TASK_STATUS } from "../utils/constants";

const zone = dayjs(new Date()).format("Z").split(":");
const offset = parseInt(zone[0].substring(1)) * 60 + parseInt(zone[1]);

var utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
dayjs().utcOffset(offset);

export const InspectionDrawer = (props) => {
  const { open, videoMode, setVideoMode, onClose, task, streamingToken, ...other } = props;
  const [selUnittype, setSelUnittype] = useState();
  const [checkList, setCheckList] = useState([]);
  const [uniqueArea, setUniqueArea] = useState([]);
  const [dialogStat, setDialogStat] = useState(false);
  const [callDialogStat, setCallDialogStat] = useState(false);
  const [inspectionDiag, setInspectionDiag] = useState(false);
  const [image, setImage] = useState();
  const [taskUploadedImage, setTaskUploadedImages] = useState();
  const [inspComplete, setInsComplete] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [timeSpent, setTimeSpent] = useState("");
  const [estTime, setEstTime] = useState("");
  const [selTeamMember, setSelTeamMember] = useState([]);
  const [isReviewChanging, setIsReviewChanging] = useState(false)
  const [commentidx, setCommentidx] = useState(0)
  const [inventories, setinventories] = useState([])
  const [taskQuery, setTaskQuery] = useState('')
  const [aiInspections, setAiInspections] = useState([])

  useEffect(() => {
    if (task && task.inventories) {
      setinventories(task.inventories)
    } else {
      setinventories([])
    }
    if(task && task.ai_inspection_media && task.ai_inspection_media.length) {
      setAiInspections(task.ai_inspection_media)
    } else {
      setAiInspections([])
    }
  }, [task])

  const customInstance = useAxios();
  const queryClient = useQueryClient();
  const hmsActions = useHMSActions();
  const peers = useHMSStore(selectPeers);
  const { isLocalAudioEnabled, isLocalVideoEnabled, toggleAudio, toggleVideo } =
    useAVToggle();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const user = getUser();

  const { videoRef } = useVideo({
    trackId: peers?.find(
      (_) => _.roleName === "broadcaster" && _.isLocal === false
    )?.videoTrack,
  });

  const { data: unitAreas, refetch: unitAreasRefetch } = useQuery(
    "taskUnitAreas",
    () =>
      customInstance.get(
        `unit-areas/unit-type-or-property?unit_type_id=${selUnittype?.id}`
      ),
    { enabled: selUnittype?.id !== undefined }
  );

  const { mutateAsync: completeChecklistInspection } = useMutation(
    ({ id, status }) => {
      customInstance.patch(
        `active-task-checklists/toggle-inspection-status?id=${id}&inspection_status=${status}`
      );
    }
  );

  const { data: taskInspection, refetch: refetchInspection } = useQuery(
    "taskInspection",
    () => customInstance.get(`task-inspection?filter.task_id=$in:${task?.id}`),
    { enabled: task?.id !== undefined }
  );

  const { mutateAsync: completeAreaInspection } = useMutation((data) =>
    customInstance.post(`task-inspection`, data)
  );

  const { mutateAsync: updateAreaInspection } = useMutation((data) =>
    customInstance.patch(`task-inspection/${data.id}`, data)
  );

  const { mutateAsync: updateUnitCondition } = useMutation(({ id, status }) =>
    customInstance.patch(`units/change-unit-condition/${id}/${status}`)
  );

  const { mutateAsync: updateTask } = useMutation((data) => {
    customInstance.patch(`tasks/${data?.id}`, data);
  });

  const { mutateAsync: changeInvCount } = useMutation((data) => {
    customInstance.post(`task-inventory/update-count`, data);
  });

  const { mutateAsync: addTaskQuery, data: addQueryData, error: addQueryError, isLoading: addQueryLoading } = useMutation((data) =>
    customInstance.post(`owner-query`, data)
  );

  useEffect(() => {
    if (addQueryData !== undefined && task) {
      setTaskQuery('')
      console.log('');
      (async () => {
        await queryClient.refetchQueries(["taskById", task?.id], {
          active: true,
          exact: true,
        });
      })()
    }
  }, [addQueryData, task])

  const onCompleteInspection = async (status, taskStatus) => {
    setUpdating(true);
    await updateUnitCondition({ id: task?.unit?.id, status });
    let data = { ...task };
    delete data.property;
    delete data.unit_type;
    delete data.unit;
    delete data.created_by;
    delete data.rrulestr;
    delete data.inspected_by;
    delete data.assigned_to;
    delete data.due_time;
    delete data.task_inspection;
    delete data.video_stream;
    delete data.owner_querries;
    delete data.cost

    await updateTask({
      ...data,
      inspection_status: taskStatus === "ReOpen" ? "InspectedReOpen" : "Complete",
      status: taskStatus,
      inspected_at: new Date(),
    });
    await queryClient.refetchQueries(["allTasks"], {
      active: true,
      exact: true,
    });
    toast.success("Inspection completed successfully!");
    setUpdating(false)
    setTimeout(() => {
      setInspectionDiag(false);
      leaveCall();
      onClose?.();
    }, 1000);
  };

  const onCompleteChecklist = async (id, status) => {
    await completeChecklistInspection({ id, status });
    if (status === "Complete") {
      toast.success("Checklist completed successfully!");
    }
  };

  const onCompleteArea = async (unit_area_id, id, areaIdx) => {
    let area_data = uniqueArea?.find((_) => _.unit_area_id === unit_area_id);
    const team = selTeamMember[areaIdx]
    let teamMemberIds = []
    if (team !== undefined || team) {
      teamMemberIds = team.map(item => item.id)
      area_data['team_member_ids'] = teamMemberIds
    }
    const newData = JSON.parse(JSON.stringify(area_data))
    delete newData.team
    delete newData.selected_team_member
    delete newData.inspection_comment_arr
    if (id) {
      await updateAreaInspection(newData);
    } else {
      delete newData.id;
      await completeAreaInspection(newData);
    }
    let new_area_data = [...uniqueArea];
    // console.log('new_area_data[areaIdx]', new_area_data[areaIdx])
    new_area_data[areaIdx].inspection_comment = ''
    setUniqueArea(new_area_data)
    toast.success("Area completed successfully!");
    refetchInspection();
  };

  useEffect(() => {
    if (checkList?.length > 0) {
      let data = checkList
        .map((item) => {
          const area_inspec = taskInspection?.data?.data?.find(
            (_) => _.unit_area_id === item.unit_area_id
          );
          // console.log('area_inspec', area_inspec);
          return {
            task_id: task?.id,
            inspection_type: task?.remote_inspection ? "Remote" : "Physical",
            unit_area_id: item.unit_area_id,
            inspection_rating: area_inspec ? area_inspec.inspection_rating : 0,
            inspection_comment: area_inspec?.inspection_comment_arr ? "" : area_inspec
              ? area_inspec.inspection_comment
              : "",
            id: area_inspec ? area_inspec.id : 0,
            team_id: area_inspec?.team_id ? area_inspec?.team_id : task?.assigned_to_team_id ? task?.assigned_to_team_id : null,
            team: task?.assigned_to_team_id && task?.assigned_to_team.team_members?.length > 0 ? task?.assigned_to_team?.team_members : undefined,
            selected_team_member: area_inspec?.team_members && area_inspec?.team_members.length > 0 ? area_inspec?.team_members : [],
            inspection_comment_arr: area_inspec?.inspection_comment_arr ? area_inspec?.inspection_comment_arr : []
          };
        })
        .filter(
          (value, index, self) =>
            self.findIndex((_) => _.unit_area_id === value.unit_area_id) ===
            index
        );
      setUniqueArea(data);
      setSelTeamMember(data.map(item => item.selected_team_member))
    } else {
      setUniqueArea([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkList && taskInspection, task]);

  useEffect(() => {
    if (props.task) {
      setSelUnittype(props.task?.unit_type);
      setInsComplete(
        props.task?.inspection_status === "Complete" ? true : false
      );
      // "Complete"
      // INSPECTOR_TASK_STATUS[2].value

      // Old Conversion
      // if (task?.time_spent) {
      //   let hours = Math.floor(task?.time_spent / 3600);
      //   let minutes = Math.floor(task?.time_spent / 60);

      //   if (hours > 0) {
      //     setTimeSpent(hours.toString() + " hrs");
      //   } else if (minutes > 0) {
      //     setTimeSpent(minutes.toString() + " minutes");
      //   } else {
      //     setTimeSpent("1 minute");
      //   }
      // }

      // Updated Conversion
      let time = task?.time_spent
      if(task?.totalHaltTime) {
        time = task?.totalHaltTime
      } else if (task?.time_diff && task?.time_spent && task?.time_diff > task?.time_spent) {
        time = task?.time_diff
      } else if (task?.time_spent) {
        time = task?.time_spent
      }
      console.log('time spent', time)
      let hours, minutes;
      if (time > 3600) {
        hours = Math.floor(time / 3600);
        minutes = Math.floor((time % 3600) / 60);
      } else {
        minutes = Math.ceil(time / 60);
      }
      setTimeSpent(`${hours ?? 0} hrs ${minutes} mins`);

      if (task?.estimated_time) {
        const time = task?.estimated_time
        let hours, minutes;

        if (time > 3600) {
          hours = Math.floor(time / 3600);
          minutes = Math.floor((time % 3600) / 60);
        } else {
          minutes = Math.ceil(time / 60);
        }

        setEstTime(`${hours ?? 0} hrs ${minutes} mins`);
      }

      if (props.task?.active_task_checklists) {
        setCheckList(props.task?.active_task_checklists);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.task]);

  useEffect(() => {
    if (selUnittype?.id) {
      unitAreasRefetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selUnittype]);

  useEffect(() => {
    if (
      task?.video_stream &&
      streamingToken?.data &&
      !task?.video_stream?.recording_url
    ) {
      hmsActions.join({
        userName: user.name,
        authToken: streamingToken.data,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamingToken]);

  useEffect(() => {
    window.onunload = () => {
      if (hmsActions) {
        hmsActions.leave();
      }
    };
  }, [hmsActions]);

  const leaveCall = () => {
    setCallDialogStat(false);
    if (isConnected && hmsActions) {
      hmsActions.leave();
    }
  };

  const DashedDivider = () => {
    return (
      <div
        style={{
          borderBottom: "1px dashed #65748B",
        }}
      />
    );
  };

  return (
    <Drawer
      anchor="right"
      onClose={onClose}
      open={open}
      ModalProps={{ sx: { zIndex: 2000 } }}
      PaperProps={{
        sx: {
          width: "100%",
          backgroundColor: "rgb(220 225 235)",
          maxHeight: "100%",
          overflowY: "hidden",
        },
      }}
      {...other}
    >
      <ImageDialog
        dialogStat={dialogStat}
        setDialogStat={setDialogStat}
        image={image}
      />
      <InspectionStatusDialog
        task={task}
        inspectionDiag={inspectionDiag}
        setInspectionDiag={setInspectionDiag}
        onCompleteInspection={onCompleteInspection}
        updating={updating}
      />
      <ConfirmDialog
        title="Leave Call?"
        message=" Are you sure you want to leave the call?"
        dialogStat={callDialogStat}
        setDialogStat={setCallDialogStat}
        onConfirmDialog={leaveCall}
      />
      <Grid
        container
        sx={{
          minHeight: "100%",
          position: "relative"
          //maxHeight: "100%",
          //overflowY: "hidden",
        }}
      >
        {videoMode && <Grid item md={7} xs={12}>
          <Box
            sx={{
              alignItems: "center",
              backgroundColor: "black",
              color: "primary.contrastText",
              display: "flex",
              justifyContent: "center",
              //px: 3,
              //py: 2,
              width: "100%",
              height: "100%",
              maxHeight: "100%",
              overflowY: "hidden",
              position: "relative",
            }}
          >
            {task?.video_stream ? (
              task?.video_stream?.recording_url ? (
                <video
                  src={task?.video_stream?.recording_url}
                  style={{ width: "100%", height: "100%" }}
                  controls
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    style={{ width: "50%", height: "100%" }}
                    autoPlay
                    muted
                    playsInline
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "absolute",
                      right: 10,
                    }}
                  >
                    <Fab
                      color={isLocalAudioEnabled ? "rgb(220 225 235)" : "error"}
                      onClick={toggleAudio}
                      sx={{ mb: 2 }}
                    >
                      {isLocalAudioEnabled ? (
                        <MicNoneOutlined />
                      ) : (
                        <MicOffOutlined />
                      )}
                    </Fab>
                    <Fab
                      color={isLocalVideoEnabled ? "rgb(220 225 235)" : "error"}
                      onClick={toggleVideo}
                      sx={{ mb: 2 }}
                    >
                      {isLocalVideoEnabled ? (
                        <VideocamOutlined />
                      ) : (
                        <VideocamOffOutlined />
                      )}
                    </Fab>
                    <Fab color="error" onClick={() => setCallDialogStat(true)}>
                      <CallEndOutlined />
                    </Fab>
                  </Box>
                </>
              )
            ) : task?.executor_videos && task.executor_videos.length > 0 ?
              <video
                src={task.executor_videos[0].url}
                style={{ width: "50%", height: "100%" }}
                controls
              />
              : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <VideocamOffOutlined fontSize="large" />
                  <Typography>No video available</Typography>
                </Box>
              )}
          </Box>
        </Grid>}
        {!videoMode && <Grid item md={7} xs={12}>
          <Box
            id="image-wrapper"
            sx={{
              alignItems: "center",
              backgroundColor: "black",
              color: "primary.contrastText",
              display: "flex",
              justifyContent: "center",
              //px: 3,
              //py: 2,
              width: "100%",
              height: "100%",
              maxHeight: "100%",
              overflowY: "hidden",
              position: "relative",
            }}
          >
            <img style={{ width: "100%", height: "100%", objectFit: 'cover' }} src={taskUploadedImage?.url} />
            {taskUploadedImage?.caption && (
              <div data-screensize={window.outerHeight - 148} className="overlay overlay_1">
                <Typography sx={{ fontSize: 20 }} >
                  {taskUploadedImage?.caption}
                </Typography>
              </div>
            )}
          </Box>
        </Grid>}
        <Grid
          item
          md={5}
          xs={12}
          sx={{ maxHeight: "100%", overflowY: "scroll" }}
        >
          <div
            className="taskdrawer"
            style={{
              //overflowY: "scroll",
              //height: "100%",
              position: "relative",
            }}
          >
            <Box
              sx={{
                alignItems: "center",
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                justifyContent: "space-between",
                px: 3,
                py: 2,
                zIndex: 4000,
                position: "sticky",
                top: 0,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography color="inherit" variant="h6">
                  Task Inspection
                </Typography>
              </Box>
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="video_mode"
                      sx={{
                        color: '#fff',
                        '&.Mui-checked': {
                          color: '#fff',
                        },
                      }}
                      checked={videoMode}
                      onChange={(e) => { setVideoMode(e.target.checked); setTaskUploadedImages(null) }}
                    />
                  }
                  sx={{ color: "inherit" }}
                  label="Video Mode"
                //labelPlacement="start"
                />
                <IconButton
                  color="inherit"
                  onClick={() => {
                    setIsReviewChanging(false)
                    leaveCall();
                    onClose();
                  }}
                >
                  <XIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <Box
              sx={{
                py: 4,
                px: 3,
              }}
            >
              <Card sx={{ p: 2 }}>
                <Typography variant="h6">{task?.task_title}</Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ pt: 1, mb: 1 }}
                >
                  {task?.task_description}
                </Typography>
                <DashedDivider />
                <Box
                  sx={{
                    my: 2,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      alignItems: "center",
                      backgroundColor: "background.default",
                      backgroundImage: `url("${task?.property?.main_image
                        ? task?.property?.main_image
                        : task?.property?.images?.[0]
                        }")`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                      borderRadius: 1,
                      display: "flex",
                      minHeight: 50,
                      justifyContent: "center",
                      overflow: "hidden",
                      minWidth: 50,
                      objectFit: "cover",
                    }}
                  />
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="subtitle2">
                      {task?.unit?.unit_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {task?.property?.property_name} |{" "}
                      {task?.unit_type?.unit_type_name}
                    </Typography>
                  </Box>
                </Box>
                <DashedDivider />
                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <PropertyList>
                    <PropertyListItem
                      align="vertical"
                      disableGutters={true}
                      lowPadding={true}
                      label="Task Type"
                      value={task?.task_type}
                    />
                  </PropertyList>
                  <PropertyList>
                    <PropertyListItem
                      align="vertical"
                      disableGutters={true}
                      lowPadding={true}
                      label="Priority"
                      value={task?.priority}
                    />
                  </PropertyList>
                  <PropertyList>
                    <PropertyListItem
                      align="vertical"
                      disableGutters={true}
                      lowPadding={true}
                      label="Status"
                      value={task?.status ? task?.status : "Pending"}
                    />
                  </PropertyList>
                </Box>
              </Card>
              <Card sx={{ p: 2, my: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <PropertyList>
                    <PropertyListItem
                      align="horizontal"
                      disableGutters={true}
                      lowPadding={true}
                      label="Assign To"
                      value={
                        task?.assigned_to
                          ? task?.assigned_to.first_name +
                          " " +
                          task?.assigned_to.last_name
                          : ""
                      }
                    />
                    <PropertyListItem
                      align="horizontal"
                      disableGutters={true}
                      lowPadding={true}
                      label="Due At"
                      value={dayjs(new Date(task?.due_at)).format("lll")}
                    />
                    <PropertyListItem
                      align="horizontal"
                      disableGutters={true}
                      lowPadding={true}
                      label="Estimated Time"
                      value={estTime
                        // task?.estimated_time
                        //   ? `${task?.estimated_time} mins`
                        //   : "---"
                      }
                    />
                    <PropertyListItem
                      align="horizontal"
                      disableGutters={true}
                      lowPadding={true}
                      label="Actual Time"
                      value={timeSpent}
                    />
                    {task?.assigned_to_team && task?.assigned_to_team?.team_members && task?.assigned_to_team?.team_members?.length > 0 &&
                      <PropertyListItem
                        align="horizontal"
                        disableGutters={true}
                        lowPadding={true}
                        label="Team Members"
                        value={task?.assigned_to_team?.team_members.map(item => (`${item.first_name} ${item.last_name}`)).join()}
                      />
                    }
                  </PropertyList>
                </Box>
                {task?.task_photos?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <DashedDivider />
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                      }}
                    >
                      {task?.task_photos?.map((_photo, index) => (
                        <Box
                          key={`photo${index}`}
                          sx={{
                            mr: 2,
                            alignItems: "center",
                            backgroundColor: "background.default",
                            backgroundImage: `url("${_photo?.url}")`,
                            backgroundPosition: "center",
                            backgroundSize: "cover",
                            borderRadius: 1,
                            display: "flex",
                            minHeight: 50,
                            justifyContent: "center",
                            overflow: "hidden",
                            minWidth: 50,
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setTaskUploadedImages({ url: _photo?.url, caption: _photo?.description });
                            setVideoMode(false);
                            // setDialogStat(true);
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Card>
              {task?.task_type === "Maintenance" && (
                <Card sx={{ p: 2, my: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <PropertyList>
                      <PropertyListItem
                        align="horizontal"
                        disableGutters={true}
                        lowPadding={true}
                        label="Issue Category"
                        value={"---"}
                      />
                      <PropertyListItem
                        align="horizontal"
                        disableGutters={true}
                        lowPadding={true}
                        label="Issue Type"
                        value={"---"}
                      />
                      <PropertyListItem
                        align="horizontal"
                        disableGutters={true}
                        lowPadding={true}
                        label="Element"
                        value={task?.element ? task?.element?.name : "---"}
                      />
                    </PropertyList>
                  </Box>
                </Card>
              )}

              {task?.executor_photos?.length > 0 && (<>
                <Box
                  sx={{
                    m: 1,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6">Executor Photos</Typography>
                </Box>
                <Card sx={{ p: 2, my: 2 }}>
                  <Box >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                      }}
                    >
                      {task?.executor_photos?.map((_photo, index) => (
                        <Box
                          key={`photo${index}`}
                          sx={{
                            mr: 2,
                            alignItems: "center",
                            backgroundColor: "background.default",
                            backgroundImage: `url("${_photo?.url}")`,
                            backgroundPosition: "center",
                            backgroundSize: "cover",
                            borderRadius: 1,
                            display: "flex",
                            minHeight: 50,
                            justifyContent: "center",
                            overflow: "hidden",
                            minWidth: 50,
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setTaskUploadedImages(
                              {
                                url: _photo?.url,
                                caption: task?.executor_captions ? task?.executor_captions[index]?.comment : ""
                              })
                            setVideoMode(false);
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Card>
              </>)}
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    m: 1,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6">Requirements</Typography>
                  <Typography variant="h6" color="textSecondary">
                    {`${checkList
                      ?.filter((_) => _.inspection_status === "Complete")
                      ?.reduce((total, value) => total + 1, 0)}/${checkList?.length
                      }`}
                  </Typography>
                </Box>
                {uniqueArea?.map((_area, areaIdx) => (
                  <Accordion
                    key={areaIdx}
                    sx={{
                      my: 2,
                      "&:before": { backgroundColor: "transparent" },
                    }}
                    onChange={(_, expanded) => {
                      setIsReviewChanging(false)
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="button">
                        {
                          unitAreas?.data?.find(
                            (_) => _.id === parseInt(_area.unit_area_id)
                          )?.area_name
                        }
                      </Typography>
                      <Typography
                        variant="button"
                        color="textSecondary"
                        sx={{ ml: "auto" }}
                      >
                        {`(${checkList
                          ?.filter(
                            (_) =>
                              _.unit_area_id === parseInt(_area.unit_area_id) &&
                              _.inspection_status === "Complete"
                          )
                          ?.reduce((total, value) => total + 1, 0)}/${checkList?.filter(
                            (_) =>
                              _.unit_area_id === parseInt(_area.unit_area_id)
                          )?.length
                          })`}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <DashedDivider />
                      <List>
                        {_area.team !== undefined && _area.team.length > 0
                          // task !== undefined && task.assigned_to_team_id && task.assigned_to_team && Array.isArray(task.assigned_to_team.team_members) && task.assigned_to_team.team_members.length > 0 
                          &&
                          <Autocomplete
                            options={_area.team ?? []}
                            getOptionLabel={(option) =>
                              option.first_name ? `${option.first_name} ${option.last_name}` : ""
                            }
                            sx={{ my: 2 }}
                            fullWidth
                            disableClearable
                            multiple={true}
                            value={selTeamMember.length > 0 ? selTeamMember[areaIdx] : []}
                            size="small"
                            renderInput={(params) =>
                              <TextField
                                {...params}
                                fullWidth
                                label="Select team member"
                                placeholder="Select team member"
                              />
                            }
                            onChange={(event, newValue) => {
                              // console.log('newValue', newValue);
                              let newSelMember = [...selTeamMember]
                              newSelMember[areaIdx] = newValue
                              // console.log('newSelMember', newSelMember);
                              newValue ? setSelTeamMember(newSelMember) : setSelTeamMember([])
                            }}
                          />
                        }
                        {checkList
                          ?.filter(
                            (_) =>
                              _.unit_area_id === parseInt(_area.unit_area_id)
                          )
                          ?.map((_cl, clIdx) => (
                            <ListItem key={clIdx} sx={{ p: 0 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{ minWidth: "85%", maxWidth: "85%" }}
                              >
                                {_cl.checklist_title}
                              </Typography>
                              <Checkbox
                                checked={
                                  _cl.checklist_status === "Pending"
                                    ? false
                                    : true
                                }
                                disabled={true}
                              />
                              <Checkbox
                                checked={
                                  _cl.inspection_status === "Pending"
                                    ? false
                                    : true
                                }
                                disabled={inspComplete}
                                onChange={(e) => {
                                  let chklist_data = [...checkList];
                                  chklist_data[clIdx].inspection_status = e
                                    .currentTarget.checked
                                    ? "Complete"
                                    : "Pending";
                                  setCheckList(chklist_data);
                                  onCompleteChecklist(
                                    _cl.id,
                                    chklist_data[clIdx].inspection_status
                                  );
                                }}
                              />
                            </ListItem>
                          ))}
                      </List>
                      <DashedDivider />
                      <TextField
                        fullWidth
                        sx={{ mt: 3 }}
                        label="Review"
                        placeholder="Add your review"
                        disabled={inspComplete}
                        multiline
                        rows={1}
                        maxRows={3}
                        value={
                          `${isReviewChanging && uniqueArea[areaIdx].inspection_comment_arr ? uniqueArea[areaIdx].inspection_comment_arr[commentidx]?.comment : _area.inspection_comment}`
                        }
                        onChange={(e) => {
                          let area_data = [...uniqueArea];
                          if (isReviewChanging && area_data[areaIdx].inspection_comment_arr && area_data[areaIdx].inspection_comment_arr[commentidx]) {
                            area_data[areaIdx].inspection_comment_arr[commentidx].comment = e.currentTarget.value
                          }
                          area_data[areaIdx].inspection_comment =
                            e.currentTarget.value;
                          setUniqueArea(area_data);
                        }}
                      />
                      <Box sx={{ height: 20, display: 'flex', alignItems: 'center', mt: 1, ml: 1 }}>
                        <Typography>
                          {/* {`${areaIdx} ${commentidx} ${isReviewChanging} ${uniqueArea[areaIdx]?.inspection_comment_arr?.length > 0 && selTeamMember.length > 0} ${selTeamMember[areaIdx][commentidx]?.id === uniqueArea[areaIdx].inspection_comment_arr[commentidx]?.id} ${uniqueArea[areaIdx].inspection_comment_arr.map(item => item.id).includes(selTeamMember[areaIdx][commentidx]?.id)}`} */}
                        </Typography>
                        {isReviewChanging && uniqueArea[areaIdx]?.inspection_comment_arr?.length > 0 && selTeamMember.length > 0 && selTeamMember[areaIdx].map(item => item.id).includes(uniqueArea[areaIdx].inspection_comment_arr[commentidx]?.id)
                          &&
                          <Typography>
                            {`${selTeamMember[areaIdx].find(item => item.id === uniqueArea[areaIdx].inspection_comment_arr[commentidx]?.id)?.first_name} ${selTeamMember[areaIdx].find(item => item.id === uniqueArea[areaIdx].inspection_comment_arr[commentidx]?.id)?.last_name}`}
                          </Typography>
                        }
                      </Box>
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                          <StarRatings
                            rating={isReviewChanging && uniqueArea[areaIdx].inspection_comment_arr && uniqueArea[areaIdx].inspection_comment_arr[commentidx]?.rating ? uniqueArea[areaIdx].inspection_comment_arr[commentidx]?.rating : _area.inspection_rating ?? 0}
                            starRatedColor="#5048e5"
                            starHoverColor={
                              inspComplete ? "rgb(203, 211, 227)" : "#5048e5"
                            }
                            starDimension="20px"
                            changeRating={(rating) => {
                              if (inspComplete) {
                                return;
                              }
                              let area_data = [...uniqueArea];
                              area_data[areaIdx].inspection_rating = rating;
                              setUniqueArea(area_data);
                            }}
                            numberOfStars={5}
                            name="rating"
                          />
                          {_area.inspection_comment_arr && _area.inspection_comment_arr.length > 1 &&
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                              <Button
                                color="primary"
                                size="small"
                                variant="contained"
                                disabled={inspComplete}
                                sx={{ ml: 1 }}
                                onClick={() => {
                                  setIsReviewChanging(true)
                                  console.log(commentidx, uniqueArea[areaIdx].inspection_comment_arr.length);
                                  if (commentidx !== 0) {
                                    setCommentidx(commentidx - 1)
                                  }
                                }}
                              >
                                Prev
                              </Button>
                              <Button
                                color="primary"
                                size="small"
                                variant="contained"
                                disabled={inspComplete}
                                sx={{ ml: 1 }}
                                onClick={() => {
                                  setIsReviewChanging(true)
                                  console.log(commentidx, uniqueArea[areaIdx].inspection_comment_arr.length);
                                  if (commentidx < uniqueArea[areaIdx].inspection_comment_arr.length - 1) {
                                    setCommentidx(commentidx + 1)
                                  }
                                }}
                              >
                                Next
                              </Button>
                            </Box>
                          }
                        </Box>
                        <Box sx={{
                          display: 'flex', flexDirection: 'row',
                          alignItems: 'center'
                        }}>
                          <Button
                            color="primary"
                            size="small"
                            variant="contained"
                            disabled={inspComplete}
                            sx={{ mr: 1 }}
                            onClick={() =>
                              onCompleteArea(_area.unit_area_id, _area.id, areaIdx)
                            }
                          >
                            Save
                          </Button>
                          <Button
                            color="primary"
                            size="small"
                            variant="contained"
                            disabled={inspComplete}
                            onClick={() => {
                              const pendingChkInsp = checkList?.find(
                                (_) =>
                                  _.unit_area_id ===
                                  parseInt(_area.unit_area_id) &&
                                  _.checklist_status === "Complete" &&
                                  _.inspection_status === "Pending"
                              );
                              // if (pendingChkInsp) {
                              //   toast.error(
                              //     "Please complete all pending checklist to complete area."
                              //   );
                              //   return;
                              // } else {
                              //   onCompleteArea(_area.unit_area_id, _area.id, areaIdx);
                              // }
                            }}
                          >
                            {_area.id > 0 ? "Completed" : "Complete Area"}
                          </Button>
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
              {inventories !== undefined && inventories.length > 0 &&
                <Accordion
                  // key={areaIdx}
                  sx={{
                    my: 2,
                    "&:before": { backgroundColor: "transparent" },
                  }}
                // onChange={(_, expanded) => {
                //   setIsReviewChanging(false)
                // }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="button">
                      Inventories
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <DashedDivider />
                    {inventories.length > 0 &&
                      <List>
                        {inventories.map((item, idx) =>
                          <ListItem key={idx} sx={{ p: 0, mb: 2 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ minWidth: "82%", maxWidth: "82%" }}
                            >
                              {item.name}
                            </Typography>
                            <Box sx={{
                              display: 'flex', flexDirection: 'row', justifyContent: 'center',
                              alignItems: 'center'
                            }}>
                              <IconButton onClick={() => {
                                let copyInv = [...inventories]
                                if (copyInv[idx].quantity > 0) {
                                  copyInv[idx].quantity = copyInv[idx].quantity - 1
                                  setinventories(copyInv)
                                  const countObj = {
                                    invId: item.id, checkListCode: item.checkList_code,
                                    quantity: copyInv[idx].quantity, id: item.taskInvId
                                  }
                                  changeInvCount(countObj)
                                }
                              }}>
                                <Remove />
                              </IconButton>
                              <Typography
                                variant="subtitle2"
                                sx={{ width: 20 }}
                              >
                                {item.quantity}
                              </Typography>
                              <IconButton onClick={() => {
                                let copyInv = [...inventories]
                                copyInv[idx].quantity = copyInv[idx].quantity + 1
                                setinventories(copyInv)
                                const countObj = {
                                  invId: item.id, checkListCode: item.checkList_code,
                                  quantity: copyInv[idx].quantity, id: item.taskInvId
                                }
                                changeInvCount(countObj)
                              }}>
                                <Add />
                              </IconButton>
                            </Box>
                          </ListItem>
                        )}
                      </List>
                    }
                  </AccordionDetails>
                </Accordion>
              }

              {aiInspections && aiInspections.length > 0 &&
                <Accordion
                  // key={areaIdx}
                  sx={{
                    my: 2,
                    "&:before": { backgroundColor: "transparent" },
                  }}
                // onChange={(_, expanded) => {
                //   setIsReviewChanging(false)
                // }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="button">
                      AI Inspection
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <DashedDivider />
                    {aiInspections.length > 0 &&
                      <List>
                        {aiInspections.map((item, idx) =>
                          <ListItem key={idx} sx={{ p: 0, mb: 2, justifyContent:'space-between' }}>
                          <Box
                            sx={{
                              alignItems: "center",
                              backgroundColor: "background.default",
                              backgroundImage: `url("${item.url}")`,
                              backgroundPosition: "center",
                              backgroundSize: "cover",
                              borderRadius: 1,
                              display: "flex",
                              minHeight: 150,
                              justifyContent: "center",
                              overflow: "hidden",
                              minWidth: 150,
                              objectFit: "cover",
                            }}
                            onClick={() => {
                            setTaskUploadedImages(
                              {
                                url: item?.url,
                                caption: ""
                              })
                            setVideoMode(false);
                          }}
                          />
                          <Box display={'flex'} flexDirection={'column'} minWidth={'40%'}>
                          {Object.keys(item.counts).length > 0 ? Object.keys(item.counts).map((cnt, idx) => 
                            <Typography key={idx}
                              variant="subtitle2"
                              sx={{textAlign:'right', mb:2}}
                            >
                              {cnt}: {item.counts[cnt]}
                            </Typography>
                          ) : 
                          <Typography
                              variant="subtitle2"
                              sx={{ textAlign:'right', minWidth: "40%", maxWidth: "40%" }}
                            >
                              No item founds
                            </Typography>
                          }
                          </Box>
                          </ListItem>
                        )}
                      </List>
                    }
                  </AccordionDetails>
                </Accordion>
              }

              {
                task && (task.status === 'Approval From Owner' || task.status === 'Approved By Owner') && task.owner_querries && task.owner_querries.length > 0 &&
                <Box>
                  <Typography variant="subtitle1" textAlign={'center'}>
                    Querries
                  </Typography>
                  <Box sx={{ width: '100%', borderWidth: 1, maxHeight: 300, overflowY: 'scroll', }}>
                    {task.owner_querries.map((item, idx) =>
                      <Box key={idx} sx={{ display: 'flex', flexDirection: 'row', height: 50, alignItems: 'center', justifyContent: user.id === item?.sender?.id ? 'flex-end' : 'flex-start', paddingX: 2, marginBottom: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', backgroundColor: 'ButtonHighlight', paddingX: 1, borderRadius: 1 }}>
                          <Typography fontSize={12} textAlign={user.id === item?.sender?.id ? 'right' : 'left'} color="primary">
                            {item?.sender?.first_name}{' '} {item?.sender?.last_name}{'  '}({item?.sender?.user_role?.role})
                          </Typography>
                          <Typography variant="subtitle1">
                            {item.comment}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                  <TextField
                    fullWidth
                    sx={{ mt: 3, backgroundColor: 'white' }}
                    label="Add Task query"
                    placeholder="Add task query"
                    // disabled={inspComplete}
                    multiline
                    rows={1}
                    maxRows={3}
                    value={taskQuery}
                    onChange={(e) => { setTaskQuery(e.currentTarget.value) }}
                  />
                  <Button
                    color="primary"
                    size="small"
                    variant="contained"
                    fullWidth
                    disabled={addQueryLoading}
                    sx={{ my: 1 }}
                    onClick={() => {
                      if (taskQuery.trim() !== '') {
                        addTaskQuery({ sender_id: user.id, task_id: task.id, comment: taskQuery })
                      } else {
                        toast.error("Please enter task query");
                      }
                    }}
                  >
                    Add task query
                  </Button>
                </Box>
              }
            </Box>
            {(user?.user_role?.role === 'Inspector' || user?.user_role?.role === 'Owner') &&
              <Box
                sx={{
                  backgroundColor: "white",
                  px: 3,
                  py: 1,
                  zIndex: 4000,
                  position: "sticky",
                  bottom: 0,
                }}
              >
                <Button
                  color="primary"
                  fullWidth
                  variant="contained"
                  disabled={inspComplete}
                  onClick={() => setInspectionDiag(true)}
                >
                  Complete Inspection
                </Button>
              </Box>
            }
          </div>
        </Grid>
      </Grid>
    </Drawer>
  );
};

InspectionDrawer.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};

// ${isReviewChanging && uniqueArea[areaIdx]?.inspection_comment_arr?.length > 0 && selTeamMember.length > 0 && selTeamMember[areaIdx][commentidx]?.id === uniqueArea[areaIdx].inspection_comment_arr[commentidx]?.id ? `(${selTeamMember[areaIdx][commentidx]?.first_name})` : ''}
