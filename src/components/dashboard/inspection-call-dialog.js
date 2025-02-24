import { Cancel, VideoCall } from "@mui/icons-material";
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect } from "react";
import { getState, setState } from "../../contexts/zustand-store";
import { PropertyList } from "../property-list";
import { PropertyListItem } from "../property-list-item";

export const InspectionCallDialog = (props) => {
  const {
    inspectionCallDiag,
    setInspectionCallDiag,
    task,
    joining,
    onJoinInspectionCall,
  } = props;

  useEffect(() => {
    if (inspectionCallDiag) {
      let notifications = getState().notifications;
      if (notifications.length > 0 && notifications[0].newCall) {
        notifications[0].newCall = false;
        setState(notifications);
      }
    }
  }, [inspectionCallDiag]);

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
    <Dialog
      fullWidth
      maxWidth="sm"
      open={inspectionCallDiag}
      onClose={() => setInspectionCallDiag(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{ sx: { backgroundColor: "rgb(220 225 235)" } }}
    >
      <DialogTitle id="alert-dialog-title">
        <Typography variant="h3">
          {task?.unit?.unit_name} : Inspection call
        </Typography>
      </DialogTitle>
      <DialogContent>
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
      </DialogContent>
      <DialogActions
        sx={{
          paddingBottom: 2,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button
          component="a"
          startIcon={<Cancel fontSize="large" />}
          variant="contained"
          color="error"
          onClick={() => {
            setInspectionCallDiag(false);
          }}
        >
          Decline
        </Button>
        <Button
          sx={{ ml: 3 }}
          component="div"
          startIcon={<VideoCall fontSize="large" />}
          variant="contained"
          color="success"
          onClick={() => {
            onJoinInspectionCall(13, 525);
          }}
        >
          Join Call
        </Button>
      </DialogActions>
    </Dialog>
  );
};
