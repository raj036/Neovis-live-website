import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Fab,
  FormControl,
  FormControlLabel,
  Switch,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "react-query";
import { STATUSES, ELEMENT_TYPES } from "../../../../utils/constants";
import useAxios from "../../../../services/useAxios";
import { ConfirmDialog } from "../../confim-dialog";
import { CameraAlt } from "@mui/icons-material";
import {
  deleteFirebaseImage,
  uploadFirebaseImage,
} from "../../../../utils/helper";

export const ElementEditForm = (props) => {
  const router = useRouter();
  const [isDisabled, setIsDisabled] = useState(true);
  const [dialogStat, setDialogStat] = useState(false);
  const [loading, setLoading] = useState();
  const [elementPhoto, setElementPhoto] = useState();

  const { element } = props;

  const customInstance = useAxios();
  const queryClient = useQueryClient();

  const { mutateAsync: addElement } = useMutation((data) =>
    customInstance.post(`elements`, data)
  );

  const { mutateAsync: updateElement } = useMutation((data) => {
    customInstance.patch(`elements/${data?.id}`, data);
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      code: "",
      photo: "",
      element_type: "",
      status: "Active",
      is_checklist_config: true,
      is_guest_task_config: true
    },
    validationSchema: Yup.object({
      code: Yup.string().max(15),
      name: Yup.string().max(50),
    }),
    onSubmit: async (values, helpers) => {
      try {
        if (values.inventories) {
          delete values.inventories
        }
        setLoading(true);
        if (element) {
          let photo = await uploadPhoto();
          await updateElement({ ...values, photo: photo });
          await queryClient.refetchQueries(
            ["elementById", element.id?.toString()],
            {
              active: true,
              exact: true,
            }
          );
        } else {
          let photo = await uploadPhoto();
          await addElement({ ...values, photo: photo });
          formik.resetForm();
        }
        setLoading(false);
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        toast.success(
          element
            ? "Element updated successfully!"
            : "Element added successfully!"
        );
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong!");
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  const onConfirmDialog = async () => {
    try {
      setDialogStat(false);
      await updateElement({ ...formik.values, status: "Delete" });
      toast.success("Element deleted!");
      router.push("/dashboard/configurations/elements");
    } catch (e) {
      setDialogStat(false);
      toast.error("Something went wrong!");
    }
  };

  const uploadPhoto = async () => {
    let photo_uri;
    const element = formik.values;
    if (elementPhoto && elementPhoto.updated === true) {
      try {
        if (element?.photo) {
          await deleteFirebaseImage("config", element.photo);
        }
        photo_uri = await uploadFirebaseImage("config", elementPhoto);
      } catch (e) {
        console.log("Error", e);
      }
    }
    return photo_uri;
  };

  const onImageSelect = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function (e) {
      setElementPhoto({
        url: reader.result,
        _file: file,
        updated: true,
      });
    };
  };

  useEffect(() => {
    if (props) {
      if (props?.isEdit) {
        setIsDisabled(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  useEffect(() => {
    formik.resetForm();
    if (props?.element) {
      formik.setValues({ ...props.element });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.element]);

  return (
    <>
      <form onSubmit={formik.handleSubmit} {...props}>
        <Card>
          <CardContent>
            <ConfirmDialog
              title="Delete confirm?"
              message=" Are you sure you want to delete element?"
              dialogStat={dialogStat}
              setDialogStat={setDialogStat}
              onConfirmDialog={onConfirmDialog}
            />
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    overflow: "hidden",
                    //mt: "-25px",
                    ml: 5,
                    mb: 3,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <Avatar
                      src={
                        elementPhoto ? elementPhoto?.url : formik?.values?.photo
                      }
                      sx={{
                        height: 150,
                        width: 150,
                        ml: 2,
                        mt: 1,
                      }}
                    >
                      Element
                    </Avatar>
                    <Typography
                      color="textSecondary"
                      variant="subtitle2"
                      sx={{ mt: 1, ml: 5 }}
                    >
                      Element Photo
                    </Typography>
                    <>
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="user-image"
                        type="file"
                        onChange={onImageSelect}
                      />
                      <label htmlFor="user-image">
                        <Fab
                          component="div"
                          style={{
                            backgroundColor: "white",
                            width: "25px",
                            height: "25px",
                            position: "absolute",
                            top: "110px",
                            right: "2px",
                          }}
                          icon
                          disabled={isDisabled}
                        >
                          <CameraAlt sx={{ width: "15px", height: "15px" }} />
                        </Fab>
                      </label>
                    </>
                  </div>
                </Box>
              </Grid>
              <Grid item md={8} xs={12}>
                <TextField
                  error={Boolean(formik.touched.name && formik.errors.name)}
                  fullWidth
                  helperText={formik.touched.name && formik.errors.name}
                  label="Element Title"
                  name="name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.name}
                  disabled={isDisabled}
                  sx={{ mb: 2 }}
                />
                <TextField
                  error={Boolean(formik.touched.code && formik.errors.code)}
                  fullWidth
                  helperText={formik.touched.code && formik.errors.code}
                  label="Element Code"
                  name="code"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.code}
                  disabled={isDisabled}
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <InputLabel id="element_type">Element Type *</InputLabel>
                  <Select
                    error={Boolean(
                      formik.touched.element_type && formik.errors.element_type
                    )}
                    helperText={
                      formik.touched.element_type && formik.errors.element_type
                    }
                    label="Element Type"
                    labelId="element_type"
                    name="element_type"
                    required
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.element_type}
                    disabled={isDisabled}
                  >
                    {ELEMENT_TYPES?.map((_type) => (
                      <MenuItem key={_type.value} value={_type.value}>
                        {_type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mt: 3 }}>
                  <InputLabel id="status">Status *</InputLabel>
                  <Select
                    error={Boolean(
                      formik.touched.status && formik.errors.status
                    )}
                    helperText={formik.touched.status && formik.errors.status}
                    label="Status"
                    labelId="status"
                    name="status"
                    required
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.status}
                    disabled={isDisabled}
                  >
                    {STATUSES?.map((_status) => (
                      <MenuItem key={_status.value} value={_status.value}>
                        {_status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControlLabel
                  sx={{ mb: 2 }}
                  control={
                    <Switch
                      checked={formik.values.is_checklist_config}
                      onChange={(e) => {
                        formik.setFieldValue('is_checklist_config', e.currentTarget.checked)
                      }}
                    />
                  }
                  label="Show on checklist"
                />
                <FormControlLabel
                  sx={{ mb: 2 }}
                  control={
                    <Switch
                      checked={formik.values.is_guest_task_config}
                      onChange={(e) => {
                        formik.setFieldValue('is_guest_task_config', e.currentTarget.checked)
                      }}
                    />
                  }
                  label="For guest task"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        {!isDisabled && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              mx: -1,
              mb: -1,
              mt: 3,
            }}
          >
            {element && !element.default && (
              <>
                <Button
                  color="error"
                  sx={{
                    m: 1,
                    mr: "auto",
                  }}
                  onClick={() => setDialogStat(true)}
                >
                  Delete
                </Button>
              </>
            )}
            <Button
              sx={{ m: 1, ml: "auto", minWidth: "100px" }}
              type="submit"
              variant="contained"
            >
              {loading ? (
                <CircularProgress style={{ color: "white" }} size={26} />
              ) : element ? (
                "Update"
              ) : (
                "Save"
              )}
            </Button>
          </Box>
        )}
      </form>
    </>
  );
};
