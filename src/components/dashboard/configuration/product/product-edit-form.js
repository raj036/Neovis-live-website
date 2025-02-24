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
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControlLabel,
  Switch
} from "@mui/material";
import { useMutation, useQueryClient } from "react-query";
import { STATUSES, product_TYPES } from "../../../../utils/constants";
import useAxios from "../../../../services/useAxios";
import { ConfirmDialog } from "../../confim-dialog";
import { CameraAlt } from "@mui/icons-material";
import {
  deleteFirebaseImage,
  uploadFirebaseImage,
} from "../../../../utils/helper";
import { QuillEditor } from "../../../quill-editor";

export const ProductEditForm = (props) => {
  const router = useRouter();
  const [isDisabled, setIsDisabled] = useState(true);
  const [dialogStat, setDialogStat] = useState(false);
  const [loading, setLoading] = useState();
  const [productPhoto, setproductPhoto] = useState();

  const { product } = props;

  const customInstance = useAxios();
  const queryClient = useQueryClient();

  const { mutateAsync: addproduct } = useMutation((data) =>
    customInstance.post(`products`, data)
  );

  const { mutateAsync: updateproduct } = useMutation((data) => {
    customInstance.patch(`products/${data?.id}`, data);
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      code: "",
      photo: "",
      description: "",
      // product_type: "",
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
        if (product) {
          let photo = await uploadPhoto();
          await updateproduct({ ...values, photo: photo });
          await queryClient.refetchQueries(
            ["productById", product.id?.toString()],
            {
              active: true,
              exact: true,
            }
          );
        } else {
          let photo = await uploadPhoto();
          await addproduct({ ...values, photo: photo });
          formik.resetForm();
        }
        setLoading(false);
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        toast.success(
          product
            ? "Product updated successfully!"
            : "Product added successfully!"
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
      await updateproduct({ ...formik.values, status: "Delete" });
      toast.success("product deleted!");
      router.push("/dashboard/configurations/products");
    } catch (e) {
      setDialogStat(false);
      toast.error("Something went wrong!");
    }
  };

  const uploadPhoto = async () => {
    let photo_uri;
    const product = formik.values;
    if (productPhoto && productPhoto.updated === true) {
      try {
        if (product?.photo) {
          await deleteFirebaseImage("config", product.photo);
        }
        photo_uri = await uploadFirebaseImage("config", productPhoto);
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
      setproductPhoto({
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
    if (props?.product) {
      formik.setValues({ ...props.product });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.product]);

  return (
    <>
      <form onSubmit={formik.handleSubmit} {...props}>
        <Card>
          <CardContent>
            <ConfirmDialog
              title="Delete confirm?"
              message=" Are you sure you want to delete product?"
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
                        productPhoto ? productPhoto?.url : formik?.values?.photo
                      }
                      sx={{
                        height: 150,
                        width: 150,
                        ml: 2,
                        mt: 1,
                      }}
                    >
                      Product
                    </Avatar>
                    <Typography
                      color="textSecondary"
                      variant="subtitle2"
                      sx={{ mt: 1, ml: 5 }}
                    >
                      Product Photo
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
                            width: "35px",
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
                  label="Product Title"
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
                  label="Product Code"
                  name="code"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.code}
                  disabled={isDisabled}
                  sx={{ mb: 2 }}
                />
                {/* <FormControl fullWidth sx={{ mt: 1 }}>
                  <InputLabel id="product_type">Product Type *</InputLabel>
                  <Select
                    error={Boolean(
                      formik.touched.product_type && formik.errors.product_type
                    )}
                    helperText={
                      formik.touched.product_type && formik.errors.product_type
                    }
                    label="product Type"
                    labelId="product_type"
                    name="product_type"
                    required
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.product_type}
                    disabled={isDisabled}
                  >
                    {product_TYPES?.map((_type) => (
                      <MenuItem key={_type.value} value={_type.value}>
                        {_type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl> */}
                {/* <Typography
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
                  placeholder="Enter product description"
                  sx={{ height: 300 }}
                  value={formik.values.description}
                  disabled={isDisabled}
                /> */}
                <TextField
                  error={Boolean(formik.touched.description && formik.errors.description)}
                  fullWidth
                  helperText={formik.touched.description && formik.errors.description}
                  label="Product Description"
                  name="description"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.description}
                  disabled={isDisabled}
                  sx={{ mb: 2 }}
                />
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
            {product && !product.default && (
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
              ) : product ? (
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
