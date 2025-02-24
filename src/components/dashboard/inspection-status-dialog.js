import {
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { INSPECTOR_TASK_STATUS, UNIT_CONDITIONS } from "./../../utils/constants";

export const InspectionStatusDialog = (props) => {
  const {
    inspectionDiag,
    setInspectionDiag,
    task,
    updating,
    onCompleteInspection,
  } = props;
  const [status, setStatus] = useState();
  const [taskStatus, setTaskStatus] = useState();

  useEffect(() => {
    if (inspectionDiag) {
      setStatus();
    }
  }, [inspectionDiag]);

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={inspectionDiag}
      onClose={() => setInspectionDiag(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{ sx: { backgroundColor: "rgb(220 225 235)" } }}
    >
      <DialogTitle id="alert-dialog-title">
        <Typography variant="h6">Complete Inspection</Typography>
        <Typography variant="body2">
          Please set the unit status to complete task inspection
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Card sx={{ px: 1.5, py: 1.5 }}>
          <Box
            sx={{
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
        </Card>
        <FormControl
          fullWidth
          sx={{
            mt: 3,
            backgroundColor: "background.default",
            borderRadius: 1,
            boxShadow:
              "0px 1px 1px rgb(100 116 139 / 6%), 0px 1px 2px rgb(100 116 139 / 10%)",
          }}
        >
          <InputLabel id="type" size="small">
            Set Unit Status *
          </InputLabel>
          <Select
            label="Set Unit Status *"
            labelId="type"
            name="task_type"
            size="small"
            required
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {UNIT_CONDITIONS.map((_type) => (
              <MenuItem key={_type.value} value={_type.value}>
                {_type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          fullWidth
          sx={{
            mt: 3,
            backgroundColor: "background.default",
            borderRadius: 1,
            boxShadow:
              "0px 1px 1px rgb(100 116 139 / 6%), 0px 1px 2px rgb(100 116 139 / 10%)",
          }}
        >
          <InputLabel id="type" size="small">
            Set Task Status *
          </InputLabel>
          <Select
            label="Set Task Status *"
            labelId="type"
            name="task_status"
            size="small"
            required
            value={status}
            onChange={(e) => setTaskStatus(e.target.value)}
          >
            {INSPECTOR_TASK_STATUS.map((_type) => (
              <MenuItem key={_type.value} value={_type.value}>
                {_type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setInspectionDiag(false)} autoFocus>
          Close
        </Button>
        <Button
          sx={{ m: 1, ml: "auto", minWidth: "100px" }}
          onClick={() => onCompleteInspection(status, taskStatus)}
          disabled={!status}
        >
          {updating ? (
            <CircularProgress style={{ color: "white" }} size={26} />
          ) : (
            "Submit"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
