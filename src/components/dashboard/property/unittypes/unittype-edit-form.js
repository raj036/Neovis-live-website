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
  Chip,
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
import { FileDropzone } from "../../../file-dropzone";
import { PROPERTY_STATUSES, UNITTYPE_CLASS } from "../../../../utils/constants";
import { QuillEditor } from "../../../quill-editor";
import useAxios from "../../../../services/useAxios";
import { ConfirmDialog } from "../../confim-dialog";
import * as MuiIcons from "@mui/icons-material";
import {
  deleteFirebaseImage,
  uploadFirebaseImage,
} from "../../../../utils/helper";
import { margin } from "@mui/system";

export const UnittypeEditForm = (props) => {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [dialogStat, setDialogStat] = useState(false);
  const [loading, setLoading] = useState();
  const [amenities, setAmenities] = useState([]);
  const [selProperty, setSelProprty] = useState();

  const { unittype } = props;

  const customInstance = useAxios();
  const queryClient = useQueryClient();

  const { data: properties } = useQuery("allProperty", () =>
    customInstance.get(`properties`)
  );

  const { mutateAsync: addUnittype } = useMutation((data) =>
    customInstance.post(`unit-types`, data)
  );

  const { mutateAsync: updateUnittype } = useMutation((data) => {
    customInstance.patch(`unit-types/${data?.id}`, data);
  });

  const { data: amentities } = useQuery("amentities", () =>
    customInstance.get(`amentities`)
  );

  const formik = useFormik({
    initialValues: {
      property_id: 0,
      unit_type_code: "",
      unit_type_name: "",
      description: "",
      number_of_bedroom: 0,
      number_of_bathroom: 0,
      unit_class: "",
      main_image: "",
      images: [],
      status: "Active",
      amenity_ids: [],
    },
    validationSchema: Yup.object({
      property_id: Yup.string().required(),
      unit_type_code: Yup.string().max(15),
      unit_type_name: Yup.string().max(50),
      unit_class: Yup.string().max(50),
      description: Yup.string().max(5000),
      number_of_bedroom: Yup.number().max(99, "Invalid count"),
      number_of_bathroom: Yup.number().max(99, "Invalid count"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        setLoading(true);
        if (unittype) {
          let images = await uploadImages();
          let data = { ...values };
          delete data.property;
          await updateUnittype({
            ...data,
            images: images,
          });
          await queryClient.refetchQueries(
            ["unittypeById", unittype.id?.toString()],
            {
              active: true,
              exact: true,
            }
          );
          router.push("/dashboard/properties/unittypes");
        } else {
          let images = await uploadImages();
          await addUnittype({
            ...values,
            images: images,
          });
          formik.resetForm();
          setFiles([]);
          router.push("/dashboard/properties/unittypes");
        }
        setLoading(false);
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        toast.success(
          unittype
            ? "Unit type updated successfully!"
            : "Unit type added successfully!"
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
      await updateUnittype({
        ...formik.values,
        status: "Delete",
      });
      toast.success("Unit type deleted successfully!");
      router.push("/dashboard/properties/unittypes");
    } catch (e) {
      setDialogStat(false);
      toast.error("Something went wrong!");
    }
  };

  const uploadImages = async () => {
    let imagesUri = files?.filter((_) => !_.updated && !_.deleted);

    await Promise.all(
      files
        ?.filter((_) => _.updated || _.deleted)
        ?.map(
          (file) =>
            new Promise(async (resolve) => {
              if (file.deleted) {
                await deleteFirebaseImage("unittype", file.url);
                resolve();
              } else {
                const uri = await uploadFirebaseImage("unittype", file);
                imagesUri.push({
                  url: uri,
                  description: file.description,
                  default: file.default ? true : false,
                  isTaskImage: file.isTaskImage ? true : false,
                  isTaskRoomImage: file.isTaskRoomImage ? true : false,
                });
                resolve();
              }
            })
        )
    );
    return imagesUri;
  };

  const handleDrop = async (newFiles) => {
    let imgData = [...files];

    await Promise.all(
      newFiles?.map(
        (_file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(_file);
            reader.onload = () => {
              imgData.push({
                url: reader.result,
                _file: _file,
                updated: true,
              });
              resolve(reader.result);
            };
            reader.onerror = (error) => reject(error);
          })
      )
    );
    setFiles(imgData);
  };

  const handleRemove = (url) => {
    let data = [...files];

    const idx = data?.findIndex((_) => _.url === url);

    if (idx >= 0) {
      if (data[idx].updated) {
        data.splice(idx, 1);
        setFiles(data);
      } else {
        data[idx].deleted = true;
        setFiles(data);
      }
    }
  };

  const onDefaultImageChange = (url, isDefault) => {
    let data = url
      ? files?.map((_) => {
        delete _.default;
        return _;
      })
      : [...files];
    const idx = data?.findIndex((_) => _.url === url);
    if (idx >= 0) {
      data[idx].default = isDefault;
    }

    setFiles(data);
  };

  const onTaskImageChange = (url, isTaskImage) => {
    let data = url
      ? files?.map((_) => {
        delete _.isTaskImage;
        return _;
      })
      : [...files];
    const idx = data?.findIndex((_) => _.url === url);
    if (idx >= 0) {
      data[idx].isTaskImage = isTaskImage;
    }

    setFiles(data);
  };

  const onTaskRoomImageChange = (url, isTaskRoomImage) => {
    let data = [...files]
    //  url
    //   ? files?.map((_) => {
    //     delete _.isTaskRoomImage;
    //     return _;
    //   })
    //   : [...files];
    const idx = data?.findIndex((_) => _.url === url);
    // if (idx >= 0) {
    //   data[idx].isTaskRoomImage = isTaskRoomImage;
    // }
    data[idx].isTaskRoomImage = isTaskRoomImage;

    setFiles(data);
  };

  const onDescriptionChange = (url, description) => {
    let data = [...files];
    const idx = data?.findIndex((_) => _.url === url);
    if (idx >= 0) {
      data[idx].description = description;
    }

    setFiles(data);
  };

  const handleRemoveAll = () => {
    let data = [...files];

    data.forEach((_, index) => {
      if (_.updated) {
        data.splice(index, 1);
      } else {
        _.deleted = true;
      }
    });

    setFiles(data);
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
    setFiles([]);
    if (props?.unittype) {
      const amenity_ids = props.unittype?.amenities?.map((_) => _.id);
      formik.setValues({ ...props.unittype, amenity_ids: amenity_ids });
      setSelProprty(props?.unittype.property);

      setFiles(props.unittype?.images ?? []);
      setAmenities(props.unittype?.amenities);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.unittype]);

  return (
    <>
      <form onSubmit={formik.handleSubmit} {...props}>
        <Card>
          <CardContent>
            <ConfirmDialog
              title="Delete confirm?"
              message=" Are you sure you want to delete unittype?"
              dialogStat={dialogStat}
              setDialogStat={setDialogStat}
              onConfirmDialog={onConfirmDialog}
            />
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Typography variant="h6">Basic details</Typography>
              </Grid>
              <Grid item md={8} xs={12}>
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
                  disabled={isDisabled}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={Boolean(
                        formik.touched.property_id && formik.errors.property_id
                      )}
                      disabled={isDisabled}
                      fullWidth
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
                <TextField
                  error={Boolean(
                    formik.touched.unit_type_name &&
                    formik.errors.unit_type_name
                  )}
                  fullWidth
                  required
                  helperText={
                    formik.touched.unit_type_name &&
                    formik.errors.unit_type_name
                  }
                  label="Unit Type Name"
                  name="unit_type_name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.unit_type_name}
                  disabled={isDisabled}
                  sx={{
                    mt: 3,
                  }}
                />
                <TextField
                  error={Boolean(
                    formik.touched.unit_type_code &&
                    formik.errors.unit_type_code
                  )}
                  fullWidth
                  required
                  helperText={
                    formik.touched.unit_type_code &&
                    formik.errors.unit_type_code
                  }
                  sx={{
                    mt: 3,
                  }}
                  label="Unit Type Code"
                  name="unit_type_code"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.unit_type_code}
                  disabled={isDisabled}
                />
                <FormControl
                  fullWidth
                  sx={{
                    mt: 3,
                  }}
                >
                  <InputLabel id="unit_class">Unit Class *</InputLabel>
                  <Select
                    error={Boolean(
                      formik.touched.unit_class && formik.errors.unit_class
                    )}
                    helperText={
                      formik.touched.unit_class && formik.errors.unit_class
                    }
                    label="Unit Class"
                    labelId="unit_class"
                    name="unit_class"
                    required
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.unit_class}
                    disabled={isDisabled}
                  >
                    {UNITTYPE_CLASS?.map((_class) => (
                      <MenuItem key={_class.value} value={_class.value}>
                        {_class.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  error={Boolean(
                    formik.touched.number_of_bedroom &&
                    formik.errors.number_of_bedroom
                  )}
                  fullWidth
                  helperText={
                    formik.touched.number_of_bedroom &&
                    formik.errors.number_of_bedroom
                  }
                  type="number"
                  label="Number of bedroom"
                  name="number_of_bedroom"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.number_of_bedroom}
                  disabled={isDisabled}
                  sx={{
                    mt: 3,
                  }}
                />
                <TextField
                  error={Boolean(
                    formik.touched.number_of_bathroom &&
                    formik.errors.number_of_bathroom
                  )}
                  fullWidth
                  helperText={
                    formik.touched.number_of_bathroom &&
                    formik.errors.number_of_bathroom
                  }
                  type="number"
                  label="Number of bathroom"
                  name="number_of_bathroom"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.number_of_bathroom}
                  disabled={isDisabled}
                  sx={{
                    mt: 3,
                  }}
                />
                <FormControl
                  fullWidth
                  sx={{
                    mt: 3,
                  }}
                >
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
                    {PROPERTY_STATUSES?.map((_status) => (
                      <MenuItem key={_status.value} value={_status.value}>
                        {_status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography
                  color="textSecondary"
                  sx={{
                    mb: 2,
                    mt: 3,
                  }}
                  variant="subtitle2"
                >
                  Description
                </Typography>
                <QuillEditor
                  onChange={(value) => {
                    formik.setFieldValue("description", value);
                  }}
                  placeholder="Enter unit type description"
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
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Typography variant="h6">Images</Typography>
                <Typography
                  color="textSecondary"
                  variant="body2"
                  sx={{ mt: 1 }}
                >
                  Unit Type Image
                </Typography>
              </Grid>
              <Grid item md={8} xs={12}>
                <FileDropzone
                  accept={{
                    "image/*": [],
                  }}
                  files={files}
                  onDefaultImageChange={onDefaultImageChange}
                  isShowTaskImage={true}
                  isShowTaskRoomImage={true}
                  onTaskImageChange={onTaskImageChange}
                  onTaskRoomImageChange={onTaskRoomImageChange}
                  onDescriptionChange={onDescriptionChange}
                  onDrop={handleDrop}
                  onRemove={handleRemove}
                  onRemoveAll={handleRemoveAll}
                  disabled={isDisabled}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Typography variant="h6">Amenities</Typography>
              </Grid>
              <Grid item md={8} xs={12}>
                <Autocomplete
                  options={
                    amentities?.data?.data?.filter(
                      (_) => !formik.values.amenity_ids.includes(_.id)
                    ) ?? []
                  }
                  getOptionLabel={(option) => option.name}
                  filterSelectedOptions
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Amenities"
                      placeholder="Select Amenities"
                    />
                  )}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      formik.setFieldValue("amenity_ids", [
                        ...formik.values.amenity_ids,
                        newValue.id,
                      ]);
                      setAmenities([...amenities, newValue]);
                    }
                  }}
                  disabled={isDisabled}
                />
                <Grid container sx={{ mt: 2 }}>
                  {amenities?.map((_amenity) => {
                    let AmenityIcon =
                      MuiIcons[_amenity.icon ? _amenity.icon : "LocalOffer"];
                    return (
                      <Grid key={_amenity.id} item sx={{ mt: 2, display: "flex", marginLeft: 2 }}>
                        <Chip
                          label={_amenity.name}
                          icon={<AmenityIcon />}
                          variant="outlined"
                          disabled={isDisabled}
                          onDelete={() => {
                            formik.setFieldValue(
                              "amenity_ids",
                              formik.values.amenity_ids?.filter(
                                (_) => _ !== _amenity.id
                              )
                            );
                            setAmenities(
                              amenities?.filter((_) => _.id !== _amenity.id)
                            );
                          }}
                        />
                      </Grid>
                    );
                  })}
                </Grid>

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
            {unittype && (
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
              ) : unittype ? (
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
