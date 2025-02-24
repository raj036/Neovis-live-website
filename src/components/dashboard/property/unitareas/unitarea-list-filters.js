import { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Chip, Divider, Input, Typography } from "@mui/material";
import { useUpdateEffect } from "../../../../hooks/use-update-effect";
import { Search as SearchIcon } from "../../../../icons/search";
import { MultiSelect } from "../../../multi-select";
import { AREA_TYPES, STATUSES } from "../../../../utils/constants";

export const UnitareaListFilter = (props) => {
  const {
    properties,
    unittypes,
    onChange,
    setSearch,
    handleSearchChange,
    ...other
  } = props;
  const [filterItems, setFilterItems] = useState([]);
  const [allProperty, setAllProperty] = useState([]);
  const [allUnitType, setAllUnitType] = useState([]);

  useEffect(() => {
    if (properties && properties?.length > 0) {
      setAllProperty(
        properties?.map((_) => ({
          label: _.property_name,
          value: _.id.toString(),
        }))
      );
    }
  }, [properties]);

  useEffect(() => {
    if (unittypes && unittypes?.length > 0) {
      setAllUnitType(
        unittypes?.map((_) => ({
          label: _.unit_type_name,
          value: _.id.toString(),
        }))
      );
    }
  }, [unittypes]);

  const propertyValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "property")
        .map((filterItems) => filterItems.value),
    [filterItems]
  );

  const unittypeValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "unittype")
        .map((filterItems) => filterItems.value),
    [filterItems]
  );

  const typeValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "type")
        .map((filterItems) => filterItems.value),
    [filterItems]
  );

  const statusValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "status")
        .map((filterItems) => filterItems.value),
    [filterItems]
  );

  useUpdateEffect(
    () => {
      const filters = {
        name: undefined,
        property: [],
        unittype: [],
        type: [],
        status: [],
        inStock: undefined,
      };

      // Transform the filter items in an object that can be used by the parent component to call the
      // serve with the updated filters
      filterItems.forEach((filterItem) => {
        switch (filterItem.field) {
          case "name":
            // There will (or should) be only one filter item with field "name"
            // so we can set up it directly
            filters.name = filterItem.value;
            break;
          case "property":
            filters.property.push(filterItem.value);
            break;
          case "unittype":
            filters.unittype.push(filterItem.value);
            break;
          case "type":
            filters.type.push(filterItem.value);
            break;
          case "status":
            filters.status.push(filterItem.value);
            break;
          case "inStock":
            // The value can be "available" or "outOfStock" and we transform it to a boolean
            filters.inStock = filterItem.value === "available";
            break;
          default:
            break;
        }
      });

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
          const option = allProperty.find((option) => option.value === value);

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

  const handleUnittypeChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== "unittype") {
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
          const option = allUnitType.find((option) => option.value === value);

          newFilterItems.push({
            label: "Unit Type",
            field: "unittype",
            value,
            displayValue: option.label,
          });
        }
      });

      return newFilterItems;
    });
  };

  const handleTypeChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== "type") {
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
          const option = AREA_TYPES.find((option) => option.value === value);

          newFilterItems.push({
            label: "Area Type",
            field: "type",
            value,
            displayValue: option.label,
          });
        }
      });

      return newFilterItems;
    });
  };

  const handleStatusChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== "status") {
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
          const option = STATUSES.find((option) => option.value === value);

          newFilterItems.push({
            label: "Status",
            field: "status",
            value,
            displayValue: option.label,
          });
        }
      });

      return newFilterItems;
    });
  };

  return (
    <div {...other}>
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          p: 2,
        }}
      >
        <SearchIcon fontSize="small" />
        <Box
          component="form"
          onSubmit={handleSearchChange}
          sx={{
            flexGrow: 1,
            ml: 3,
          }}
        >
          <Input
            disableUnderline
            fullWidth
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder="Search by unit area code/name"
          />
        </Box>
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
          options={allProperty}
          value={propertyValues}
        />
        <MultiSelect
          label="Unit Type"
          onChange={handleUnittypeChange}
          options={allUnitType}
          value={unittypeValues}
        />
        <MultiSelect
          label="Area Type"
          onChange={handleTypeChange}
          options={AREA_TYPES}
          value={typeValues}
        />
        <MultiSelect
          label="Status"
          onChange={handleStatusChange}
          options={STATUSES}
          value={statusValues}
        />
      </Box>
    </div>
  );
};

UnitareaListFilter.propTypes = {
  onChange: PropTypes.func,
};
