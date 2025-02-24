import React from 'react'
import { Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import { QuillEditor } from '../../../quill-editor';
import { validateDescription } from '../../../../utils/helper';

const Step1 = ({
  formik,
  isDisabled,
  title,
  descriptionErr,
  setDescriptionErr
}) => {

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
              Task Config Name:
            </Typography>
          </Grid>

          <Grid item md={8} sm={9} xs={10}>
            <TextField
              fullWidth
              label="Task Config Name"
              name="name"
              required
              disabled={isDisabled}
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.name && formik.errors.name
              )}
              helperText={
                formik.touched.name && formik.errors.name && 'Please enter task config name'
              }
            />
          </Grid>

          <Grid item xs={2} sm={3} md={4} sx={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <Typography variant='subtitle1'>
              Task Config Code:
            </Typography>
          </Grid>

          <Grid item md={8} sm={9} xs={10}>
            <TextField
              fullWidth
              label="Task Config Code"
              name="code"
              required
              disabled={isDisabled}
              value={formik.values.code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.code && formik.errors.code
              )}
              helperText={
                formik.touched.code && formik.errors.code && 'Please enter task config code'
              }
            />
          </Grid>

          <Grid item xs={2} sm={3} md={4} sx={{ mt: 1 }}>
            <Typography variant='subtitle1'>
              Description:
            </Typography>
          </Grid>

          <Grid item xs={10} sm={9} md={8}>
            <QuillEditor
              placeholder="Enter task config description"
              sx={{ 
                height: 180, 
                borderColor : descriptionErr.description ? "#D14343" : "#E6E8F0"
              }}
              name='description'
              disabled={isDisabled}
              value={formik.values.description}
              onChange={(value) => {
                formik.setFieldValue("description", value);
                descriptionErr.description && 
                  validateDescription(value, 'description', setDescriptionErr);
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.description && descriptionErr.description}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Step1;