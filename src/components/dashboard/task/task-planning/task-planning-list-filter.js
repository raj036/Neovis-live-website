import { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Chip, Divider, Input, Typography } from "@mui/material";
import { useUpdateEffect } from "../../../../hooks/use-update-effect";
import { Search as SearchIcon } from "../../../../icons/search";
import { MultiSelect } from "../../../multi-select";
import { CONFIGURATION, PLANNIG_STATUSES } from "../../../../utils/constants";

export const TaskPlanningListFilter = (props) => {
  const {
    properties,
    unittypes,
    units,
    unitgroup,
    taskConfig,
    onChange,
    setSearch,
    handleSearchChange,
    propertyId,
    ...other
  } = props;
  const [filterItems, setFilterItems] = useState([]);
  const [allProperty, setAllProperty] = useState([]);
  const [allUnitType, setAllUnitType] = useState([]);
  const [allUnit, setAllUnit] = useState([]);
  const [allUnitGroup, setAllUnitGroup] = useState([]);
  const [allTaskConfig, setAllTaskConfig] = useState([]);

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

  useEffect(() => {
    if (units && units?.length > 0) {
      setAllUnit(
        units?.map((_) =>
        ({
          label: _.unit_name,
          value: _.id.toString(),
        }))
      );
    }
  }, [units]);


  useEffect(() => {
    if (unitgroup && unitgroup?.length > 0) {
      setAllUnitGroup(
        unitgroup?.map((_) => ({
          label: _.name,
          value: _.id.toString(),
        }))
      );
    }
  }, [unitgroup]);

  useEffect(() => {
    if (taskConfig && taskConfig?.length > 0) {
      setAllTaskConfig(
        taskConfig?.map((_) => ({
          label: _.name,
          value: _.id.toString(),
        }))
      );
    }
  }, [taskConfig]);

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

  const unitValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "units")
        .map((filterItems) => filterItems.value),
    [filterItems]
  );

  const unitgroupValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "unitgroup")
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

  const configurationValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "configuration")
        .map((filterItems) => filterItems.value),
    [filterItems]
  );


  useUpdateEffect(
    () => {
      const filters = {
        name: undefined,
        property: [],
        unittype: [],
        units: [],
        unitgroup: [],
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
          case "units":
            filters.units.push(filterItem.value);
            break;
          case "unitgroup":
            filters.unitgroup.push(filterItem.value);
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

  const handleUnitChange = (values) => {
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
            label: "Units",
            field: "units",
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
        if (filterItem.field !== "unitgroup") {
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
          const option = allUnitGroup.find((option) => option.value === value);

          newFilterItems.push({
            label: "Unit Group",
            field: "unitgroup",
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
          const option = PLANNIG_STATUSES.find((option) => option.value === value);
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

  const handleConfigChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== "configuration") {
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
          const option = CONFIGURATION.find((option) => option.value === value);

          newFilterItems.push({
            label: "Configuration",
            field: "configuration",
            value,
            displayValue: option?.label,
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
            placeholder="Search by config name"
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
        {propertyId?.length > 0 &&
          <MultiSelect
            label="Units"
            onChange={handleUnitChange}
            options={allUnit}
            value={unitValues}
          />}
        <MultiSelect
          label="Unit Group"
          onChange={handleTypeChange}
          options={allUnitGroup}
          value={unitgroupValues}
        />
        <MultiSelect
          label="Task Config"
          onChange={handleConfigChange}
          options={allTaskConfig}
          value={configurationValues}
        />
        <MultiSelect
          label="Status"
          onChange={handleStatusChange}
          options={PLANNIG_STATUSES}
          value={statusValues}
        />
      </Box>
    </div>
  );
};

TaskPlanningListFilter.propTypes = {
  onChange: PropTypes.func,
};
