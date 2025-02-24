import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
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
  Autocomplete,
  Switch,
  FormControlLabel,
  Chip
} from "@mui/material";
import { useMutation, useQueryClient, useQuery } from "react-query";
import { AREA_TYPES, INVENTORY_CATEGORIES, STATUSES, TASK_TYPES } from "../../../../utils/constants";
import { QuillEditor } from "../../../quill-editor";
import useAxios from "../../../../services/useAxios";
import { ConfirmDialog } from "../../confim-dialog";

export const ChecklistEditForm = (props) => {
  const router = useRouter();
  const [isDisabled, setIsDisabled] = useState(true);
  const [dialogStat, setDialogStat] = useState(false);
  const [loading, setLoading] = useState();
  const [selCategories, setSelCategories] = useState([])
  const [isGuestSelected, setIsGuestSelected] = useState(0)

  const { checklist } = props;

  const customInstance = useAxios();
  const queryClient = useQueryClient();

  const { data: unitareas } = useQuery("allUnitareas", () =>
    customInstance.get(`unit-areas`)
  );

  const { mutateAsync: addChecklist } = useMutation((data) =>
    customInstance.post(`task-checklists`, data)
  );

  const { mutateAsync: updateChecklist } = useMutation((data) => {
    customInstance.patch(`task-checklists/${data?.id}`, data);
  });

  const { data: elementData, refetch: elementRefetch, isLoading: isElementLoading } = useQuery(
    "allElementList",
    () =>
      customInstance.get(`elements?filter.is_checklist_config=${1}&filter.is_guest_task_config=${isGuestSelected}`)
  );

  const { data: amenityData, refetch: amenityRefetch, isLoading: isAmenityLoading } = useQuery(
    "allAmenities",
    () =>
      customInstance.get(`amentities?filter.is_checklist_config=${1}&filter.is_guest_task_config=${isGuestSelected}`)
  );

  const { data: productData, refetch: productRefetch, isLoading: isProductLoading } = useQuery(
    "allproductList",
    () =>
      customInstance.get(`products?filter.is_checklist_config=${1}&filter.is_guest_task_config=${isGuestSelected}`)
  );

  const formik = useFormik({
    initialValues: {
      checklist_title: "",
      checklist_code: "",
      description: "",
      area_type: "",
      task_type: "",
      // unit_area_ids: [],
      status: "Active",
      category_type: "",
      cat_element_id: null,
      cat_amentity_id: null,
      cat_product_id: null,
      all_cat_ids: [],
      is_guest_selected: false
    },
    validationSchema: Yup.object({
      checklist_code: Yup.string().max(15),
      checklist_title: Yup.string().max(50),
      description: Yup.string().max(5000),
    }),
    onSubmit: async (values, helpers) => {
      try {
        setLoading(true);
        let data = {
          ...values,
          // unit_area_ids: values.unit_area_ids.map(item => item.id)
        }
        if (checklist) {
          // let data = { ...values };
          delete data.unit_areas;
          await updateChecklist(data);
          await queryClient.refetchQueries(
            ["checklistById", checklist.id?.toString()],
            {
              active: true,
              exact: true,
            }
          );
        } else {
          await addChecklist(data);
          formik.resetForm();
        }
        setLoading(false);
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        toast.success(
          checklist
            ? "Checklist updated successfully!"
            : "Checklist added successfully!"
        );
        router.push("/dashboard/tasks/checklists");
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong!");
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });
  console.log('isGuestSelected', isGuestSelected)
  useEffect(() => {
    if (formik.values.is_guest_selected) {
      setIsGuestSelected(1)
    } else {
      setIsGuestSelected(0)
    }
  }, [formik.values.is_guest_selected])

  useEffect(() => {
    elementRefetch()
    productRefetch()
    amenityRefetch()
  }, [isGuestSelected])

  useEffect(() => {
    if (selCategories.length > 0) {
      const catIds = selCategories.filter(item => item)?.map(item => item.id)
      formik.setFieldValue('all_cat_ids', catIds)
    } else {
      formik.setFieldValue('all_cat_ids', [])
    }
  }, [selCategories])

  useEffect(() => {
    if (formik.values.category_type) {
      setSelCategories([])
    }
  }, [formik.values.category_type])

  const onConfirmDialog = async () => {
    try {
      setDialogStat(false);
      let data = { ...formik.values };
      delete data.unit_areas;
      await updateChecklist({ ...data, status: "Delete" });
      toast.success("Checklist deleted successfully!");
      router.push("/dashboard/tasks/checklists");
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
    if (props?.checklist) {
      formik.setValues({ ...props.checklist, unit_area_ids: props.checklist.unit_areas.length > 0 ? props.checklist.unit_areas : [] });
      if (props.checklist.category_type) {
        setIsCategoryShown(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.checklist]);

  useEffect(() => {
    if (props?.checklist) {
      let prodValues = []
      if (props.checklist.category_type === 'Element' && elementData !== undefined) {
        setCaegoryValue(elementData?.data?.data?.find(
          (_) => _.id === props.checklist?.cat_element_id
        ))
        prodValues = elementData?.data?.data?.filter((item) => props.checklist.all_cat_ids.includes(item.id))
      } else if (props.checklist.category_type === 'Amenity' && amenityData !== undefined) {
        setCaegoryValue(amenityData?.data?.data?.find(
          (_) => _.id === props.checklist?.cat_amentity_id
        ))
        prodValues = amenityData?.data?.data?.filter((item) => props.checklist.all_cat_ids.includes(item.id))
      } else if (props.checklist.category_type === 'Product' && productData !== undefined) {
        setCaegoryValue(productData?.data?.data?.find(
          (_) => _.id === props.checklist?.cat_product_id
        ))
        prodValues = productData?.data?.data?.filter((item) => props.checklist.all_cat_ids.includes(item.id))
      }
      setTimeout(() => {
        setSelCategories(prodValues)
      }, 1000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.checklist, elementData, amenityData, productData]);

  const [categoryValue, setCaegoryValue] = useState(null)
  const [selCategory, setSelCategory] = useState(null)
  const [isCategoryShown, setIsCategoryShown] = useState(false)

  console.log('selCategories', selCategories);
  useEffect(() => {
    if (selCategory && selCategory.id === 0) {
      setCaegoryValue(selCategory)
      return
    }
    if (selCategory && formik.values.category_type === 'Element' && elementData !== undefined) {
      setCaegoryValue(elementData?.data?.data?.find(
        (_) => _.id === selCategory?.id
      ))
    } else if (selCategory && formik.values.category_type === 'Amenity' && amenityData !== undefined) {
      setCaegoryValue(amenityData?.data?.data?.find(
        (_) => _.id === selCategory?.id
      ))
    } else if (selCategory && formik.values.category_type === 'Product' && productData !== undefined) {
      setCaegoryValue(productData?.data?.data?.find(
        (_) => _.id === selCategory?.id
      ))
    }
  }, [selCategory, formik.values.category_type, elementData, amenityData, productData])


  return (
    <>
      <form onSubmit={formik.handleSubmit} {...props}>
        <Card>
          <CardContent>
            <ConfirmDialog
              title="Delete confirm?"
              message=" Are you sure you want to delete checklist?"
              dialogStat={dialogStat}
              setDialogStat={setDialogStat}
              onConfirmDialog={onConfirmDialog}
            />
            <FormControlLabel
              sx={{ mb: 2 }}
              control={
                <Switch
                  // disabled={disabled}
                  checked={formik.values.is_guest_selected}
                  onChange={(e) => {
                    formik.setFieldValue('is_guest_selected', e.currentTarget.checked)
                    if (e.currentTarget.checked) {
                      formik.setFieldValue('task_type', 'GuestSelection')
                    } else {
                      formik.setFieldValue('task_type', '')
                    }
                  }}
                />
              }
              label="Create Guest Request For All The Area Types"
            />
            <Grid container spacing={3}>
              <Grid item md={6} xs={12}>
                <TextField
                  error={Boolean(
                    formik.touched.checklist_title &&
                    formik.errors.checklist_title
                  )}
                  fullWidth
                  helperText={
                    formik.touched.checklist_title &&
                    formik.errors.checklist_title
                  }
                  label="Checklist Title"
                  name="checklist_title"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.checklist_title}
                  disabled={isDisabled}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  error={Boolean(
                    formik.touched.checklist_code &&
                    formik.errors.checklist_code
                  )}
                  fullWidth
                  helperText={
                    formik.touched.checklist_code &&
                    formik.errors.checklist_code
                  }
                  label="Checklist Code"
                  name="checklist_code"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.checklist_code}
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
                    disabled={isDisabled || formik.values.task_type === 'GuestSelection'}
                    MenuProps={{ PaperProps: { sx: { maxHeight: 235 } } }}
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
                  <InputLabel id="task_type">Task Type *</InputLabel>
                  <Select
                    error={Boolean(
                      formik.touched.task_type && formik.errors.task_type
                    )}
                    helperText={
                      formik.touched.task_type && formik.errors.task_type
                    }
                    label="Task Type"
                    labelId="task_type"
                    name="task_type"
                    required
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.task_type}
                    disabled={isDisabled || formik.values.task_type === 'GuestSelection'}
                  >
                    {TASK_TYPES?.map((_task) => (
                      <MenuItem key={_task.value} value={_task.value}>
                        {_task.label}
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
              {/* <Grid item md={6} xs={12}>
                <Autocomplete
                  options={unitareas?.data?.data ?? []}
                  getOptionLabel={(option) =>
                    option.area_name ? option.area_name : ""
                  }
                  value={formik.values.unit_area_ids}
                  multiple={true}
                  disabled={false}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={Boolean(
                        formik.touched.unit_area_ids && formik.errors.unit_area_ids
                      )}
                      fullWidth
                      name="unit_areas"
                      helperText={
                        formik.touched.unit_area_ids && formik.errors.unit_area_ids &&
                        'Please select unit area'
                      }
                      label="Select UnitArea"
                      placeholder="Select Unit Area"
                    />
                  )}
                  onChange={(event, newValue) => {
                    console.log('newValue', newValue);
                    // setSelProprty(newValue)
                    formik.setFieldValue(
                      "unit_area_ids",
                      newValue ? newValue : []
                    );
                  }}
                />
              </Grid> */}
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
                  placeholder="Enter checklist description"
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
              <FormControlLabel
                sx={{ my: 2, ml: 2 }}
                control={
                  <Switch
                    // disabled={disabled}
                    checked={isCategoryShown}
                    onChange={(e) => {
                      setIsCategoryShown(e.currentTarget.checked)
                      if (!e.currentTarget.checked) {
                        setSelCategories([])
                      }
                    }
                    }
                  />
                }
                label="Add inventory Valid for this checklist"
              />
              {isCategoryShown &&
                <Grid container spacing={3} sx={{ ml: 2 }}>
                  <Grid item md={6} xs={12}>
                    <FormControl
                      fullWidth
                    >
                      <InputLabel id="category">Category *</InputLabel>
                      <Select
                        error={Boolean(
                          formik.touched.category_type && formik.errors.category_type
                        )}
                        helperText={formik.touched.category_type && formik.errors.category_type}
                        label="Category"
                        labelId="category_type"
                        name="category_type"
                        required
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.category_type}
                        disabled={isDisabled}
                      >
                        {INVENTORY_CATEGORIES?.map((_status) => (
                          <MenuItem key={_status.value} value={_status.value}>
                            {_status.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    {elementData !== undefined && amenityData != undefined && productData !== undefined &&
                      <Autocomplete
                        options={formik.values.category_type === 'Element' ?
                          [{ id: 0, name: "All Element" }, ...elementData?.data?.data] : formik.values.category_type === 'Amenity' ?
                            [{ id: 0, name: "All Amenity" }, ...amenityData?.data?.data] : formik.values.category_type === 'Product' ?
                              [{ id: 0, name: "All Product" }, ...productData?.data?.data] : []}
                        getOptionLabel={(option) =>
                          option.name ? option.name : ""
                        }
                        // sx={{ marginTop: 2 }}
                        value={categoryValue}
                        // disabled={isDisabled || unit}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            error={Boolean(
                              formik.touched[formik.values.category_type === 'Element' ? 'cat_element_id' : formik.values.category_type === 'Product' ? 'cat_product_id' : 'cat_amentity_id'] && formik.errors[formik.values.category_type === 'Element' ? 'cat_element_id' : formik.values.category_type === 'Product' ? 'cat_product_id' : 'cat_amentity_id']
                            )}
                            // disabled={isDisabled || unit}
                            fullWidth
                            required
                            helperText={
                              formik.touched[formik.values.category_type === 'Element' ? 'cat_element_id' : formik.values.category_type === 'Product' ? 'cat_product_id' : 'cat_amentity_id'] && formik.errors[formik.values.category_type === 'Element' ? 'cat_element_id' : formik.values.category_type === 'Product' ? 'cat_product_id' : 'cat_amentity_id']
                            }
                            label={`Select ${formik.values.category_type || 'Category'}`}
                            placeholder={`Select ${formik.values.category_type || 'Category'}`}
                          />
                        )}
                        onChange={(event, newValue) => {
                          console.log('select category_type', newValue);
                          if (newValue && newValue.id === 0) {
                            if (newValue.name === 'All Element') {
                              setSelCategories(elementData?.data?.data)
                              formik.setFieldValue(
                                "cat_element_id", elementData?.data?.data[0]?.id
                              );
                              formik.setFieldValue(
                                "cat_amentity_id", null
                              );
                              formik.setFieldValue(
                                "cat_product_id", null
                              );
                            } else if (newValue.name === 'All Amenity') {
                              setSelCategories(amenityData?.data?.data)
                              formik.setFieldValue(
                                "cat_amentity_id", amenityData?.data?.data[0]?.id
                              );
                              formik.setFieldValue(
                                "cat_element_id", null
                              );
                              formik.setFieldValue(
                                "cat_product_id", null
                              );
                            } else if (newValue.name === 'All Product') {
                              setSelCategories(productData?.data?.data)
                              formik.setFieldValue(
                                "cat_product_id", productData?.data?.data[0]?.id
                              );
                              formik.setFieldValue(
                                "cat_amentity_id", null
                              );
                              formik.setFieldValue(
                                "cat_element_id", null
                              );
                            }
                            setSelCategory(newValue);
                            return
                          } else if (!newValue && selCategories.length > 0) {
                            setSelCategories([])
                            return
                          }
                          setSelCategory(newValue);
                          if (selCategories.length === 0 || !(selCategories.find(item => item.id === newValue.id))) {
                            setSelCategories([...selCategories, newValue])
                          }
                          if (formik.values.category_type === 'Element') {
                            formik.setFieldValue(
                              "cat_element_id",
                              newValue ? newValue.id : undefined
                            );
                            formik.setFieldValue(
                              "cat_amentity_id", null
                            );
                            formik.setFieldValue(
                              "cat_product_id", null
                            );
                          } else if (formik.values.category_type === 'Amenity') {
                            formik.setFieldValue(
                              "cat_amentity_id",
                              newValue ? newValue.id : undefined
                            );
                            formik.setFieldValue(
                              "cat_element_id", null
                            );
                            formik.setFieldValue(
                              "cat_product_id", null
                            );
                          } else if (formik.values.category_type === 'Product') {
                            formik.setFieldValue(
                              "cat_product_id",
                              newValue ? newValue.id : undefined
                            );
                            formik.setFieldValue(
                              "cat_element_id", null
                            );
                            formik.setFieldValue(
                              "cat_amentity_id", null
                            );
                          }
                        }}
                      />
                    }
                  </Grid>
                </Grid>
              }
              {selCategories.length > 0 && selCategories.filter(item => item)?.map((item, idx) =>
                <Grid key={idx} item sx={{ mt: 1, display: "flex", marginLeft: 1 }}>
                  <Chip
                    label={item.name}
                    variant="outlined"
                    //  icon={<AmenityIcon />}
                    //  disabled={isDisabled}
                    onDelete={() => {
                      setSelCategories(
                        selCategories?.filter((_) => _.id !== item.id)
                      );
                    }}
                  />
                </Grid>
              )}
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
            {checklist && !checklist.default && (
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
              ) : checklist ? (
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
