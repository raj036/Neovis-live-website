import { Autocomplete, TextField, Typography, Box } from '@mui/material';

const CustomAutocomplete = ({ label, options, value, onChange, error, helperText, isDisabled, placeholder }) => (
  <Autocomplete
    options={options}
    getOptionLabel={(option) => option ? option : ""}
    value={value}
    size="small"
    disabled={isDisabled}
    renderInput={(params) => (
      <TextField
        {...params}
        error={error}
        fullWidth
        disabled={isDisabled}
        required
        helperText={helperText}
        label={label}
        placeholder={placeholder}
        sx={{
          backgroundColor: "background.default",
          borderRadius: 1,
          boxShadow: "none", // Removed box shadow to match the design
          '& .MuiInputBase-root': {
            padding: 0,
            paddingBottom: 1,
          },
          '& .MuiFormLabel-root': {
            fontSize: '1rem', // Adjusted font size for the label
          },
        }}
      />
    )}
    onChange={onChange}
  />
);

export default CustomAutocomplete;