import { Box, Drawer, Grid, IconButton, Typography } from "@mui/material";
import { X as XIcon } from "../../../icons/x";
import { User as DummyImg } from "../../../icons/user";
import { Image as ImageIcon } from "../../../icons/image";

export const CalendarEventDialog = (props) => {
  const { onClose, open, event } = props
  return (
    <Drawer
      anchor="right"
      onClose={onClose}
      open={open.isOpen}
      ModalProps={{ sx: { zIndex: 2000 } }}
      hideBackdrop={false}
      PaperProps={{
        sx: {
          width: 450,
          maxHeight: "100%",
          boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
          padding: 0.5
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: 1.5,
          borderBottom: '1px solid gray'
        }}>
        <Typography variant="h6">
          {event?.title}
        </Typography>
        <IconButton color="inherit"
          sx={{ padding: "2px" }}
          onClick={onClose}
        >
          <XIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box
        sx={{
          padding: 1.5
        }}>
        <Grid container>
          <Grid item>
            {event?.imgUrl ?
              (<Box
                sx={{
                  alignItems: "center",
                  backgroundColor: "background.default",
                  backgroundImage: `url("${event?.imgUrl[0].url}")`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  borderRadius: 0.5,
                  display: "flex",
                  minHeight: 80,
                  justifyContent: "center",
                  overflow: "hidden",
                  minWidth: 80,
                  objectFit: "cover",
                }}
              />
              ) : (
                <Box
                  sx={{
                    alignItems: "center",
                    backgroundColor: "background.default",
                    borderRadius: 0.5,
                    display: "flex",
                    height: 80,
                    justifyContent: "center",
                    width: 80,
                  }}
                >
                  <ImageIcon fontSize="small" />
                </Box>)
            }
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <span sx={{ fontSize: '12px' }}>
                  Units
                </span>
                <br/>
                <span sx={{ fontSize: '16px' }}>
                  {event?.title}
                </span>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Drawer>
  );
};