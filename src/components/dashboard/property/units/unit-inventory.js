import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Box, Button, CircularProgress, FormControl, FormHelperText, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, Typography, colors } from '@mui/material'
import React, { useMemo } from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { QuillEditor } from "../../../quill-editor";
import { FileDropzone } from '../../../file-dropzone';
import { AREA_TYPES, STATUSES } from '../../../../utils/constants';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { PencilAlt as PencilAltIcon } from "../../../../icons/pencil-alt";

const UnitInventory = ({ inventoryFormik, item, expanded, index, handleInventoryChange, setSelectedInventory, selectedInventory, inventoryFiles,
    onDefaultImageChange,
    onDescriptionChange,
    onDrop, setDialogStat,
    onRemove, setIsDeleteInventory,
    onRemoveAll, updateInventoryLoading,
    inventoryDoc, onDocDrop,
    elementData, amenityData,
    productData, setCaegoryValue, categoryValue }) => {

    const disabled = useMemo(() => {
        if (selectedInventory) {
            return selectedInventory.id !== item.id
        } else {
            return true
        }
    }, [selectedInventory])

    const catValue = useMemo(() => {
        if (item?.cat_element_id && elementData !== undefined && elementData?.data) {
            const catElement = elementData?.data?.data?.find((elitem => elitem.id === item?.cat_element_id))
            return catElement
        } else if (item?.cat_amentity_id && amenityData !== undefined && amenityData?.data) {
            const catAmenity = amenityData?.data?.data?.find((amitem => amitem.id === item?.cat_amentity_id))
            return catAmenity
        } else if (item?.cat_product_id && productData !== undefined && productData?.data) {
            const catProduct = productData?.data?.data?.find((pditem => pditem.id === item?.cat_product_id))
            return catProduct
        }
    }, [item, elementData, amenityData, productData])

    // console.log('catValue', catValue, 'categoryValue', categoryValue);

    return (
        <Accordion expanded={expanded === `panel${index + 1}`} onChange={handleInventoryChange(`panel${index + 1}`)} sx={{ backgroundColor: colors.deepPurple['A200'], mb: 1, borderRadius: 2 }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#fafafa' }} />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
            >
                <Typography sx={{ width: '60%', flexShrink: 0, color: '#fafafa' }}>
                    {item?.name}
                </Typography>
                <Typography sx={{ width: '50%', color: 'text.secondary', color: '#fafafa' }}>{item?.code}</Typography>
                <Typography sx={{ width: '10%', color: 'text.secondary', color: '#fafafa' }}>{item?.quantity}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: '#fafafa' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', my: 2 }}>
                    <Tooltip title="edit" sx={{ mr: 2 }}>
                        <IconButton onClick={() => {
                            setCaegoryValue(null)
                            if (selectedInventory) {
                                if (selectedInventory.id !== item.id) {
                                    setSelectedInventory(item)
                                } else {
                                    setSelectedInventory(null)
                                }
                            } else {
                                setSelectedInventory(item)
                            }
                        }}>
                            <PencilAltIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="delete">
                        <IconButton onClick={() => {
                            console.log('item?.id', item?.id);
                            setIsDeleteInventory(item?.id)
                            setDialogStat(true)
                        }}>
                            <DeleteForeverIcon sx={{ color: 'red' }} />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Typography sx={{ width: '50%', flexShrink: 0 }}>
                        {item?.cat_element_id ? 'Element' : item?.cat_amentity_id ? 'Amenity' : item?.cat_product_id ? 'Product' : 'Category'}
                    </Typography>
                    <Autocomplete
                        options={item?.cat_element_id ?
                            elementData?.data?.data : item?.cat_amentity_id ? amenityData?.data?.data : item?.cat_product_id ? productData?.data?.data : []}
                        getOptionLabel={(option) =>
                            option.name ? option.name : ""
                        }
                        size="small"
                        sx={{ width: '50%' }}
                        value={categoryValue && !disabled ? categoryValue : catValue}
                        // disabled={disabled}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                // error={}
                                disabled={disabled}
                                fullWidth
                                required
                                // helperText={}
                                label={`Select ${item?.cat_element_id ? 'Element' : item?.cat_amentity_id ? 'Amenity' : item?.cat_product_id ? 'Product' : 'Category'}`}
                                placeholder={`Select ${item?.cat_element_id ? 'Element' : item?.cat_amentity_id ? 'Amenity' : item?.cat_product_id ? 'Product' : 'Category'}`}
                            />
                        )}
                        onChange={(event, newValue) => {
                            if (!disabled) {
                                console.log('select category', newValue);
                                setCaegoryValue(newValue);
                                if (item?.cat_element_id) {
                                    inventoryFormik.setFieldValue(
                                        "cat_element_id",
                                        newValue ? newValue.id : undefined
                                    );
                                    inventoryFormik.setFieldValue(
                                        "cat_amentity_id", null
                                    );
                                    inventoryFormik.setFieldValue(
                                        "cat_product_id", null
                                    );
                                } else if (item?.cat_amentity_id) {
                                    inventoryFormik.setFieldValue(
                                        "cat_amentity_id",
                                        newValue ? newValue.id : undefined
                                    );
                                    inventoryFormik.setFieldValue(
                                        "cat_element_id", null
                                    );
                                    inventoryFormik.setFieldValue(
                                        "cat_product_id", null
                                    );
                                } else if (item?.cat_product_id) {
                                    inventoryFormik.setFieldValue(
                                        "cat_product_id",
                                        newValue ? newValue.id : undefined
                                    );
                                    inventoryFormik.setFieldValue(
                                        "cat_element_id", null
                                    );
                                    inventoryFormik.setFieldValue(
                                        "cat_amentity_id", null
                                    );
                                }
                            }
                        }}
                    />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Typography sx={{ width: '50%', flexShrink: 0 }}>
                        Name
                    </Typography>
                    <TextField
                        error={Boolean(
                            inventoryFormik.touched.name && inventoryFormik.errors.name
                        )}
                        size="small"
                        sx={{ width: '50%' }}
                        helperText={
                            inventoryFormik.touched.name && inventoryFormik.errors.name
                        }
                        label="Inventory Name"
                        name="name"
                        onBlur={inventoryFormik.handleBlur}
                        onChange={inventoryFormik.handleChange}
                        required
                        value={selectedInventory && selectedInventory.id === item.id ? inventoryFormik.values.name : item?.name}
                        disabled={disabled}
                    />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Typography sx={{ width: '50%', flexShrink: 0 }}>
                        Code
                    </Typography>
                    <TextField
                        error={Boolean(
                            inventoryFormik.touched.code && inventoryFormik.errors.code
                        )}
                        size="small"
                        sx={{ width: '50%' }}
                        helperText={
                            inventoryFormik.touched.code && inventoryFormik.errors.code
                        }
                        label="Inventory code"
                        name="code"
                        onBlur={inventoryFormik.handleBlur}
                        onChange={inventoryFormik.handleChange}
                        required
                        value={selectedInventory && selectedInventory.id === item.id ? inventoryFormik.values.code : item?.code}
                        disabled={disabled}
                    />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                    <Typography sx={{ width: '50%', flexShrink: 0 }}>
                        Quantity
                    </Typography>
                    <TextField
                        type="number"
                        size="small"
                        label="Quantity"
                        sx={{ width: '50%' }}
                        required
                        error={Boolean(
                            inventoryFormik.touched.quantity && inventoryFormik.errors.quantity
                        )}
                        helperText={
                            inventoryFormik.touched.quantity && inventoryFormik.errors.quantity
                        }
                        name="quantity"
                        min={0}
                        onBlur={inventoryFormik.handleBlur}
                        onChange={inventoryFormik.handleChange}
                        value={selectedInventory && selectedInventory.id === item.id ? inventoryFormik.values.quantity : item?.quantity}
                        disabled={disabled}
                    />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                    <Typography sx={{ width: '50%', flexShrink: 0 }}>
                        Price
                    </Typography>
                    <TextField
                        type="number"
                        size="small"
                        label="Price"
                        sx={{ width: '50%' }}
                        required
                        error={Boolean(
                            inventoryFormik.touched.price && inventoryFormik.errors.price
                        )}
                        helperText={
                            inventoryFormik.touched.price && inventoryFormik.errors.price
                        }
                        name="price"
                        min={0}
                        onBlur={inventoryFormik.handleBlur}
                        onChange={inventoryFormik.handleChange}
                        value={selectedInventory && selectedInventory.id === item.id ? inventoryFormik.values.price : item?.price}
                        disabled={disabled}
                    />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                    <Typography sx={{ width: '50%', flexShrink: 0 }}>
                        Status
                    </Typography>
                    <FormControl sx={{ width: '50%' }}>
                        <InputLabel id="status">Status *</InputLabel>
                        <Select
                            error={Boolean(
                                inventoryFormik.touched.status && inventoryFormik.errors.status
                            )}
                            size="small"
                            helperText={inventoryFormik.touched.status && inventoryFormik.errors.status}
                            label="Status"
                            labelId="status"
                            name="status"
                            required
                            onBlur={inventoryFormik.handleBlur}
                            onChange={inventoryFormik.handleChange}
                            value={selectedInventory && selectedInventory.id === item.id ? inventoryFormik.values.status : item?.status}
                            disabled={disabled}
                        >
                            {STATUSES?.map((_status) => (
                                <MenuItem key={_status.value} value={_status.value}>
                                    {_status.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                    <Typography sx={{ width: '50%', flexShrink: 0 }}>
                        Area type
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel id="area_type">Area Type</InputLabel>
                        <Select
                            error={Boolean(
                                inventoryFormik.touched.area_type && inventoryFormik.errors.area_type
                            )}
                            helperText={
                                inventoryFormik.touched.area_type && inventoryFormik.errors.area_type
                            }
                            size="small"
                            label="Area Type"
                            labelId="area_type"
                            name="area_type"
                            // required
                            onBlur={inventoryFormik.handleBlur}
                            onChange={inventoryFormik.handleChange}
                            value={selectedInventory && selectedInventory.id === item.id ? inventoryFormik.values.area_type : item?.area_type}
                            disabled={disabled}
                            MenuProps={{ PaperProps: { sx: { maxHeight: 195 } } }}
                        >
                            {AREA_TYPES?.map((_area) => (
                                <MenuItem key={_area.value} value={_area.value}>
                                    {_area.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                    <Typography sx={{ width: '50%', flexShrink: 0 }}>
                        Description
                    </Typography>
                    <QuillEditor
                        onChange={(value) => {
                            inventoryFormik.setFieldValue("description", value);
                        }}
                        placeholder="Enter inventory description"
                        sx={{ height: 200 }}
                        value={selectedInventory && selectedInventory.id === item.id ? inventoryFormik.values.description : item?.description}
                        disabled={disabled}
                    />
                    {Boolean(
                        inventoryFormik.touched.description && inventoryFormik.errors.description
                    ) && (
                            <Box sx={{ mt: 2 }}>
                                <FormHelperText error>
                                    {inventoryFormik.errors.description}
                                </FormHelperText>
                            </Box>
                        )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                    <Typography sx={{ width: '50%', flexShrink: 0 }}>
                        Comment
                    </Typography>
                    <QuillEditor
                        onChange={(value) => {
                            inventoryFormik.setFieldValue("comment", value);
                        }}
                        placeholder="Enter inventory comment"
                        sx={{ height: 200 }}
                        value={selectedInventory && selectedInventory.id === item.id ? inventoryFormik.values.comment : item?.comment}
                        disabled={disabled}
                    />
                    {Boolean(
                        inventoryFormik.touched.comment && inventoryFormik.errors.comment
                    ) && (
                            <Box sx={{ mt: 2 }}>
                                <FormHelperText error>
                                    {inventoryFormik.errors.comment}
                                </FormHelperText>
                            </Box>
                        )}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                    <Typography
                        // color="textSecondary"
                        variant="body2"
                        sx={{ mr: 2 }}
                    >
                        Image
                    </Typography>
                    <FileDropzone
                        accept={{
                            "image/*": [],
                        }}
                        files={selectedInventory && selectedInventory.id === item.id ? inventoryFiles : item?.images}
                        onDefaultImageChange={onDefaultImageChange}
                        onDescriptionChange={onDescriptionChange}
                        onDrop={onDrop}
                        onRemove={onRemove}
                        onRemoveAll={onRemoveAll}
                        disabled={disabled}
                    />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 2 }}>
                    <Typography
                        color="textSecondary"
                        variant="body2"
                        sx={{ mr: 4 }}
                    >
                        Doc
                    </Typography>
                    <FileDropzone
                        accept={{
                            "application/*": [],
                        }}
                        files={selectedInventory && selectedInventory.id === item.id ? inventoryDoc : [{ url: item?.doc_url }]}
                        onDefaultImageChange={onDefaultImageChange}
                        onDescriptionChange={onDescriptionChange}
                        onDrop={onDocDrop}
                        onRemove={onRemove}
                        onRemoveAll={onRemoveAll}
                        maxFiles={1}
                        disabled={disabled}
                    />
                </Box>

                <Button
                    sx={{ mt: 2, ml: "auto", minWidth: "100px" }}
                    // type="submit"
                    variant="contained"
                    onClick={inventoryFormik.handleSubmit}
                    disabled={disabled}
                >
                    {updateInventoryLoading ? (
                        <CircularProgress style={{ color: "white" }} size={26} />
                    ) : 'Update inventory'
                    }
                </Button>
            </AccordionDetails>
        </Accordion>
    )
}

export default UnitInventory