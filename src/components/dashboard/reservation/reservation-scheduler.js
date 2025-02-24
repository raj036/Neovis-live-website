import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { useMemo } from 'react';
import moment from "moment"
import { useState } from 'react';
import { Box, Button } from '@mui/material';

function createData(name, code, population, size) {
    const density = population / size;
    return { name, code, population, size, density };
}

const rows = [
    createData('India', 'IN', 1324171354, 3287263),
    createData('China', 'CN', 1403500365, 9596961),
    createData('Italy', 'IT', 60483973, 301340),
    createData('United States', 'US', 327167434, 9833520),
    createData('Canada', 'CA', 37602103, 9984670),
    createData('Australia', 'AU', 25475400, 7692024),
    createData('Germany', 'DE', 83019200, 357578),
    createData('Ireland', 'IE', 4857000, 70273),
    createData('Mexico', 'MX', 126577691, 1972550),
    createData('Japan', 'JP', 126317000, 377973),
    createData('France', 'FR', 67022000, 640679),
    createData('United Kingdom', 'GB', 67545757, 242495),
    createData('Russia', 'RU', 146793744, 17098246),
    createData('Nigeria', 'NG', 200962417, 923768),
    createData('Brazil', 'BR', 210147125, 8515767),
];

const ReservationScheduler = ({ reservationEvents }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentDate, setCurrentDate] = useState(moment().format('YYYY-MM-DD'))
    console.log('currentDate', currentDate);
    const columns = useMemo(() => [
        { id: 'name', label: 'Units', minWidth: 170 },
        { id: 'day1', label: moment(currentDate).add(0, 'd').format('YYYY-MM-DD'), minWidth: 100 },
        { id: 'day2', label: moment(currentDate).add(1, 'd').format('YYYY-MM-DD'), minWidth: 100 },
        { id: 'day3', label: moment(currentDate).add(2, 'd').format('YYYY-MM-DD'), minWidth: 100 },
        { id: 'day4', label: moment(currentDate).add(3, 'd').format('YYYY-MM-DD'), minWidth: 100 },
        { id: 'day5', label: moment(currentDate).add(4, 'd').format('YYYY-MM-DD'), minWidth: 100 },
        { id: 'day6', label: moment(currentDate).add(5, 'd').format('YYYY-MM-DD'), minWidth: 100 },
        { id: 'day7', label: moment(currentDate).add(6, 'd').format('YYYY-MM-DD'), minWidth: 100 },
        // {
        //     id: 'population',
        //     label: 'Population',
        //     minWidth: 170,
        //     align: 'right',
        //     format: (value) => value.toLocaleString('en-US'),
        // },
        // {
        //     id: 'size',
        //     label: 'Size\u00a0(km\u00b2)',
        //     minWidth: 170,
        //     align: 'right',
        //     format: (value) => value.toLocaleString('en-US'),
        // },
        // {
        //     id: 'density',
        //     label: 'Density',
        //     minWidth: 170,
        //     align: 'right',
        //     format: (value) => value.toFixed(2),
        // },
    ], [setCurrentDate, currentDate])


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const tgroupedEvents = useMemo(() => {

    }, [reservationEvents])

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Button onClick={() => setCurrentDate(moment(currentDate).subtract(7, 'd').format('YYYY-MM-DD'))}>Prev Week</Button>
                <Button onClick={() => setCurrentDate(moment(currentDate).add(7, 'd').format('YYYY-MM-DD'))}>Next Week</Button>
            </Box>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    {column.format && typeof value === 'number'
                                                        ? column.format(value)
                                                        : value}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            {/* <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            /> */}
        </Paper>
    );
}

export default ReservationScheduler