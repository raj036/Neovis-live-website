import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import * as dayjs from "dayjs";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Fab,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { GoogleMap, Marker } from "@react-google-maps/api";
import Geocode from "react-geocode";
import * as MuiIcons from "@mui/icons-material";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import { CameraAlt } from "@mui/icons-material";
import { FileDropzone } from "../../file-dropzone";
import {
  GOOGLE_MAPS_APIKEY,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
} from "../../../utils/constants";
import { QuillEditor } from "../../quill-editor";
import useAxios from "../../../services/useAxios";
import { ConfirmDialog } from "../confim-dialog";
import {
  deleteFirebaseImage,
  uploadFirebaseImage,
} from "../../../utils/helper";

Geocode.setApiKey(GOOGLE_MAPS_APIKEY);

const zone = dayjs(new Date()).format("Z").split(":");
const offset = parseInt(zone[0].substring(1)) * 60 + parseInt(zone[1]);

var utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
dayjs().utcOffset(offset);
export const PropertyEditForm = (props) => {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [dialogStat, setDialogStat] = useState(false);
  const [loading, setLoading] = useState();
  const [place, setPlace] = useState("");
  const [propertyLogo, setPropertyLogo] = useState();
  const [amenities, setAmenities] = useState([]);
  const [company, setCompany] = useState(null);

  const { property } = props;
  const [location, setLocation] = useState({
    lat: 43.65107,
    lng: -79.347015,
  });

  const customInstance = useAxios();
  const queryClient = useQueryClient();

  const { mutateAsync: addProperty } = useMutation((data) =>
    customInstance.post(`properties`, data)
  );

  const { mutateAsync: updateProperty } = useMutation((data) => {
    customInstance.patch(`properties/${data?.id}`, data);
  });

  const { data: countries } = useQuery("countries", () =>
    customInstance.get(`countries`)
  );

  const { data: amentities } = useQuery("amentities", () =>
    customInstance.get(`amentities`)
  );

  const { data: companyData } = useQuery("companies", () =>
    customInstance.get(`company`)
  );

  const formik = useFormik({
    initialValues: {
      property_name: "",
      description: "",
      property_code: "",
      property_type: "Hotel",
      property_logo: "",
      main_image: "",
      images: [],
      address: "",
      country_code: 0,
      province: "",
      city: "",
      zip_code: "",
      latitude: 0,
      longitude: 0,
      status: "Active",
      amenity_ids: [],
      working_hour_from: null,
      working_hour_to: null,
      company_id: null
    },
    validationSchema: Yup.object({
      property_code: Yup.string().required().max(15),
      property_name: Yup.string().max(50),
      description: Yup.string().max(5000),
      address: Yup.string().max(100).required(),
      zip_code: Yup.number()
        .max(99999, "Invalid Zip")
        .min(10000, "Invalid Zip"),
      city: Yup.string()
        .max(30)
        .required()
        .matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for this field "),
      province: Yup.string()
        .max(30)
        .required()
        .matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for this field "),
    }),
    onSubmit: async (values, helpers) => {
      try {
        setLoading(true);
        if (property) {
          let images = await uploadImages();
          let property_logo = await uploadLogo();
          delete values.company
          delete values.country
          await updateProperty({
            ...values,
            images: images,
            property_logo: property_logo,
          });
          await queryClient.refetchQueries(
            ["propertyById", property.id?.toString()],
            {
              active: true,
              exact: true,
            }
          );
        } else {
          let images = await uploadImages();
          let property_logo = await uploadLogo();
          delete values.company
          delete values.country
          await addProperty({
            ...values,
            // working_hour_from: dayjs(new Date(values?.working_hour_from)).format('HH:mm'),
            // working_hour_to: dayjs(new Date(values?.working_hour_to)).format('HH:mm'),
            images: images,
            property_logo: property_logo,
          });
          formik.resetForm();
          setFiles([]);
        }
        setLoading(false);
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        toast.success(
          property
            ? "Property updated successfully!"
            : "Property added successfully!"
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
      await updateProperty({
        ...formik.values,
        status: "Delete",
      });
      toast.success("Property deleted successfully!");
      router.push("/dashboard/properties");
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
                await deleteFirebaseImage("property", file.url);
                resolve();
              } else {
                const uri = await uploadFirebaseImage("property", file);
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

  const uploadLogo = async () => {
    let logo_uri;
    const property = formik.values;
    if (propertyLogo && propertyLogo.updated === true) {
      try {
        if (property?.property_logo) {
          await deleteFirebaseImage("property", property.property_logo);
        }
        logo_uri = await uploadFirebaseImage("property", propertyLogo);
      } catch (e) {
        console.log("Error", e);
      }
    }
    return logo_uri;
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

  const handleWorkingHoursChange = (time, key) => {
    const formattedTime = time.toISOString().slice(11, 19);
    if (key === 'From') {
      formik.setFieldValue(
        "working_hour_from",
        time
      );
    } else {
      formik.setFieldValue(
        "working_hour_to",
        time
      );
    }

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

  const handleChange = (address) => setPlace(address);

  const handleSelect = async (address) => {
    setPlace(address);
    const results = await geocodeByAddress(address);
    const geo = await getLatLng(results[0]);
    setLocation(geo);
    formik.setFieldValue("latitude", geo.lat);
    formik.setFieldValue("longitude", geo.lng);
  };

  const populatePlace = async (lat, lng) => {
    const { results } = await Geocode.fromLatLng(lat, lng);
    setPlace(results[0].formatted_address);
  };

  const onLocationChange = async (e) => {
    setLocation(e.latLng.toJSON());
    formik.setFieldValue("latitude", e.latLng.toJSON().lat);
    formik.setFieldValue("longitude", e.latLng.toJSON().lng);
    const { lat, lng } = e.latLng.toJSON();
    populatePlace(lat, lng);
  };

  const onImageSelect = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function (e) {
      setPropertyLogo({
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
    setFiles([]);
    setPlace("");
    setLocation(location);
    if (props?.property) {
      const amenity_ids = props.property?.amenities?.map((_) => _.id);
      formik.setValues({ ...props.property, amenity_ids: amenity_ids });

      const { latitude, longitude } = props.property;

      if (latitude && longitude) {
        setLocation({
          lat: latitude,
          lng: longitude,
        });

        populatePlace(latitude, longitude);
      }

      setFiles(props.property?.images ?? []);
      setAmenities(props.property?.amenities);
      setCompany(props.property?.company)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.property]);



  return (
    <>
      <form onSubmit={formik.handleSubmit} {...props}>
        <Card>
          <CardContent>
            <ConfirmDialog
              title="Delete confirm?"
              message=" Are you sure you want to delete property?"
              dialogStat={dialogStat}
              setDialogStat={setDialogStat}
              onConfirmDialog={onConfirmDialog}
            />
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Typography variant="h6">Basic details</Typography>
              </Grid>
              <Grid item md={8} xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    overflow: "hidden",
                    mt: "-25px",
                    ml: 20,
                    mb: 3,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <Avatar
                      src={
                        propertyLogo
                          ? propertyLogo?.url
                          : formik?.values?.property_logo
                      }
                      sx={{
                        height: 64,
                        width: 64,
                        ml: 2,
                        mt: 1,
                      }}
                    >
                      LOGO
                    </Avatar>
                    <Typography
                      color="textSecondary"
                      variant="subtitle2"
                      sx={{ mt: 1 }}
                    >
                      Property Logo
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
                        <Tooltip title={"Select logo"}>
                          <Fab
                            component="div"
                            style={{
                              backgroundColor: "white",
                              width: "30px",
                              height: "25px",
                              position: "absolute",
                              top: "38px",
                              right: "5px",
                            }}
                            icon
                            disabled={isDisabled}
                          >
                            <CameraAlt sx={{ width: "15px", height: "15px" }} />
                          </Fab>
                        </Tooltip>
                      </label>
                    </>
                  </div>
                </Box>
                <TextField
                  error={Boolean(
                    formik.touched.property_code && formik.errors.property_code
                  )}
                  fullWidth
                  helperText={
                    formik.touched.property_code && formik.errors.property_code &&
                    "Please enter property code"
                  } R
                  label="Property Code"
                  name="property_code"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.property_code}
                  disabled={isDisabled}
                />
                <TextField
                  error={Boolean(
                    formik.touched.property_name && formik.errors.property_name
                  )}
                  fullWidth
                  required
                  helperText={
                    formik.touched.property_name && formik.errors.property_name &&
                    "Please enter property name"
                  }
                  label="Property Name"
                  name="property_name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.property_name}
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
                  <InputLabel id="type">Select Property Type</InputLabel>
                  <Select
                    error={Boolean(
                      formik.touched.property_type &&
                      formik.errors.property_type
                    )}
                    helperText={
                      formik.touched.property_type && formik.errors.property_type
                    }
                    label="Select Property Type"
                    labelId="type"
                    name="property_type"
                    required
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.property_type}
                    disabled={isDisabled}
                  >
                    {PROPERTY_TYPES.map((_type) => (
                      <MenuItem key={_type.value} value={_type.value}>
                        {_type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                  placeholder="Enter property description"
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
                  Property Image
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
                <Typography variant="h6">Address</Typography>
              </Grid>
              <Grid item md={8} xs={12}>
                <TextField
                  error={Boolean(
                    formik.touched.address && formik.errors.address
                  )}
                  fullWidth
                  required
                  label="Street"
                  name="address"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.address}
                  disabled={isDisabled}
                />
                <Grid container spacing={3}>
                  <Grid item md={6} xs={12}>
                    <TextField
                      error={Boolean(formik.touched.city && formik.errors.city)}
                      helperText={formik.touched.city && formik.errors.city && "Please enter city"}
                      fullWidth
                      required
                      label="City"
                      name="city"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      sx={{ mt: 2 }}
                      value={formik.values.city}
                      disabled={isDisabled}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextField
                      error={Boolean(
                        formik.touched.province && formik.errors.province
                      )}
                      helperText={
                        formik.touched.province && formik.errors.province && "Please enter province"
                      }
                      fullWidth
                      required
                      label="Province"
                      name="province"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      sx={{ mt: 2 }}
                      value={formik.values.province}
                      disabled={isDisabled}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item md={6} xs={12}>
                    <TextField
                      error={Boolean(
                        formik.touched.zip_code && formik.errors.zip_code && "Please enter zip code"
                      )}
                      type="number"
                      fullWidth
                      required
                      label="Zip"
                      name="zip_code"
                      helperText={
                        formik.touched.zip_code && formik.errors.zip_code
                      }
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      sx={{ mt: 2 }}
                      value={
                        formik.values.zip_code === 0
                          ? ""
                          : formik.values.zip_code
                      }
                      disabled={isDisabled}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel id="country">Country *</InputLabel>
                      <Select
                        error={Boolean(
                          formik.touched.country_code &&
                          formik.errors.country_code
                        )}
                        helperText={
                          formik.touched.country_code &&
                          formik.errors.country_code && "Please enter city"
                        }
                        label="Country"
                        labelId="country"
                        name="country_code"
                        required
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.country_code}
                        disabled={isDisabled}
                      >
                        {countries?.data?.map((_country) => (
                          <MenuItem key={_country.id} value={_country.id}>
                            {_country.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item md={6} xs={12}>
                    <TextField
                      fullWidth
                      label="Latitude"
                      name="latitude"
                      sx={{ mt: 2 }}
                      value={formik.values.latitude}
                      disabled={true}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextField
                      fullWidth
                      label="Longitude"
                      name="longitude"
                      sx={{ mt: 2 }}
                      value={formik.values.longitude}
                      disabled={true}
                    />
                  </Grid>
                </Grid>
                {window.google && (
                  <Grid container spacing={3}>
                    <Grid item md={12} xs={12}>
                      <Box>
                        <PlacesAutocomplete
                          value={place}
                          onChange={handleChange}
                          onSelect={handleSelect}
                        >
                          {({
                            getInputProps,
                            suggestions,
                            getSuggestionItemProps,
                            loading,
                          }) => (
                            <>
                              <TextField
                                label="Places"
                                {...getInputProps()}
                                fullWidth
                                value={place}
                                sx={{ mt: 2 }}
                                disabled={isDisabled}
                              />
                              <List
                                style={{
                                  position: "absolute",
                                  zIndex: 100,
                                  backgroundColor: "white",
                                  width: "40%",
                                }}
                              >
                                {suggestions.map((suggestion) => (
                                  <ListItem
                                    key={suggestion.index}
                                    {...getSuggestionItemProps(suggestion)}
                                    active={suggestion.active}
                                    style={{ width: "100%" }}
                                  >
                                    {suggestion.description}
                                  </ListItem>
                                ))}
                              </List>
                            </>
                          )}
                        </PlacesAutocomplete>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grid>
            {window.google && (
              <GoogleMap
                mapContainerStyle={{
                  height: "35vh",
                  marginTop: "15px",
                }}
                center={location}
                zoom={10}
                on
                onClick={onLocationChange}
              >
                <Marker
                  position={location}
                  draggable
                  onDragEnd={onLocationChange}
                />
              </GoogleMap>
            )}
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
                      (_) => !formik.values?.amenity_ids?.includes(_.id)
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
                      MuiIcons[
                      _amenity.icon && MuiIcons[_amenity.icon]
                        ? _amenity.icon
                        : "LocalOffer"
                      ];
                    return (
                      <Grid key={_amenity.id} item sx={{ mt: 2, display: "flex", marginLeft: 2 }}>
                        <Chip
                          label={_amenity.name}
                          variant="outlined"
                          icon={<AmenityIcon />}
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

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Typography variant="h6">Companies</Typography>
              </Grid>
              <Grid item md={8} xs={12}>
                <Autocomplete
                  options={companyData?.data?.data?.length > 0 ? companyData?.data?.data : []
                    // companyData?.data?.data?.filter(
                    //   (_) => !formik.values?.company_id?.includes(_.id)
                    // ) ?? []
                  }
                  value={company}
                  getOptionLabel={(option) => option.name}
                  // filterSelectedOptions
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Companies"
                      placeholder="Select Companies"
                    />
                  )}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      formik.setFieldValue("company_id", newValue.id
                        // [
                        //   ...formik.values.company_id,
                        //   newValue.id,
                        // ]
                      );
                      setCompany(newValue);
                    }
                  }}
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
                <Typography variant="h6">Working Hours</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <Box display="flex" alignItems="center" mt={1}>
                  <TimePicker
                    label="From"
                    error={Boolean(
                      formik.touched.working_hour_from && formik.errors.working_hour_from
                    )}
                    name="working_hour_from"
                    format="HH:mm"
                    disabled={isDisabled}
                    value={formik.values.working_hour_from ?? null}
                    onChange={(e) => { handleWorkingHoursChange(e, 'From') }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                  <Typography variant="body2" mx={1}>
                    to
                  </Typography>
                  <TimePicker
                    label="To"
                    error={Boolean(
                      formik.touched.working_hour_to && formik.errors.working_hour_to
                    )}
                    name="working_hour_to"
                    format="HH:mm"
                    disabled={isDisabled}
                    value={formik.values.working_hour_to ?? null}
                    onChange={(e) => { handleWorkingHoursChange(e, 'To') }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Box>
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
            {property && (
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
              ) : property ? (
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
