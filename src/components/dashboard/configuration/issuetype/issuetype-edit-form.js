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
import { STATUSES } from "../../../../utils/constants";
import { QuillEditor } from "../../../quill-editor";
import useAxios from "../../../../services/useAxios";
import { ConfirmDialog } from "../../confim-dialog";

export const IssuetypeEditForm = (props) => {
  const router = useRouter();
  const [isDisabled, setIsDisabled] = useState(true);
  const [dialogStat, setDialogStat] = useState(false);
  const [loading, setLoading] = useState();

  const { issuetype } = props;

  const customInstance = useAxios();
  const queryClient = useQueryClient();

  const { data: properties } = useQuery("allProperty", () =>
    customInstance.get(`properties`)
  );

  const { mutateAsync: addIssuetype } = useMutation((data) =>
    customInstance.post(`issue-types`, data)
  );

  const { mutateAsync: updateIssuetype } = useMutation((data) => {
    customInstance.patch(`issue-types/${data?.id}`, data);
  });

  const formik = useFormik({
    initialValues: {
      code: "",
      name: "",
      description: "",
      status: "Active",
    },
    validationSchema: Yup.object({
      code: Yup.string().max(15),
      name: Yup.string().max(50),
      description: Yup.string().max(5000),
    }),
    onSubmit: async (values, helpers) => {
      try {
        setLoading(true);
        if (issuetype) {
          let data = { ...values };
          delete data.property;
          await updateIssuetype(data);
          await queryClient.refetchQueries(
            ["issuetypeById", issuetype.id?.toString()],
            {
              active: true,
              exact: true,
            }
          );
        } else {
          await addIssuetype(values);
          formik.resetForm();
        }
        setLoading(false);
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        toast.success(
          issuetype
            ? "Issue type updated successfully!"
            : "Issue type added successfully!"
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
      await updateIssuetype({ ...formik.values, status: "Delete" });
      toast.success("Issue type deleted successfully!");
      router.push("/dashboard/configurations/issuetypes");
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
    if (props?.issuetype) {
      formik.setValues({ ...props.issuetype });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.issuetype]);

  return (
    <>
      <form onSubmit={formik.handleSubmit} {...props}>
        <Card>
          <CardContent>
            <ConfirmDialog
              title="Delete confirm?"
              message=" Are you sure you want to delete Issue type?"
              dialogStat={dialogStat}
              setDialogStat={setDialogStat}
              onConfirmDialog={onConfirmDialog}
            />
            <Grid container spacing={3}>
              <Grid item md={6} xs={12}>
                <TextField
                  error={Boolean(formik.touched.name && formik.errors.name)}
                  fullWidth
                  helperText={formik.touched.name && formik.errors.name}
                  label="Issue Type Name"
                  name="name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.name}
                  disabled={isDisabled}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  error={Boolean(formik.touched.code && formik.errors.code)}
                  fullWidth
                  helperText={formik.touched.code && formik.errors.code}
                  label="Issue Type Code"
                  name="code"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.code}
                  disabled={isDisabled}
                />
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
                  placeholder="Enter Issue type description"
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
            {issuetype && (
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
              ) : issuetype ? (
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
