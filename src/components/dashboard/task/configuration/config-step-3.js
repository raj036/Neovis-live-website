import { Adjust, AttachMoney, LowPriority, PriorityHigh, Schedule } from '@mui/icons-material'
import { Autocomplete, Button, Card, CardContent, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import React from 'react'
import { STAY_TYPES, TASK_CONFIG_EXEC_MOMENT, TASK_TYPES, WEEKDAYS } from '../../../../utils/constants'
import { Box } from '@mui/system'
import { QuillEditor } from '../../../quill-editor'
import { validateDescription } from '../../../../utils/helper'

const Step3 = ({
  formik,
  reservationAddons,
  isDisabled,
  title,
  setDescriptionErr,
  descriptionErr
}) => {

  const handleSingleStayDay = (props) => {
    formik.setFieldValue("stay_days", [props.value])
  }

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
              Task Type:
            </Typography>
          </Grid>

          <Grid item md={8} sm={9} xs={10}>
            <Autocomplete
              options={TASK_TYPES.map(task => task.label)}
              value={formik.values.task_type}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  disabled={isDisabled}
                  required
                  name='task_type'
                  id='task_type'
                  label="Task Type"
                  placeholder="Task Type"
                  error={Boolean(
                    formik.touched.task_type && formik.errors.task_type
                  )}
                  helperText={
                    formik.touched.task_type && formik.errors.task_type &&
                    'Please select task type'
                  }
                />
              )}
              onChange={(e, newValue) => {
                formik.setFieldValue("task_type", newValue ?? undefined)
              }}
            />
          </Grid>

          <Grid item xs={2} sm={3} md={4} sx={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <Typography variant='subtitle1'>
              Task Title:
            </Typography>
          </Grid>

          <Grid item md={8} sm={9} xs={10}>
            <TextField
              fullWidth
              label="Task Title"
              name="task_title"
              required
              disabled={isDisabled}
              value={formik.values.task_title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.task_title && formik.errors.task_title
              )}
              helperText={
                formik.touched.task_title && formik.errors.task_title && 'Please enter task title'
              }
            />
          </Grid>

          <Grid item xs={2} sm={3} md={4} sx={{ mt: 1 }}>
            <Typography variant='subtitle1'>
              Task Description:
            </Typography>
          </Grid>

          <Grid item xs={10} sm={9} md={8}>
            <QuillEditor
              placeholder="Enter task description"
              sx={{
                height: 180,
                borderColor: descriptionErr.task_description ? "#D14343" : "#E6E8F0"
              }}
              name='task_description'
              disabled={isDisabled}
              value={formik.values.task_description}
              onChange={(value) => {
                formik.setFieldValue("task_description", value);
                descriptionErr.task_description && validateDescription(value, 'task_description', setDescriptionErr)
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.task_description && descriptionErr.task_description}
            />
          </Grid>
        </Grid>

        <Grid container sx={{ mt: 1 }} spacing={3}>
          <Grid item xs={2} sm={3} md={4} sx={{
            display: 'flex',
            alignItems: 'center',
          }}>
            <Typography variant='subtitle1'>
              Addons:
            </Typography>
          </Grid>

          <Grid item md={8} sm={9} xs={10}>
            <Autocomplete
              multiple
              options={reservationAddons}
              getOptionLabel={(option) =>
                option?.name ? option?.name : ""
              }
              value={formik.values.amenties}
              disabled={isDisabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  disabled={isDisabled}
                  name='amenties'
                  label="Addons"
                  placeholder={!isDisabled ? "Addons" : ""}
                />
              )}
              onChange={(e, newValue) => {
                formik.setFieldValue("amenties", newValue ?? undefined)
              }}
            />
          </Grid>

          <Grid item xs={2} sm={3} md={4} sx={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <Typography variant='subtitle1'>
              Task Execution Moment:
            </Typography>
          </Grid>

          <Grid item md={8} sm={9} xs={10}>
            <Autocomplete
              options={TASK_CONFIG_EXEC_MOMENT.map(task => task.label)}
              value={formik.values.execution_moment}
              disabled={isDisabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  disabled={isDisabled}
                  name='execution_moment'
                  id='execution_moment'
                  label="Task Execution Moment"
                  placeholder="Task Execution Moment"
                  error={Boolean(
                    formik.touched.execution_moment && 
                    formik.errors.execution_moment &&
                    formik.values.execution_moment === "" 
                  )}
                  helperText={
                    formik.touched.execution_moment && 
                    formik.errors.execution_moment &&
                    formik.values.execution_moment === "" &&
                    'Please select task execution moment'
                  }
                />
              )}
              onChange={(e, newValue) => {
                formik.setFieldValue("execution_moment", newValue ?? undefined),
                formik.setFieldValue("stay_type", null),
                formik.setFieldValue("stay_days", [])
              }}
            />
          </Grid>

          {
            formik.values.execution_moment === "Stay" && (
              <>
                <Grid item xs={2} sm={3} md={4} sx={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Typography variant='subtitle1'>
                    Stay Type:
                  </Typography>
                </Grid>

                <Grid item md={8} sm={9} xs={10}>
                  <FormControl fullWidth>
                    <InputLabel id="area_type">Stay Type</InputLabel>
                    <Select
                      error={Boolean(
                        formik.touched.stay_type && formik.errors.stay_type
                      )}
                      helperText={
                        formik.touched.stay_type && formik.errors.stay_type
                      }
                      label="Stay Type"
                      labelId="stay_type"
                      name="stay_type"
                      required
                      onBlur={formik.handleBlur}
                      onChange={(e, { props }) => {
                        formik.setFieldValue('stay_type', props?.value);
                        formik.setFieldValue('stay_days', []);
                      }}
                      value={formik.values.stay_type}
                      disabled={isDisabled}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 160 } } }}
                    >
                      {STAY_TYPES?.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )
          }

          {
            (formik.values.stay_type === "Weekly" || formik.values.stay_type === "SpecificDays") && (
              <>
                <Grid item xs={2} sm={3} md={4} sx={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Typography variant='subtitle1'>
                    Stay Days:
                  </Typography>
                </Grid>

                <Grid item md={8} sm={9} xs={10}>
                  <FormControl fullWidth>
                    <InputLabel id="area_type">Stay Days</InputLabel>
                    <Select
                      error={Boolean(
                        formik.touched.stay_days && formik.errors.stay_days
                      )}
                      helperText={
                        formik.touched.stay_days && formik.errors.stay_days
                      }
                      label="Area Type"
                      labelId="stay_days"
                      multiple={formik.values.stay_type === "SpecificDays"}
                      name="stay_days"
                      required
                      onBlur={formik.handleBlur}
                      onChange={ 
                        formik.values.stay_type === "SpecificDays" ? 
                          formik.handleChange : (e, { props }) => handleSingleStayDay(props)
                      }
                      value={formik.values.stay_days}
                      disabled={isDisabled}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 160 } } }}
                    >
                      {WEEKDAYS?.map((day) => (
                        <MenuItem key={day.id} value={day.id}>
                          {day.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )
          }
        </Grid>

        <Grid container alignItems="center" sx={{ mt: 3 }}>
          <Grid xs={2} sm={3} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 500 }} variant='body1'>
              Priority:
            </Typography>
          </Grid>

          <Grid xs={10} sm={9} md={8}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Button
                variant={
                  formik.values.priority === "Low"
                    ? "contained"
                    : "outlined"
                }
                fullWidth
                disabled={isDisabled}
                startIcon={<LowPriority />}
                sx={{ mx: 1 }}
                onClick={() => formik.setFieldValue("priority", "Low")}
              >
                Low
              </Button>
              <Button
                variant={
                  formik.values.priority === "Medium"
                    ? "contained"
                    : "outlined"
                }
                fullWidth
                disabled={isDisabled}
                startIcon={<Adjust />}
                sx={{ mx: 1 }}
                onClick={() => formik.setFieldValue("priority", "Medium")}
              >
                Medium
              </Button>
              <Button
                variant={
                  formik.values.priority === "High"
                    ? "contained"
                    : "outlined"
                }
                fullWidth
                disabled={isDisabled}
                startIcon={<PriorityHigh />}
                sx={{ mx: 1 }}
                onClick={() => formik.setFieldValue("priority", "High")}
              >
                High
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Grid container columnSpacing={3}>
          <Grid item xs={2} sm={3} md={4} sx={{
            display: 'flex',
            alignItems: 'center',
            mt: 2
          }}>
            <Typography variant='subtitle1'>
              Cost and Duration:
            </Typography>
          </Grid>

          <Grid item xs={10} sm={9} md={8}>
            <Box sx={{ mt: 3, display: "flex", flexDirection: "row", gap: 2 }}>
              <TextField
                type="number"
                variant="outlined"
                placeholder='Cost'
                label="Cost"
                name="cost_amount"
                disabled={isDisabled}
                required
                value={formik.values.cost_amount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                sx={{ width: "150px" }}
                error={
                  formik.touched.cost_amount && formik.errors.cost_amount &&
                  'Provide valid cost'
                }
                helperText={
                  formik.touched.cost_amount && formik.errors.cost_amount &&
                  'Provide valid cost'
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment sx={{ mr: 1 }}>
                      <AttachMoney />
                    </InputAdornment>
                  ),
                }}
              />
              <Select
                sx={{ width: "140px", maxHeight: "56px" }}
                value={formik.values.cost_type}
                name="cost_type"
                disabled={isDisabled}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              >
                <MenuItem value={"Hourly"}>{"Hourly"}</MenuItem>
                <MenuItem value={"Daily"}>{"Daily"}</MenuItem>
                <MenuItem value={"Monthly"}>{"Monthly"}</MenuItem>
                <MenuItem value={"Fixed"}>{"Fixed"}</MenuItem>
              </Select>
              <TextField
                type="number"
                variant="outlined"
                label="Duration"
                sx={{ ml: 5 }}
                name="duration"
                value={formik.values.duration}
                error={
                  formik.touched.duration && formik.errors.duration
                }
                helperText={
                  formik.touched.duration && formik.errors.duration &&
                  'Provide valid duration'
                }
                required
                onBlur={formik.handleBlur}
                disabled={isDisabled}
                onChange={formik.handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment sx={{ mr: 1 }}>
                      <Schedule />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card >
  )
}

export default Step3