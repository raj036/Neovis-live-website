import { useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { ChevronDown as ChevronDownIcon } from "../icons/chevron-down";

export const MultiSelect = (props) => {
  const { label, onChange, options, value = [], emptyMsg, ...other } = props;
  const anchorRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(false);

  const handleOpenMenu = () => {
    setOpenMenu(true);
  };

  const handleCloseMenu = () => {
    setOpenMenu(false);
  };

  const handleChange = (event) => {
    let newValue = [...value];

    if (event.target.checked) {
      newValue.push(event.target.value);
    } else {
      if(!isNaN(event.target.value)) {
        newValue = newValue.filter((item) => item !== +event.target.value);
      }
      newValue = newValue.filter((item) => item !== event.target.value);
    }

    onChange?.(newValue, setOpenMenu);
  };

  return (
    <>
      <Button
        color="inherit"
        endIcon={<ChevronDownIcon fontSize="small" />}
        onClick={handleOpenMenu}
        ref={anchorRef}
        {...other}
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorRef.current}
        onClose={handleCloseMenu}
        open={openMenu}
        PaperProps={{ style: { minWidth: 250 } }}
      >
        {options.length > 0 ? options.map((option) => (
          <MenuItem key={option.label}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={value.includes(option.value)}
                  onChange={handleChange}
                  value={option.value}
                />
              }
              label={option.label}
              sx={{
                flexGrow: 1,
                mr: 0,
              }}
            />
          </MenuItem>
        )) : (
          <MenuItem>
            <Typography>
              {emptyMsg || ""}
            </Typography>
          </MenuItem>
        )
      }
        {/* <MenuItem key={"apply"}>
          <Button sx={{ m: 1, ml: "auto" }} variant="contained">
            Apply
          </Button>
        </MenuItem> */}
      </Menu>
    </>
  );
};

MultiSelect.propTypes = {
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
  value: PropTypes.array.isRequired,
};
