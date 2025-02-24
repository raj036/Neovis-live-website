import { useState, useMemo, useEffect } from "react";
import { Box, Chip, Divider, InputBase, Typography, alpha, styled, Autocomplete, TextField } from "@mui/material";
import { useUpdateEffect } from "../../../hooks/use-update-effect";
import { MultiSelect } from "../../multi-select";
import { useRouter } from "next/router";
import SearchIcon from '@mui/icons-material/Search';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  marginBottom: 10,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

export const DashboardTaskFilter = (props) => {
  const {
    properties,
    units,
    users,
    onChange,
    setSelProperty,
    handleChangeUnit,
    setResources,
    ...other
  } = props;
  const [filterItems, setFilterItems] = useState([]);
  const [allUnit, setAllUnit] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [allExecutor, setAllExecutor] = useState([]);
  const [firstTime, setIsfirstTime] = useState(true)
  const [selUnit, setSelUnit] = useState([]);
  const [isReservationRoute, setIsReservationRoute] = useState(false)

  const router = useRouter()

  useEffect(() => {
    if (units && units?.length > 0) {
      setAllUnit(
        units?.map((_) => ({
          label: _.unit_name,
          value: _.id.toString(),
        }))
      );
    }
  }, [units]);

  useEffect(()=> {
    if (router.pathname.includes('reservations/plan-dashboard')) {
      setIsReservationRoute(true)
    }
  }, [])

  useEffect(() => {
    if (properties && properties?.length > 0) {
      setAllProperties(
        properties?.map((_) => ({
          label: _.property_name,
          value: _.id.toString(),
        }))
      );
      if (firstTime) {
        setSelProperty([properties[0].id.toString()])
        setFilterItems([{
          label: "Property",
          field: "property",
          value: properties[0]?.id.toString(),
          displayValue: properties[0]?.property_name,
        }])
        setTimeout(() => {
          if (units && units.length > 0) {
            const unitFilters = units.map(ut => ({
              label: "Unit",
              field: "unit",
              value: ut?.id.toString(),
              displayValue: ut?.unit_name,
            }))
            setFilterItems([...filterItems, ...unitFilters])
            setResources(units.map(ut => ({ id: ut.id, title: ut.unit_name })))
          }
          setIsfirstTime(false)
        }, 2000)
      }
    }
  }, [properties, units, firstTime]);

  useEffect(() => {
    if (users && users?.length > 0) {
      setAllExecutor(
        users
          ?.filter((_user) => _user.user_role.role.toLowerCase() === "executor")
          .map((_) => ({
            label: _.first_name + " " + _.last_name,
            value: _.id.toString(),
          }))
      );
    }
  }, [users]);

  const propertyValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "property")
        .map((filterItems) => filterItems.value),
    [filterItems]
  );

  const unitValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "unit")
        .map((filterItems) => filterItems.value),
    [filterItems]
  );

  const executorValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "executor")
        .map((filterItems) => filterItems.value),
    [filterItems]
  );

  useUpdateEffect(
    () => {
      const filters = {
        property: [],
        unit: [],
        executor: [],
      };

      // Transform the filter items in an object that can be used by the parent component to call the
      // serve with the updated filters
      filterItems.forEach((filterItem) => {
        switch (filterItem.field) {
          case "property":
            filters.property.push(filterItem.value);
            break;
          case "unit":
            filters.unit.push(filterItem.value);
            break;
          case "executor":
            filters.executor.push(filterItem.value);
            break;
          default:
            break;
        }
      });

      setSelProperty(filters.property);

      if (filters.property.length === 0) {
        setAllUnit([]);
      }

      onChange?.(filters);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterItems]
  );

  const handleDelete = (filterItem) => {
    setFilterItems((prevState) =>
      prevState.filter((_filterItem) => {
        return !(
          filterItem.field === _filterItem.field &&
          filterItem.value === _filterItem.value
        );
      })
    );
  };

  const handlePropertyChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== "property") {
          return true;
        }

        const found = values.includes(filterItem.value);

        if (found) {
          valuesFound.push(filterItem.value);
        }

        return found;
      });

      // Nothing changed
      if (values.length === valuesFound.length) {
        return newFilterItems;
      }

      values.forEach((value) => {
        if (!valuesFound.includes(value)) {
          const option = allProperties.find((option) => option.value === value);

          newFilterItems.push({
            label: "Property",
            field: "property",
            value,
            displayValue: option.label,
          });
        }
      });

      return newFilterItems;
    });
  };

  const handleUnitChange = (values) => {
    console.log('unit values', values)
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== "unit") {
          return true;
        }

        const found = values.includes(filterItem.value);

        if (found) {
          valuesFound.push(filterItem.value);
        }

        return found;
      });

      // Nothing changed
      if (values.length === valuesFound.length) {
        return newFilterItems;
      }

      values.forEach((value) => {
        if (!valuesFound.includes(value)) {
          const option = allUnit.find((option) => option.value === value);

          newFilterItems.push({
            label: "Unit",
            field: "unit",
            value,
            displayValue: option.label,
          });
        }
      });

      return newFilterItems;
    });
  };

  const handleExecutorChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== "executor") {
          return true;
        }

        const found = values.includes(filterItem.value);

        if (found) {
          valuesFound.push(filterItem.value);
        }

        return found;
      });

      // Nothing changed
      if (values.length === valuesFound.length) {
        return newFilterItems;
      }

      values.forEach((value) => {
        if (!valuesFound.includes(value)) {
          const option = allExecutor.find((option) => option.value === value);

          newFilterItems.push({
            label: "Executor",
            field: "executor",
            value,
            displayValue: option.label,
          });
        }
      });

      return newFilterItems;
    });
  };

  return (
    <div style={{ width: '100%' }} {...other}>
      <Box sx={{ width: '20%', }}>
        {/* <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
            onChange={(e) => handleChangeUnit(e, units)}
          />
        </Search> */}

      </Box>
      <Divider />
      {filterItems.length > 0 ? (
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flexWrap: "wrap",
            p: 2,
          }}
        >
          {filterItems.map((filterItem, i) => (
            <Chip
              key={i}
              label={
                <Box
                  sx={{
                    alignItems: "center",
                    display: "flex",
                    "& span": {
                      fontWeight: 600,
                    },
                  }}
                >
                  <span>{filterItem.label}</span>:{" "}
                  {filterItem.displayValue || filterItem.value}
                </Box>
              }
              onDelete={() => handleDelete(filterItem)}
              sx={{ m: 1 }}
              variant="outlined"
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ p: 3 }}>
          <Typography color="textSecondary" variant="subtitle2">
            No filters applied
          </Typography>
        </Box>
      )}
      <Divider />
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          flexWrap: "wrap",
          p: 1,
        }}
      >
        <MultiSelect
          label="Property"
          onChange={handlePropertyChange}
          options={allProperties}
          value={propertyValues}
        />
        {isReservationRoute ? 
          <Autocomplete
          options={allUnit ? allUnit : []}
          getOptionLabel={(option) =>
            option.label ? option.label : ""
          }
          multiple={true}
          value={selUnit}
          size="small"
          sx={{ my: 2 }}
          // disabled={isDisabled || task || isDashboardTask}
          renderInput={(params) => (
            <TextField
              {...params}
              required
              fullWidth={false}
              label="Select Unit"
              placeholder="Select Unit"
              sx={{
                width:400,
                backgroundColor: "background.default",
                borderRadius: 1,
                boxShadow:
                  "0px 1px 1px rgb(100 116 139 / 6%), 0px 1px 2px rgb(100 116 139 / 10%)",
              }}
            />
          )}
          onChange={(event, newValue) => {
            console.log('unit newValue', newValue)
            setSelUnit(newValue);
            if(newValue && newValue.length > 0) {
            handleUnitChange(newValue.map(vl => vl.value))
            }
          }}
        />
        :
        <MultiSelect
          label="Unit"
          onChange={handleUnitChange}
          options={allUnit}
          value={unitValues}
          emptyMsg="Select Property First"
        />
        }
        {!router.pathname.includes('plan-dashboard') &&
          <MultiSelect
            label="Executor"
            onChange={handleExecutorChange}
            options={allExecutor}
            value={executorValues}
          />
        }
      </Box>
    </div>
  );
};
