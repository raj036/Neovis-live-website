import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Box, Chip, Divider, Input, Typography } from "@mui/material";
import { useUpdateEffect } from "../../../hooks/use-update-effect";
import { Search as SearchIcon } from "../../../icons/search";
import { MultiSelect } from "../../multi-select";
import { PROPERTY_STATUSES, PROPERTY_TYPES } from "../../../utils/constants";

export const PropertyListFilters = (props) => {
  const { onChange, setSearch, handleSearchChange, ...other } = props;
  const [filterItems, setFilterItems] = useState([]);

  const categoryValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "category")
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
        category: [],
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
          case "category":
            filters.category.push(filterItem.value);
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

  const handleCategoryChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== "category") {
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
          const option = PROPERTY_TYPES.find(
            (option) => option.value === value
          );

          newFilterItems.push({
            label: "Category",
            field: "category",
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
          const option = PROPERTY_STATUSES.find(
            (option) => option.value === value
          );

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
            placeholder="Search by property name"
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
          label="Category"
          onChange={handleCategoryChange}
          options={PROPERTY_TYPES}
          value={categoryValues}
        />
        <MultiSelect
          label="Status"
          onChange={handleStatusChange}
          options={PROPERTY_STATUSES}
          value={statusValues}
        />
      </Box>
    </div>
  );
};

PropertyListFilters.propTypes = {
  onChange: PropTypes.func,
};
