import { Autocomplete, Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';

const Step2 = ({
  formik,
  properties,
  unitgroups,
  units,
  selProperty,
  setSelProperty,
  selUnitGroup,
  setSelUnitGroup,
  selUnits,
  setSelectedUnits,
  isDisabled,
  title
}) => {

  const [unitOptions, setUnitOptions] = useState([]);
  const [unitGrpList, setUnitGrpList] = useState([]);

  useEffect(() => {
    if (unitgroups?.data?.unit_groups) {
      setUnitGrpList(unitgroups?.data?.unit_groups);
    }

    if(units) {
      let data = [{
        unit_name: "All",
        id: 0
      },
      ...units];
      setUnitOptions(data);
    } 
  },[units, unitgroups])

  return (
    <Card sx={{ mt: 5 }}>
      <CardContent>
        {
          isDisabled &&
          <Typography sx={{ mb: 3 }} variant='h5'>
            {title}
          </Typography>
        }
        <Grid container spacing={3}>
          <Grid item xs={2} sm={3} md={4} sx={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <Typography variant='subtitle1'>
              Property:
            </Typography>
          </Grid>

          <Grid item md={8} sm={9} xs={10}>
            <Autocomplete
              options={properties?.data?.data ?? []}
              getOptionLabel={(option) =>
                option?.property_name ? option?.property_name : ""
              }
              disabled={isDisabled}
              value={
                selProperty
                  ? properties?.data?.data?.find(
                    (_) => _.id === selProperty?.id
                  )
                  : ""
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={Boolean(
                    formik.touched.property_id && formik.errors.property_id
                  )}
                  helperText={
                    formik.touched.property_id && formik.errors.property_id &&
                    'Please select property'
                  }
                  disabled={isDisabled}
                  fullWidth
                  name='property_id'
                  required
                  label="Select Property"
                  placeholder="Select Property"
                />
              )}
              onChange={(event, newValue) => {
                setSelProperty(newValue);
                formik.setFieldValue(
                  "property_id",
                  newValue ? newValue.id : null
                );
                setSelUnitGroup([]);
                setSelectedUnits([]);
                setUnitGrpList([]);
                setUnitOptions([]);
                formik.setFieldValue(
                  'unit_group_ids', []
                )
                formik.setFieldValue(
                  'unit_ids', []
                )
              }}
            />
          </Grid>

          <Grid item xs={2} sm={3} md={4} sx={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <Typography variant='subtitle1'>
              Unit Groups:
            </Typography>
          </Grid>

          <Grid item md={8} sm={9} xs={10}>
            <Autocomplete
              options={unitGrpList ?? []}
              getOptionLabel={(option) =>
                option?.name ? option?.name : ""
              }
              disabled={isDisabled}
              multiple={true}
              value={formik.values.unit_group_ids}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={Boolean(
                    formik.touched.unit_group_ids &&
                    formik.values.unit_group_ids.length === 0
                  )}
                  helperText={
                    formik.touched.unit_group_ids &&
                    formik.values.unit_group_ids.length === 0 &&
                    'Please select atleast one unit group'
                  }
                  required
                  fullWidth
                  name='unit_group_ids'
                  disabled={isDisabled}
                  label="Select Unitgroup"
                  placeholder={!isDisabled ? "Select Unitgroup" : ""}
                />
              )}
              onChange={(event, newValue) => {
                setSelUnitGroup(newValue);
                setUnitOptions([]);
                formik.setFieldValue(
                  "unit_group_ids",
                  newValue ? newValue : []
                );
                formik.setFieldValue(
                  "unit_ids", []
                );
                if (newValue.length > 1) {
                  setSelectedUnits([]);
                }
              }}
            />
          </Grid>

          <Grid item xs={2} sm={3} md={4} sx={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <Typography variant='subtitle1'>
              Units:
            </Typography>
          </Grid>

          <Grid item md={8} sm={9} xs={12}>
            <Autocomplete
              options={unitOptions ?? []}
              getOptionLabel={(option) =>
                option?.unit_name ? option?.unit_name : ""
              }
              multiple={true}
              disabled={isDisabled}
              value={formik.values.unit_ids}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={Boolean(
                    formik.touched.unit_ids && formik.errors.unit_ids
                  )}
                  helperText={
                    formik.touched.unit_ids && formik.errors.unit_ids &&
                    'Please select atleast one unit'
                  }
                  required
                  fullWidth
                  name='unit_ids'
                  disabled={isDisabled}
                  label="Select Unit"
                  placeholder={!isDisabled ? "Select Unit" : ""}
                />
              )}
              onChange={(event, newValue) => {
                if(newValue[newValue.length-1]?.id === 0) {
                  setSelectedUnits([...units]);
                  formik.setFieldValue(
                    "unit_ids",
                    [...units]
                  );
                } else {
                  setSelectedUnits(newValue);
                  formik.setFieldValue(
                    "unit_ids",
                    newValue ? newValue : []
                  );
                }
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Step2