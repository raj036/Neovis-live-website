import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { AREA_TYPES, STATUSES } from "../../../../utils/constants";
import { QuillEditor } from "../../../quill-editor";
import useAxios from "../../../../services/useAxios";
import { ConfirmDialog } from "../../confim-dialog";

export const UnitareaEditForm = (props) => {
  const router = useRouter();
  const [isDisabled, setIsDisabled] = useState(true);
  const [dialogStat, setDialogStat] = useState(false);
  const [loading, setLoading] = useState();
  const [selProperty, setSelProprty] = useState();
  const [selUnittype, setSelUnittype] = useState();

  const { unitarea } = props;

  const customInstance = useAxios();
  const queryClient = useQueryClient();

  const { data: properties } = useQuery("allProperty", () =>
    customInstance.get(`properties`)
  );

  const { data: unittypes, refetch: unittypeRefetch } = useQuery(
    "unitTypesOnProperty",
    () => customInstance.get(`unit-types/property/${selProperty?.id}`),
    { enabled: selProperty?.id !== undefined }
  );

  const { mutateAsync: addUnitarea } = useMutation((data) =>
    customInstance.post(`unit-areas`, data)
  );

  const { mutateAsync: updateUnitarea } = useMutation((data) => {
    customInstance.patch(`unit-areas/${data?.id}`, data);
  });

  const formik = useFormik({
    initialValues: {
      area_name: "",
      area_code: "",
      description: "",
      area_type: "",
      status: "Active",
      unit_type_id: 0,
      property_id: 0,
    },
    validationSchema: Yup.object({
      property_id: Yup.string().required(),
      unit_type_id: Yup.string().required(),
      area_code: Yup.string().max(15),
      area_name: Yup.string().max(50),
      description: Yup.string().max(5000),
    }),
    onSubmit: async (values, helpers) => {
      try {
        setLoading(true);
        if (unitarea) {
          let data = { ...values };
          delete data.property;
          delete data.unit_type;
          await updateUnitarea(data);
          await queryClient.refetchQueries(
            ["unitareaById", unitarea.id?.toString()],
            {
              active: true,
              exact: true,
            }
          );
        } else {
          await addUnitarea(values);
          formik.resetForm();
        }
        setLoading(false);
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        toast.success(
          unitarea
            ? "Unit area updated successfully!"
            : "Unit area added successfully!"
        );
        router.push("/dashboard/properties/unitareas");
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
      await updateUnitarea({ ...formik.values, status: "Delete" });
      toast.success("Unit area deleted successfully!");
      router.push("/dashboard/properties/unitareas");
    } catch (e) {
      setDialogStat(false);
      toast.error("Something went wrong!");
    }
  };

  useEffect(() => {
    if (selProperty?.id) {
      unittypeRefetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selProperty, unittypeRefetch]);

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
    if (props?.unitarea) {
      formik.setValues({ ...props.unitarea });
      setSelProprty(props?.unitarea.property);
      setSelUnittype(props?.unitarea.unit_type);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.unitarea]);

  return (
    <>
      <form onSubmit={formik.handleSubmit} {...props}>
        <Card>
          <CardContent>
            <ConfirmDialog
              title="Delete confirm?"
              message=" Are you sure you want to delete unitarea?"
              dialogStat={dialogStat}
              setDialogStat={setDialogStat}
              onConfirmDialog={onConfirmDialog}
            />
            <Grid container spacing={3}>
              <Grid item md={6} xs={12}>
                <Autocomplete
                  options={properties?.data?.data ?? []}
                  getOptionLabel={(option) =>
                    option.property_name ? option.property_name : ""
                  }
                  value={
                    selProperty
                      ? properties?.data?.data?.find(
                          (_) => _.id === selProperty?.id
                        )
                      : ""
                  }
                  disabled={isDisabled || unitarea}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={Boolean(
                        formik.touched.property_id && formik.errors.property_id
                      )}
                      fullWidth
                      disabled={isDisabled || unitarea}
                      required
                      helperText={
                        formik.touched.property_id && formik.errors.property_id
                      }
                      label="Select Property"
                      placeholder="Select Property"
                    />
                  )}
                  onChange={(event, newValue) => {
                    setSelProprty(newValue);
                    formik.setFieldValue(
                      "property_id",
                      newValue ? newValue.id : undefined
                    );
                  }}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <Autocomplete
                  options={unittypes?.data ?? []}
                  getOptionLabel={(option) =>
                    option.unit_type_name ? option.unit_type_name : ""
                  }
                  value={
                    selUnittype
                      ? unittypes?.data?.find((_) => _.id === selUnittype?.id)
                      : ""
                  }
                  disabled={isDisabled}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={Boolean(
                        formik.touched.unit_type_id &&
                          formik.errors.unit_type_id
                      )}
                      disabled={isDisabled}
                      fullWidth
                      required
                      helperText={
                        formik.touched.unit_type_id &&
                        formik.errors.unit_type_id
                      }
                      label="Select Unit Type"
                      placeholder="Select Unit Type"
                    />
                  )}
                  onChange={(event, newValue) => {
                    setSelUnittype(newValue);
                    formik.setFieldValue(
                      "unit_type_id",
                      newValue ? newValue.id : undefined
                    );
                  }}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  error={Boolean(
                    formik.touched.area_name && formik.errors.area_name
                  )}
                  fullWidth
                  helperText={
                    formik.touched.area_name && formik.errors.area_name
                  }
                  label="Area Name"
                  name="area_name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.area_name}
                  disabled={isDisabled}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  error={Boolean(
                    formik.touched.area_code && formik.errors.area_code
                  )}
                  fullWidth
                  helperText={
                    formik.touched.area_code && formik.errors.area_code
                  }
                  label="Area Code"
                  name="area_code"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.area_code}
                  disabled={isDisabled}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="area_type">Area Type *</InputLabel>
                  <Select
                    error={Boolean(
                      formik.touched.area_type && formik.errors.area_type
                    )}
                    helperText={
                      formik.touched.area_type && formik.errors.area_type
                    }
                    label="Area Type"
                    labelId="area_type"
                    name="area_type"
                    required
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.area_type}
                    disabled={isDisabled}
                    MenuProps={{ PaperProps: { sx: { maxHeight: 195 } } }}
                  >
                    {AREA_TYPES?.map((_area) => (
                      <MenuItem key={_area.value} value={_area.value}>
                        {_area.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12}>
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
              </Grid>
              <Grid item xs={12}>
                <Typography
                  color="textSecondary"
                  sx={{
                    mb: 1,
                  }}
                  variant="subtitle2"
                >
                  Description
                </Typography>
                <QuillEditor
                  onChange={(value) => {
                    formik.setFieldValue("description", value);
                  }}
                  placeholder="Enter unit area description"
                  sx={{ height: 300 }}
                  value={formik.values.description}
                  disabled={isDisabled}
                />
                {Boolean(
                  formik.touched.description && formik.errors.description
                ) && (
                  <Box sx={{ mt: 2 }}>
                    <FormHelperText error>
                      {formik.errors.description}
                    </FormHelperText>
                  </Box>
                )}
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
            {unitarea && (
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
              ) : unitarea ? (
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
