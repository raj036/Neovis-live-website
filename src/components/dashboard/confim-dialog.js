import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export const ConfirmDialog = (props) => {
  const { title, message, dialogStat, setDialogStat, onConfirmDialog } = props;

  return (
    <Dialog
      open={dialogStat}
      onClose={() => setDialogStat(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogStat(false)} autoFocus>
          No
        </Button>
        <Button onClick={onConfirmDialog}>Yes</Button>
      </DialogActions>
    </Dialog>
  );
};
