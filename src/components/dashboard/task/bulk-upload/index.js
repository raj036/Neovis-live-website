import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import { Grid, IconButton, Typography } from '@mui/material';
import { X as XIcon } from "../../../../icons/x";
import toast from "react-hot-toast";
import { DialogTitle, DialogActions, DialogContent } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { FileDropzone } from './file-upload';
import { useMutation, useQuery, useQueryClient } from "react-query";
import useAxios from '../../../../services/useAxios';
import { Box } from '@mui/system';

const TaskBulkUpload = ({ open, taskRefetch, setOpen }) => {
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const customInstance = useAxios();

    const validateExcelFile = (fileName) => {
        var regex = /\.(xlsx|xls)$/i;
        var isValid = regex.test(fileName);
        if (!isValid) {
            toast.error("Invalid file. Please upload an Excel file.");
            return false
        }
        return true
    }

    const uploadFileTasks = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            let response = await customInstance.post(`tasks/bulkUpload`, formData);
            if (response?.data?.errorUpload?.length === 0) {
                setFile(null);
                taskRefetch();
                toast.success("File upload sucessful")
            }
            else {
                let errorRows;
                let errorData = response?.data?.errorUpload;
                errorRows = errorData && errorData.map((item) => item.row_no);
                errorRows = errorRows?.join(",")
                toast.error(`The file upload has encountered an error. Rows ${errorRows || ""} in the Excel sheet have failed to upload `);
                setFile(null);
            }
        } catch (error) {
            setFile(null);
            toast.error("File upload failed");
        }
    };

    const uploadFileUnits = async (e, file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            let response = await customInstance.post(`units/bulkUpload`, formData);
            if (response?.data?.errorUpload?.length === 0) {
                e.target.value = null
                toast.success("File upload sucessful")
            }
            else {
                let errorRows;
                let errorData = response?.data?.errorUpload;
                errorRows = errorData && errorData.map((item) => item.row_no);
                errorRows = errorRows?.join(",")
                toast.error(`The file upload has encountered an error. Rows ${errorRows || ""} in the Excel sheet have failed to upload `);
                e.target.value = null
            }


        } catch (error) {
            e.target.value = null
            toast.error("File upload failed");
        }
    };


    const handleFileChange = (event, selectedFile) => {
        const file = selectedFile?.[0]?.file || null;
        var validFile = validateExcelFile(file?.name);
        if (file === null) {
            setFile(null);
            toast.error("Something went wrong!");
            return;
        }
        if (validFile) {
            uploadFileTasks(file);
        }
        else {
            setFile(null);
            toast.error("Something went wrong!");
        }

    };


    const handleTemplateDownload = () => {
        const fileUrl = "https://firebasestorage.googleapis.com/v0/b/virtual-inspect-5390b.appspot.com/o/config%2FTaskCreation%20(3).xlsx?alt=media&token=c039821b-e13f-4c03-811c-6313844a3577";
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = 'Tasks.xlsx';
        link.click();
        toast.success("The Task Bulk Update Template have downloaded.")
    };

    const handleDocumentUpload = () => {
        fileInputRef.current.click();
    };

    return (
        <React.Fragment>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <DialogTitle id="alert-dialog-title">Bulk Upload Tasks</DialogTitle>
                    <IconButton color="inherit"
                        sx={{ padding: "16px 24px" }}
                        onClick={() => setOpen(false)}
                    >
                        <XIcon fontSize="small" />
                    </IconButton>
                </Box>
                <DialogContent >
                    <Grid item container spacing={1}>
                        <Grid item xs={12} md={12}>
                            <FileDropzone
                                accept={{
                                    "xlsx/xls": [],
                                }}
                                files={file}
                                onDefaultImageChange={null}
                                onDescriptionChange={null}
                                onDrop={handleFileChange}
                                onRemove={() => {
                                    setFile(null);
                                }}
                                onRemoveAll={null}
                                disabled={false}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <Box  >
                        <Button style={{ fontSize: 15 }} onClick={handleTemplateDownload} autoFocus>
                            Download Template
                        </Button>
                        <Typography fontSize={"small"}>(Download template for new tasks)</Typography>
                    </Box>
                </DialogActions>
            </Dialog>

        </React.Fragment>
    );
};

export default TaskBulkUpload;