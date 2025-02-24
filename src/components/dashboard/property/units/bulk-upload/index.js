import React, { useState, useRef, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import {
    DialogTitle, Box, DialogActions, Grid, DialogContent, FormControl,
    FormLabel, RadioGroup, FormControlLabel, Radio, IconButton
} from '@mui/material';
import { X as XIcon } from "../../../../../icons/x";
import Dialog from '@mui/material/Dialog';
import toast from "react-hot-toast";
import { FileDropzone } from './file-upload';
import { useMutation, useQuery, useQueryClient } from "react-query";
import useAxios from '../../../../../services/useAxios';
import dayjs from 'dayjs';

const UnitBulkUpload = ({ open, unitsRefetch, setOpen }) => {
    const fileInputRef = useRef(null);
    const customInstance = useAxios();
    const [file, setFile] = useState(null);
    const [uploadMode, setUploadMode] = useState("insert_new")

    const validateExcelFile = (fileName) => {
        var regex = /\.(xlsx|xls)$/i;
        var isValid = regex.test(fileName);
        if (!isValid) {
            toast.error("Invalid file. Please upload an Excel file.");
            return false
        }
        return true
    }

    const { mutateAsync: downloadUnitsData } = useMutation(() =>
        customInstance.get(`units/downloadExcel`)
    );


    const uploadFileUnits = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            let response = await customInstance.post(`units/update-bulkUpload`, formData);
            if (response?.data?.errorUpload?.length === 0) {
                setFile(null);
                unitsRefetch();
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


    const handleFileChange = (event, selectedFile) => {
        const file = selectedFile?.[0]?.file || null;
        if (file === null) {
            setFile(null);
            toast.error("Something went wrong!");
            return;
        }
        var validFile = validateExcelFile(file?.name);
        if (validFile) {
            uploadFileUnits(file)
        }
        else {
            setFile(null);
            toast.error("Something went wrong!");
        }

    };

    const handleTemplateDownload = () => {
        const fileUrl = "https://firebasestorage.googleapis.com/v0/b/virtual-inspect-5390b.appspot.com/o/config%2FUnitCreation%20(2).xlsx?alt=media&token=c2201f39-6fb7-4078-9324-85a4ebe93028"
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = 'Units.xlsx';
        link.click();
        toast.success("The Unit Bulk Update Template have downloaded.")
    };

    const handleDownloadData = async () => {
        let data = await downloadUnitsData();
        var filename = `UnitsDownload(${dayjs(new Date()).format("ddd DD/MM/YYYY hh:mm:ss A")}).xlsx`
        if (!filename) {
            toast.error("Error Occurred !")
            return;
        }
        if (typeof window.navigator.msSaveBlob !== "undefined") {
            let byteChar = atob(data?.data);
            let byteArray = new Array(byteChar.length);
            for (let i = 0; i < byteChar.length; i++) {
                byteArray[i] = byteChar.charCodeAt(i);
            }
            let uIntArray = new Uint8Array(byteArray);
            let blob = new Blob([uIntArray], { type: "application/vnd.ms-excel" });
            window.navigator.msSaveBlob(blob, filename);
        } else {
            const source = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${data?.data}`;
            const link = document.createElement("a");
            link.href = source;
            link.download = filename;
            link.click();
            toast.success("The units data have been downloaded succesfully.")
        }


    }

    const handleDocumentUpload = () => {
        fileInputRef.current.click();
    };

    return (
        <React.Fragment>
            <Dialog
                open={open}
                maxWidth="xl"
                onClose={() => setOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between"
                    }}
                >
                    <DialogTitle id="alert-dialog-title">Bulk Upload Units</DialogTitle>
                    <IconButton color="inherit"
                        sx={{ padding: "16px 24px" }}
                        onClick={() => setOpen(false)}
                    >
                        <XIcon fontSize="small" />
                    </IconButton>
                </Box>

                <DialogContent sx={{ width: "45vw" }}>
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
                <DialogActions
                    sx={{
                        display: "flex", justifyContent: "flex-end", marginBottom: "15px"
                    }}>
                    {/* <Box ml={5}>
                        <Button style={{ fontSize: 15 }} onClick={handleTemplateDownload} autoFocus>
                            Download Template
                        </Button>
                        <Typography fontSize={"small"}>(Download template for new units)</Typography>
                    </Box> */}

                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <Button style={{ fontSize: 15 }} onClick={handleDownloadData}>Download Data / Template</Button>
                        <Typography fontSize={"small"}>(Download data of existing units)</Typography>
                    </Box>
                </DialogActions>
            </Dialog>
        </React.Fragment >
    );
};

export default UnitBulkUpload;