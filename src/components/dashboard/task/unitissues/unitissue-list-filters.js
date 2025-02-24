import { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Chip, Divider, Input, Typography } from "@mui/material";
import { useUpdateEffect } from "../../../../hooks/use-update-effect";
import { Search as SearchIcon } from "../../../../icons/search";
import { MultiSelect } from "../../../multi-select";
import { STATUSES, UNIT_CONDITIONS } from "../../../../utils/constants";

export const UnitIssueListFilter = (props) => {
  const {
    units,
    unittypes,
    unitareas,
    issuetypes,
    elements,
    onChange,
    setSearch,
    handleSearchChange,
    ...other
  } = props;
  const [filterItems, setFilterItems] = useState([]);
  const [allUnit, setAllUnit] = useState([]);
  const [allUnitType, setAllUnitType] = useState([]);
  const [allUnitArea, setAllUnitArea] = useState([]);
  const [allIssueType, setAllIssueType] = useState([]);
  const [allElement, setAllElement] = useState([]);

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
    if (unitareas && unitareas?.length > 0) {
      setAllUnitArea(
        unitareas?.map((_) => ({
          label: _.area_name,
          value: _.id.toString(),
        }))
      );
    }
  }, [unitareas]);

  useEffect(() => {
    if (issuetypes && issuetypes?.length > 0) {
      setAllIssueType(
        issuetypes?.map((_) => ({
          label: _.name,
          value: _.id.toString(),
        }))
      );
    } else {
      setAllIssueType([]);
    }
  }, [issuetypes]);

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

  const unittypeValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "unittype")
        .map((filterItems) => filterItems.value),
    [filterItems]
  );

  const unitareaValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "unitarea")
        .map((filterItems) => filterItems.value),
    [filterItems]
  );

  const issuetypeValues = useMemo(
    () =>
      filterItems
        .filter((filterItems) => filterItems.field === "issuetype")
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
        unit: [],
        unittype: [],
        unitarea: [],
        issuetype: [],
        element: [],
        status: [],
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
          case "unit":
            filters.unit.push(filterItem.value);
            break;
          case "unittype":
            filters.unittype.push(filterItem.value);
            break;
          case "unitarea":
            filters.unitarea.push(filterItem.value);
            break;
          case "issuetype":
            filters.issuetype.push(filterItem.value);
            break;
          case "status":
            filters.status.push(filterItem.value);
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

  const handleUnitareaChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== "unitarea") {
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
          const option = allUnitArea.find((option) => option.value === value);

          newFilterItems.push({
            label: "Unit Area",
            field: "unitarea",
            value,
            displayValue: option.label,
          });
        }
      });

      return newFilterItems;
    });
  };

  const handleIssuetypeChange = (values) => {
    setFilterItems((prevState) => {
      const valuesFound = [];

      // First cleanup the previous filter items
      const newFilterItems = prevState.filter((filterItem) => {
        if (filterItem.field !== "issuetype") {
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
          const option = allIssueType.find((option) => option.value === value);

          newFilterItems.push({
            label: "Issue Type",
            field: "issuetype",
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
            placeholder="Search by unit code/name"
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
          label="Unit Type"
          onChange={handleUnittypeChange}
          options={allUnitType}
          value={unittypeValues}
        />
        <MultiSelect
          label="Unit"
          onChange={handleUnitChange}
          options={allUnit}
          value={unitValues}
        />
        <MultiSelect
          label="Unit Area"
          onChange={handleUnitareaChange}
          options={allUnitArea}
          value={unitareaValues}
        />
        <MultiSelect
          label="Issue Type"
          onChange={handleIssuetypeChange}
          options={allIssueType}
          value={issuetypeValues}
        />
        <MultiSelect
          label="Element"
          onChange={handleElementChange}
          options={allElement}
          value={elementValues}
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

UnitIssueListFilter.propTypes = {
  onChange: PropTypes.func,
};
