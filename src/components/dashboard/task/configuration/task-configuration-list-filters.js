import { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Chip, Divider, Input, Typography } from "@mui/material";
import { useUpdateEffect } from "../../../../hooks/use-update-effect";
import { Search as SearchIcon } from "../../../../icons/search";
import { MultiSelect } from "../../../multi-select";
import { TASK_CONFIG_PRIORITIES, TASK_CONFIG_EXEC_MOMENT, TASK_TYPES } from "../../../../utils/constants";

export const TaskConfigurationListFilter = (props) => {
  const {
    properties,
    unitgroup,
    onChange,
    setSearch,
    handleSearchChange,
    ...other
  } = props;
  const [filterItems, setFilterItems] = useState([]);
  const [allProperty, setAllProperty] = useState([]);
  const [allUnitGroups, setAllUnitGroups] = useState([]);

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
    if (unitgroup && unitgroup?.length > 0) {
      setAllUnitGroups(
        unitgroup?.map((_) => ({
          label: _.name.toUpperCase(),
          value: _.id.toString(),
        }))
      );
    }
  }, [unitgroup]);

  const propertyValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "property")
        .map((filterItems) => filterItems.value),
    [filterItems]
  );

  const taskTypeValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "tasktype")
        .map((filterItems) => filterItems.value),
    [filterItems]
  );

  const unitGroupValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "unit_group")
        .map((filterItems) => filterItems.value),
    [filterItems]
  );

  const priorityValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "priority")
        .map((filterItems) => filterItems.value),
    [filterItems]
  );

  const execMomentValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "exec_moment")
        .map((filterItems) => filterItems.value),
    [filterItems]
  );

  useUpdateEffect(
    () => {
      const filters = {
        property: [],
        tasktype: [],
        unit_group: [],
        priority: [],
        exec_moment: []
      };

      // Transform the filter items in an object that can be used by the parent component to call the
      // serve with the updated filters
      filterItems.forEach((filterItem) => {
        switch (filterItem.field) {
          case "property":
            filters.property.push(filterItem.value);
            break;
          case "tasktype":
            filters.tasktype.push(filterItem.value);
            break;
          case "unit_group":
            filters.unit_group.push(filterItem.value);
            break;
          case "exec_moment":
            filters.exec_moment.push(filterItem.value);
            break;
          case "priority":
            filters.priority.push(filterItem.value);
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

  const handleTaskTypeChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== "tasktype") {
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
          const option = TASK_TYPES.find((option) => option.value === value);

          newFilterItems.push({
            label: "Task Type",
            field: "tasktype",
            value,
            displayValue: option.label,
          });
        }
      });

      return newFilterItems;
    });
  };

  const handleUnitGrpChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== "unit_group") {
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
          const option = allUnitGroups.find((option) => option.value === value);

          newFilterItems.push({
            label: "Unit Group",
            field: "unit_group",
            value,
            displayValue: option.label,
          });
        }
      });

      return newFilterItems;
    });
  };

  const handleExecMomChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== "exec_moment") {
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
          const option = TASK_CONFIG_EXEC_MOMENT.find((option) => option.value === value);

          newFilterItems.push({
            label: "Exec Moment",
            field: "exec_moment",
            value,
            displayValue: option.label,
          });
        }
      });

      return newFilterItems;
    });
  };

  const handlePriorityChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== "priority") {
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
          const option = TASK_CONFIG_PRIORITIES.find((option) => option.value === value);

          newFilterItems.push({
            label: "Priority",
            field: "priority",
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
          label="Task Type"
          onChange={handleTaskTypeChange}
          options={TASK_TYPES}
          value={taskTypeValues}
        />
        <MultiSelect
          label="Property"
          onChange={handlePropertyChange}
          options={allProperty}
          value={propertyValues}
        />
        <MultiSelect
          label="Unit Groups"
          onChange={handleUnitGrpChange}
          options={allUnitGroups}
          value={unitGroupValues}
        />
        <MultiSelect
          label="Execution Moment"
          onChange={handleExecMomChange}
          options={TASK_CONFIG_EXEC_MOMENT}
          value={execMomentValues}
        />
        <MultiSelect
          label="Priority"
          onChange={handlePriorityChange}
          options={TASK_CONFIG_PRIORITIES}
          value={priorityValues}
        />
      </Box>
    </div>
  );
};

TaskConfigurationListFilter.propTypes = {
  onChange: PropTypes.func,
};
