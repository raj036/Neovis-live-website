import { Button, TextField } from '@mui/material'
import { Box } from '@mui/system'
import React, { useCallback, useState } from 'react'

function DateRange(props) {

    const [cost, setCost] = useState(props.values ? JSON.parse(props.values).cost : 0)
    const [start_date, setStart_date] = useState(props.values ? JSON.parse(props.values).start_date : '')
    const [end_date, setEnd_date] = useState(props.values ? JSON.parse(props.values).end_date : '')


    const handleSubmit = useCallback(
        () => {
            const id = new Date().getMilliseconds()
            const x = props.formik.values.dateRanges.find(d => JSON.parse(d).id === JSON.parse(props.values).id)
            props.formik.setFieldValue("dateRanges", 
            props.formik.values.dateRanges.map(d => JSON.parse(d).id === JSON.parse(props.values).id ? JSON.stringify({ id: JSON.parse(d).id, cost, start_date, end_date }) : d)
            // [...x, JSON.stringify({ id: props.id, cost, start_date, end_date })]
        );
        },
        [props.formik, props.values, cost, start_date, end_date],
    )

    const handleRemove = useCallback(
        () => {
            // props.setDateRangeCount(p => p -= 1)
            const x = props.formik.values.dateRanges
            props.formik.setFieldValue("dateRanges", x.filter(y => JSON.parse(y).id !== JSON.parse(props.values).id));
        },
        [props],
    )


    return (
        <div>


            <TextField

                fullWidth
                required
                label="Cost"
                name="cost"
                type="number"
                onChange={e => {
                    setCost(e.target.value)
                }}
                value={cost}
                sx={{ mt: 2 }}
            />

            <Box sx={{ display: 'flex', my: '10px' }}>
                <Box>
                    Start Date:
                </Box>
                <Box sx={{ ml: '10px' }}>
                    {new Date(start_date).toLocaleDateString()}

                </Box>
            </Box>

            <TextField

                fullWidth
                required
                label="Choose start Date"
                name="start_date"
                type="date"
                onChange={e => {
                    setStart_date(e.target.value)
                }}
                value={start_date}
                sx={{ mt: 2 }}
            />


            <Box sx={{ display: 'flex', my: '10px' }}>
                <Box>
                    End Date:
                </Box>
                <Box sx={{ ml: '10px' }}>
                    {new Date(end_date).toLocaleDateString()}

                </Box>
            </Box>

            <TextField

                fullWidth
                required
                label="Choose end Date"
                name="end_date"
                type="date"
                onChange={e => {
                    setEnd_date(e.target.value)
                }}
                value={end_date}
                sx={{ mt: 2 }}
            />
            <Box sx={{display:'flex', my:'10px'}}>
            <Button onClick={handleRemove}>remove</Button>

            <Button onClick={handleSubmit}>submit</Button>

            </Box>

        </div>
    )
}

export default DateRange

// http://localhost:3000/dashboard/properties/units/140/edit
{/* <TextField
error={Boolean(
  formik.touched.cost && formik.errors.cost
)}
fullWidth
required
label="Cost"
name="cost"
type="number"
onBlur={formik.handleBlur}
onChange={formik.handleChange}
value={formik.values.cost}
disabled={isDisabled}
sx={{ mt: 2 }}
/>

<Box sx={{ display: 'flex', my: '10px' }}>
  <Box>
    Start Date:
  </Box>
  <Box sx={{ ml: '10px' }}>
    {new Date(formik.values.start_date).toLocaleDateString()}

  </Box>
</Box>

<TextField
error={Boolean(
  formik.touched.start_date && formik.errors.start_date
)}
fullWidth
required
label="Choose start Date"
name="start_date"
type="date"
onBlur={formik.handleBlur}
onChange={formik.handleChange}
value={formik.values.start_date}
disabled={isDisabled}
sx={{ mt: 2 }}
/>


<Box sx={{ display: 'flex', my: '10px' }}>
  <Box>
    End Date:
  </Box>
  <Box sx={{ ml: '10px' }}>
    {new Date(formik.values.end_date).toLocaleDateString()}

  </Box>
</Box>

<TextField
error={Boolean(
  formik.touched.end_date && formik.errors.end_date
)}
fullWidth
required
label="Choose end Date"
name="end_date"
type="date"
onBlur={formik.handleBlur}
onChange={formik.handleChange}
value={formik.values.end_date}
disabled={isDisabled}
sx={{ mt: 2 }}
/> */}