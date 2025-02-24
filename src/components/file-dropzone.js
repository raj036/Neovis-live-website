import {
  Box,
  Link,
  Typography
} from "@mui/material";
import PropTypes from "prop-types";
import { useDropzone } from "react-dropzone";

export const FileDropzone = (props) => {
  const {
    // Own props
    files = [],
    onRemove,
    onRemoveAll,
    onUpload,
    onDefaultImageChange,
    isShowTaskImage,
    onTaskImageChange,
    isShowTaskRoomImage,
    onTaskRoomImageChange,
    onDescriptionChange,
    // DropzoneOptions props
    accept,
    disabled,
    getFilesFromEvent,
    maxSize,
    minSize,
    multiple,
    maxFiles,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onDropAccepted,
    onDropRejected,
    onFileDialogCancel,
    onFileDialogOpen,
    useFsAccessApi,
    autoFocus,
    preventDropOnDocument,
    noClick,
    noKeyboard,
    noDrag,
    noDragEventsBubbling,
    onError,
    validator,
    ...other
  } = props;

  // We did not add the remaining props to avoid component complexity
  // but you can simply add it if you need to.
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    minSize,
    onDrop,
  });

  return (
    <div {...other}>
      {!disabled && (
        <Box
          sx={{
            alignItems: "center",
            border: 1,
            borderRadius: 1,
            borderStyle: "dashed",
            borderColor: "divider",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            outline: "none",
            p: 6,
            ...(isDragActive && {
              backgroundColor: "action.active",
              opacity: 0.5,
            }),
            "&:hover": {
              backgroundColor: "action.hover",
              cursor: "pointer",
              opacity: 0.5,
            },
          }}
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          <Box
            sx={{
              "& img": {
                width: 100,
              },
            }}
          >
            <img alt="Select file" src="/static/undraw_add_file2_gvbb.svg" />
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">
              {`Select file${maxFiles && maxFiles === 1 ? "" : "s"}`}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                {`Drop file${maxFiles && maxFiles === 1 ? "" : "s"}`}{" "}
                <Link underline="always">browse</Link> thorough your machine
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </div>
  );
};

FileDropzone.propTypes = {
  files: PropTypes.array,
  onRemove: PropTypes.func,
  onRemoveAll: PropTypes.func,
  onUpload: PropTypes.func,
  accept: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
  disabled: PropTypes.bool,
  getFilesFromEvent: PropTypes.func,
  maxFiles: PropTypes.number,
  maxSize: PropTypes.number,
  minSize: PropTypes.number,
  noClick: PropTypes.bool,
  noDrag: PropTypes.bool,
  noDragEventsBubbling: PropTypes.bool,
  noKeyboard: PropTypes.bool,
  onDrop: PropTypes.func,
  onDropAccepted: PropTypes.func,
  onDropRejected: PropTypes.func,
  onFileDialogCancel: PropTypes.func,
  preventDropOnDocument: PropTypes.bool,
};
