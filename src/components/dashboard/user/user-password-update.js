import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
} from "@mui/material";
import { useState } from "react";

export const ChangePassword = (props) => {
  const { passwordDialog, setPasswordDialog, onChangePassword } = props;
  const [newPassword, setNewPassword] = useState();

  return (
    <Dialog
      open={passwordDialog}
      onClose={() => setPasswordDialog(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Change Password?</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            backgroundColor: "background.paper",
            minHeight: "100%",
          }}
        >
          <TextField
            fullWidth
            label="Password"
            name="password"
            placeholder="Enter new password"
            helperText="Password must be at least 6 and max 15 characters"
            onChange={(e) => setNewPassword(e.currentTarget.value)}
          />
          <Divider sx={{ pt: 2 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              p: 2,
            }}
          >
            <Button
              color="primary"
              variant="contained"
              onClick={() => onChangePassword(newPassword)}
              disabled={
                newPassword === undefined ||
                newPassword?.length < 6 ||
                newPassword?.length > 15
              }
            >
              Change Password
            </Button>
            <Button
              color="primary"
              variant="contained"
              sx={{ marginLeft: 5 }}
              onClick={() => setPasswordDialog(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
