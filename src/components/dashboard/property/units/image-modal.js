import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Link,
  List,
  ListItem,
  ListItemIcon,
  TextField,
  Typography
} from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import * as React from 'react';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export function ImageModal(props) {
  const { currentStatus, imageType, toggleEditing, files, file, accept, disabled, isShowTaskRoomImage, onDefaultImageChange, isShowTaskImage, onRemoveAll, onRemove, onTaskImageChange, onTaskRoomImageChange, onDescriptionChange } = props



  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={toggleEditing}
        open={currentStatus}
        maxWidth="md"
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="image-dialog-title">
          Edit Image
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={toggleEditing}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Box sx={{ mt: 2 }}>
            <List>
              <ListItem
                sx={{
                  borderColor: "divider",
                  borderRadius: 1,
                  "& + &": {
                    mt: 1,
                  },
                }}
              >
                <ListItemIcon>
                  {/* <DuplicateIcon fontSize="small" /> */}
                  <Box
                    sx={{
                      alignItems: "center",
                      //backgroundColor: "background.default",
                      backgroundImage: `url("${file.url}")`,
                      backgroundPosition: "center",
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      borderRadius: 1,
                      display: "flex",
                      height: 400,
                      justifyContent: "center",
                      overflow: "hidden",
                      width: 600,
                      position: "relative",
                    }}
                  />
                </ListItemIcon>

                <Grid container>

                  <Grid container>

                    <Grid item md={12} xs={12}>
                      <TextField
                        fullWidth
                        disabled={disabled}
                        multiline
                        rows={11}
                        value={file.description}
                        InputProps={{ disableUnderline: true }}
                        inputType="text"
                        onChange={(e) =>
                          onDescriptionChange(file.url, e.currentTarget.value)
                        }
                        placeholder="Enter Description"
                      />

                      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                        Image Type:
                      </Typography>


                      <FormControlLabel
                        // sx={{
                        //   position: "absolute",
                        //   top: 0,
                        // }}
                        control={
                          <Checkbox
                            disabled={disabled}
                            checked={imageType?.includes('DEFAULT')}

                            onChange={(e) =>
                              onDefaultImageChange(
                                file.url,
                                e.currentTarget.checked
                              )
                            }
                          />
                        }
                        label="Main"
                      />
                      {isShowTaskImage &&
                        <FormControlLabel
                          // sx={{
                          //   position: "absolute",
                          //   top: 0, right: 50
                          // }}
                          control={
                            <Checkbox
                              disabled={disabled}
                              checked={imageType?.includes('TASK')}

                              onChange={(e) =>
                                onTaskImageChange(
                                  file.url,
                                  e.currentTarget.checked
                                )
                              }
                            />
                          }
                          label="Task"
                        />
                      }
                      {isShowTaskRoomImage &&
                        <FormControlLabel

                          control={
                            <Checkbox
                              disabled={disabled}
                              checked={imageType?.includes('ROOM')}

                              onChange={(e) =>
                                onTaskRoomImageChange(
                                  file.url,
                                  e.currentTarget.checked
                                )
                              }
                            />
                          }
                          label="Room"
                        />
                      }
                    </Grid>
                    <Grid item md={12} xs={12}>
                      <FormControlLabel
                        control={
                          disabled ? (
                            <></>
                          ) : (
                            <></>
                            // <Cancel
                            //   fontSize="small"
                            //   sx={{
                            //     color: "red",
                            //     position: "absolute",
                            //     right: "15px",
                            //     top: "5px",
                            //   }}
                            //   onClick={() => onRemove?.(file.url)}
                            // />
                          )
                        }
                        sx={{
                          flexGrow: 1,
                          mr: 0,
                        }}
                      />
                    </Grid>
                  </Grid>

                </Grid>
              </ListItem>
            </List>
            {/* {!disabled && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 2,
                  }}
                >
                  <Button onClick={onRemoveAll} size="small" type="button">
                    Remove All
                  </Button>
                </Box>
              )} */}
          </Box>
          <Box sx={{ display: "flex", flexDirection: 'column' }}>
            {files && Array.isArray(files) && files?.length > 0 && Object.keys(accept)[0] === "application/*" && files.map((item, idx) =>
              item?._file !== undefined ?
                <Box key={idx} sx={{ my: 2 }}>
                  <Typography variant="subtitle1">{item?._file?.name}</Typography>
                </Box>
                : item?.url ?
                  <Link
                    key={idx}
                    color="inherit"
                    variant="subtitle2"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      // fontSize: "0.875rem",
                      color: "black", cursor: 'pointer'
                    }}
                    onClick={() => window.open(item?.url, '_blank')}
                  >
                    Download document
                    {/* {item?.url?.slice(0, 50)}{item?.url?.length > 50 && '...'} */}
                  </Link> :
                  <Typography variant="subtitle1">No document available</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={toggleEditing}>
            Save changes
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}