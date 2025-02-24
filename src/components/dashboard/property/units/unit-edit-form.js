import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { uuid } from "uuidv4";
import * as Yup from "yup";

import CloseIcon from "@mui/icons-material/Close";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import {
	Autocomplete,
	Box,
	Button,
	CardContent,
	CircularProgress,
	FormControl,
	FormControlLabel,
	FormGroup,
	FormHelperText,
	Grid,
	IconButton,
	InputLabel,
	List,
	ListItem,
	MenuItem,
	Modal,
	Select,
	Switch,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import Tab from "@mui/material/Tab";
import { GoogleMap, Marker } from "@react-google-maps/api";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import Geocode from "react-geocode";
import PlacesAutocomplete, {
	geocodeByAddress,
	getLatLng,
} from "react-places-autocomplete";
import { useMutation, useQuery, useQueryClient } from "react-query";
import useAxios from "../../../../services/useAxios";
import {
	AREA_TYPES,
	GOOGLE_MAPS_APIKEY,
	INVENTORY_CATEGORIES,
	STATUSES,
	UNIT_CONDITIONS,
} from "../../../../utils/constants";
import {
	deleteFirebaseImage,
	uploadFirebaseImage,
} from "../../../../utils/helper";
import { FileDropzone } from "../../../file-dropzone";
import { Logo } from "../../../logo";
import { QuillEditor } from "../../../quill-editor";
import { ConfirmDialog } from "../../confim-dialog";
import { CostTable } from "./cost-table";
import { CustomizableImageList } from "./customizable-image-list";
import {
	MainContainer,
	StyledCard,
	StyledPopup,
	ViewQrButton,
} from "./styled-components";
import { TransformedInput } from "./transformed-input";
import UnitInventory from "./unit-inventory";
import { tabsData } from "./units.util";

Geocode.setApiKey(GOOGLE_MAPS_APIKEY);

export const UnitEditForm = (props) => {
	const router = useRouter();
	const [files, setFiles] = useState([]);
	const [inventoryFiles, setInventoryFiles] = useState([]);
	const [inventoryDoc, setInventoryDoc] = useState([]);
	const [isDisabled, setIsDisabled] = useState(true);
	const [dialogStat, setDialogStat] = useState(false);
	const [dialogInventoryStat, setDialogInventoryStat] = useState(false);
	const [loading, setLoading] = useState();
	const [selProperty, setSelProprty] = useState();
	const [selUnittype, setSelUnittype] = useState();
	const [unitId, setUnitId] = useState();
	const [place, setPlace] = useState("");
	const [tab, setTab] = useState("1");
	const [inventoryFormVisible, setInventoryFormVisible] = useState(false);
	// const [dateRangeCount, setDateRangeCount] = useState([]);

	const { unit, setIsLoading } = props;

	const [location, setLocation] = useState({
		lat: 43.65107,
		lng: -79.347015,
	});

	const customInstance = useAxios();
	const queryClient = useQueryClient();

	const { data: properties } = useQuery("allProperty", () =>
		customInstance.get(`properties`)
	);

	const { data: elementData, isLoading: isElementLoading } = useQuery(
		"allElementList",
		() => customInstance.get(`elements`)
	);

	const { data: amenityData, isLoading: isAmenityLoading } = useQuery(
		"allAmenities",
		() => customInstance.get(`amentities`)
	);

	const { data: productData, isLoading: isProductLoading } = useQuery(
		"allproductList",
		() => customInstance.get(`products`)
	);

	const { data: unittypes, refetch: unittypeRefetch } = useQuery(
		"unitTypesOnProperty",
		() => customInstance.get(`unit-types/property/${selProperty?.id}`),
		{ enabled: selProperty?.id !== undefined }
	);

	const { mutateAsync: addUnit } = useMutation((data) =>
		customInstance.post(`units`, data)
	);

	const { mutateAsync: updateUnit } = useMutation((data) => {
		customInstance.patch(`units/${data?.id}`, data);
	});

	const { mutateAsync: deleteUnit } = useMutation((data) => {
		customInstance.delete(`units/${data?.id}`);
	});

	const { data: countries } = useQuery("countries", () =>
		customInstance.get(`countries`)
	);

	const { mutateAsync: addInventory, isLoading: addInventoryLoading } =
		useMutation((data) => customInstance.post(`inventory`, data));

	const { mutateAsync: updateInventory } = useMutation((data) => {
		customInstance.patch(`inventory/${data?.id}`, data);
	});

	const { mutateAsync: deleteInventory } = useMutation((id) => {
		customInstance.delete(`inventory/${id}`);
	});

	const formik = useFormik({
		initialValues: {
			unit_name: "",
			unit_code: "",
			pms_id: null,
			description: "",
			unit_condition: "",
			address_same_as_property: false,
			images_same_as_unittype: false,
			address: "",
			main_image: "",
			images: [],
			country_code: 0,
			province: "",
			city: "",
			zip_code: "",
			latitude: 0,
			longitude: 0,
			status: "Active",
			unit_type_id: 0,
			property_id: 0,
			dateRanges: [],
			// isPermonth: false,
			// cost: 0,
			// start_date: '',
			// end_date: ''
		},
		validationSchema: Yup.object({
			property_id: Yup.string().required(),
			unit_type_id: Yup.string().required(),
			unit_code: Yup.string().max(15),
			pms_id: Yup.number().nullable(true),
			unit_name: Yup.string().max(50),
			description: Yup.string().max(5000),
			address: Yup.string().max(100).required(),
			zip_code: Yup.number()
				.max(99999, "Invalid Zip")
				.min(10000, "Invalid Zip"),
			city: Yup.string()
				.max(30)
				.required()
				.matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for this field "),
			province: Yup.string()
				.max(30)
				.required()
				.matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for this field "),
		}),
		onSubmit: async (values, helpers) => {
			try {
				setLoading(true);
				if (unit) {
					let data = { ...values, id: unitId };
					let images = await uploadImages();
					delete data.property;
					delete data.unit_type;
					await updateUnit({ ...data, images: images });

					await queryClient.refetchQueries(["unitById", unit.id?.toString()], {
						active: true,
						exact: true,
					});
				} else {
					let images = await uploadImages();
					await addUnit({ ...values, images: images });
					formik.resetForm();
				}
				setLoading(false);
				helpers.setStatus({ success: true });
				helpers.setSubmitting(false);
				toast.success(
					unit ? "Unit updated successfully!" : "Unit added successfully!"
				);
				router.push("/dashboard/properties/units");
			} catch (err) {
				console.error(err);
				setLoading(false);
				toast.error("Something went wrong!");
				helpers.setStatus({ success: false });
				helpers.setErrors({ submit: err.message });
				helpers.setSubmitting(false);
			}
		},
	});

	// qr-code feature ===========

	const opts = {
		errorCorrectionLevel: "H",
		type: "image/jpeg",
		quality: 1,
		margin: 1,
		color: {
			dark: "#424242",
			light: "#fff",
		},
	};
	const [assetQrData, setAssetQrData] = useState([]);
	const downloadQrCode = async () => {
		if (props.unit !== undefined) {
			const data = [props.unit];
			if (data.length > 0) {
				const qrLinks = data.map((item) =>
					QRCode.toDataURL(`https://dev.neovis.io/scan_unit/${item.id}`, opts)
				);
				try {
					const values = await Promise.all(qrLinks);
					console.log("qr values", values);
					setAssetQrData(values);
				} catch (error) {
					console.log(error);
				}
			}
		}
	};

	const qrRef = useRef([]);
	useEffect(() => {
		if (props.unit !== undefined) {
			const data = [props.unit];
			qrRef.current = qrRef.current.slice(0, data.length);
		}
	}, [props.unit]);

	const handleQrCodePrint = () => {
		if (props.unit !== undefined) {
			const data = [props.unit];
			if (qrRef.current.length === 0) {
				return;
			}
			try {
				qrRef.current.forEach(async (item, i) => {
					console.log("qr item", item);
					const canvas = await html2canvas(item),
						img = canvas.toDataURL("image/jpeg"),
						link = document.createElement("a");
					link.href = img;
					link.download = `unit.jpeg`;
					data.forEach((dt, idx) => {
						if (idx === i) {
							link.download = `${dt.unit_name}.jpeg`;
						}
					});
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				});
			} catch (error) {
				console.log(error);
			}
		}
	};
	// =================

	const [selCategory, setSelCategory] = useState(null);
	const [updateInventoryLoading, setUpdateInventoryLoading] = useState(false);
	const inventoryFormik = useFormik({
		initialValues: {
			name: "",
			code: "",
			description: "",
			quantity: 0,
			price: 0.0,
			video_url: "",
			doc_url: "",
			comment: "",
			images: [],
			status: "Active",
			cat_element_id: null,
			cat_amentity_id: null,
			cat_product_id: null,
			category: "Element",
			area_type: "",
		},
		validationSchema: Yup.object({
			cat_element_id: Yup.number().nullable(true),
			cat_amentity_id: Yup.number().nullable(true),
			cat_product_id: Yup.number().nullable(true),
			video_url: Yup.string(),
			doc_url: Yup.string(),
			comment: Yup.string(),
			code: Yup.string().max(15),
			quantity: Yup.number().nullable(true),
			name: Yup.string().max(50),
			description: Yup.string().max(5000),
		}),
		onSubmit: async (values, helpers) => {
			try {
				console.log("inventories values", values);
				if (unit) {
					const data = { ...values, unit_id: unit?.id };
					if (data.quantity < 0 || data.quantity % 1 !== 0) {
						toast.error("Quantity must be proper value");
						return;
					}
					if (data.price < 0) {
						toast.error("Price must be proper value");
						return;
					}
					if (
						!data.cat_element_id &&
						!data.cat_amentity_id &&
						!data.cat_product_id
					) {
						toast.error("Please select a category");
						return;
					}

					if (selectedInventory) {
						setUpdateInventoryLoading(true);
						let images = await uploadInventoryImages();
						let docUrl = await uploadInventoryDoc();
						if (data.unit) {
							delete data.unit;
						}
						console.log("update payload", { ...data, images });
						await updateInventory({
							...data,
							images,
							doc_url:
								docUrl.length > 0 ? docUrl[0] : selectedInventory.doc_url,
						});
						setSelectedInventory(null);
						setTimeout(() => {
							setUpdateInventoryLoading(false);
							setExpanded(false);
						}, 2000);
					} else {
						setUpdateInventoryLoading(true);
						let images = await uploadInventoryImages();
						let docUrl = await uploadInventoryDoc();
						await addInventory({
							...data,
							images,
							doc_url: docUrl.length > 0 ? docUrl[0] : "",
						});
						setInventoryFiles([]);
						setInventoryDoc([]);
						setInventoryFormVisible(false);
						setUpdateInventoryLoading(false);
						toast.success("Inventory added successfully");
					}
					inventoryFormik.resetForm();
					await queryClient.refetchQueries(["unitById", unit.id?.toString()], {
						active: true,
						exact: true,
					});
				}
			} catch (err) {
				console.error(err);
				setLoading(false);
				setUpdateInventoryLoading(false);
				toast.error("Something went wrong!");
				helpers.setStatus({ success: false });
				helpers.setErrors({ submit: err.message });
				helpers.setSubmitting(false);
			}
		},
	});

	const [categoryValue, setCaegoryValue] = useState(null);
	console.log(
		"categoryValue",
		categoryValue,
		"formik values",
		inventoryFormik.values.cat_element_id
	);
	useEffect(() => {
		if (
			selCategory &&
			inventoryFormik.values.category === "Element" &&
			elementData !== undefined
		) {
			setCaegoryValue(
				elementData?.data?.data?.find((_) => _.id === selCategory?.id)
			);
		} else if (
			selCategory &&
			inventoryFormik.values.category === "Amenity" &&
			amenityData !== undefined
		) {
			setCaegoryValue(
				amenityData?.data?.data?.find((_) => _.id === selCategory?.id)
			);
		} else if (
			selCategory &&
			inventoryFormik.values.category === "Product" &&
			productData !== undefined
		) {
			setCaegoryValue(
				productData?.data?.data?.find((_) => _.id === selCategory?.id)
			);
		}
	}, [
		selCategory,
		inventoryFormik.values.category,
		elementData,
		amenityData,
		productData,
	]);

	const uploadInventoryImages = async () => {
		let imagesUri = inventoryFiles?.filter((_) => !_.updated && !_.deleted);

		await Promise.all(
			inventoryFiles
				?.filter((_) => _.updated || _.deleted)
				?.map(
					(file) =>
						new Promise(async (resolve) => {
							if (file.deleted) {
								await deleteFirebaseImage("inventory", file.url);
								resolve();
							} else {
								const uri = await uploadFirebaseImage("inventory", file);
								imagesUri.push({
									url: uri,
									description: file.description,
									default: file.default ? true : false,
								});
								resolve();
							}
						})
				)
		);
		return imagesUri;
	};

	const uploadInventoryDoc = async () => {
		let imagesUri = [];

		await Promise.all(
			inventoryDoc
				?.filter((_) => _._file)
				?.map(
					(file) =>
						new Promise(async (resolve) => {
							if (file.deleted) {
								await deleteFirebaseImage("inventory", file.url);
								resolve();
							} else {
								const uri = await uploadFirebaseImage("inventory", file);
								imagesUri.push(uri);
								resolve();
							}
						})
				)
		);
		return imagesUri;
	};

	const handleInventoryDrop = async (newFiles) => {
		let imgData = [...inventoryFiles];
		await Promise.all(
			newFiles?.map(
				(_file) =>
					new Promise((resolve, reject) => {
						const reader = new FileReader();
						reader.readAsDataURL(_file);
						reader.onload = () => {
							imgData.push({
								url: reader.result,
								_file: _file,
								updated: true,
							});
							resolve(reader.result);
						};
						reader.onerror = (error) => reject(error);
					})
			)
		);
		setInventoryFiles(imgData);
	};

	const handleInventoryDocDrop = async (newDoc) => {
		// console.log('doc file drop', newDoc);
		let docData = newDoc?.map((_file) => ({
			_file: _file,
			updated: true,
		}));
		// console.log('docData', docData);
		setInventoryDoc(docData);
	};

	const handleInventoryRemove = (url) => {
		let data = [...inventoryFiles];

		const idx = data?.findIndex((_) => _.url === url);

		if (idx >= 0) {
			if (data[idx].updated) {
				data.splice(idx, 1);
				setInventoryFiles(data);
			} else {
				data[idx].deleted = true;
				setInventoryFiles(data);
			}
		}
	};

	const onDefaultInventoryImageChange = (url, isDefault) => {
		let data = url
			? inventoryFiles?.map((_) => {
					delete _.default;
					return _;
			  })
			: [...inventoryFiles];
		const idx = data?.findIndex((_) => _.url === url);
		if (idx >= 0) {
			data[idx].default = isDefault;
		}

		setInventoryFiles(data);
	};

	const onInventoryDescriptionChange = (url, description) => {
		let data = [...inventoryFiles];
		const idx = data?.findIndex((_) => _.url === url);
		if (idx >= 0) {
			data[idx].description = description;
		}

		setInventoryFiles(data);
	};

	const handleInventoryRemoveAll = () => {
		let data = [...inventoryFiles];

		data.forEach((_, index) => {
			if (_.updated) {
				data.splice(index, 1);
			} else {
				_.deleted = true;
			}
		});

		setInventoryFiles(data);
	};

	const onConfirmDialog = async () => {
		try {
			setDialogStat(false);
			await deleteUnit({ id: unitId });
			toast.success("Unit deleted successfully!");
			router.push("/dashboard/properties/units");
		} catch (e) {
			setDialogStat(false);
			toast.error("Something went wrong!");
		}
	};

	const [isDeleteInventory, setIsDeleteInventory] = useState(null);

	const onConfirmInventoryDialog = useCallback(async () => {
		try {
			if (isDeleteInventory) {
				await deleteInventory(isDeleteInventory);
				setIsDeleteInventory(null);
				setDialogInventoryStat(false);
				toast.success("Inventory deleted successfully!");
				setTimeout(() => {
					setExpanded(false);
				}, 500);
				await queryClient.refetchQueries(["unitById", unit.id?.toString()], {
					active: true,
					exact: true,
				});
			}
		} catch (e) {
			setDialogInventoryStat(false);
			toast.error("Something went wrong!");
		}
	}, [isDeleteInventory]);

	const handleChange = (address) => setPlace(address);

	const handleSelect = async (address) => {
		setPlace(address);
		const results = await geocodeByAddress(address);
		const geo = await getLatLng(results[0]);
		setLocation(geo);
		formik.setFieldValue("latitude", geo.lat);
		formik.setFieldValue("longitude", geo.lng);
	};

	const populatePlace = async (lat, lng) => {
		const { results } = await Geocode.fromLatLng(lat, lng);
		setPlace(results[0].formatted_address);
	};

	const onLocationChange = async (e) => {
		setLocation(e.latLng.toJSON());
		formik.setFieldValue("latitude", e.latLng.toJSON().lat);
		formik.setFieldValue("longitude", e.latLng.toJSON().lng);
		const { lat, lng } = e.latLng.toJSON();
		populatePlace(lat, lng);
	};

	useEffect(() => {
		if (selProperty?.id) {
			unittypeRefetch();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selProperty, unittypeRefetch]);

	const uploadImages = async () => {
		let imagesUri = files?.filter((_) => !_.updated && !_.deleted);

		await Promise.all(
			files
				?.filter((_) => _.updated || _.deleted)
				?.map(
					(file) =>
						new Promise(async (resolve) => {
							if (file.deleted) {
								await deleteFirebaseImage("unittype", file.url);
								resolve();
							} else {
								const uri = await uploadFirebaseImage("unittype", file);
								imagesUri.push({
									url: uri,
									description: file.description,
									default: file.default ? true : false,
									isTaskImage: file.isTaskImage ? true : false,
									isTaskRoomImage: file.isTaskRoomImage ? true : false,
								});
								resolve();
							}
						})
				)
		);
		return imagesUri;
	};

	const handleDrop = async (newFiles) => {
		if (!formik.values.images_same_as_unittype) {
			let imgData = [...files];
			await Promise.all(
				newFiles?.map(
					(_file) =>
						new Promise((resolve, reject) => {
							const reader = new FileReader();
							reader.readAsDataURL(_file);
							reader.onload = () => {
								imgData.push({
									url: reader.result,
									_file: _file,
									updated: true,
								});
								resolve(reader.result);
							};
							reader.onerror = (error) => reject(error);
						})
				)
			);
			setFiles(imgData);
		}
	};

	const handleRemove = (url) => {
		let data = [...files];

		const idx = data?.findIndex((_) => _.url === url);

		if (idx >= 0) {
			if (data[idx].updated) {
				data.splice(idx, 1);
				setFiles(data);
			} else {
				data[idx].deleted = true;
				setFiles(data);
			}
		}
	};

	const onDefaultImageChange = (url, isDefault) => {
		let data = url
			? files?.map((_) => {
					delete _.default;
					return _;
			  })
			: [...files];
		const idx = data?.findIndex((_) => _.url === url);
		if (idx >= 0) {
			data[idx].default = isDefault;
		}

		setFiles(data);
	};

	const onTaskImageChange = (url, isTaskImage) => {
		let data = url
			? files?.map((_) => {
					delete _.isTaskImage;
					return _;
			  })
			: [...files];
		const idx = data?.findIndex((_) => _.url === url);
		if (idx >= 0) {
			data[idx].isTaskImage = isTaskImage;
		}

		setFiles(data);
	};

	const onTaskRoomImageChange = (url, isTaskRoomImage) => {
		let data = [...files];
		//  url
		//   ? files?.map((_) => {
		//     delete _.isTaskRoomImage;
		//     return _;
		//   })
		//   : [...files];
		const idx = data?.findIndex((_) => _.url === url);
		// if (idx >= 0) {
		//   data[idx].isTaskRoomImage = isTaskRoomImage;
		// }
		data[idx].isTaskRoomImage = isTaskRoomImage;

		setFiles(data);
	};

	const onDescriptionChange = (url, description) => {
		let data = [...files];
		const idx = data?.findIndex((_) => _.url === url);
		if (idx >= 0) {
			data[idx].description = description;
		}

		setFiles(data);
	};

	const handleRemoveAll = () => {
		let data = [...files];

		data.forEach((_, index) => {
			if (_.updated) {
				data.splice(index, 1);
			} else {
				_.deleted = true;
			}
		});

		setFiles(data);
	};

	useEffect(() => {
		if (props) {
			if (props?.isEdit) {
				setIsDisabled(false);
			}
			if (props?.unit?.id !== undefined) {
				setUnitId(props?.unit?.id);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props]);

	const [inventories, setInventories] = useState([]);
	const [expanded, setExpanded] = useState(false);
	const [selectedInventory, setSelectedInventory] = useState(null);

	useEffect(() => {
		if (selectedInventory) {
			inventoryFormik.setValues({ ...selectedInventory });
			setInventoryFiles(selectedInventory.images ?? []);
			setInventoryDoc([{ url: selectedInventory.doc_url }]);
		}
	}, [selectedInventory]);

	// useEffect(() => {
	//   if (isDeleteInventory) {
	//     (async () => {
	//       console.log('id', isDeleteInventory);
	//       await deleteInventory(isDeleteInventory)
	//       setIsDeleteInventory(null)
	//       await queryClient.refetchQueries(["unitById", unit.id?.toString()], {
	//         active: true,
	//         exact: true,
	//       });
	//     })()
	//   }
	// }, [isDeleteInventory])

	const handleInventoryChange = (panel) => (event, isExpanded) => {
		setExpanded(isExpanded ? panel : false);
	};

	useEffect(() => {
		formik.resetForm();
		setIsLoading(true);
		if (props?.unit != undefined) {
			if (props?.unit?.inventories && props.unit.inventories.length > 0) {
				setInventories(props.unit.inventories);
				delete props.unit.inventories;
			}
			Object.keys(props.unit)
				.filter((key) => formik.initialValues.hasOwnProperty(key))
				.forEach((key) => {
					formik.setFieldValue(key, props.unit[key]);
				});
			setSelProprty(props?.unit.property);
			setFiles(props.unit?.images ?? []);
			const { latitude, longitude } = props.unit;
			if (latitude && longitude) {
				setLocation({
					lat: latitude,
					lng: longitude,
				});
				populatePlace(latitude, longitude);
			}
		}
		setIsLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.unit]);

	useEffect(() => {
		if (
			props?.unit != undefined &&
			unittypes?.data !== undefined &&
			unittypes?.data?.length > 0
		) {
			setSelUnittype(props?.unit.unit_type);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.unit, unittypes]);

	useEffect(() => {
		if (selProperty) {
			if (formik.values.address_same_as_property) {
				formik.setFieldValue("address", selProperty.address);
				formik.setFieldValue("country_code", selProperty.country_code);
				formik.setFieldValue("province", selProperty.province);
				formik.setFieldValue("city", selProperty.city);
				formik.setFieldValue("zip_code", selProperty.zip_code);
				formik.setFieldValue("latitude", selProperty.latitude);
				formik.setFieldValue("longitude", selProperty.longitude);

				const { latitude, longitude } = selProperty;

				if (latitude && longitude) {
					setLocation({
						lat: latitude,
						lng: longitude,
					});

					populatePlace(latitude, longitude);
				}
			} else {
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formik.values.address_same_as_property, selProperty]);

	useEffect(() => {
		if (selUnittype) {
			if (formik.values.images_same_as_unittype) {
				setFiles(selUnittype?.images);
				formik.setFieldValue("main_image", selUnittype.main_image);
			} else {
				setFiles([]);
				formik.setFieldValue("main_image", "");
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formik.values.images_same_as_unittype, selUnittype]);

	useEffect(() => {
		if (!formik.values?.dateRanges) {
			const id = uuid();
			formik.setFieldValue("dateRanges", [
				JSON.stringify({ id: id, cost: 0, start_date: "", end_date: "" }),
			]);
		}
	}, [formik]);

	const updateTab = (event, newValue) => setTab(newValue);

	const imageProps = {
		accept: {
			"image/*": [],
		},
		files,
		onDefaultImageChange,
		isShowTaskImage: true,
		isShowTaskRoomImage: true,
		onTaskImageChange,
		onTaskRoomImageChange,
		onDescriptionChange,
		onDrop: handleDrop,
		onRemove: handleRemove,
		onRemoveAll: handleRemoveAll,
	};

	return (
		<div style={{ position: "relative" }}>
			<ViewQrButton onClick={downloadQrCode}> View QR code</ViewQrButton>

			<form onSubmit={formik.handleSubmit} {...props}>
				<Box>
					<TabContext value={tab}>
						<Box sx={{ borderBottom: 1, borderColor: "divider" }} fullWidth>
							<TabList onChange={updateTab}>
								{tabsData.map(({ label, value }, key) => (
									<Tab label={label} value={value} key={key} />
								))}
							</TabList>
						</Box>
						<TabPanel value="1">
							<StyledCard>
								<CardContent>
									<ConfirmDialog
										title="Delete confirm?"
										message=" Are you sure you want to delete unit?"
										dialogStat={dialogStat}
										setDialogStat={setDialogStat}
										onConfirmDialog={onConfirmDialog}
									/>
									<ConfirmDialog
										title="Delete confirm?"
										message=" Are you sure you want to delete inventory?"
										dialogStat={dialogInventoryStat}
										setDialogStat={setDialogInventoryStat}
										onConfirmDialog={onConfirmInventoryDialog}
									/>
									<MainContainer>
										<Grid container spacing={3}>
											<Grid item md={12} xs={12}>
												<TransformedInput
													inputType="autocomplete"
													inputLabel="Property"
													options={properties?.data?.data ?? []}
													getOptionLabel={(option) =>
														option.property_name ? option.property_name : ""
													}
													value={
														selProperty
															? properties?.data?.data?.find(
																	(_) => _.id === selProperty?.id
															  )
															: ""
													}
													disabled={isDisabled || unit}
													renderInput={(params) => (
														<TextField
															{...params}
															error={Boolean(
																formik.touched.property_id &&
																	formik.errors.property_id
															)}
															disabled={isDisabled || unit}
															fullWidth
															required
															helperText={
																formik.touched.property_id &&
																formik.errors.property_id
															}
															placeholder="Select Property"
														/>
													)}
													onChange={(event, newValue) => {
														setSelProprty(newValue);
														formik.setFieldValue(
															"property_id",
															newValue ? newValue.id : undefined
														);
													}}
												/>
												<TransformedInput
													inputType="autocomplete"
													inputLabel="Unit Type"
													options={unittypes?.data ?? []}
													getOptionLabel={(option) =>
														option.unit_type_name ? option.unit_type_name : ""
													}
													value={
														selUnittype
															? unittypes?.data?.find(
																	(_) => _.id === selUnittype?.id
															  )
															: ""
													}
													disabled={isDisabled}
													renderInput={(params) => (
														<TextField
															{...params}
															error={Boolean(
																formik.touched.unit_type_id &&
																	formik.errors.unit_type_id
															)}
															disabled={isDisabled}
															fullWidth
															required
															helperText={
																formik.touched.unit_type_id &&
																formik.errors.unit_type_id
															}
															placeholder="Select Unit Type"
														/>
													)}
													onChange={(event, newValue) => {
														setSelUnittype(newValue);
														formik.setFieldValue(
															"unit_type_id",
															newValue ? newValue.id : undefined
														);
													}}
												/>
												<TransformedInput
													error={Boolean(
														formik.touched.unit_name && formik.errors.unit_name
													)}
													fullWidth
													helperText={
														formik.touched.unit_name && formik.errors.unit_name
													}
													name="unit_name"
													onBlur={formik.handleBlur}
													onChange={formik.handleChange}
													required
													value={formik.values.unit_name}
													disabled={isDisabled}
													inputLabel="Unit Name"
													inputType="text"
													placeholder="Enter Unit Name"
												/>
												<TransformedInput
													error={Boolean(
														formik.touched.unit_code && formik.errors.unit_code
													)}
													fullWidth
													helperText={
														formik.touched.unit_code && formik.errors.unit_code
													}
													name="unit_code"
													onBlur={formik.handleBlur}
													onChange={formik.handleChange}
													required
													value={formik.values.unit_code}
													disabled={isDisabled}
													inputLabel="Unit Code"
													inputType="text"
													placeholder="Enter Unit Code"
												/>

												<TransformedInput
													error={Boolean(
														formik.touched.pms_id && formik.errors.pms_id
													)}
													fullWidth
													helperText={
														formik.touched.pms_id && formik.errors.pms_id
													}
													name="pms_id"
													type="number"
													autoComplete="off"
													onBlur={formik.handleBlur}
													onChange={formik.handleChange}
													value={formik.values.pms_id}
													disabled={isDisabled}
													inputLabel="PMS ID"
													inputType="text"
													placeholder="Enter PMS ID"
												/>
												<FormControl fullWidth>
													<TransformedInput
														error={Boolean(
															formik.touched.unit_condition &&
																formik.errors.unit_condition
														)}
														helperText={
															formik.touched.unit_condition &&
															formik.errors.unit_condition
														}
														name="unit_condition"
														required
														onBlur={formik.handleBlur}
														onChange={formik.handleChange}
														value={formik.values.unit_condition}
														disabled={isDisabled}
														inputType="select"
														inputLabel="Unit Condition"
													>
														{UNIT_CONDITIONS?.map((_area) => (
															<MenuItem key={_area.value} value={_area.value}>
																{_area.label}
															</MenuItem>
														))}
													</TransformedInput>
												</FormControl>
												<FormControl fullWidth>
													<TransformedInput
														error={Boolean(
															formik.touched.status && formik.errors.status
														)}
														helperText={
															formik.touched.status && formik.errors.status
														}
														label="Status"
														labelId="status"
														name="status"
														required
														onBlur={formik.handleBlur}
														onChange={formik.handleChange}
														value={formik.values.status}
														selectable={true}
														inputType="select"
														disabled={isDisabled}
														inputLabel="Status"
													>
														{STATUSES?.map((_status) => (
															<MenuItem
																key={_status.value}
																value={_status.value}
															>
																{_status.label}
															</MenuItem>
														))}
													</TransformedInput>
												</FormControl>

												<TransformedInput
													onChange={(value) => {
														formik.setFieldValue("description", value);
													}}
													placeholder="Enter unit description"
													sx={{ height: 300 }}
													value={formik.values.description}
													disabled={isDisabled}
													inputLabel="Description"
													inputType="editor"
												/>

												{Boolean(
													formik.touched.description &&
														formik.errors.description
												) && (
													<Box sx={{ mt: 2 }}>
														<FormHelperText error>
															{formik.errors.description}
														</FormHelperText>
													</Box>
												)}
											</Grid>
										</Grid>
									</MainContainer>
								</CardContent>
							</StyledCard>
						</TabPanel>
						<TabPanel value="2">
							<StyledCard>
								<CardContent>
									<Grid container spacing={3}>
										<Grid item md={12} xs={12}>
											<FormGroup>
												<FormControlLabel
													control={
														<Switch
															name="images_same_as_unittype"
															checked={formik.values.images_same_as_unittype}
															onChange={formik.handleChange}
														/>
													}
													label="Same as Unit type"
												/>
											</FormGroup>
											<CustomizableImageList {...imageProps} />
											{!formik.values?.images_same_as_unittype && (
												<FileDropzone {...imageProps} />
											)}
										</Grid>
									</Grid>
								</CardContent>
							</StyledCard>
						</TabPanel>
						<TabPanel value="3">
							<StyledCard>
								<CardContent>
									<MainContainer>
										<Grid container>
											<Grid item md={12} xs={12}>
												<FormGroup>
													<FormControlLabel
														control={
															<Switch
																name="address_same_as_property"
																checked={formik.values.address_same_as_property}
																onChange={(e) => {
																	formik.setFieldValue(
																		"address_same_as_property",
																		e.target.checked
																	);
																	formik.setFieldValue("address", "");
																	formik.setFieldValue("country_code", "");
																	formik.setFieldValue("province", "");
																	formik.setFieldValue("city", "");
																	formik.setFieldValue("zip_code", "");
																	formik.setFieldValue("latitude", 0);
																	formik.setFieldValue("longitude", 0);

																	setLocation({
																		lat: 43.65107,
																		lng: -79.347015,
																	});

																	populatePlace(43.65107, -79.347015);
																}}
															/>
														}
														label="Same as property"
													/>
												</FormGroup>
												<TransformedInput
													error={Boolean(
														formik.touched.address && formik.errors.address
													)}
													fullWidth
													required
													name="address"
													onBlur={formik.handleBlur}
													onChange={formik.handleChange}
													value={formik.values.address}
													disabled={isDisabled}
													inputType="text"
													inputLabel="Address"
													placeholder="Enter Address"
													inputDisabled={formik.values.address_same_as_property}
												/>
												<Grid container>
													<Grid item md={12} xs={12}>
														<TransformedInput
															error={Boolean(
																formik.touched.city && formik.errors.city
															)}
															helperText={
																formik.touched.city && formik.errors.city
															}
															fullWidth
															required
															name="city"
															inputLabel="City"
															onBlur={formik.handleBlur}
															onChange={formik.handleChange}
															value={formik.values.city}
															disabled={isDisabled}
															inputType="text"
															placeholder="Enter City"
															inputDisabled={
																formik.values.address_same_as_property
															}
														/>
													</Grid>

													<Grid item md={12} xs={12}>
														<TransformedInput
															error={Boolean(
																formik.touched.province &&
																	formik.errors.province
															)}
															helperText={
																formik.touched.province &&
																formik.errors.province
															}
															fullWidth
															required
															inputLabel="Province"
															name="province"
															onBlur={formik.handleBlur}
															onChange={formik.handleChange}
															value={formik.values.province}
															disabled={isDisabled}
															inputType="text"
															placeholder="Enter Province"
															inputDisabled={
																formik.values.address_same_as_property
															}
														/>
													</Grid>
												</Grid>
												<Grid container>
													<Grid item md={12} xs={12}>
														<TransformedInput
															error={Boolean(
																formik.touched.zip_code &&
																	formik.errors.zip_code
															)}
															type="number"
															fullWidth
															required
															name="zip_code"
															helperText={
																formik.touched.zip_code &&
																formik.errors.zip_code
															}
															onBlur={formik.handleBlur}
															onChange={formik.handleChange}
															value={
																formik.values.zip_code === 0
																	? ""
																	: formik.values.zip_code
															}
															inputType="text"
															inputLabel="Zip Code"
															disabled={isDisabled}
															placeholder="Enter Zip Code"
															inputDisabled={
																formik.values.address_same_as_property
															}
														/>
													</Grid>
													<Grid item md={12} xs={12}>
														<FormControl fullWidth>
															<TransformedInput
																error={Boolean(
																	formik.touched.country_code &&
																		formik.errors.country_code
																)}
																helperText={
																	formik.touched.country_code &&
																	formik.errors.country_code
																}
																labelId="country"
																name="country_code"
																required
																onBlur={formik.handleBlur}
																onChange={formik.handleChange}
																value={formik.values.country_code || "default"}
																disabled={isDisabled}
																inputType="select"
																inputLabel="Country"
																inputDisabled={
																	formik.values.address_same_as_property
																}
															>
																{countries?.data?.length &&
																	[
																		{ name: "Select Country", id: "default" },
																		...countries?.data,
																	]?.map((_country) => (
																		<MenuItem
																			key={_country.id}
																			value={_country?.id}
																		>
																			{_country.name}
																		</MenuItem>
																	))}
															</TransformedInput>
														</FormControl>
													</Grid>
												</Grid>

												<Grid container>
													<Grid item md={12} xs={12}>
														<TransformedInput
															fullWidth
															name="latitude"
															value={formik.values.latitude}
															disabled={true}
															inputType="text"
															inputLabel="Latitude"
															inputDisabled={true}
														/>
													</Grid>
													<Grid item md={12} xs={12}>
														<TransformedInput
															fullWidth
															name="longitude"
															value={formik.values.longitude}
															disabled={true}
															inputType="text"
															inputLabel="Longitude"
															inputDisabled={true}
														/>
													</Grid>
												</Grid>
												{window.google && (
													<Grid container spacing={3}>
														<Grid item md={12} xs={12}>
															<Box>
																<PlacesAutocomplete
																	value={place}
																	onChange={handleChange}
																	onSelect={handleSelect}
																>
																	{({
																		getInputProps,
																		suggestions,
																		getSuggestionItemProps,
																		loading,
																	}) => (
																		<>
																			<TransformedInput
																				{...getInputProps()}
																				fullWidth
																				value={place}
																				sx={{ mt: 2 }}
																				disabled={isDisabled}
																				inputType="text"
																				inputLabel="Places"
																				inputDisabled={
																					formik.values.address_same_as_property
																				}
																			/>
																			<List
																				style={{
																					position: "absolute",
																					zIndex: 100,
																					backgroundColor: "white",
																					width: "40%",
																				}}
																			>
																				{suggestions.map((suggestion) => (
																					<ListItem
																						key={suggestion.index}
																						{...getSuggestionItemProps(
																							suggestion
																						)}
																						active={suggestion.active}
																						style={{ width: "100%" }}
																					>
																						{suggestion.description}
																					</ListItem>
																				))}
																			</List>
																		</>
																	)}
																</PlacesAutocomplete>
															</Box>
														</Grid>
													</Grid>
												)}
											</Grid>
										</Grid>
									</MainContainer>
									{window.google && (
										<GoogleMap
											mapContainerStyle={{
												height: "35vh",
												marginTop: "15px",
												borderRadius: "1rem",
											}}
											center={location}
											zoom={10}
											on
											onClick={onLocationChange}
										>
											<Marker
												position={location}
												draggable
												onDragEnd={onLocationChange}
											/>
										</GoogleMap>
									)}
								</CardContent>
							</StyledCard>
						</TabPanel>

						<TabPanel value="4">
							{/* <StyledCard>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item md={4} xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button onClick={() => {
                          // setDateRangeCount(p => [...p,uuid()])
                          const id = uuid()
                          const x = formik.values.dateRanges || []
                          formik.setFieldValue("dateRanges", [...x, JSON.stringify({ id: id, cost: 0, start_date: '', end_date: '' })]);

                        }}>Add</Button>

                      </Box>
                    </Grid>
                    <Grid item md={8} xs={12}>
                      {formik.values?.dateRanges?.map((v, i) => (
                        <DateRange key={i} formik={formik} values={v} />

                      ))} */}
							{/* formik.values.dateRanges ? formik.values.dateRanges : */}
							{/* </Grid>
                  </Grid>
                </CardContent>
              </StyledCard> */}
							<CostTable />
						</TabPanel>

						{unit && (
							<TabPanel value="5">
								<StyledCard>
									<CardContent>
										<Grid container spacing={3}>
											<Grid item md={4} xs={12}>
												<Typography variant="h6">Inventory List</Typography>
											</Grid>
											<Grid item md={8} xs={12}>
												<Box>
													{inventories.length > 0 ? (
														inventories.map((item, idx) => (
															<UnitInventory
																key={idx}
																index={idx}
																inventoryFormik={inventoryFormik}
																item={item}
																expanded={expanded}
																handleInventoryChange={handleInventoryChange}
																setSelectedInventory={setSelectedInventory}
																selectedInventory={selectedInventory}
																inventoryFiles={inventoryFiles}
																onDefaultImageChange={
																	onDefaultInventoryImageChange
																}
																onDescriptionChange={
																	onInventoryDescriptionChange
																}
																onDrop={handleInventoryDrop}
																onRemove={handleInventoryRemove}
																onRemoveAll={handleInventoryRemoveAll}
																updateInventoryLoading={updateInventoryLoading}
																setIsDeleteInventory={setIsDeleteInventory}
																setDialogStat={setDialogInventoryStat}
																inventoryDoc={inventoryDoc}
																onDocDrop={handleInventoryDocDrop}
																elementData={elementData}
																amenityData={amenityData}
																productData={productData}
																setCaegoryValue={setCaegoryValue}
																categoryValue={categoryValue}
															/>
														))
													) : (
														<Typography variant="h4">
															No inventories found for this unit
														</Typography>
													)}
													<Button
														sx={{ m: 1, ml: "auto", minWidth: "100px" }}
														variant="contained"
														onClick={() => {
															setInventoryFormVisible(true);
															setSelectedInventory(null);
															setInventoryFiles([]);
															setInventoryDoc([]);
															setCaegoryValue(null);
															setExpanded(false);
															inventoryFormik.resetForm();
															setTimeout(() => {
																window.scrollTo(
																	0,
																	document.body.scrollHeight - 1800
																);
															}, 500);
														}}
													>
														Add inventory
													</Button>
												</Box>
											</Grid>
										</Grid>
									</CardContent>
								</StyledCard>
							</TabPanel>
						)}
					</TabContext>
				</Box>

				{unit && inventoryFormVisible && (
					<StyledCard>
						<CardContent sx={{ position: "relative" }}>
							<Grid container spacing={3} sx={{ mt: 2 }}>
								<Grid item md={4} xs={12}>
									<Typography variant="h6">Add Inventory</Typography>
								</Grid>
								<Grid item md={8} xs={12}>
									<Box>
										<FormControl fullWidth>
											<InputLabel id="category">Category *</InputLabel>
											<Select
												error={Boolean(
													inventoryFormik.touched.category &&
														inventoryFormik.errors.category
												)}
												helperText={
													inventoryFormik.touched.category &&
													inventoryFormik.errors.category
												}
												label="Category"
												labelId="category"
												name="category"
												required
												onBlur={inventoryFormik.handleBlur}
												onChange={inventoryFormik.handleChange}
												value={inventoryFormik.values.category}
												disabled={isDisabled}
											>
												{INVENTORY_CATEGORIES?.map((_status) => (
													<MenuItem key={_status.value} value={_status.value}>
														{_status.label}
													</MenuItem>
												))}
											</Select>
										</FormControl>
										{elementData && (
											<Autocomplete
												options={
													inventoryFormik.values.category === "Element"
														? elementData?.data?.data
														: inventoryFormik.values.category === "Amenity"
														? amenityData?.data?.data
														: inventoryFormik.values.category === "Product"
														? productData?.data?.data
														: []
												}
												getOptionLabel={(option) =>
													option.name ? option.name : ""
												}
												sx={{ marginTop: 2 }}
												value={categoryValue}
												// disabled={isDisabled || unit}
												renderInput={(params) => (
													<TextField
														{...params}
														error={Boolean(
															inventoryFormik.touched[
																inventoryFormik.values.category === "Element"
																	? "cat_element_id"
																	: inventoryFormik.values.category ===
																	  "Product"
																	? "cat_product_id"
																	: "cat_amentity_id"
															] &&
																inventoryFormik.errors[
																	inventoryFormik.values.category === "Element"
																		? "cat_element_id"
																		: inventoryFormik.values.category ===
																		  "Product"
																		? "cat_product_id"
																		: "cat_amentity_id"
																]
														)}
														// disabled={isDisabled || unit}
														fullWidth
														required
														helperText={
															inventoryFormik.touched[
																inventoryFormik.values.category === "Element"
																	? "cat_element_id"
																	: inventoryFormik.values.category ===
																	  "Product"
																	? "cat_product_id"
																	: "cat_amentity_id"
															] &&
															inventoryFormik.errors[
																inventoryFormik.values.category === "Element"
																	? "cat_element_id"
																	: inventoryFormik.values.category ===
																	  "Product"
																	? "cat_product_id"
																	: "cat_amentity_id"
															]
														}
														label={`Select ${inventoryFormik.values.category}`}
														placeholder={`Select ${inventoryFormik.values.category}`}
													/>
												)}
												onChange={(event, newValue) => {
													console.log("select category", newValue);
													setSelCategory(newValue);
													if (inventoryFormik.values.category === "Element") {
														inventoryFormik.setFieldValue(
															"cat_element_id",
															newValue ? newValue.id : undefined
														);
														inventoryFormik.setFieldValue(
															"cat_amentity_id",
															null
														);
														inventoryFormik.setFieldValue(
															"cat_product_id",
															null
														);
													} else if (
														inventoryFormik.values.category === "Amenity"
													) {
														inventoryFormik.setFieldValue(
															"cat_amentity_id",
															newValue ? newValue.id : undefined
														);
														inventoryFormik.setFieldValue(
															"cat_element_id",
															null
														);
														inventoryFormik.setFieldValue(
															"cat_product_id",
															null
														);
													} else if (
														inventoryFormik.values.category === "Product"
													) {
														inventoryFormik.setFieldValue(
															"cat_product_id",
															newValue ? newValue.id : undefined
														);
														inventoryFormik.setFieldValue(
															"cat_element_id",
															null
														);
														inventoryFormik.setFieldValue(
															"cat_amentity_id",
															null
														);
													}
												}}
											/>
										)}

										<TextField
											error={Boolean(
												inventoryFormik.touched.name &&
													inventoryFormik.errors.name
											)}
											fullWidth
											helperText={
												inventoryFormik.touched.name &&
												inventoryFormik.errors.name
											}
											sx={{
												mt: 2,
											}}
											label="Inventory Name"
											name="name"
											onBlur={inventoryFormik.handleBlur}
											onChange={inventoryFormik.handleChange}
											required
											value={inventoryFormik.values.name}
											// disabled={isDisabled}
										/>

										<TextField
											error={Boolean(
												inventoryFormik.touched.code &&
													inventoryFormik.errors.code
											)}
											fullWidth
											helperText={
												inventoryFormik.touched.code &&
												inventoryFormik.errors.code
											}
											sx={{
												mt: 2,
											}}
											label="Inventory Code"
											name="code"
											onBlur={inventoryFormik.handleBlur}
											onChange={inventoryFormik.handleChange}
											required
											value={inventoryFormik.values.code}
											// disabled={isDisabled}
										/>

										<FormControl
											fullWidth
											sx={{
												mt: 2,
											}}
										>
											<InputLabel id="area_type">Area Type</InputLabel>
											<Select
												error={Boolean(
													inventoryFormik.touched.area_type &&
														inventoryFormik.errors.area_type
												)}
												helperText={
													inventoryFormik.touched.area_type &&
													inventoryFormik.errors.area_type
												}
												label="Area Type"
												labelId="area_type"
												name="area_type"
												required
												onBlur={inventoryFormik.handleBlur}
												onChange={inventoryFormik.handleChange}
												value={inventoryFormik.values.area_type}
												// disabled={isDisabled}
												MenuProps={{ PaperProps: { sx: { maxHeight: 195 } } }}
											>
												{AREA_TYPES?.map((_area) => (
													<MenuItem key={_area.value} value={_area.value}>
														{_area.label}
													</MenuItem>
												))}
											</Select>
										</FormControl>

										<FormControl
											fullWidth
											sx={{
												mt: 2,
											}}
										>
											<InputLabel id="status">Status *</InputLabel>
											<Select
												error={Boolean(
													inventoryFormik.touched.status &&
														inventoryFormik.errors.status
												)}
												helperText={
													inventoryFormik.touched.status &&
													inventoryFormik.errors.status
												}
												label="Status"
												labelId="status"
												name="status"
												required
												onBlur={inventoryFormik.handleBlur}
												onChange={inventoryFormik.handleChange}
												value={inventoryFormik.values.status}
												// disabled={isDisabled}
											>
												{STATUSES?.map((_status) => (
													<MenuItem key={_status.value} value={_status.value}>
														{_status.label}
													</MenuItem>
												))}
											</Select>
										</FormControl>

										<TextField
											type="number"
											// variant="outlined"
											// size="small"
											label="Quantity"
											fullWidth
											required
											sx={{ mt: 2 }}
											error={Boolean(
												inventoryFormik.touched.quantity &&
													inventoryFormik.errors.quantity
											)}
											helperText={
												inventoryFormik.touched.quantity &&
												inventoryFormik.errors.quantity
											}
											name="quantity"
											min={0}
											onBlur={inventoryFormik.handleBlur}
											onChange={inventoryFormik.handleChange}
											value={inventoryFormik.values.quantity}
											// disabled={isDisabled}
											// InputProps={{
											//   startAdornment: (
											//     <InputAdornment sx={{ mr: 1 }}>
											//       <AttachMoney />
											//     </InputAdornment>
											//   ),
											// }}
										/>

										<TextField
											type="number"
											// variant="outlined"
											// size="small"
											label="Price"
											fullWidth
											required
											sx={{ mt: 2 }}
											error={Boolean(
												inventoryFormik.touched.price &&
													inventoryFormik.errors.price
											)}
											helperText={
												inventoryFormik.touched.price &&
												inventoryFormik.errors.price
											}
											name="price"
											min={0}
											onBlur={inventoryFormik.handleBlur}
											onChange={inventoryFormik.handleChange}
											value={inventoryFormik.values.price}
										/>

										<Box>
											<Typography
												color="textSecondary"
												sx={{
													mb: 1,
													mt: 2,
												}}
												variant="subtitle2"
											>
												Inventory Description
											</Typography>
											<QuillEditor
												onChange={(value) => {
													inventoryFormik.setFieldValue("description", value);
												}}
												placeholder="Enter inventory description"
												sx={{ height: 300 }}
												value={inventoryFormik.values.description}
												// disabled={isDisabled}
											/>
											{Boolean(
												inventoryFormik.touched.description &&
													inventoryFormik.errors.description
											) && (
												<Box sx={{ mt: 2 }}>
													<FormHelperText error>
														{inventoryFormik.errors.description}
													</FormHelperText>
												</Box>
											)}
										</Box>

										<Box>
											<Typography
												color="textSecondary"
												sx={{
													mb: 1,
													mt: 2,
												}}
												variant="subtitle2"
											>
												Inventory commnent
											</Typography>
											<QuillEditor
												onChange={(value) => {
													inventoryFormik.setFieldValue("comment", value);
												}}
												placeholder="Enter inventory comment"
												sx={{ height: 300 }}
												value={inventoryFormik.values.comment}
												// disabled={isDisabled}
											/>
											{Boolean(
												inventoryFormik.touched.comment &&
													inventoryFormik.errors.comment
											) && (
												<Box sx={{ mt: 2 }}>
													<FormHelperText error>
														{inventoryFormik.errors.comment}
													</FormHelperText>
												</Box>
											)}
										</Box>

										<Box>
											<Typography
												color="textSecondary"
												variant="body2"
												sx={{ mt: 2 }}
											>
												Inventory Doc
											</Typography>
											<FileDropzone
												accept={{
													"application/*": [],
												}}
												files={inventoryDoc}
												onDefaultImageChange={onDefaultInventoryImageChange}
												onDescriptionChange={onInventoryDescriptionChange}
												onDrop={handleInventoryDocDrop}
												onRemove={handleInventoryRemove}
												onRemoveAll={handleInventoryRemoveAll}
												maxFiles={1}
												// disabled={isDisabled}
											/>
										</Box>

										<Box>
											<Typography
												color="textSecondary"
												variant="body2"
												sx={{ mt: 2 }}
											>
												Inventory Image
											</Typography>
											<FileDropzone
												accept={{
													"image/*": [],
												}}
												files={inventoryFiles}
												onDefaultImageChange={onDefaultInventoryImageChange}
												onDescriptionChange={onInventoryDescriptionChange}
												onDrop={handleInventoryDrop}
												onRemove={handleInventoryRemove}
												onRemoveAll={handleInventoryRemoveAll}
												// disabled={isDisabled}
											/>
										</Box>

										<Button
											sx={{ m: 1, ml: "auto", minWidth: "100px" }}
											// type="submit"
											variant="contained"
											onClick={inventoryFormik.handleSubmit}
										>
											{
												updateInventoryLoading || addInventoryLoading ? (
													<CircularProgress
														style={{ color: "white" }}
														size={26}
													/>
												) : (
													"Save inventory"
												)
												// unit ? (
												//   "Update"
												// ) : (
												//   "Save"
												// )
											}
										</Button>
									</Box>
								</Grid>
							</Grid>
							<Box sx={{ position: "absolute", top: 10, right: 10 }}>
								<Tooltip title="close">
									<IconButton onClick={() => setInventoryFormVisible(false)}>
										<CloseIcon sx={{ color: "red" }} />
									</IconButton>
								</Tooltip>
							</Box>
						</CardContent>
					</StyledCard>
				)}

				{assetQrData?.length && props.unit
					? assetQrData?.map((qrCode, qrid) => {
							return (
								<Modal
									key={qrid}
									open={open}
									onClose={() => setAssetQrData([])}
									aria-labelledby="modal-modal-title"
									aria-describedby="modal-modal-description"
								>
									<StyledPopup>
										<div
											ref={(el) => (qrRef.current[qrid] = el)}
											key={qrid}
											style={{
												display: "flex",
												paddingTop: 20,
												paddingBottom: 20,
												justifyContent: "center",
												alignItems: "center",
												flexDirection: "column",
											}}
										>
											<Box
												sx={{
													display: "flex",
													flexDirection: "row",
													justifyContent: "center",
													alignItems: "center",
													mb: 2,
												}}
											>
												<Logo
													sx={{
														height: 42,
														width: 42,
													}}
												/>
												<Typography
													style={{
														fontWeight: "600",
														fontSize: 20,
														textAlign: "center",
													}}
												>
													Neovis
												</Typography>
											</Box>
											<img
												src={qrCode}
												alt="Asset qr code"
												style={{
													width: 200,
													height: 200,
												}}
											/>
											{[props.unit].map(
												(item, id) =>
													qrid === id && (
														<div
															key={id}
															style={{
																display: "flex",
																flexDirection: "column",
																justifyContent: "center",
																alignItems: "center",
															}}
														>
															<Typography
																style={{
																	fontWeight: "700",
																	marginTop: 10,
																	fontSize: 30,
																}}
															>
																{item.unit_name}
															</Typography>
														</div>
													)
											)}
											{props.unit && assetQrData?.length && (
												<Button
													color="error"
													sx={{ mt: 5 }}
													onClick={handleQrCodePrint}
												>
													Downoad QR code
												</Button>
											)}
										</div>
									</StyledPopup>
								</Modal>
							);
					  })
					: null}

				{
					<Box
						sx={{
							display: "flex",
							flexWrap: "wrap",
							justifyContent: "space-between",
							width: "80%",
							mx: "auto",
							mb: -1,
							mt: 3,
						}}
					>
						{unit && (
							<>
								<Button
									color="error"
									sx={{
										m: 1,
										mr: "auto",
									}}
									onClick={() => setDialogStat(true)}
								>
									Delete
								</Button>
							</>
						)}
						<Button
							sx={{ m: 1, ml: "auto", minWidth: "100px" }}
							type="submit"
							variant="contained"
						>
							{loading ? (
								<CircularProgress style={{ color: "white" }} size={26} />
							) : unit ? (
								"Update"
							) : (
								"Save"
							)}
						</Button>
					</Box>
				}
			</form>
		</div>
	);
};
