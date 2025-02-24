import { useEffect, useState } from "react";
import { useFormik } from "formik";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  useMediaQuery,
} from "@mui/material";
import * as dayjs from "dayjs";
import { PropertyList } from "../../../property-list";
import { PropertyListItem } from "../../../property-list-item";
import { ImageDialog } from "../../image-dialog";

export const UnitissueEditForm = (props) => {
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));
  const [image, setImage] = useState();
  const [dialogStat, setDialogStat] = useState(false);

  const align = mdUp ? "horizontal" : "vertical";

  const formik = useFormik({
    initialValues: {
      issue_title: "",
      description: "",
      issue_photos: [],
      reported_at: "",
      status: "Active",
      unit: null,
      unit_area: null,
      source_task: null,
      reference_task: null,
      issue_type: null,
      reported_by: null,
    },
  });

  useEffect(() => {
    formik.resetForm();
    if (props?.unitIssue) {
      formik.setValues({ ...props.unitIssue });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.unitIssue]);

  return (
    <>
      <ImageDialog
        dialogStat={dialogStat}
        setDialogStat={setDialogStat}
        image={image}
      />
      <form {...props}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Typography variant="h6">Property Details</Typography>
              </Grid>
              <Grid item md={8} xs={12}>
                <PropertyList>
                  <PropertyListItem
                    align={align}
                    divider
                    label="Property"
                    value={formik.values.property?.property_name}
                  />
                  <PropertyListItem
                    align={align}
                    divider
                    label="Unit Type"
                    value={formik.values.unit_type?.unit_type_name}
                  />
                  <PropertyListItem
                    align={align}
                    divider
                    label="Unit"
                    value={formik.values.unit?.unit_name}
                  />
                  <PropertyListItem
                    align={align}
                    divider
                    label="Unit Area"
                    value={formik.values.unit_area?.area_name}
                  />
                </PropertyList>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Typography variant="h6">Issue Details</Typography>
              </Grid>
              <Grid item md={8} xs={12}>
                <PropertyList>
                  <PropertyListItem
                    align={align}
                    divider
                    label="Issue Title"
                    value={formik.values.issue_title}
                  />
                  <PropertyListItem
                    align={align}
                    divider
                    label="Reported At"
                    value={dayjs(new Date(formik.values.reported_at))
                      .format("lll")
                      .toString()}
                  />
                  <PropertyListItem
                    align={align}
                    divider
                    label="Reported By"
                    value={
                      formik.values.reported_by?.first_name +
                      " " +
                      formik.values.reported_by?.last_name
                    }
                  />
                  <PropertyListItem
                    align={align}
                    divider
                    label="Source Task"
                    value={formik.values.source_task?.task_title}
                  />
                  <PropertyListItem
                    align={align}
                    divider
                    label="Reference Task"
                    value={""}
                  />
                  <PropertyListItem
                    align={align}
                    divider
                    label="Issue Type"
                    value={formik.values.issue_type?.name}
                  />
                  <PropertyListItem
                    align={align}
                    divider
                    label="Element"
                    value={formik.values.element?.name}
                  />
                  <PropertyListItem
                    align={align}
                    divider
                    label="Status"
                    value={formik.values.status}
                  />
                  <PropertyListItem
                    align={align}
                    divider
                    label="Description"
                    value={formik.values.description}
                  />
                </PropertyList>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Typography variant="h6">Issue Photos</Typography>
              </Grid>
              <Grid item md={8} xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                >
                  {formik.values.issue_photos?.map((_photo, index) => (
                    <Box
                      key={index}
                      sx={{
                        marginRight: 2,
                        marginBottom: 1.5,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setImage(_photo);
                        setDialogStat(true);
                      }}
                    >
                      <img
                        src={_photo}
                        style={{ objectFit: "cover", height: 150, width: 150 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </form>
    </>
  );
};
