import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Box, Chip, Divider, Input, Typography } from "@mui/material";
import { Search as SearchIcon } from "../../../../icons/search";
import { useUpdateEffect } from "../../../../hooks/use-update-effect";
import { MultiSelect } from "../../../multi-select";
import { ELEMENT_TYPES, STATUSES } from "../../../../utils/constants";

export const ElementStockFilter = (props) => {
    const { onChange, setSearch, handleSearchChange, units, properties, unitTypes, ...other } = props;
    const [filterItems, setFilterItems] = useState([]);

    const unitValues = useMemo(
        () =>
            filterItems
                .filter((filterItems) => filterItems.field === "units")
                .map((filterItems) => filterItems.value),
        [filterItems]
    );

    const propertyValues = useMemo(
        () =>
            filterItems
                .filter((filterItems) => filterItems.field === "properties")
                .map((filterItems) => filterItems.value),
        [filterItems]
    );

    const unitTypesValues = useMemo(
        () =>
            filterItems
                .filter((filterItems) => filterItems.field === "unitTypes")
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
                units: [],
                properties: [],
                unitTypes: [],
                status: [],
            };

            // Transform the filter items in an object that can be used by the parent component to call the
            // serve with the updated filters
            filterItems.forEach((filterItem) => {
                switch (filterItem.field) {
                    case "units":
                        filters.units.push(filterItem.value);
                        break;
                    case "properties":
                        filters.properties.push(filterItem.value);
                        break;
                    case "unitTypes":
                        filters.unitTypes.push(filterItem.value);
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

    const handleunitsChange = (values) => {
        setFilterItems((prevState) => {
            const valuesFound = [];

            // First cleanup the previous filter items
            const newFilterItems = prevState.filter((filterItem) => {
                if (filterItem.field !== "units") {
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
                    const option = units.find((option) => option.value === value);

                    newFilterItems.push({
                        label: "Unit",
                        field: "units",
                        value,
                        displayValue: option.label,
                    });
                }
            });

            return newFilterItems;
        });
    };


    const handlepropertiesChange = (values) => {
        setFilterItems((prevState) => {
            const valuesFound = [];

            // First cleanup the previous filter items
            const newFilterItems = prevState.filter((filterItem) => {
                if (filterItem.field !== "properties") {
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
                    const option = properties.find((option) => option.value === value);

                    newFilterItems.push({
                        label: "Property",
                        field: "properties",
                        value,
                        displayValue: option.label,
                    });
                }
            });

            return newFilterItems;
        });
    };


    const handleunitTypesChange = (values) => {
        setFilterItems((prevState) => {
            const valuesFound = [];

            // First cleanup the previous filter items
            const newFilterItems = prevState.filter((filterItem) => {
                if (filterItem.field !== "unitTypes") {
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
                    const option = unitTypes.find((option) => option.value === value);

                    newFilterItems.push({
                        label: "Unit Type",
                        field: "unitTypes",
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
            {/* <Box
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
                        placeholder="Search by element code/title"
                    />
                </Box>
            </Box>
            <Divider /> */}
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
                {Array.isArray(units) && units.length > 0 &&
                    <MultiSelect
                        label="Unit"
                        onChange={handleunitsChange}
                        options={units}
                        value={unitValues}
                    />
                }
                {Array.isArray(properties) && properties.length > 0 &&
                    <MultiSelect
                        label="Property"
                        onChange={handlepropertiesChange}
                        options={properties}
                        value={propertyValues}
                    />
                }
                {Array.isArray(unitTypes) && unitTypes.length > 0 &&
                    <MultiSelect
                        label="Unit Type"
                        onChange={handleunitTypesChange}
                        options={unitTypes}
                        value={unitTypesValues}
                    />
                }
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

ElementStockFilter.propTypes = {
    onChange: PropTypes.func,
};
