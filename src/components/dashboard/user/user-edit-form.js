import NextLink from "next/link";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import Slider from '@mui/material/Slider';
import useAxios from "../../../services/useAxios";
import { ChangePassword } from "./user-password-update";
import { ConfirmDialog } from "../confim-dialog";
import {
  deleteFirebaseImage,
  getToken,
  getUser,
  managerLogin,
  setUser,
  uploadFirebaseImage,
} from "../../../utils/helper";
import { GOOGLE_MAPS_APIKEY, USER_STATUSES } from "../../../utils/constants";
import { format } from "date-fns";
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import { GoogleMap, Marker } from "@react-google-maps/api";
import Geocode from "react-geocode";
import { FileDropzone } from "../../file-dropzone";
Geocode.setApiKey(GOOGLE_MAPS_APIKEY);

export const UserEditForm = (props) => {
  const { user, owner, userProfileImage, ...other } = props;
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [dialogStat, setDialogStat] = useState(false);
  const [newUser, setNewUser] = useState(true);
  const [isProfile, setIsProfile] = useState(false);
  const [selProperty, setSelProperty] = useState();
  const [isOwnerRoute, setIsOwnerRoute] = useState(false)
  const [place, setPlace] = useState("");
  const [location, setLocation] = useState({
    lat: 43.65107,
    lng: -79.347015,
  });
  const [ownerDoc, setownerDoc] = useState([])
  const [propFilters, setPropFilters] = useState([])
  const [selUnits, setSelUnits] = useState([])

  const customInstance = useAxios();
  const router = useRouter();
  const loginUser = getUser();
  const isManager = managerLogin();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (router.pathname.includes('/owner/') || user?.user_role?.role === 'Owner') {
      setIsOwnerRoute(true)
    } else {
      setIsOwnerRoute(false)
    }
  }, [router])

  const { mutateAsync: registerUser, data: registededUserRes } = useMutation((data) =>
    customInstance.post(`auth/register`, data)
  );

  const { mutateAsync: addOwner } = useMutation((data) => {
    customInstance.post(`owner`, data);
  });

  const { mutateAsync: updateOwner } = useMutation((data) =>
    customInstance.patch(`owner/${owner?.id}`, data)
  );

  const { data: properties } = useQuery(
    "taskProperty",
    () => customInstance.get(`properties/getAll`)
  );

  const { mutateAsync: updateUser, data: updateuserRes } = useMutation((data) => {
    delete data.password;
    return customInstance.patch(`users/${user?.id}`, data);
  });
  console.log('updateuserRes', updateuserRes);
  const { mutateAsync: updateProfile, data: updateProfileRes } = useMutation((data) => {
    delete data.password;
    return customInstance
      .patch(`auth/profile/update`, data)
      .then((profile) => {
        setUser({ user: profile.data, token: getToken() })
        ownerFormik.handleSubmit()
      });
  });

  const { mutateAsync: changePassword } = useMutation((newPassword) => {
    customInstance.patch(`users/change-password/${user?.id}`, {
      password: newPassword,
    });
  });

  const { data: userRoles } = useQuery(
    "userRoles",
    () => customInstance.get(`user-roles`),
    { enabled: isManager }
  );

  const { data: countries } = useQuery("countries", () =>
    customInstance.get(`countries`)
  );

  const { data: unitsData, refetch: unitsRefetch } = useQuery("allUnit", () =>
    customInstance.get(
      `units?filter.property_id=${propFilters}`
    )
  );

  // console.log('unitsData', unitsData?.data);
  console.log('owner', owner);

  useEffect(() => {
    if (selProperty !== undefined && selProperty.length > 0) {
      setPropFilters(`$in:${selProperty.map(pty => pty?.id)?.join(",")}`);
      setTimeout(() => { unitsRefetch() }, 100)
    }
  }, [selProperty])

  const onConfirmDialog = async () => {
    try {
      setDialogStat(false);
      const birthDate = formik.values.dob
        ? format(new Date(formik.values.dob), "yyyy-MM-dd")
        : null;
      await updateUser({ ...formik.values, dob: birthDate, status: "Delete" });
      toast.success("User deleted!");
      router.push("/dashboard/users");
    } catch (e) {
      setDialogStat(false);
      toast.error("Something went wrong!");
    }
  };

  const onChangePassword = async (newPassword) => {
    try {
      await changePassword(newPassword);
      setPasswordDialog(false);
      toast.success("Password updated successfully!");
    } catch (e) {
      setDialogStat(false);
      toast.error("Something went wrong!");
    }
  };

  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      organization_id: 0,
      user_role_id: "",
      dob: null,
      property_ids: [],
      profile_image_url: "",
      status: "Active",
      phone_number: "",
      is_external: false,
      fcmToken: "",
      submit: null,
      cost_per_hour: 0,
      cost_per_month: 0,
      trip_cost: 0,
      per_km_fix_price: 0,
      per_range_fix_price: 0
    },
    validationSchema: Yup.object({
      first_name: Yup.string().max(20),
      last_name: Yup.string().max(20),
      password: newUser ? Yup.string().min(6).max(15) : Yup.string(),
      property_ids: Yup.array().min(1),
      email: Yup.string()
        .email("Must be a valid email")
        .max(255)
        .required("Email is required"),
      phone_number: Yup.string().max(15),
    }),
    onSubmit: async (values, helpers) => {
      try {
        // NOTE: Make API request
        const updateUserPayload = {
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          organization_id: values.organization_id,
          user_role_id: values.user_role_id,
          profile_image_url: values.profile_image_url,
          status: values.status,
          phone_number: values.phone_number,
          is_external: values.is_external,
          fcm_token: values.fcmToken,
          created_by_id: values?.created_by_id,
          updated_by_id: values?.updated_by_id,
          cost_per_hour: values?.updated_by_id,
          cost_per_month: values?.cost_per_month,
          trip_cost: values?.trip_cost,
          per_km_fix_price: values?.per_km_fix_price,
          per_range_fix_price: values?.per_range_fix_price
        }
        const birthDate = values.dob
          ? format(new Date(values.dob), "yyyy-MM-dd")
          : null;
        const propertyIds = values.property_ids.map(pty => pty?.id)
        if (newUser) {
          await registerUser({
            ...values,
            property_ids: propertyIds,
            phone_number: values.phone_number.toString(),
            organization_id: loginUser?.organization?.id ?? "",
            dob: birthDate,
          });
          formik.resetForm();
        } else {
          let data = { ...values };
          delete data.user_role;

          if (isProfile) {
            let profile_image_url = await uploadImage();
            if (data.properties) {
              delete data.properties
            }
            await updateProfile({
              ...data,
              property_ids: propertyIds,
              profile_image_url: profile_image_url
                ? profile_image_url
                : data.profile_image_url,
              dob: birthDate,
            });
          } else {
            await updateUser({ ...updateUserPayload, property_ids: propertyIds, phone_number: data.phone_number.toString(), dob: birthDate });
          }
          await queryClient.refetchQueries(
            ["userById", values.id?.toString()],
            {
              active: true,
              exact: true,
            }
          );
        }
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        toast.success(
          newUser ? "User added successfully!" : "User updated successfully!"
        );
        if (!isOwnerRoute) {
          router.push('/dashboard/users')
        }
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message ?? "Something went wrong!");
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  const ownerFormik = useFormik({
    initialValues: {
      user_id: null,
      address: '',
      country_code: 0,
      province: "",
      city: "",
      zip_code: "",
      latitude: 0,
      longitude: 0,
      bank_owner_name: '',
      bank_account_number: '',
      bank_account_code: '',
      unit_ids: []
    },
    validationSchema: Yup.object({
      user_id: Yup.number().required(),
      // address: Yup.string().max(100).required(),
      // zip_code: Yup.number()
      //   .max(99999, "Invalid Zip")
      //   .min(10000, "Invalid Zip"),
      // city: Yup.string()
      //   .max(30)
      //   .required()
      //   .matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for this field "),
      // province: Yup.string()
      //   .max(30)
      //   .required()
      //   .matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for this field "),
    }),
    onSubmit: async (values, helpers) => {
      try {
        // console.log('owner values', values);
        if (!values.user_id || !values.address) {
          toast.error("Please check required fields");
          return
        }
        if (values.unit_ids.length === 0) {
          toast.error("Please select units");
          return
        }
        const ownerDocsUrl = await uploadownerDoc()
        // console.log('owner docs', ownerDocsUrl);
        const ownerDocs = ownerDocsUrl.filter(item => item).map(item => ({ url: item }))
        const unit_ids = values.unit_ids.map(item => item.id)
        delete values.units
        if (owner) {
          await updateOwner({ ...values, docs: [...ownerDocs, ...owner.docs], unit_ids })
          toast.success("Owner successfully updated");
        } else {
          await addOwner({ ...values, docs: ownerDocs, unit_ids })
          toast.success("Owner successfully added");
        }
        ownerFormik.resetForm()
        if (!isOwnerRoute) {
          router.push('/dashboard/owner')
        } else {
          router.push('/dashboard/profile')
        }
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message ?? "Something went wrong!");
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (registededUserRes !== undefined) {
      // console.log('registededUserRes', registededUserRes?.data?.user?.id);
      ownerFormik.setFieldValue('user_id', registededUserRes?.data?.user?.id)
      setTimeout(() => {
        ownerFormik.handleSubmit()
      }, 100)
    }
  }, [registededUserRes])

  useEffect(() => {
    if (updateuserRes !== undefined) {
      console.log('updateuserRes', updateuserRes?.data);
      setTimeout(() => {
        ownerFormik.handleSubmit()
      }, 100)
    }
  }, [updateuserRes])

  // useEffect(() => {
  //   if (updateProfileRes !== undefined) {
  //     setTimeout(() => {
  //       ownerFormik.handleSubmit()
  //     }, 100)
  //   }
  // }, [updateProfileRes])

  const handleChange = (address) => setPlace(address);

  const handleSelect = async (address) => {
    setPlace(address);
    const results = await geocodeByAddress(address);
    const geo = await getLatLng(results[0]);
    setLocation(geo);
    ownerFormik.setFieldValue("latitude", geo.lat);
    ownerFormik.setFieldValue("longitude", geo.lng);
  };

  const populatePlace = async (lat, lng) => {
    const { results } = await Geocode.fromLatLng(lat, lng);
    setPlace(results[0].formatted_address);
  };

  const onLocationChange = async (e) => {
    setLocation(e.latLng.toJSON());
    ownerFormik.setFieldValue("latitude", e.latLng.toJSON().lat);
    ownerFormik.setFieldValue("longitude", e.latLng.toJSON().lng);
    const { lat, lng } = e.latLng.toJSON();
    populatePlace(lat, lng);
  };


  useEffect(() => {
    if (isOwnerRoute && userRoles !== undefined) {
      const owner = userRoles?.data?.find(item => item.role === 'Owner')
      formik.setFieldValue('user_role_id', owner?.id)
    }
  }, [userRoles, isOwnerRoute])

  const uploadownerDoc = async () => {
    let imagesUri = []

    await Promise.all(
      ownerDoc
        ?.filter((_) => _._file)
        ?.map(
          (file) =>
            new Promise(async (resolve) => {
              if (file.deleted) {
                await deleteFirebaseImage("ownerDoc", file.url);
                resolve();
              } else {
                const uri = await uploadFirebaseImage("ownerDoc", file);
                imagesUri.push(uri);
                resolve();
              }
            })
        )
    );
    return imagesUri;
  };

  const handleownerDocDrop = async (newDoc) => {
    let data = [...ownerDoc];
    let docData = newDoc?.map((_file) =>
    ({
      _file: _file,
      updated: true,
    })
    );
    // console.log('docData', docData);
    setownerDoc([...data, ...docData]);
  };

  const handleOwnerDocRemove = (url) => {
    let data = [...ownerDoc];

    const idx = data?.findIndex((_) => _.url === url);

    if (idx >= 0) {
      if (data[idx].updated) {
        data.splice(idx, 1);
        setownerDoc(data);
      } else {
        data[idx].deleted = true;
        setownerDoc(data);
      }
    }
  };

  const handleInventoryRemoveAll = () => {
    let data = [...ownerDoc];

    data.forEach((_, index) => {
      if (_.updated) {
        data.splice(index, 1);
      } else {
        _.deleted = true;
      }
    });

    setownerDoc(data);
  };


  useEffect(() => {
    if (user) {
      setNewUser(false);
      formik.setValues(user);
      formik.setFieldValue('property_ids', user?.properties)
    } else {
      setNewUser(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (owner) {
      ownerFormik.setValues(owner)
      ownerFormik.setFieldValue('user_id', owner?.user_id)
      if (owner.units && owner.units.length > 0) {
        ownerFormik.setFieldValue('unit_ids', owner.units)
      }
      if (owner.docs && owner.docs.length > 0) {
        setownerDoc(owner.docs)
      }
    }
  }, [owner])

  useEffect(() => {
    if (router && router?.query?.type === "profile") {
      setIsProfile(true);
    }
  }, [router]);

  const uploadImage = async () => {
    let profile_image_urlUri;
    const user = formik.values;
    if (userProfileImage && userProfileImage.updated === true) {
      try {
        if (user?.profile_image_url) {
          await deleteFirebaseImage("user", user?.profile_image_url);
        }
        profile_image_urlUri = await uploadFirebaseImage(
          "user",
          userProfileImage
        );
      } catch (e) {
        console.log("Error", e);
      }
    }
    return profile_image_urlUri;
  };

  return (
    <form onSubmit={formik.handleSubmit} {...other}>
      <Card>
        <CardHeader title={newUser ? `Add ${isOwnerRoute ? 'Owner' : 'User'}` : `Edit ${isOwnerRoute ? 'Owner' : 'User'}`} />
        <Divider />
        <CardContent>
          <ChangePassword
            passwordDialog={passwordDialog}
            setPasswordDialog={setPasswordDialog}
            onChangePassword={onChangePassword}
          />
          <ConfirmDialog
            title="Delete confirm?"
            message=" Are you sure you want to delete user?"
            dialogStat={dialogStat}
            setDialogStat={setDialogStat}
            onConfirmDialog={onConfirmDialog}
          />
          <Grid container spacing={3}>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.first_name && formik.errors.first_name
                )}
                fullWidth
                helperText={
                  formik.touched.first_name && formik.errors.first_name
                }
                label="First Name"
                name="first_name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.first_name}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.last_name && formik.errors.last_name
                )}
                fullWidth
                helperText={formik.touched.last_name && formik.errors.last_name}
                label="Last Name"
                name="last_name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.last_name}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(formik.touched.email && formik.errors.email)}
                fullWidth
                helperText={formik.touched.email && formik.errors.email}
                label="Email address"
                name="email"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.email}
                disabled={isProfile}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel id="user_role_id">Role *</InputLabel>
                <Select
                  error={Boolean(
                    formik.touched.user_role_id && formik.errors.user_role_id
                  )}
                  helperText={
                    formik.touched.user_role_id && formik.errors.user_role_id
                  }
                  label="Role"
                  labelId="user_role_id"
                  name="user_role_id"
                  required
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.user_role_id}
                  disabled={isProfile || isOwnerRoute}
                >
                  {userRoles?.data?.map((_role) => (
                    <MenuItem key={_role.id} value={_role.id}>
                      {_role.role}
                    </MenuItem>
                  ))}
                  {isProfile && formik.values.user_role.role !== "Manager" && (
                    <MenuItem
                      key={formik.values.user_role.id}
                      value={formik.values.user_role.id}
                    >
                      {formik.values.user_role.role}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.phone_number && formik.errors.phone_number
                )}
                fullWidth
                helperText={
                  formik.touched.phone_number && formik.errors.phone_number
                }
                type="number"
                label="Phone Number"
                name="phone_number"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.phone_number}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel id="status">Status *</InputLabel>
                <Select
                  error={Boolean(formik.touched.status && formik.errors.status)}
                  helperText={formik.touched.status && formik.errors.status}
                  label="Status"
                  labelId="status"
                  name="status"
                  required
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.status}
                  disabled={isProfile}
                >
                  {USER_STATUSES?.map((_status) => (
                    <MenuItem key={_status} value={_status}>
                      {_status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item md={6} xs={12}>
              <FormControl fullWidth>
                <DesktopDatePicker
                  error={Boolean(formik.touched.dob && formik.errors.dob)}
                  inputFormat="MM/dd/yyyy"
                  label="DOB"
                  name="dob"
                  onChange={(newDate) =>
                    formik.setFieldValue(
                      "dob",
                      newDate ? newDate.toString() : null
                    )
                  }
                  value={formik.values.dob ?? null}
                  renderInput={(inputProps) => <TextField {...inputProps} />}
                />
              </FormControl>
            </Grid>
            {newUser && (
              <Grid item md={6} xs={12}>
                <TextField
                  error={Boolean(
                    formik.touched.password && formik.errors.password
                  )}
                  fullWidth
                  helperText={formik.touched.password && formik.errors.password}
                  label="Password"
                  name="password"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.password}
                />
              </Grid>
            )}
            <Grid item md={6} xs={12}>
              <Autocomplete
                options={properties?.data ?? []}
                getOptionLabel={(option) =>
                  option.property_name ? option.property_name : ""
                }
                disabled={isOwnerRoute}
                multiple={true}
                value={formik.values.property_ids}
                size="medium"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={Boolean(
                      formik.touched.property_ids && formik.errors.property_ids
                    )}
                    disabled={isOwnerRoute}
                    fullWidth
                    helperText={
                      formik.touched.property_ids && formik.errors.property_ids &&
                      "Please select property to be assigned."
                    }
                    label="Select Property"
                    placeholder="Select Property"
                  />
                )}
                onChange={(event, newValue) => {
                  setSelProperty(newValue);
                  formik.setFieldValue(
                    "property_ids",
                    newValue ? newValue : undefined
                  );
                }}
              />
            </Grid>
            {isOwnerRoute && unitsData !== undefined &&
              <Grid item md={6} xs={12}>
                <Autocomplete
                  options={unitsData?.data?.data ?? []}
                  getOptionLabel={(option) =>
                    option.unit_name ? option.unit_name : ""
                  }
                  disabled={isOwnerRoute}
                  multiple={true}
                  value={ownerFormik.values.unit_ids}
                  size="medium"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={Boolean(
                        ownerFormik.touched.unit_ids && ownerFormik.errors.unit_ids
                      )}
                      disabled={isOwnerRoute}
                      fullWidth
                      helperText={
                        ownerFormik.touched.unit_ids && ownerFormik.errors.unit_ids &&
                        "Please select units to be assigned."
                      }
                      label="Select Units"
                      placeholder="Select Units"
                    />
                  )}
                  onChange={(event, newValue) => {
                    setSelUnits(newValue);
                    ownerFormik.setFieldValue(
                      "unit_ids",
                      newValue ? newValue : undefined
                    );
                  }}
                />
              </Grid>
            }
          </Grid>

          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Typography variant="h6">Cost</Typography>
              </Grid>
              <Grid item md={8} xs={12}>
                <TextField
                  error={Boolean(
                    formik.touched.cost_per_hour && formik.errors.cost_per_hour
                  )}
                  fullWidth
                  required
                  label="Cost per hour"
                  name="cost_per_hour"
                  type="number"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.cost_per_hour}
                  sx={{ mt: 2 }}
                />
                <TextField
                  error={Boolean(
                    formik.touched.cost_per_month && formik.errors.cost_per_month
                  )}
                  fullWidth
                  required
                  label="Cost per month"
                  name="cost_per_month"
                  type="number"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.cost_per_month}
                  sx={{ mt: 2 }}
                />
                <FormGroup sx={{my:2}}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="trip_cost"
                        checked={formik.values.trip_cost}
                        onChange={(e) => {
                          formik.setFieldValue("trip_cost", e.target.checked)

                        }}
                      />
                    }
                    label="Trip cost"
                  />
                </FormGroup>
                {
                  formik.values.trip_cost && (
                    <>

                      <TextField
                        error={Boolean(
                          formik.touched.per_km_fix_price && formik.errors.per_km_fix_price
                        )}
                        fullWidth
                        label="Per km fix price"
                        name="per_km_fix_price"
                        type="number"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.per_km_fix_price}
                        sx={{ mt: 2 }}
                      />

                        <Slider
                                aria-label="Temperature"
                                defaultValue={30}
                                // getAriaValueText={valuetext}
                                valueLabelDisplay="auto"
                                shiftStep={30}
                                step={10}
                                marks
                                min={10}
                                max={110}
                              />
                      {/* <TextField
                        error={Boolean(
                          formik.touched.per_range_fix_price && formik.errors.per_range_fix_price
                        )}
                        fullWidth
                        label="Per range fix price"
                        name="per_range_fix_price"
                        type="number"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.per_range_fix_price}
                        sx={{ mt: 2 }}
                      /> */}
                    </>
                  )
                }
              </Grid>
            </Grid>
          </CardContent>
          {isOwnerRoute &&
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={4} xs={12}>
                  <Typography variant="h6">Address</Typography>
                </Grid>
                <Grid item md={8} xs={12}>
                  <TextField
                    error={Boolean(
                      ownerFormik.touched.address && ownerFormik.errors.address
                    )}
                    fullWidth
                    required
                    label="Street"
                    name="address"
                    onBlur={ownerFormik.handleBlur}
                    onChange={ownerFormik.handleChange}
                    value={ownerFormik.values.address}
                  // disabled={isDisabled}
                  />
                  <Grid container spacing={3}>
                    <Grid item md={6} xs={12}>
                      <TextField
                        error={Boolean(ownerFormik.touched.city && ownerFormik.errors.city)}
                        helperText={ownerFormik.touched.city && ownerFormik.errors.city && "Please enter city"}
                        fullWidth
                        required
                        label="City"
                        name="city"
                        onBlur={ownerFormik.handleBlur}
                        onChange={ownerFormik.handleChange}
                        sx={{ mt: 2 }}
                        value={ownerFormik.values.city}
                      // disabled={isDisabled}
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <TextField
                        error={Boolean(
                          ownerFormik.touched.province && ownerFormik.errors.province
                        )}
                        helperText={
                          ownerFormik.touched.province && ownerFormik.errors.province && "Please enter province"
                        }
                        fullWidth
                        required
                        label="Province"
                        name="province"
                        onBlur={ownerFormik.handleBlur}
                        onChange={ownerFormik.handleChange}
                        sx={{ mt: 2 }}
                        value={ownerFormik.values.province}
                      // disabled={isDisabled}
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={3}>
                    <Grid item md={6} xs={12}>
                      <TextField
                        error={Boolean(
                          ownerFormik.touched.zip_code && ownerFormik.errors.zip_code && "Please enter zip code"
                        )}
                        type="number"
                        fullWidth
                        required
                        label="Zip"
                        name="zip_code"
                        helperText={
                          ownerFormik.touched.zip_code && ownerFormik.errors.zip_code
                        }
                        onBlur={ownerFormik.handleBlur}
                        onChange={ownerFormik.handleChange}
                        sx={{ mt: 2 }}
                        value={
                          ownerFormik.values.zip_code === 0
                            ? ""
                            : ownerFormik.values.zip_code
                        }
                      // disabled={isDisabled}
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="country">Country *</InputLabel>
                        <Select
                          error={Boolean(
                            ownerFormik.touched.country_code &&
                            ownerFormik.errors.country_code
                          )}
                          helperText={
                            ownerFormik.touched.country_code &&
                            ownerFormik.errors.country_code && "Please enter city"
                          }
                          label="Country"
                          labelId="country"
                          name="country_code"
                          required
                          onBlur={ownerFormik.handleBlur}
                          onChange={ownerFormik.handleChange}
                          value={ownerFormik.values.country_code}
                        // disabled={isDisabled}
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
                        value={ownerFormik.values.latitude}
                        disabled={true}
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <TextField
                        fullWidth
                        label="Longitude"
                        name="longitude"
                        sx={{ mt: 2 }}
                        value={ownerFormik.values.longitude}
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
                                // disabled={isDisabled}
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
          }

          {isOwnerRoute &&
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={4} xs={12}>
                  <Typography variant="h6">Bank details</Typography>
                </Grid>
                <Grid item md={8} xs={12}>
                  <TextField
                    error={Boolean(
                      ownerFormik.touched.bank_owner_name && ownerFormik.errors.bank_owner_name
                    )}
                    fullWidth
                    label="Bank owner name"
                    name="bank_owner_name"
                    onBlur={ownerFormik.handleBlur}
                    onChange={ownerFormik.handleChange}
                    value={ownerFormik.values.bank_owner_name}
                  // disabled={isDisabled}
                  />
                  <TextField
                    sx={{ my: 3 }}
                    error={Boolean(
                      ownerFormik.touched.bank_account_number && ownerFormik.errors.bank_account_number
                    )}
                    fullWidth
                    label="Bank account number"
                    name="bank_account_number"
                    onBlur={ownerFormik.handleBlur}
                    onChange={ownerFormik.handleChange}
                    value={ownerFormik.values.bank_account_number}
                  // disabled={isDisabled}
                  />
                  <TextField
                    error={Boolean(
                      ownerFormik.touched.bank_account_code && ownerFormik.errors.bank_account_code
                    )}
                    fullWidth
                    label="Bank account code"
                    name="bank_account_code"
                    onBlur={ownerFormik.handleBlur}
                    onChange={ownerFormik.handleChange}
                    value={ownerFormik.values.bank_account_code}
                  // disabled={isDisabled}
                  />
                </Grid>
              </Grid>
            </CardContent>
          }

          {isOwnerRoute &&
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={4} xs={12}>
                  <Typography variant="h6">Docs</Typography>
                </Grid>
                <Grid item md={8} xs={12}>
                  <FileDropzone
                    accept={{
                      "application/*": [],
                    }}
                    files={ownerDoc}
                    onDefaultImageChange={() => { }}
                    onDescriptionChange={() => { }}
                    onDrop={handleownerDocDrop}
                    onRemove={handleOwnerDocRemove}
                    onRemoveAll={handleInventoryRemoveAll}
                    maxFiles={1}
                  // disabled={disabled}
                  />
                </Grid>
              </Grid>
            </CardContent>
          }
          <FormGroup sx={{ width: "180px" }}>
            <FormControlLabel
              control={
                <Switch
                  name="is_external"
                  checked={formik.values.is_external}
                  onChange={formik.handleChange}
                  disabled={isProfile}
                />
              }
              sx={{ mt: 2 }}
              label="External User"
            />
          </FormGroup>
        </CardContent>
        <CardActions
          sx={{
            flexWrap: "wrap",
            m: -1,
          }}
        >
          <Button
            disabled={formik.isSubmitting}
            type="submit"
            sx={{ m: 1 }}
            variant="contained"
          >
            {newUser ? "Save" : "Update"}
          </Button>
          {!newUser && !isProfile && (
            <>
              <NextLink href={`/dashboard/users/${user?.id}`} passHref>
                <Button
                  component="a"
                  disabled={formik.isSubmitting}
                  sx={{
                    m: 1,
                    mr: "auto",
                  }}
                  variant="outlined"
                >
                  Cancel
                </Button>
              </NextLink>

              <Button color="info" onClick={() => setPasswordDialog(true)}>
                Change Password
              </Button>

              <Button
                color="error"
                disabled={formik.isSubmitting}
                onClick={() => setDialogStat(true)}
              >
                Delete user
              </Button>
            </>
          )}
        </CardActions>
      </Card>
    </form>
  );
};

UserEditForm.propTypes = {
  user: PropTypes.object.isRequired,
};
