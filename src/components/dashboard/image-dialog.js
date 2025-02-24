import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import { Box } from "@mui/system";

export const ImageDialog = (props) => {
  const { dialogStat, setDialogStat, image } = props;

  return (
    <Dialog
      open={dialogStat}
      onClose={() => setDialogStat(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogContent>
        <Box
          sx={{
            alignItems: "center",
            backgroundColor: "background.default",
            backgroundImage: `url("${image}")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            borderRadius: 1,
            display: "flex",
            minHeight: 400,
            justifyContent: "center",
            overflow: "hidden",
            minWidth: 400,
            objectFit: "cover",
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogStat(false)} autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
