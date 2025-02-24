import { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Chip, Divider, Input, Typography } from "@mui/material";
import { useUpdateEffect } from "../../../hooks/use-update-effect";
import { Search as SearchIcon } from "../../../icons/search";
import { MultiSelect } from "../../multi-select";
import * as dayjs from 'dayjs';
import {
    STATUSES,
    DUE_STATUS,
} from "../../../utils/constants";
import { DatePicker } from '@mui/x-date-pickers';
import TextField from "@mui/material/TextField";

export const PmsrequestFilter = (props) => {
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
        ...other
    } = props;
    const [filterItems, setFilterItems] = useState([]);
    const [allElement, setAllElement] = useState([]);

    // const elementValues = useMemo(
    //     () =>
    //         filterItems
    //             .filter((filterItems) => filterItems.field === "name")
    //             .map((filterItems) => filterItems.value),
    //     [filterItems]
    // );


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

    useUpdateEffect(
        () => {
            const filters = {
                name: [],
                location: [],
                dueby: [],
                status: [],
            };

            filterItems.forEach((filterItem) => {
                switch (filterItem.field) {
                    case "name":
                        filters.name.push(filterItem.value);
                        break;
                    case "location":
                        filters.location.push(filterItem.value);
                        break;

                    case "dueby":
                        filters.dueby.push(filterItem.value);
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
                    const option = STATUSES.find((option) => option.value === value);
                    newFilterItems.push({
                        label: "Status",
                        field: "status",
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
                        p:1
                    }}
                >
                    <Input
                        disableUnderline
                        fullWidth
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        placeholder="Search by name"
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
                <Box sx={{ mt: 2, ml: 2 }}>
                    <MultiSelect
                        label="Due By"
                        onChange={handleDueAtChange}
                        options={DUE_STATUS}
                        value={dueAtValues}
                    />
                </Box>
                <Box >
                    <DatePicker
                        onChange={(newDate) => {

                            let start_date = dayjs(newDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
                            setStartDate(start_date)
                        }}
                        label="Start date"
                        renderInput={(inputProps) => (
                            <TextField
                                fullWidth
                                // style={{ height: "35px !important" }}
                                {...inputProps} />
                        )}
                        value={startDate}
                    />
                </Box>
                <Box sx={{ml:1}}>
                    <DatePicker
                        s
                        onChange={(newDate) => {
                            let end_date = dayjs(newDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
                            setEndDate(end_date)
                        }}
                        label="End date"
                        renderInput={(inputProps) => (
                            <TextField
                                fullWidth
                                // style={{ height: "35px !important" }}
                                {...inputProps} />
                        )}
                        value={endDate}
                    />
                </Box>
                <Box sx={{ mt: 2, ml: 2 }}>
                    <MultiSelect
                        label="Status"
                        onChange={handleStatusChange}
                        options={STATUSES}
                        value={statusValues}
                    />
                </Box>
            </Box>
        </div>
    );
};

PmsrequestFilter.propTypes = {
    onChange: PropTypes.func,
};
