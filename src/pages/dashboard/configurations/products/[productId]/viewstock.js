import React, { useEffect, useState } from 'react'
import { Fragment } from "react";
import PropTypes from "prop-types";
import {
    Box,
    Card,
    Container,
    Divider,
    Link,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from "@mui/material";
import NextLink from "next/link";
import { Image as ImageIcon } from "../../../../../icons/image";
import { useRouter } from "next/router";
import { useQuery } from 'react-query';
import { AuthGuard } from '../../../../../components/authentication/auth-guard';
import { DashboardLayout } from '../../../../../components/dashboard/dashboard-layout';
import Head from 'next/head';
import { Scrollbar } from '../../../../../components/scrollbar';
import { SeverityPill } from '../../../../../components/severity-pill';
import useAxios from '../../../../../services/useAxios';
import { BackButton } from '../../../../../components/dashboard/back-button';
import { ElementStockFilter } from '../../../../../components/dashboard/configuration/element/element-stock-filters';

const ProductViewstock = () => {

    const router = useRouter()
    const customInstance = useAxios();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
    };


    const [productId, setproductId] = useState();
    const [productStocks, setproductsStocks] = useState([])
    const [filterproductsStocks, setFilterproductsStocks] = useState([])
    const [units, setunits] = useState([])
    const [properties, setProperties] = useState([])
    const [unitTypes, setUnitTypes] = useState([]);
    const [isEmptyFilter, setIsEmptyFilter] = useState(false)
    const [search, setSearch] = useState("");

    const { data: products, isLoading, isFetching } = useQuery(
        ["productById", productId],
        () => customInstance.get(`products/${productId}`),
        { enabled: productId !== undefined }
    );

    useEffect(() => {
        if (router) {
            if (router.query.productId) {
                setproductId(router.query.productId);
            }
        }
    }, [router]);

    useEffect(() => {
        if (products !== undefined && products.data && products.data.inventories && products.data.inventories.length > 0) {
            setproductsStocks(products.data.inventories)
            let units = products.data.inventories.map(item => item.unit)
            units = [...new Set(units.map((ut) => ut.id))].map(
                (id) => units.find((ut) => ut.id === id));
            setunits(units)
            if (Array.isArray(units) && units.length > 0) {
                let properties = units.map((item => item.property))
                properties = [...new Set(properties.map((ut) => ut.id))].map(
                    (id) => properties.find((ut) => ut.id === id));
                setProperties(properties)

                let unit_types = units.map((item => item.unit_type))
                unit_types = [...new Set(unit_types.map((ut) => ut.id))].map(
                    (id) => unit_types.find((ut) => ut.id === id));
                setUnitTypes(unit_types)
            }
        }
    }, [products])

    const handleFiltersChange = (filterSelection) => {
        console.log('filterSelection', filterSelection);
        const isEmptyFilter = Object.values(filterSelection).every(item => item.length === 0)
        if (isEmptyFilter) {
            setIsEmptyFilter(true)
            setFilterproductsStocks([])
            return
        }
        let unitFilters = []
        let propertyFilters = []
        let unitTypeFilters = []
        let statusFilter = []

        if (filterSelection?.units?.length > 0) {
            let stocks = [...productStocks]
            stocks = stocks.filter(item => filterSelection.units.includes(item.unit.unit_name))
            unitFilters = stocks
        }

        if (filterSelection?.unitTypes?.length > 0) {
            let stocks = [...productStocks]
            stocks = stocks.filter(item => filterSelection.unitTypes.includes(item.unit.unit_type.unit_type_name))
            unitTypeFilters = stocks
        }

        if (filterSelection?.properties?.length > 0) {
            let stocks = [...productStocks]
            stocks = stocks.filter(item => filterSelection.properties.includes(item.unit.property.property_name))
            propertyFilters = stocks
        }

        if (filterSelection?.status?.length > 0) {
            let stocks = [...productStocks]
            stocks = stocks.filter(item => filterSelection.status.includes(item.status))
            statusFilter = stocks
        }
        let updatesFilter = [...unitFilters, ...unitTypeFilters, ...propertyFilters, ...statusFilter]
        updatesFilter = [...new Set(updatesFilter.map((ut) => ut.id))].map(
            (id) => updatesFilter.find((ut) => ut.id === id))
        setFilterproductsStocks(updatesFilter)
        setIsEmptyFilter(false)
    };

    const handleSearchChange = (event) => {
        event.preventDefault();
    };

    return (
        <AuthGuard>
            <DashboardLayout isLoading={isLoading || isFetching}>
                <Head>
                    <title>Dashboard: product Stock</title>
                </Head>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        py: 8,
                    }}
                >
                    <Container maxWidth="xl">
                        <BackButton
                            path={`/dashboard/configurations/products`}
                            as="/dashboard/configurations/products"
                            title="Product"
                        />
                        {products !== undefined &&
                            <Box sx={{ my: 2 }}>
                                <Box
                                    sx={{
                                        alignItems: "center",
                                        display: "flex",
                                    }}
                                >
                                    {products.data?.photo ? (
                                        <Box
                                            sx={{
                                                alignItems: "center",
                                                backgroundColor: "background.default",
                                                backgroundImage: `url("${products.data?.photo}")`,
                                                backgroundPosition: "center",
                                                backgroundSize: "cover",
                                                borderRadius: 1,
                                                display: "flex",
                                                minHeight: 80,
                                                justifyContent: "center",
                                                overflow: "hidden",
                                                minWidth: 80,
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                alignItems: "center",
                                                backgroundColor: "background.default",
                                                borderRadius: 1,
                                                display: "flex",
                                                height: 80,
                                                justifyContent: "center",
                                                width: 80,
                                            }}
                                        >
                                            <ImageIcon fontSize="small" />
                                        </Box>
                                    )}
                                    <Box
                                        sx={{
                                            cursor: "pointer",
                                            ml: 2,
                                        }}
                                    >
                                        <Link
                                            color="inherit"
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: "0.875rem",
                                                color: "black",
                                            }}
                                        >
                                            {products.data?.name}
                                        </Link>
                                    </Box>
                                </Box>
                            </Box>
                        }
                        <Card>
                            <Card>
                                <ElementStockFilter
                                    onChange={handleFiltersChange}
                                    handleSearchChange={handleSearchChange}
                                    setSearch={setSearch}
                                    units={units.map((item => ({ label: item.unit_name, value: item.unit_name })))}
                                    properties={properties.map((item => ({ label: item.property_name, value: item.property_name })))}
                                    unitTypes={unitTypes.map((item => ({ label: item.unit_type_name, value: item.unit_type_name })))}
                                />
                            </Card>
                            <Divider />
                            <Scrollbar>
                                <Table sx={{ minWidth: 1200 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell width="30%">Name</TableCell>
                                            <TableCell>Code</TableCell>
                                            <TableCell>Unit</TableCell>
                                            <TableCell>Property</TableCell>
                                            <TableCell>Unit Type</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Quantity</TableCell>
                                            <TableCell>Price</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    {!isEmptyFilter && filterproductsStocks.length > 0 ? <TableBody>
                                        {filterproductsStocks.map((inventory) =>
                                            <Fragment key={inventory?.id}>
                                                <TableRow hover>
                                                    <TableCell width="30%">
                                                        <Box
                                                            sx={{
                                                                alignItems: "center",
                                                                display: "flex",
                                                            }}
                                                        >
                                                            {inventory?.image_url ? (
                                                                <Box
                                                                    sx={{
                                                                        alignItems: "center",
                                                                        backgroundColor: "background.default",
                                                                        backgroundImage: `url("${inventory?.image_url}")`,
                                                                        backgroundPosition: "center",
                                                                        backgroundSize: "cover",
                                                                        borderRadius: 1,
                                                                        display: "flex",
                                                                        minHeight: 80,
                                                                        justifyContent: "center",
                                                                        overflow: "hidden",
                                                                        minWidth: 80,
                                                                        objectFit: "cover",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Box
                                                                    sx={{
                                                                        alignItems: "center",
                                                                        backgroundColor: "background.default",
                                                                        borderRadius: 1,
                                                                        display: "flex",
                                                                        height: 80,
                                                                        justifyContent: "center",
                                                                        width: 80,
                                                                    }}
                                                                >
                                                                    <ImageIcon fontSize="small" />
                                                                </Box>
                                                            )}
                                                            <Box
                                                                sx={{
                                                                    cursor: "pointer",
                                                                    ml: 2,
                                                                }}
                                                            >
                                                                <Link
                                                                    color="inherit"
                                                                    variant="subtitle2"
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        fontSize: "0.875rem",
                                                                        color: "black",
                                                                    }}
                                                                >
                                                                    {inventory?.name}
                                                                </Link>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{inventory?.code}</TableCell>
                                                    <TableCell>{inventory?.unit?.unit_name}</TableCell>
                                                    <TableCell>{inventory?.unit?.property?.property_name}</TableCell>
                                                    <TableCell>{inventory?.unit?.unit_type?.unit_type_name}</TableCell>
                                                    <TableCell>
                                                        <SeverityPill
                                                            color={
                                                                inventory?.status === "Active" ? "success" : "warning"
                                                            }
                                                        >
                                                            {inventory?.status}
                                                        </SeverityPill>
                                                    </TableCell>
                                                    <TableCell>{inventory?.quantity}</TableCell>
                                                    <TableCell>{inventory?.price}</TableCell>
                                                </TableRow>
                                            </Fragment>

                                        )}
                                    </TableBody> : productStocks.length > 0 &&
                                    <TableBody>
                                        {productStocks.map((inventory) =>
                                            <Fragment key={inventory?.id}>
                                                <TableRow hover>
                                                    <TableCell width="30%">
                                                        <Box
                                                            sx={{
                                                                alignItems: "center",
                                                                display: "flex",
                                                            }}
                                                        >
                                                            {inventory?.image_url ? (
                                                                <Box
                                                                    sx={{
                                                                        alignItems: "center",
                                                                        backgroundColor: "background.default",
                                                                        backgroundImage: `url("${inventory?.image_url}")`,
                                                                        backgroundPosition: "center",
                                                                        backgroundSize: "cover",
                                                                        borderRadius: 1,
                                                                        display: "flex",
                                                                        minHeight: 80,
                                                                        justifyContent: "center",
                                                                        overflow: "hidden",
                                                                        minWidth: 80,
                                                                        objectFit: "cover",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Box
                                                                    sx={{
                                                                        alignItems: "center",
                                                                        backgroundColor: "background.default",
                                                                        borderRadius: 1,
                                                                        display: "flex",
                                                                        height: 80,
                                                                        justifyContent: "center",
                                                                        width: 80,
                                                                    }}
                                                                >
                                                                    <ImageIcon fontSize="small" />
                                                                </Box>
                                                            )}
                                                            <Box
                                                                sx={{
                                                                    cursor: "pointer",
                                                                    ml: 2,
                                                                }}
                                                            >
                                                                <Link
                                                                    color="inherit"
                                                                    variant="subtitle2"
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        fontSize: "0.875rem",
                                                                        color: "black",
                                                                    }}
                                                                >
                                                                    {inventory?.name}
                                                                </Link>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{inventory?.code}</TableCell>
                                                    <TableCell>{inventory?.unit?.unit_name}</TableCell>
                                                    <TableCell>{inventory?.unit?.property?.property_name}</TableCell>
                                                    <TableCell>{inventory?.unit?.unit_type?.unit_type_name}</TableCell>
                                                    <TableCell>
                                                        <SeverityPill
                                                            color={
                                                                inventory?.status === "Active" ? "success" : "warning"
                                                            }
                                                        >
                                                            {inventory?.status}
                                                        </SeverityPill>
                                                    </TableCell>
                                                    <TableCell>{inventory?.quantity}</TableCell>
                                                    <TableCell>{inventory?.price}</TableCell>
                                                </TableRow>
                                            </Fragment>

                                        )}
                                    </TableBody>
                                    }
                                </Table>
                                {isEmptyFilter && productStocks.length === 0 &&
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', mt: 2 }}>
                                        <Typography variant='h6'>No inventory found</Typography>
                                    </Box>
                                }
                            </Scrollbar>
                            {products !== undefined && products.data && products.data.inventories && products.data.inventories.length > 0 &&
                                <TablePagination
                                    component="div"
                                    count={filterproductsStocks.length > 0 ? filterproductsStocks.length : products.data.inventories.length}
                                    onPageChange={handlePageChange}
                                    onRowsPerPageChange={handleRowsPerPageChange}
                                    page={page}
                                    rowsPerPage={rowsPerPage}
                                    rowsPerPageOptions={[5, 10, 25]}
                                />
                            }
                        </Card>
                    </Container>
                </Box>
            </DashboardLayout>
        </AuthGuard>
    )
}

export default ProductViewstock

