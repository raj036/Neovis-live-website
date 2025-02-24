import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
    Box,
    Button,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React, { useState } from 'react';

export const CostTable = () => {
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({
    startDate: null,
    endDate: null,
    cost: '',
    template: '',
  });

  const templates = ['Template A', 'Template B', 'Template C'];

  const handleAddRow = () => {
    if (newRow?.startDate && newRow?.endDate && newRow.cost && newRow?.template) {
      setRows([...rows, newRow]);
      setNewRow({
        startDate: null,
        endDate: null,
        cost: '',
        template: '',
      });
    }

  };

  const handleInputChange = (field, value) => {
    setNewRow({ ...newRow, [field]: value });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Template</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{`${row.startDate?.toLocaleDateString()} - ${row.endDate?.toLocaleDateString()}`}</TableCell>
                <TableCell>{row.cost}</TableCell>
                <TableCell>{row.template}</TableCell>
                <TableCell><DeleteOutlineIcon fontSize='small' /></TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <Box display="flex" gap={2}>
                  <DatePicker
                    label="Start Date"
                    value={newRow.startDate}
                    onChange={(date) => handleInputChange('startDate', date)}
                    renderInput={(params) => <TextField {...params} />}
                  />
                  <DatePicker
                    label="End Date"
                    value={newRow.endDate}
                    onChange={(date) => handleInputChange('endDate', date)}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Box>
              </TableCell>
              <TableCell>
                <TextField
                  label="Cost"
                  type="number"
                  value={newRow.cost}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Select
                  value={newRow.template}
                  onChange={(e) => handleInputChange('template', e.target.value)}
                  displayEmpty
                  fullWidth
                >
                  <MenuItem value="" disabled>Select a template</MenuItem>
                  {templates.map((template) => (
                    <MenuItem key={template} value={template}>{template}</MenuItem>
                  ))}
                </Select>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Button variant="contained" onClick={handleAddRow} sx={{ mt: 2 }}>
        Add Row
      </Button>
    </LocalizationProvider>
  );
};
