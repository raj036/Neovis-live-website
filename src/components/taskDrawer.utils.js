export const getPriorityColor = (priority) => {
  switch (priority) {
    case "Urgent":
      return "error";
    case "High":
      return "warning";
    case "Medium":
      return "info";
    case "Low":
      return "success";
    case "Watch":
      return "default";
    default:
      return "default";
  }
};

