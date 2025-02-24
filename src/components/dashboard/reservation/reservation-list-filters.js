import { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Checkbox, Chip, Divider, FormControlLabel, FormGroup, Input, Typography } from "@mui/material";
import { useUpdateEffect } from "../../../hooks/use-update-effect";
import { Search as SearchIcon } from "../../../icons/search";
import { MultiSelect } from "../../multi-select";
import * as dayjs from 'dayjs';
import {
    RESERVATION_STATUSES,
} from "../../../utils/constants";
import { DatePicker } from '@mui/x-date-pickers';
import TextField from "@mui/material/TextField";
import useAxios from "../../../services/useAxios";
import { useQuery } from "react-query";

export const ReservationFilter = (props) => {
    const {
        name,
        location,
        onChange,
        setSearch,
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        handleSearchChange,
        handleIsPlanned,
        checked,
        isOwner,
        ownerData,
        ...other
    } = props;
    const [filterItems, setFilterItems] = useState([]);
    const [allElement, setAllElement] = useState([]);
    const [propertiesOptions, setPropertiesOption] = useState([]);
    const [allUnit, setAllUnit] = useState([]);

    const customInstance = useAxios();

    const { data: properties } = useQuery("allProperty", () =>
        customInstance.get(`properties`)
    );

    const propertyValues = useMemo(
        () =>
            filterItems
                .filter((filterItems) => filterItems.field === "property_id")
                .map((filterItems) => +filterItems.value),
        [filterItems]
    );

    const unitValues = useMemo(
        () =>
            filterItems
                .filter((filterItems) => filterItems.field === "unit")
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

    useEffect(() => {
        if (properties?.data) {
            setPropertiesOption(properties?.data?.data?.map(pty => {
                return { value: pty.id, label: pty.property_name }
            }))
        }
    }, [properties])

    useEffect(() => {
        if (ownerData && ownerData.units && ownerData.units?.length > 0) {
            setAllUnit(
                ownerData?.units?.map((_) => ({
                    label: _.unit_name,
                    value: _.id.toString(),
                }))
            );
        }
    }, [ownerData?.units]);

    useUpdateEffect(
        () => {
            const filters = {
                property_id: [],
                unit_id: [],
                location: [],
                status: [],
            };

            filterItems.forEach((filterItem) => {
                switch (filterItem.field) {
                    case "property_id":
                        filters.property_id.push(filterItem.value);
                        break;
                    case "unit":
                        filters.unit_id.push(filterItem.value);
                        break;
                    case "location":
                        filters.location.push(filterItem.value);
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

    const handlePropertyChange = (values) => {

        setFilterItems((prevState) => {
            const valuesFound = [];

            // First cleanup the previous filter items
            const newFilterItems = prevState.filter((filterItem) => {
                if (filterItem.field !== "property_id") {
                    return true;
                }

                const found = values.includes(+filterItem.value);

                if (found) {
                    valuesFound.push(+filterItem.value);
                }

                return found;
            });

            // Nothing changed
            if (values.length === valuesFound.length) {
                return newFilterItems;
            }

            values.forEach((value) => {
                if (!valuesFound.includes(value)) {
                    const option = propertiesOptions.find((option) =>
                        option.value === +value
                    );

                    newFilterItems.push({
                        label: "Property",
                        field: "property_id",
                        value,
                        displayValue: option?.label,
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


    const handleStatusChange = (values, setOpenMenu) => {
        setFilterItems((prevState) => {
            const valuesFound = [];

            // First cleanup the previous filter items
            const newFilterItems = prevState.filter((filterItem) => {
                if (filterItem.field !== "status") {
                    return true;
                }
            });

            // Nothing changed
            if (values.length === valuesFound.length) {
                return newFilterItems;
            }

            // Find option with latest input selected that is saved in Array on index 1 or select Array index 0 if it is a first input
            const option = RESERVATION_STATUSES.find((option) =>
                option.value === values[1] ?? values[0]
            );

            // Only push the latest selected input object
            newFilterItems.push({
                label: "Status",
                field: "status",
                value: values[1] ?? values[0],
                displayValue: option?.label,
            });

            return newFilterItems;
        });
        setOpenMenu(false);
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
                        placeholder="Search by reservation number or location name"
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
                    my: 0.75,
                }}
            >
                <Box>
                    <MultiSelect
                        label="Property"
                        onChange={handlePropertyChange}
                        options={propertiesOptions ?? []}
                        value={propertyValues}
                    />
                </Box>
                {isOwner && ownerData &&
                    <Box sx={{ ml: 2 }}>
                        <MultiSelect
                            label="Unit"
                            onChange={handleUnitChange}
                            options={allUnit}
                            value={unitValues}
                        />
                    </Box>
                }

                <Box sx={{ ml: 2 }}>
                    <MultiSelect
                        label="Status"
                        onChange={handleStatusChange}
                        options={RESERVATION_STATUSES}
                        value={statusValues}
                    />
                </Box>

                <Box sx={{ ml: 2, display: "flex", gap: 1 }}>
                    <DatePicker
                        sx={{ maxWidth: "210px" }}
                        onChange={(newDate) => {
                            let start_date_from = dayjs(newDate).format('YYYY-MM-DD');
                            if (start_date_from !== "Invalid Date") {
                                setStartDate(prevState => (
                                    { ...prevState, from: start_date_from }
                                ));
                            } else if (newDate === null) {
                                setStartDate(
                                    { from: null, to: null }
                                );
                            }
                        }}
                        openTo="month"
                        label="Arrival Date From"
                        inputFormat="dd-MM-yyyy"
                        renderInput={(inputProps) => (
                            <TextField
                                size="medium"
                                style={{ height: "30px !important", width: isOwner ? '180px' : undefined, maxWidth: "210px" }}
                                error={false}
                                {...inputProps} />
                        )}
                        value={startDate.from}
                    />

                    <DatePicker
                        sx={{ maxWidth: "210px" }}
                        onChange={(newDate) => {
                            let start_date_to = dayjs(newDate).format('YYYY-MM-DD');
                            if (start_date_to !== "Invalid Date") {
                                setStartDate(prevState => (
                                    { ...prevState, to: start_date_to }
                                ));
                            } else if (newDate === null) {
                                setStartDate(prevState => (
                                    { ...prevState, to: null }
                                ));
                            }
                        }}
                        openTo="month"
                        label="Arrival Date To"
                        disabled={!startDate.from}
                        inputFormat="dd-MM-yyyy"
                        renderInput={(inputProps) => (
                            <TextField
                                size="medium"
                                style={{ height: "30px !important", width: isOwner ? '180px' : undefined, maxWidth: "210px" }}
                                error={false}
                                disabled={!startDate.from}
                                {...inputProps} />
                        )}
                        value={startDate.to}
                    />
                </Box>

                <Box sx={{ ml: 2, display: "flex", gap: 1 }}>
                    <DatePicker
                        sx={{ maxWidth: "210px" }}
                        onChange={(newDate) => {
                            let end_date_from = dayjs(newDate).format('YYYY-MM-DD');
                            if (end_date_from !== "Invalid Date") {
                                setEndDate(prevState => (
                                    { ...prevState, from: end_date_from }
                                ));
                            } else if (newDate === null) {
                                setEndDate(
                                    { from: null, to: null }
                                );
                            }
                        }}
                        openTo="month"
                        label="Departure Date From"
                        inputFormat="dd-MM-yyyy"
                        renderInput={(inputProps) => (
                            <TextField
                                size="medium"
                                error={false}
                                style={{ height: "30px !important", width: isOwner ? '180px' : undefined, maxWidth: "210px" }}
                                {...inputProps} />
                        )}
                        value={endDate.from}
                    />

                    <DatePicker
                        sx={{ maxWidth: "210px" }}
                        onChange={(newDate) => {
                            let end_date_to = dayjs(newDate).format('YYYY-MM-DD');
                            if (end_date_to !== "Invalid Date") {
                                setEndDate(prevState => (
                                    { ...prevState, to: end_date_to }
                                ));
                            } else if (newDate === null) {
                                setEndDate(prevState => (
                                    { ...prevState, to: null }
                                ));
                            }
                        }}
                        openTo="month"
                        label="Departure Date To"
                        inputFormat="dd-MM-yyyy"
                        disabled={!endDate.from}
                        renderInput={(inputProps) => (
                            <TextField
                                size="medium"
                                error={false}
                                style={{ height: "30px !important", width: isOwner ? '180px' : undefined, maxWidth: "210px" }}
                                disabled={!endDate.from}
                                {...inputProps} />
                        )}
                        value={endDate.to}
                    />
                </Box>
                {!isOwner &&
                    <Box sx={{ px: 3, py: 1.5 }}>
                        <FormGroup sx={{ width: 'max-content' }}>
                            <FormControlLabel
                                control={<Checkbox size="small" checked={checked} onChange={handleIsPlanned} />}
                                label="Unplanned Reservations."
                            />
                        </FormGroup>
                    </Box>
                }
            </Box>
        </div>
    );
};

ReservationFilter.propTypes = {
    onChange: PropTypes.func,
};
