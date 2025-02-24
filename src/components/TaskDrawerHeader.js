import React from "react";
import {
  Box,
  FormControlLabel,
  FormGroup,
  IconButton,
  Switch,
  Typography,
  Chip,
  Tooltip,
} from "@mui/material";
import Link from "next/link";
import {
  MoreVert,
  Launch,
  CleaningServicesOutlined,
  BuildCircleOutlined,
  PersonSearchOutlined,
  RoomServiceOutlined,
} from "@mui/icons-material";
import { X as XIcon } from "../icons/x";
import TaskPriorityIcon from "./TaskPriorityIcon";
import { getPriorityColor } from "./taskDrawer.utils";
import { PencilAlt as PencilAltIcon } from "../icons/pencil-alt";

const TaskDrawerHeader = ({
  theme,
  task,
  isManager,
  isDisabled,
  setIsDisabled,
  onClose,
  formik,
  _changeTaskStatus,
}) => {
  const handleTaskStatusUpdate = (e) => {
    const newStatus = task?.status === "On Hold" ? "Pending" : "On Hold";
    _changeTaskStatus(e, newStatus);
  };

  const getTaskTypeIcon = (typeType) => {
    const type = typeType?.toLowerCase();
    const iconSx = {
      fontSize: "1.6rem",
      color: "grey",
      padding: "4px",
    };
    switch (type) {
      case "housekeeping":
        return <CleaningServicesOutlined sx={iconSx} />;
      case "maintenance":
        return <BuildCircleOutlined sx={iconSx} />;
      case "inspection":
        return <PersonSearchOutlined sx={iconSx} />;
      case "guest request":
        return <RoomServiceOutlined sx={iconSx} />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        padding: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box>
          <Chip
            icon={
              <TaskPriorityIcon
                priority={task?.priority}
                sx={{ fontSize: "0.9rem" }}
              />
            }
            label={task?.priority}
            color={getPriorityColor(task?.priority)}
            sx={{
              borderRadius: 0.7,
              fontSize: "0.7rem",
              height: "21px",
              padding: "0.3rem 0.3rem",
              marginRight: "0.6rem",
              "& .MuiChip-label": {
                paddingLeft: "0.4rem",
                paddingRight: "0.4rem",
              },
            }}
          />
          {isManager ? (
            <Tooltip
              title={
                task?.status === "On Hold"
                  ? "Change status to Pending"
                  : "Change status to On Hold"
              }
              placement="bottom"
              slotProps={{
                tooltip: {
                  sx: {
                    color: "white",
                    backgroundColor: "black",
                  },
                },
                arrow: {
                  sx: {
                    color: "black",
                  },
                },
              }}
            >
              <Chip
                label={task?.status}
                onClick={handleTaskStatusUpdate}
                sx={{
                  borderRadius: 0.7,
                  fontSize: "0.7rem",
                  height: "21px",
                  padding: "0.3rem 0.3rem",
                  "& .MuiChip-label": {
                    paddingLeft: "0.4rem",
                    paddingRight: "0.4rem",
                  },
                }}
              />
            </Tooltip>
          ) : (
            <Chip
              label={task?.status}
              sx={{
                borderRadius: 0.7,
                fontSize: "0.7rem",
                height: "21px",
                padding: "0.3rem 0.3rem",
                "& .MuiChip-label": {
                  paddingLeft: "0.4rem",
                  paddingRight: "0.4rem",
                },
              }}
            />
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", color: "grey" }}>
          <Link href={`/task-details/${task?.id}`} passHref>
            <IconButton
              component="a"
              color="inherit"
              aria-label="Open task details"
              sx={{
                "&:hover": { color: "black" },
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Launch sx={{ fontSize: "24px" }} />
            </IconButton>
          </Link>
          {isManager && isDisabled && (
            <IconButton
              color="inherit"
              onClick={() => setIsDisabled(false)}
              aria-label="Enable edit mode"
              sx={{
                "&:hover": { color: "black" },
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PencilAltIcon sx={{ fontSize: "24px" }} />
            </IconButton>
          )}
          <IconButton
            color="inherit"
            aria-label="More options"
            sx={{
              "&:hover": { color: "black" },
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MoreVert sx={{ fontSize: "24px" }} />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={onClose}
            aria-label="Close"
            sx={{
              "&:hover": { color: "black" },
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <XIcon sx={{ fontSize: "24px" }} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        {getTaskTypeIcon(task?.task_type)}
        <Typography
          variant="h6"
          sx={{ ml: 1, mr: 1, fontSize: "1.1rem", textTransform: "capitalize" }}
        >
          {task ? task?.task_title : "New Task"}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      ></Box>
    </Box>
  );
};

export default TaskDrawerHeader;
