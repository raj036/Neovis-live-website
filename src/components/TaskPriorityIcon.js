import React from "react";
import PropTypes from "prop-types";
import {
  PriorityHigh,
  LowPriority,
  Adjust,
  KeyboardDoubleArrowDown,
  KeyboardDoubleArrowUp,
} from "@mui/icons-material";

import { TASK_PRIORITIES } from "../utils/constants";

export const priorityColors = {
  Watch: '#3498db',  // Blue
  Low: '#2ecc71',    // Green
  Medium: '#f39c12', // Orange
  High: '#e74c3c',   // Red
  Urgent: '#9b59b6'  // Purple
};

const TaskPriorityIcon = ({ priority, fontSize = "small", sx }) => {
  const getIconByPriority = (priority) => {
    const color = priorityColors[priority] || 'inherit';
    
    switch (priority) {
      case "Watch":
        return <KeyboardDoubleArrowDown fontSize={fontSize} sx={{ ...sx, color }} />;
      case "Low":
        return <LowPriority fontSize={fontSize} sx={{ ...sx, color }} />;
      case "Medium":
        return <Adjust fontSize={fontSize} sx={{ ...sx, color }} />;
      case "High":
        return <PriorityHigh fontSize={fontSize} sx={{ ...sx, color }} />;
      case "Urgent":
        return <KeyboardDoubleArrowUp fontSize={fontSize} sx={{ ...sx, color }} />;
      default:
        return null;
    }
  };

  return getIconByPriority(priority);
};

TaskPriorityIcon.propTypes = {
  priority: PropTypes.oneOf(TASK_PRIORITIES.map((p) => p.value)).isRequired,
  fontSize: PropTypes.string,
  sx: PropTypes.any,
};

export default TaskPriorityIcon;
