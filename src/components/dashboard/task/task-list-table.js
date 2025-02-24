import { Fragment, useMemo, useState } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Checkbox,
  Icon,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography
} from "@mui/material";
import { ConfirmDialog } from "../../dashboard/confim-dialog";
import NextLink from "next/link";
import * as dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { ArrowRight as ArrowRightIcon } from "../../../icons/arrow-right";
import { PencilAlt as PencilAltIcon } from "../../../icons/pencil-alt";
import { Eye as EyeIcon } from "../../../icons/eye";
import { Scrollbar } from "../../scrollbar";
import { useRouter } from "next/router";
import { SeverityPill } from "../../severity-pill";
import useAxios from "../../../services/useAxios";
import {
  VideoCameraFrontOutlined,
  SlideshowOutlined,
} from "@mui/icons-material";

var localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);

export const TaskTable = (props) => {
  const {
    onViewTask,
    onInspectionView,
    onPageChange,
    onRowsPerPageChange,
    page,
    tasks,
    tasksCount,
    rowsPerPage,
    editable,
    isManager,
    isVendor,
    setSelTasks,
    selTasks,
    ...other
  } = props;

  const router = useRouter();
  const customInstance = useAxios();
  const queryClient = useQueryClient();
  const [dialogStat, setDialogStat] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  // const [isChecked, setIsChecked] = useState(selTasks.length === tasks.length);
  const { mutateAsync: updateTaskStatus } = useMutation(({ id, status }) =>
    customInstance.patch(`tasks/update-status/${id}/${status}`)
  );

  const onConfirmDialog = async () => {
    try {
      setDialogStat(false);
      await updateTaskStatus({ id: currentTask?.id, status: "On Hold" });
      toast.success("Task status changed successfully!");
      setCurrentTask(null);
    } catch (e) {
      console.log(JSON.stringify(e));
      setCurrentTask(null);
      setDialogStat(false);
      toast.error("Something went wrong!");
    }
  };

  const convertTime = (timeString) => {
    // Time => 11:00:00 AM
    const date = new Date(timeString);
    const validFormat =
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
    return validFormat;
  };

  const getAssignee = (taskType, task) => {
    let assignee;
    if (taskType === "Inspection") {
      assignee =
        task?.assigned_to?.first_name + " " + task?.assigned_to?.last_name;
    } else {
      assignee =
        task?.assigned_to?.first_name + " " + task?.assigned_to?.last_name;
    }
    if (assignee.includes("undefined")) assignee = "";
    return assignee;
  };

  const selectAllTasks = (checkAll) => {
    if (checkAll) {
      const taskIds = tasks.map((t) => t.id);
      setSelTasks(taskIds);
    } else {
      setSelTasks([]);
    }
  };

  const selectSingleTask = (check, taskId) => {
    // debugger
    if (!taskId) return;

    if (check) {
      setSelTasks((prev) => [...prev, taskId]);
    } else {
      setSelTasks((prev) => prev.filter((id) => id !== taskId));
    }
  };

  const isAllSelected = useMemo(() => {
    if (tasks.length === 0) return false;

    return selTasks.length === tasks.length;
  }, [selTasks.length]);

  return (
    <div {...other}>
      <Scrollbar>
        <ConfirmDialog
          title="Change status?"
          message=" Are you sure you want to change task status to hold?"
          dialogStat={dialogStat}
          setDialogStat={setDialogStat}
          onConfirmDialog={onConfirmDialog}
        />
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              {isManager && (
                <TableCell width="5%">
                  {
                    <Checkbox
                      checked={isAllSelected}
                      onChange={() => {
                        selectAllTasks(!isAllSelected);
                      }}
                    />
                  }
                </TableCell>
              )}
              <TableCell width="15%">Title</TableCell>
              <TableCell width="10%">Planning Id</TableCell>
              <TableCell width="10%">Unit</TableCell>
              <TableCell width="10%">Task Type</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Create At</TableCell>
              <TableCell>Due At</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Inspection</TableCell>
              {!isManager && <TableCell>Stream</TableCell>}
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks?.map((task) => {
              return (
                <Fragment key={task.id}>
                  <TableRow hover>
                    {isManager && (
                      <TableCell>
                        <Checkbox
                          checked={selTasks.includes(task.id)}
                          onChange={() =>
                            selectSingleTask(
                              !selTasks.includes(task.id),
                              task.id
                            )
                          }
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <Box>
                        <Link
                          color="inherit"
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            color: "black",
                          }}
                          onClick={() => onViewTask(false, task.id)}
                        >
                          {task.task_title}
                        </Link>
                        <Box flexDirection={'row'} alignItems={'center'} sx={{ mt: 1 }}>
                          {task.delay_reason &&
                            <Tooltip title={`${task.delay_reason}`}>
                              <Typography
                                color="textSecondary"
                                variant="body2"
                                sx={{ mr: 1 }}
                              >
                                <SeverityPill
                                  color={"info"}
                                  style={{ cursor: 'pointer' }}
                                >
                                  Delay task
                                </SeverityPill>
                              </Typography>
                            </Tooltip>
                          }
                          {task.owner_querries && task.owner_querries.length > 0 &&
                            <Typography
                              color="textSecondary"
                              variant="body2"
                            >
                              <SeverityPill
                                color={"info"}
                                style={{ cursor: 'pointer' }}
                              >
                                Query
                              </SeverityPill>
                            </Typography>
                          }
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{task?.taskPlanning_id ?? ""}</TableCell>
                    <TableCell>
                      {task.unit ? task.unit.unit_name : ""}
                    </TableCell>
                    <TableCell>{task.task_type}</TableCell>
                    <TableCell>{getAssignee(task.task_type, task)}</TableCell>
                    <TableCell>
                      {dayjs(new Date(task.created_at)).format("lll")}
                    </TableCell>
                    {task.due_at ?
                      <TableCell>
                        {`${dayjs(new Date(task.due_at)).format(
                          "ll"
                        )} ${convertTime(task.due_time)}`}
                      </TableCell>
                      :
                      <TableCell>

                      </TableCell>
                    }
                    <TableCell align="center">
                      <SeverityPill color="success">{task.status}</SeverityPill>
                    </TableCell>
                    <TableCell align="center">
                      <SeverityPill
                        color={
                          task.inspection_status === "Complete"
                            ? "success"
                            : "warning"
                        }
                      >
                        {task.inspection_status}
                      </SeverityPill>
                    </TableCell>
                    {!isManager && (
                      <TableCell>
                        {task.video_stream ? (
                          task.video_stream.recording_url ? (
                            <Tooltip title="View Recording">
                              <IconButton
                                component="a"
                                onClick={() => onInspectionView(task.id, false)}
                              >
                                <SlideshowOutlined fontSize="medium" />
                              </IconButton>
                            </Tooltip>
                          ) : !isVendor ? (
                            <Tooltip title="Join Call">
                              <IconButton
                                component="a"
                                onClick={() => onInspectionView(task.id, true)}
                              >
                                <VideoCameraFrontOutlined fontSize="medium" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            ""
                          )
                        ) : (
                          ""
                        )}
                      </TableCell>
                    )}
                    <TableCell align="center">
                      <Box display="flex" alignItems="center">
                        {((editable && isManager) ||
                          task.status === "ReOpen") && (
                            <Tooltip title="Edit Task">
                              <IconButton
                                component="a"
                                onClick={() => onViewTask(true, task.id)}
                              >
                                <PencilAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        <Tooltip title="View Task">
                          <IconButton
                            component="a"
                            onClick={() => onViewTask(false, task.id)}
                          >
                            <ArrowRightIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Inspection">
                          <IconButton
                            component="a"
                            onClick={() => onInspectionView(task.id, false)}
                          >
                            <EyeIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      <TablePagination
        component="div"
        count={tasksCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

TaskTable.propTypes = {
  tasks: PropTypes.array.isRequired,
  tasksCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};
