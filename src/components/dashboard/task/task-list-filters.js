import { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Input,
  TextField,
  Typography,
} from "@mui/material";
import { useUpdateEffect } from "../../../hooks/use-update-effect";
import { Search as SearchIcon } from "../../../icons/search";
import { MultiSelect } from "../../multi-select";
import {
  TASK_TYPES,
  TASK_STATUSES,
  DUE_STATUS,
  TASK_PRIORITIES,
  INSPECTION_STATUSES,
} from "../../../utils/constants";
import dayjs from "dayjs";

export const TaskFilter = (props) => {
  const {
    elements,
    units,
    users,
    onChange,
    setSearch,
    handleSearchChange,
    isManager,
    isVendor,
    getUnassigned,
    setGetUnassigned,
    setAssignEmlDate,
    assignEmplDate,
    ...other
  } = props;
  const [filterItems, setFilterItems] = useState([]);
  const [allElement, setAllElement] = useState([]);
  const [allUnit, setAllUnit] = useState([]);
  const [allExecutor, setAllExecutor] = useState([]);
  const [allInspector, setAllInspector] = useState([]);

  useEffect(() => {
    if (elements && elements?.length > 0) {
      setAllElement(
        elements?.map((_) => ({
          label: _.name,
          value: _.id.toString(),
        }))
      );
    }
  }, [elements]);

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
      setAllInspector(
        users
          ?.filter(
            (_user) => _user.user_role.role.toLowerCase() === "inspector"
          )
          .map((_) => ({
            label: _.first_name + " " + _.last_name,
            value: _.id.toString(),
          }))
      );
    }
  }, [users]);

  const elementValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "element")
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

  const priorityValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "priority")
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

  const inspectorValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "inspector")
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

  const dueAtValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "dueby")
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

  const inspectionValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "inspection")
        .map((filterItems) => filterItems.value),
    [filterItems]
  );

  useUpdateEffect(
    () => {
      const filters = {
        element: [],
        unit: [],
        priority: [],
        executor: [],
        inspector: [],
        tasktype: [],
        dueby: [],
        status: [],
        inspection: [],
      };

      // Transform the filter items in an object that can be used by the parent component to call the
      // serve with the updated filters
      filterItems.forEach((filterItem) => {
        switch (filterItem.field) {
          case "element":
            filters.element.push(filterItem.value);
            break;
          case "unit":
            filters.unit.push(filterItem.value);
            break;
          case "priority":
            filters.priority.push(filterItem.value);
            break;
          case "executor":
            filters.executor.push(filterItem.value);
            break;
          case "inspector":
            filters.inspector.push(filterItem.value);
            break;
          case "tasktype":
            filters.tasktype.push(filterItem.value);
            break;
          case "dueby":
            filters.dueby.push(filterItem.value);
            break;
          case "status":
            filters.status.push(filterItem.value);
            break;
          case "inspection":
            filters.inspection.push(filterItem.value);
            break;
          default:
            break;
        }
      });

      onChange?.(filters);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterItems, getUnassigned]
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

  const handleElementChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== "element") {
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
          const option = allElement.find((option) => option.value === value);

          newFilterItems.push({
            label: "Element",
            field: "element",
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
          const option = TASK_PRIORITIES.find(
            (option) => option.value === value
          );

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

  const handleInspectorChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== "inspector") {
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
          const option = allInspector.find((option) => option.value === value);

          newFilterItems.push({
            label: "Inspector",
            field: "inspector",
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

  const handleDueAtChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== "dueby") {
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
          const option = DUE_STATUS.find((option) => option.value === value);

          newFilterItems.push({
            label: "Due By",
            field: "dueby",
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
          const option = TASK_STATUSES.find((option) => option.value === value);

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

  const handleInspectionChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== "inspection") {
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
          const option = INSPECTION_STATUSES.find(
            (option) => option.value === value
          );

          newFilterItems.push({
            label: "Inspection",
            field: "inspection",
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
      <Grid container >
        <Grid item md={7} sx={{ minHeight: '64px' }}>
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
                placeholder="Search by task title or unit name"
              />
            </Box>
          </Box>
        </Grid>
        <Grid item md={5}>
          {
            isManager && (
              <Box
                sx={{
                  ml: 2,
                  pr: 2,
                  display: "flex",
                  gap: 1,
                  justifyContent: "end",
                  alignItems: "center",
                  minHeight: '64px'
                }}
              >
                <DatePicker
                  sx={{ maxWidth: "210px" }}
                  onChange={(newDate) => {
                    if (newDate) {
                      setAssignEmlDate((prevState) => ({
                        ...prevState,
                        startDate: newDate,
                      }))
                    } else {
                      setAssignEmlDate((prevState) => ({ ...prevState, startDate: null }));
                    }
                  }}
                  disabled={!getUnassigned}
                  renderInput={(inputProps) => (
                    <TextField
                      size="small"
                      style={{ height: "30px !important", maxWidth: "210px" }}
                      error={false}
                      disabled={!getUnassigned}
                      {...inputProps}
                    />
                  )}
                  label="Start Date"
                  inputFormat="dd-MM-yyyy"
                  value={assignEmplDate.startDate}
                />

                <DatePicker
                  sx={{ maxWidth: "210px" }}
                  onChange={(newDate) => {
                    if (newDate) {
                      setAssignEmlDate((prevState) => ({
                        ...prevState,
                        endDate: newDate,
                      }));
                    } else {
                      setAssignEmlDate((prevState) => ({ ...prevState, endDate: null }));
                    }
                  }}
                  label="End Date"
                  disabled={!assignEmplDate.startDate}
                  inputFormat="dd-MM-yyyy"
                  renderInput={(inputProps) => (
                    <TextField
                      size="small"
                      style={{ height: "30px !important", maxWidth: "210px" }}
                      error={false}
                      disabled={!assignEmplDate.startDate}
                      {...inputProps}
                    />
                  )}
                  value={assignEmplDate.endDate}
                />
              </Box>
            )
          }
        </Grid>
      </Grid>
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
          label="Unit"
          onChange={handleUnitChange}
          options={allUnit}
          value={unitValues}
        />
        <MultiSelect
          label="Executor"
          onChange={handleExecutorChange}
          options={allExecutor}
          value={executorValues}
        />
        {isManager && (
          <MultiSelect
            label="Inspector"
            onChange={handleInspectorChange}
            options={allInspector}
            value={inspectorValues}
          />
        )}
        <MultiSelect
          label="Task Type"
          onChange={handleTaskTypeChange}
          options={TASK_TYPES}
          value={taskTypeValues}
        />
        <MultiSelect
          label="Element"
          onChange={handleElementChange}
          options={allElement}
          value={elementValues}
        />
        <MultiSelect
          label="Priority"
          onChange={handlePriorityChange}
          options={TASK_PRIORITIES}
          value={priorityValues}
        />
        <MultiSelect
          label="Due By"
          onChange={handleDueAtChange}
          options={DUE_STATUS}
          value={dueAtValues}
        />
        <MultiSelect
          label="Status"
          onChange={handleStatusChange}
          options={TASK_STATUSES}
          value={statusValues}
        />
        {!isVendor && (
          <MultiSelect
            label="Inspection"
            onChange={handleInspectionChange}
            options={INSPECTION_STATUSES}
            value={inspectionValues}
          />
        )}
        {
          isManager && (
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={getUnassigned}
                  onChange={() => setGetUnassigned((prev) => !prev)}
                />
              }
              label="Unassigned Tasks"
            />
          )
        }
      </Box>
    </div>
  );
};

TaskFilter.propTypes = {
  onChange: PropTypes.func,
};
