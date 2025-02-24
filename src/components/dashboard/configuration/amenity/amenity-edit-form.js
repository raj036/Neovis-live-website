import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import { CameraAlt } from "@mui/icons-material";
import {
  deleteFirebaseImage,
  uploadFirebaseImage,
} from "../../../../utils/helper";
import {
  Avatar,
  Typography,
  Fab,
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  Switch,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useMutation, useQueryClient } from "react-query";
import { STATUSES } from "../../../../utils/constants";
import useAxios from "../../../../services/useAxios";
import { ConfirmDialog } from "../../confim-dialog";

export const AmenityEditForm = (props) => {
  const router = useRouter();
  const [isDisabled, setIsDisabled] = useState(true);
  const [dialogStat, setDialogStat] = useState(false);
  const [loading, setLoading] = useState();
  const [amentiesPhoto, setAmentiesPhoto] = useState();
  const { amenity } = props;

  const customInstance = useAxios();
  const queryClient = useQueryClient();

  const { mutateAsync: addAmenity } = useMutation((data) =>
    customInstance.post(`amentities`, data)
  );

  const { mutateAsync: updateAmenity } = useMutation((data) => {
    customInstance.patch(`amentities/${data?.id}`, data);
  });

  const formik = useFormik({
    initialValues: {
      code: "",
      name: "",
      pms_id: "",
      icon: "",
      photo: "",
      add_on: false,
      is_checklist_config: true,
      is_guest_task_config: true,
      status: "Active",
    },
    validationSchema: Yup.object({
      code: Yup.string().max(15),
      name: Yup.string().max(50),
      pms_id: Yup.string().max(10),
      icon: Yup.string().max(30),
    }),
    onSubmit: async (values, helpers) => {
      try {
        if (values.inventories) {
          delete values.inventories
        }
        setLoading(true);
        if (amenity) {
          let photo = await uploadPhoto();
          await updateAmenity({ ...values, photo: photo });
          await queryClient.refetchQueries(
            ["amenityById", amenity.id?.toString()],
            {
              active: true,
              exact: true,
            }
          );
        } else {
          let photo = await uploadPhoto();
          await addAmenity({ ...values, photo: photo });
          formik.resetForm();
        }
        setLoading(false);
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        toast.success(
          amenity
            ? "Amenity updated successfully!"
            : "Amenity added successfully!"
        );
        router.push('/dashboard/configurations/amenities');
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
      await updateAmenity({ ...formik.values, status: "Delete" });
      toast.success("Amenity deleted successfully!");
      router.push("/dashboard/configurations/amenities");
    } catch (e) {
      setDialogStat(false);
      toast.error("Something went wrong!");
    }
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
    if (props?.amenity) {
      formik.setValues({ ...props.amenity });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.amenity]);

  const uploadPhoto = async () => {
    let photo_uri;
    const amenity = formik.values;
    if (amentiesPhoto && amentiesPhoto.updated === true) {
      try {
        if (amenity?.photo !== "") {
          await deleteFirebaseImage("config", amenity.photo);
        }
        photo_uri = await uploadFirebaseImage("config", amentiesPhoto);
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
      setAmentiesPhoto({
        url: reader.result,
        _file: file,
        updated: true,
      });
    };
  };


  return (
    <>
      <form onSubmit={formik.handleSubmit} {...props}>
        <Card>
          <CardContent>
            <ConfirmDialog
              title="Delete confirm?"
              message=" Are you sure you want to delete Amenity?"
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
                        amentiesPhoto ? amentiesPhoto?.url : formik?.values?.photo
                      }
                      sx={{
                        height: 150,
                        width: 150,
                        ml: 2,
                        mt: 1,
                      }}
                    >
                      Amentities
                    </Avatar>
                    <Typography
                      color="textSecondary"
                      variant="subtitle2"
                      sx={{ mt: 1, ml: 5 }}
                    >
                      Amentities Photo
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
                  label="Amenity Name"
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
                  label="Amenity Code"
                  name="code"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.code}
                  disabled={isDisabled}
                  sx={{ mb: 2 }}
                />

                <TextField
                  error={Boolean(formik.touched.pms_id && formik.errors.pms_id)}
                  fullWidth
                  helperText={formik.touched.pms_id && formik.errors.pms_id}
                  label="PMS Id"
                  name="pms_id"
                  id="pms_id"
                  required
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.pms_id}
                  disabled={isDisabled}
                  sx={{ mb: 2 }}
                />

                {/* <TextField
                  error={Boolean(formik.touched.icon && formik.errors.icon)}
                  fullWidth
                  helperText={formik.touched.icon && formik.errors.icon}
                  label="Icon"
                  name="icon"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.icon}
                  disabled={isDisabled}
                  sx={{ mb: 2 }}
                /> */}

                <FormControl fullWidth>
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
                <Grid item md={6} xs={12}>
                  <FormGroup>
                    <FormControlLabel
                      sx={{
                        mt: 1,
                      }}
                      control={
                        <Switch
                          disabled={isDisabled}
                          checked={formik.values.add_on}
                          onChange={(e) =>
                            formik.setFieldValue("add_on", e.target.checked)
                          }
                        />
                      }
                      label="Add-On"
                    />
                  </FormGroup>
                </Grid>

                <Grid item md={6} xs={12}>
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
                </Grid>

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
            {amenity && (
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
              ) : amenity ? (
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
