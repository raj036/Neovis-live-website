import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  Grid,
  FormGroup,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  MenuItem,
  Select,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import { RRule } from "rrule";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { X as XIcon } from "../icons/x";
import { PencilAlt as PencilAltIcon } from "../icons/pencil-alt";
import useAxios from "../services/useAxios";
import { TASK_PRIORITIES } from "../utils/constants";
import TaskPriorityIcon, { priorityColors } from "./TaskPriorityIcon";
import { Modal } from "@mui/material";

import {
  AssignmentTurnedInOutlined,
  PriorityHigh,
  LowPriority,
  Adjust,
  AttachMoney,
  Schedule,
  CalendarMonthOutlined,
  GroupOutlined,
  CameraAltOutlined,
  Cancel,
  ExpandMoreOutlined,
  ExpandLessOutlined,
  CheckBoxOutlined,
  ExpandMore,
  CheckCircleOutline,
  MoreVert,
  Launch,
  Visibility,
  VisibilityOff,
  DeleteSweep,
  AddAPhoto,
} from "@mui/icons-material";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import * as dayjs from "dayjs";
import { TASK_FREQUENCY, TASK_TYPES } from "../utils/constants";
import {
  deleteFirebaseImage,
  getUser,
  uploadFirebaseImage,
} from "../utils/helper";
import TaskPriortyIcon from "./TaskPriorityIcon";
import { getPriorityColor } from "./taskDrawer.utils";
import Link from "next/link";
import { useTheme } from "@mui/material/styles";
import TaskDrawerHeader from "./TaskDrawerHeader";
import { styled } from "@mui/system";

const zone = dayjs(new Date()).format("Z").split(":");
const offset = parseInt(zone[0].substring(1)) * 60 + parseInt(zone[1]);

var utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
dayjs().utcOffset(offset);

const switchStyle = {
  "& .MuiSwitch-thumb": {
    backgroundColor: "#4CAF50",
  },
  "& .MuiSwitch-track": {
    backgroundColor: "#4CAF50",
  },
};

export const TaskDrawer = (props) => {
  const { open, onClose, isManager, task, ...other } = props;
  const [files, setFiles] = useState([]);
  const [selProperty, setSelProprty] = useState();
  const [selUnittype, setSelUnittype] = useState();
  const [selUnit, setSelUnit] = useState();
  const [selUnitArea, setSelUnitArea] = useState();
  const [selInspector, setSelInspector] = useState();
  const [selVendor, setSelVendor] = useState();
  const [selExecutor, setSelExecutor] = useState();
  const [selElement, setSelElement] = useState();
  const [selIssueType, setSelIssueType] = useState();
  const [executors, setExecutors] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isDashboardTask, setIsDashboardTask] = useState(false);
  const [checkList, setCheckList] = useState([]);
  const [uniqueArea, setUniqueArea] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  const [currentCheckList, setCurrentCheckList] = useState([]);
  const [currentTab, setCurrentTab] = useState("taskdetails");
  const [getAllUsers, setGetAllUsers] = useState(false);
  const [getAllTeams, setGetAllTeams] = useState(false);
  const [allTeams, setAllTeams] = useState([]);
  const [selTeam, setSelTeam] = useState();
  const [guestTaskCategoryData, setGuestTaskCategoryData] = useState(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // const [isDefaultPhoto, setIsDefaultPhoto] = useState(true);
  // console.log('currentCheckList', currentCheckList, 'checkList', checkList, 'guestTaskCategoryData', guestTaskCategoryData);
  const user = getUser();
  const theme = useTheme();
  const customInstance = useAxios();
  const queryClient = useQueryClient();
  const [taskQuery, setTaskQuery] = useState("");

  const handlePhotoClick = (file) => {
    setSelectedPhoto(file);
  };

  const renderPriorityButtons = () => (
    <ToggleButtonGroup
      value={formik.values.priority}
      exclusive
      onChange={(event, newPriority) => {
        if (newPriority !== null) {
          formik.setFieldValue("priority", newPriority);
        }
      }}
      aria-label="task priority"
      disabled={isDisabled || !isManager}
      size="small"
      sx={{
        display: "flex",
        flexWrap: "nowrap",
        "& .MuiToggleButton-root": {
          px: 1,
          py: 0.5,
          border: "1px solid",
          borderColor: "divider",
          "&.Mui-selected": {
            backgroundColor: (theme) => theme.palette.primary.main,
            color: "white",
          },
          "&:hover": {
            border: `1px solid gray`,
          },
        },
      }}
    >
      {TASK_PRIORITIES.map((option) => (
        <ToggleButton
          key={option.value}
          value={option.value}
          aria-label={option.value}
        >
          <TaskPriorityIcon priority={option.value} sx={{ mr: 0.5 }} />
          <Typography variant="caption">{option.value}</Typography>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );

  const renderField = (name, label, placeholder, multiline = false) => {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        {isDisabled ? (
          <Typography variant="body1">
            {formik.values[name] || "Not specified"}
          </Typography>
        ) : (
          <TextField
            fullWidth
            size="small"
            placeholder={placeholder}
            name={name}
            value={formik.values[name]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched[name] && Boolean(formik.errors[name])}
            helperText={formik.touched[name] && formik.errors[name]}
            disabled={isDisabled || !isManager}
            multiline={multiline}
            rows={multiline ? 4 : 1}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: multiline ? "auto" : "40px",
              },
            }}
          />
        )}
      </Box>
    );
  };

  const tabs = [
    { label: "Task Details", value: "taskdetails" },
    { label: "Inspection Details", value: "inspectiondetails" },
  ];

  const {
    data: task_template_data,
    refetch,
    isLoading,
    isFetching,
  } = useQuery("allTemplate", () => customInstance.get(`task-templates`));

  const { data: properties } = useQuery(
    "taskProperty",
    () => customInstance.get(`properties`),
    { enabled: open === true }
  );

  const { data: propertyData, refetch: propertyDataRefetch } = useQuery(
    "propertyData",
    () => customInstance.get(`properties/${selProperty?.id}`),
    { enabled: selProperty !== undefined }
  );

  const { data: unittypes, refetch: unitTypeRefetch } = useQuery(
    "taskUnitTypes",
    () => customInstance.get(`unit-types/property/${selProperty?.id}`),
    { enabled: selProperty !== undefined }
  );

  const { data: unitAreas, refetch: unitAreasRefetch } = useQuery(
    "taskUnitAreas",
    () =>
      customInstance.get(
        `unit-areas/unit-type-or-property?unit_type_id=${selUnittype?.id}`
      ),
    { enabled: selUnittype !== undefined }
  );

  const { data: units, refetch: unitsRefetch } = useQuery(
    "taskUnits",
    () =>
      customInstance.get(
        `units/unit-type-or-property?unit_type_id=${selUnittype?.id}`
      ),
    { enabled: selUnittype !== undefined }
  );

  const { data: taskChecklist } = useQuery("taskChecklist", () =>
    customInstance.get(`task-checklists?limit=0`)
  );

  const { data: users } = useQuery(
    "taskUsers",
    () => customInstance.get(`users`),
    { enabled: getAllUsers === true }
  );

  const { data: teamData } = useQuery(
    "taskTeams",
    () => customInstance.get(`team`),
    { enabled: getAllTeams === true }
  );

  const { data: elements } = useQuery("taskElements", () =>
    customInstance.get(`elements`)
  );

  const { mutateAsync: updateElement, isLoading: isElementLoading } =
    useMutation((data) => {
      customInstance.patch(`elements/${data?.id}`, data);
    });

  const { data: amenityData } = useQuery("allAmenities", () =>
    customInstance.get(`amentities`)
  );

  const { mutateAsync: updateAmenity, isLoading: isAmenityLoading } =
    useMutation((data) => {
      customInstance.patch(`amentities/${data?.id}`, data);
    });

  const { data: productData } = useQuery("allproductList", () =>
    customInstance.get(`products`)
  );

  const { mutateAsync: updateproduct, isLoading: isProductLoading } =
    useMutation((data) => {
      customInstance.patch(`products/${data?.id}`, data);
    });

  const { data: issueTypes } = useQuery("taskIssueTypes", () =>
    customInstance.get(`issue-types`)
  );
  const { mutateAsync: updateTaskStatus } = useMutation(({ id, status }) =>
    customInstance.patch(`tasks/update-status/${id}/${status}`)
  );

  const { mutateAsync: addTask } = useMutation((data) =>
    customInstance.post(`tasks`, data)
  );

  const { mutateAsync: updateTask } = useMutation((data) => {
    customInstance.patch(`tasks/${data?.id}`, data);
  });

  const {
    mutateAsync: addTaskQuery,
    data: addQueryData,
    error: addQueryError,
    isLoading: addQueryLoading,
  } = useMutation((data) => customInstance.post(`owner-query`, data));

  useEffect(() => {
    if (addQueryData !== undefined && task) {
      setTaskQuery("");
      console.log("");
      (async () => {
        await queryClient.refetchQueries(["taskById", task?.id], {
          active: true,
          exact: true,
        });
      })();
    }
  }, [addQueryData, task]);

  const formik = useFormik({
    initialValues: {
      property_id: null,
      unit_type_id: null,
      unit_id: null,
      is_issue: false,
      remote_inspection: true,
      pet_present: false,
      task_title: "",
      task_description: "",
      priority: "Medium",
      task_type: "",
      issue_category_id: null,
      issue_type_id: null,
      element_id: null,
      task_template_id: null,
      rate_amount: 0,
      rate_unit: "Fixed",
      estimated_time: 0,
      due_at: null,
      due_time: null,
      is_recurring: false,
      is_complete: false,
      frequency: 2,
      end_date: null,
      assigned_to_id: null,
      inspected_by_id: null,
      vendor_id: null,
      task_photos: [],
      rrulestr: "",
      is_task_hold: false,
      assigned_to_team_id: null,
      isDefaultPhoto: true,
    },
    validationSchema: Yup.object({
      property_id: Yup.string().required(),
      unit_type_id: Yup.string().required(),
      unit_id: Yup.string().required(),
    }),
    onSubmit: async (values, helpers) => {
      if (
        formik.values.task_template_id &&
        newtemplatechecklist.length === 0 &&
        checkList.length === 0
      ) {
        toast.error("Please add atleast one checklist for the task.");
        return;
      }
      // if (checkList.length === 0) {
      //   toast.error("Please add atleast one checklist for the task.");
      //   return;
      // }
      try {
        let rules;
        if (values.is_recurring) {
          rules = new RRule({
            freq: values.frequency,
            dtstart: new Date(values.due_at),
            until: new Date(values.end_date),
          });
        }

        let task_date = dayjs(new Date(values.due_at)).format("YYYY-MM-DD");

        if (values.due_time) {
          task_date =
            task_date + "T" + dayjs(new Date(values.due_time)).format("HH:mm");
        } else {
          task_date = task_date + "T" + "23:59";
        }

        let formatted_due_time = null;
        if (values.due_time) {
          formatted_due_time = new Date(values.due_time).toISOString();
        }

        if (task) {
          let images = await uploadImages();
          let data = { ...values };
          delete data.property;
          delete data.unit_type;
          delete data.unit;
          delete data.created_by;
          delete data.rrulestr;
          delete data.inspected_by;
          delete data.assigned_to;
          delete data.due_time;
          delete data.task_inspection;
          delete data.video_stream;
          delete data.owner_querries;

          await updateTask({
            ...data,
            time_spent: 60,
            assigned_at: data.assigned_to_id && new Date().toISOString(),
            task_photos: images,
            active_task_checklists: formik.values.task_template_id
              ? newtemplatechecklist
              : checkList,
            due_at: new Date(task_date),
            due_time: formatted_due_time,
          });
        } else {
          let images = await uploadImages();
          await addTask({
            ...values,
            assigned_at: values.assigned_to_id && new Date().toISOString(),
            task_photos: images,
            status: "Pending",
            active_task_checklists: formik.values.task_template_id
              ? newtemplatechecklist
              : checkList,
            due_at: new Date(task_date),
            due_time: formatted_due_time,
            rrulestr: rules ? rules.toString() : "",
          });
        }
        await queryClient.refetchQueries(["allTasks"], {
          active: true,
          exact: true,
        });
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        toast.success(
          task ? "Task updated successfully!" : "Task added successfully!"
        );
        formik.resetForm();
        setFiles([]);
        setSelProprty();
        setSelUnittype();
        setSelUnit();
        setSelExecutor();
        setSelInspector();
        setSelVendor();
        setCheckList([]);
        setTimeout(() => {
          onClose?.();
        }, 200);
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong!");
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });
  console.log("formik.values.task_template_id", formik.values.task_template_id);

  const { data: singleTasktemplate, refetch: tasktemplateRefetch } = useQuery(
    "singleTasktemplate",
    () =>
      customInstance.get(`task-templates/${formik.values.task_template_id}`),
    { enabled: formik.values.task_template_id !== null }
  );

  useEffect(() => {
    if (formik.values.task_template_id) {
      tasktemplateRefetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.task_template_id, tasktemplateRefetch]);
  const [newtemplatechecklist, setNewtemplatechecklist] = useState([]);
  const [templateAreatypes, setTemplateAreatypes] = useState([]);
  useEffect(() => {
    if (
      singleTasktemplate &&
      singleTasktemplate.data &&
      unitAreas?.data.length > 0
    ) {
      if (unitAreas && unitAreas.data.length > 0) {
        // const unit_area_types = unitAreas.data.map((item) => item.area_type)
        let newChecklists = [];
        let areaNameArr = [];
        unitAreas.data.forEach((unta) => {
          singleTasktemplate.data.task_checklists.forEach((chklst) => {
            if (unta.area_type === chklst.area_type) {
              const item = { ...chklst, unit_area_id: unta.id };
              newChecklists.push(item);
              areaNameArr.push({
                area_type: chklst.area_type,
                area_name: unta.area_name,
              });
            }
          });
        });
        areaNameArr = [...new Set(areaNameArr.map((ut) => ut.area_name))].map(
          (area_name) => areaNameArr.find((ut) => ut.area_name === area_name)
        );
        setTemplateAreatypes(areaNameArr);
        // singleTasktemplate.data.task_checklists.filter((item) => unit_area_types.includes(item.area_type))
        // newChecklists = newChecklists.map(item => ({ ...item, unit_area_id: unitAreas.data[0].id }))
        setNewtemplatechecklist(newChecklists);

        let categoryData = {};
        singleTasktemplate.data.task_checklists.forEach((chklst) => {
          let guestCategory = [];
          if (chklst.category_type === "Element" && elements !== undefined) {
            guestCategory = elements?.data?.data.filter((item) =>
              chklst["all_cat_ids"].includes(item.id)
            );
            categoryData = {
              ...categoryData,
              [chklst.category_type]: guestCategory,
            };
          } else if (
            chklst.category_type === "Product" &&
            productData !== undefined
          ) {
            guestCategory = productData?.data?.data.filter((item) =>
              chklst["all_cat_ids"].includes(item.id)
            );
            categoryData = {
              ...categoryData,
              [chklst.category_type]: guestCategory,
            };
          } else if (
            chklst.category_type === "Amenity" &&
            amenityData !== undefined
          ) {
            guestCategory = amenityData?.data?.data.filter((item) =>
              chklst["all_cat_ids"].includes(item.id)
            );
            categoryData = {
              ...categoryData,
              [chklst.category_type]: guestCategory,
            };
          }
        });
        setGuestTaskCategoryData(categoryData);
      }
    }
  }, [singleTasktemplate, unitAreas, amenityData, elements, productData]);
  // console.log('task_template_data', task_template_data?.data?.data, 'singleTasktemplate', singleTasktemplate, 'checkList', checkList, 'newtemplatechecklist', newtemplatechecklist);

  useEffect(
    () => {
      if (props?.task?.status === "On Hold") {
        formik.setFieldValue("is_task_hold", true);
      }
    },
    [props?.task?.status],
    formik
  );

  const onImageSelect = async (event) => {
    let imgData = [...files];
    const newFiles = [...event.target.files];

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
  };

  const onImageRemove = (url) => {
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

  // useEffect(() => {
  //   let data = [...files];
  //   if (isDefaultPhoto) {
  //     setFiles(data.map(item => {
  //       if (item.isPropertyImage || item.isUnitTypeImage || item.isUnitImage) {
  //         item['deleted'] = true
  //         return item
  //       } else {
  //         return item
  //       }
  //     }))
  //   } else {
  //     setFiles(data.filter(item => (!item.isPropertyImage || item.isPropertyImage === undefined) || (!item.isUnitTypeImage || item.isUnitTypeImage === undefined) || (!item.isUnitImage || item.isUnitImage === undefined)))
  //     // setFiles(data.map(item => {
  //     //   if (item.isPropertyImage || item.isUnitTypeImage || item.isUnitImage) {
  //     //     item['deleted'] = false
  //     //     return item
  //     //   } else {
  //     //     return item
  //     //   }
  //     // }))
  //   }
  // }, [isDefaultPhoto])

  const onImageRemoveAll = () => {
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

  const onImageDescriptionChange = (url, description) => {
    let data = [...files];
    const idx = data?.findIndex((_) => _.url === url);
    if (idx >= 0) {
      data[idx].description = description;
    }

    setFiles(data);
  };

  const updateCheckList = (
    checklist_title,
    description,
    checklist_code,
    unit_area_id,
    area_type,
    action,
    custom,
    category_type,
    cat_id
  ) => {
    let data = [...checkList];
    if (action === "remove") {
      const idx = checkList.findIndex(
        (_) =>
          _.unit_area_id === unit_area_id &&
          _.checklist_title === checklist_title
      );
      if (idx >= 0) {
        data.splice(idx, 1);
      }
    } else {
      if (category_type !== undefined && cat_id !== undefined) {
        const catTypeValue = category_type.split("=")[1];
        const catTypeKey = category_type.split("=")[0];
        const catIdValue = cat_id.split("=")[1];
        const catIdKey = cat_id.split("=")[0];
        const idValues = catIdValue.split(",").map((item) => parseInt(item));
        data.push({
          checklist_title,
          description,
          checklist_code,
          unit_area_id,
          area_type,
          custom,
          [catTypeKey]: catTypeValue,
          [catIdKey]: idValues,
        });
        let guestCategory = [];
        if (catTypeValue === "Element") {
          guestCategory = elements?.data?.data.filter((item) =>
            idValues.includes(item.id)
          );
        } else if (catTypeValue === "Product") {
          guestCategory = productData?.data?.data.filter((item) =>
            idValues.includes(item.id)
          );
        } else if (catTypeValue === "Amenity") {
          guestCategory = amenityData?.data?.data.filter((item) =>
            idValues.includes(item.id)
          );
        }
        const categoryData = {
          [catTypeValue]: guestCategory,
        };
        setGuestTaskCategoryData({ ...guestTaskCategoryData, ...categoryData });
      } else {
        setGuestTaskCategoryData(null);
        data.push({
          checklist_title,
          description,
          checklist_code,
          unit_area_id,
          area_type,
          custom,
        });
      }
    }

    setCheckList(data);
  };

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  const uploadImages = async () => {
    let imagesUri = files?.filter((_) => !_.updated && !_.deleted);

    await Promise.all(
      files
        ?.filter((_) => _.updated || _.deleted)
        ?.map(
          (file) =>
            new Promise(async (resolve) => {
              if (file.deleted) {
                await deleteFirebaseImage("task", file.url);
                resolve();
              } else {
                const uri = await uploadFirebaseImage("task", file);
                imagesUri.push({
                  url: uri,
                  description: file.description,
                  //default: file.default ? true : false,
                });
                resolve();
              }
            })
        )
    );
    return imagesUri;
  };

  useEffect(() => {
    if (units && units?.data?.length > 0) {
      let unitsData = [
        { id: 0, unit_name: "All Units", description: "All Units" },
        ...units.data,
      ];
      setAllUnits(unitsData);
    }
  }, [units]);

  useEffect(() => {
    if (checkList?.length > 0) {
      let data = checkList
        .map((item) => item.unit_area_id)
        .filter((value, index, self) => self.indexOf(value) === index);
      setUniqueArea(data);
    } else {
      setUniqueArea([]);
    }
  }, [checkList]);

  useEffect(() => {
    if (selProperty?.id) {
      unitTypeRefetch();
      propertyDataRefetch();
      if (!task) {
        setCheckList([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selProperty, unitTypeRefetch]);

  useEffect(() => {
    if (selUnittype?.id) {
      unitsRefetch();
      unitAreasRefetch();
      if (!task) {
        setCheckList([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selUnittype, unitsRefetch, unitAreasRefetch]);

  useEffect(() => {
    const unitGroups = propertyData?.data?.unit_groups;
    const employees = [];
    const teams = [];
    if (unitGroups?.length > 0) {
      const employeeSet = new Set();
      const teamSet = new Set();
      unitGroups.forEach((ug) => {
        if (ug?.employees) {
          ug?.employees.forEach((d) => employeeSet.add(JSON.stringify(d)));
        }
        if (ug?.teams.length > 0) {
          ug?.teams.forEach((d) => teamSet.add(JSON.stringify(d)));
        }
      });
      for (const item of employeeSet) {
        employees.push(JSON.parse(item));
      }
      for (const item of teamSet) {
        teams.push(JSON.parse(item));
      }
    } else {
      setGetAllUsers(true);
      if (users) {
        employees.push(...users?.data?.data);
      }
      setGetAllTeams(true);
      if (teamData) {
        teams.push(...teamData?.data?.data);
      }
    }
    let owner = [];
    if (selUnit && selUnit.id !== 0) {
      owner = [selUnit?.owner];
    } else if (selUnit && selUnit.id === 0) {
      const allOwners = allUnits.map(
        (ut) => ut.owner !== undefined && ut.owner
      );
      owner = [...new Set(allOwners.map((ut) => ut.id))]
        ?.filter((ow) => ow !== undefined)
        ?.map((id) => allOwners.find((ow) => ow.id === id));
    }
    setInspectors([
      ...employees.filter((_) => _.user_role_id === 2 || _.user_role_id === 5),
      ...owner,
    ]);
    setExecutors(
      employees.filter(
        (_) =>
          _.user_role_id === 3 || _.user_role_id === 1 || _.user_role_id === 5
      )
    );
    setVendors(employees.filter((_) => _.user_role_id === 4));
    setAllTeams(teams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyData, users, teamData, selUnit, allUnits]);

  useEffect(() => {
    formik.resetForm();
    setFiles([]);
    setSelProprty();
    setSelUnittype();
    setSelUnit();
    setSelExecutor();
    setSelInspector();
    setSelVendor();
    setCheckList([]);

    if (props?.isEdit) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }

    if (props.task) {
      formik.setValues(props.task);
      setSelProprty(props.task?.property);
      setSelUnittype(props.task?.unit_type);
      setSelUnit(props.task?.unit);
      setFiles(props.task?.task_photos ?? []);
      setSelTeam(props.task?.assigned_to_team);

      if (props.task?.element) {
        setSelElement(props.task?.element);
      }
      if (props.task?.inspected_by) {
        setSelInspector(props.task?.inspected_by);
      }
      if (props.task?.vendor) {
        setSelVendor(props.task?.vendor);
      }
      if (props.task?.assigned_to) {
        setSelExecutor(props.task?.assigned_to);
      }

      if (props.task?.active_task_checklists !== undefined) {
        setCheckList(props.task?.active_task_checklists || []);
        let categoryData = {};
        props.task?.active_task_checklists.forEach((chklst) => {
          let guestCategory = [];
          if (chklst.category_type === "Element" && elements !== undefined) {
            guestCategory = elements?.data?.data.filter((item) =>
              chklst["all_cat_ids"].includes(item.id)
            );
            categoryData = {
              ...categoryData,
              [chklst.category_type]: guestCategory,
            };
          } else if (
            chklst.category_type === "Product" &&
            productData !== undefined
          ) {
            guestCategory = productData?.data?.data.filter((item) =>
              chklst["all_cat_ids"].includes(item.id)
            );
            categoryData = {
              ...categoryData,
              [chklst.category_type]: guestCategory,
            };
          } else if (
            chklst.category_type === "Amenity" &&
            amenityData !== undefined
          ) {
            guestCategory = amenityData?.data?.data.filter((item) =>
              chklst["all_cat_ids"].includes(item.id)
            );
            categoryData = {
              ...categoryData,
              [chklst.category_type]: guestCategory,
            };
          }
        });
        setGuestTaskCategoryData(categoryData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.task]);

  useEffect(() => {
    if (props.currentDate) {
      formik.setFieldValue(
        "due_at",
        props.currentDate ? props.currentDate.toString() : null
      );
    }
  }, [props.currentDate]);

  useEffect(() => {
    if (props.dashboardTask) {
      setSelProprty(props.dashboardTask?.property);
      setSelUnittype(props.dashboardTask?.unit_type);
      setSelUnit(props.dashboardTask?.unit);
      formik.setFieldValue("property_id", props.dashboardTask?.property.id);
      formik.setFieldValue("unit_type_id", props.dashboardTask?.unit_type.id);
      formik.setFieldValue("unit_id", props.dashboardTask?.unit.id);
      setIsDashboardTask(true);
    } else {
      setIsDashboardTask(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.dashboardTask]);

  const _changeTaskStatus = async (e, status) => {
    formik.setFieldValue("is_task_hold", e.target.checked);
    var task_id = props?.task?.id || 0;
    if (task_id === 0) {
      return;
    }
    try {
      await updateTaskStatus({ id: task_id, status: status });
      toast.success("Task status changed successfully!");
      onClose?.();
      await queryClient.refetchQueries(["allTasks"], {
        active: true,
        exact: true,
      });
    } catch (e) {
      toast.error("Something went wrong!");
    }
  };

  return (
    <Drawer
      anchor="right"
      onClose={onClose}
      open={open}
      ModalProps={{ sx: { zIndex: 2000 } }}
      PaperProps={{
        sx: {
          width: 620,
          backgroundColor: "#e9ebf0",
          maxHeight: "100%",
        },
      }}
      {...other}
    >
      <TaskDrawerHeader
        theme={theme}
        task={task}
        isManager={isManager}
        isDisabled={isDisabled}
        setIsDisabled={setIsDisabled}
        onClose={onClose}
        formik={formik}
        _changeTaskStatus={_changeTaskStatus}
      />

      {/* {isManager && task && (
        <Box sx={{ mt: 1, ml: 3 }}>
          <Tabs
            indicatorColor="primary"
            onChange={handleTabsChange}
            scrollButtons="auto"
            textColor="primary"
            value={currentTab}
            variant="scrollable"
          >
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>
          <Divider />
        </Box>
      )} */}

      <form
        onSubmit={formik.handleSubmit}
        className="taskdrawer"
        style={{
          overflowY: "scroll",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          backgroundColor: "#ffffff",
        }}
      >
        <Box
          sx={{
            my: 1,
            display: "flex",
            px: 3,
          }}
        >
          <DesktopDatePicker
            error={Boolean(formik.touched.due_at && formik.errors.due_at)}
            inputFormat="MM/dd/yyyy"
            name="due_at"
            onChange={(newDate) =>
              formik.setFieldValue(
                "due_at",
                newDate ? newDate.toString() : null
              )
            }
            disabled={isDisabled || !isManager}
            value={formik.values.due_at ?? null}
            renderInput={(inputProps) => (
              <TextField
                required
                {...inputProps}
                size="small"
                disabled={isDisabled || !isManager}
                sx={{
                  marginRight: 2,
                  "& .MuiOutlinedInput-root": {
                    width: "auto",
                    minWidth: "120px",
                    maxWidth: "200px",
                  },
                  "& .MuiOutlinedInput-input": {
                    width: "100%",
                    boxSizing: "border-box",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    border: "1px solid",
                  },
                }}
              />
            )}
          />

          <TimePicker
            error={Boolean(formik.touched.due_time && formik.errors.due_time)}
            // label="Due Time"
            name="due_time"
            onChange={(newDate) => {
              formik.setFieldValue(
                "due_time",
                newDate ? newDate.toString() : null
              );
            }}
            disabled={isDisabled || !isManager}
            value={formik.values.due_time ?? null}
            renderInput={(inputProps) => (
              <TextField
                {...inputProps}
                size="small"
                disabled={isDisabled || !isManager}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    width: "auto",
                    minWidth: "120px",
                    maxWidth: "170px",
                  },
                  "& .MuiOutlinedInput-input": {
                    width: "100%",
                    boxSizing: "border-box",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    border: "1px solid",
                  },
                }}
              />
            )}
          />
        </Box>
        <Divider sx={{ mt: 2 }} />
        <Box
          sx={{
            py: 2,
            px: 3,
            flex: 1,
          }}
        >
          {isDisabled || task || isDashboardTask ? (
            <Box sx={{ width: "100%" }}>
              <Box
                sx={{
                  px: 1,
                  py: 0.5,
                  backgroundColor: "background.paper",
                  borderRadius: 1,
                  mb: 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mb: 0.5 }}
                >
                  Property
                </Typography>
                <Typography variant="body2">
                  {selProperty?.property_name || "Not selected"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box
                  sx={{
                    flex: 1,
                    px: 1,
                    py: 0.5,
                    backgroundColor: "background.paper",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mb: 0.5 }}
                  >
                    Unit Type
                  </Typography>
                  <Typography variant="body2">
                    {selUnittype?.unit_type_name || "Not selected"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    px: 1,
                    py: 0.5,
                    backgroundColor: "background.paper",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mb: 0.5 }}
                  >
                    Unit
                  </Typography>
                  <Typography variant="body2">
                    {selUnit?.unit_name || "Not selected"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <>
              <Autocomplete
                options={properties?.data?.data ?? []}
                getOptionLabel={(option) =>
                  option.property_name ? option.property_name : ""
                }
                value={
                  selProperty && properties
                    ? properties?.data?.data?.find(
                        (_) => _.id === selProperty?.id
                      )
                    : ""
                }
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={Boolean(
                      formik.touched.property_id && formik.errors.property_id
                    )}
                    fullWidth
                    required
                    helperText={
                      formik.touched.property_id && formik.errors.property_id
                    }
                    label="Select Property"
                    placeholder="Select Property"
                    sx={{
                      backgroundColor: "background.default",
                      borderRadius: 1,
                      boxShadow:
                        "0px 1px 1px rgb(100 116 139 / 6%), 0px 1px 2px rgb(100 116 139 / 10%)",
                    }}
                  />
                )}
                onChange={(event, newValue) => {
                  setSelProprty(newValue);
                  console.log("sel property", newValue);
                  // if (isDefaultPhoto && newValue && newValue.task_image) {
                  //   const findPhoto = files.find((item) => item.isPropertyImage)
                  //   if (findPhoto) {
                  //     setFiles(files.map((item) => {
                  //       if (item.isPropertyImage) {
                  //         item['deleted'] = false
                  //         item['url'] = newValue.task_image
                  //         return item
                  //       } else {
                  //         return item
                  //       }
                  //     }))
                  //   } else {
                  //     const foundByUrl = files.find((item) => item.url === newValue.task_image)
                  //     if (foundByUrl === undefined || !foundByUrl) {
                  //       setFiles([...files, { url: newValue.task_image, description: '', deleted: false, isPropertyImage: true }])
                  //     }
                  //   }
                  // } else {
                  //   setFiles(files.filter((item) => !item.isPropertyImage))
                  // }
                  formik.setFieldValue(
                    "property_id",
                    newValue ? newValue.id : undefined
                  );
                }}
              />
              <Autocomplete
                options={selProperty && unittypes?.data ? unittypes?.data : []}
                getOptionLabel={(option) =>
                  option.unit_type_name ? option.unit_type_name : ""
                }
                value={
                  selUnittype && unittypes
                    ? unittypes?.data?.find((_) => _.id === selUnittype?.id)
                    : ""
                }
                size="small"
                sx={{ my: 2 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={Boolean(
                      formik.touched.unit_type_id && formik.errors.unit_type_id
                    )}
                    fullWidth
                    required
                    helperText={
                      formik.touched.unit_type_id && formik.errors.unit_type_id
                    }
                    label="Select Unit Type"
                    placeholder="Select Unit Type"
                    sx={{
                      backgroundColor: "background.default",
                      borderRadius: 1,
                      boxShadow:
                        "0px 1px 1px rgb(100 116 139 / 6%), 0px 1px 2px rgb(100 116 139 / 10%)",
                    }}
                  />
                )}
                onChange={(event, newValue) => {
                  setSelUnittype(newValue);
                  // if (isDefaultPhoto && newValue && newValue.task_image) {
                  //   const findPhoto = files.find((item) => item.isUnitTypeImage)
                  //   if (findPhoto) {
                  //     setFiles(files.map((item) => {
                  //       if (item.isUnitTypeImage) {
                  //         item['deleted'] = false
                  //         item['url'] = newValue.task_image
                  //         return item
                  //       } else {
                  //         return item
                  //       }
                  //     }))
                  //   } else {
                  //     const foundByUrl = files.find((item) => item.url === newValue.task_image)
                  //     if (foundByUrl === undefined || !foundByUrl) {
                  //       setFiles([...files, { url: newValue.task_image, description: '', deleted: false, isUnitTypeImage: true }])
                  //     }
                  //   }
                  // } else {
                  //   setFiles(files.filter((item) => !item.isUnitTypeImage))
                  // }
                  formik.setFieldValue(
                    "unit_type_id",
                    newValue ? newValue.id : undefined
                  );
                }}
              />
              <Autocomplete
                options={selUnittype && allUnits ? allUnits : []}
                getOptionLabel={(option) =>
                  option.unit_name ? option.unit_name : ""
                }
                value={
                  selUnit && allUnits
                    ? allUnits?.find((_) => _.id === selUnit?.id)
                    : ""
                }
                size="small"
                sx={{ my: 2 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={Boolean(
                      formik.touched.unit_id && formik.errors.unit_id
                    )}
                    required
                    fullWidth
                    helperText={formik.touched.unit_id && formik.errors.unit_id}
                    label="Select Unit"
                    placeholder="Select Unit"
                    sx={{
                      backgroundColor: "background.default",
                      borderRadius: 1,
                      boxShadow:
                        "0px 1px 1px rgb(100 116 139 / 6%), 0px 1px 2px rgb(100 116 139 / 10%)",
                    }}
                  />
                )}
                onChange={(event, newValue) => {
                  setSelUnit(newValue);
                  // if (isDefaultPhoto && newValue && newValue.task_image) {
                  //   const findPhoto = files.find((item) => item.isUnitImage)
                  //   if (findPhoto) {
                  //     setFiles(files.map((item) => {
                  //       if (item.isUnitImage) {
                  //         item['deleted'] = false
                  //         item['url'] = newValue.task_image
                  //         return item
                  //       } else {
                  //         return item
                  //       }
                  //     }))
                  //   } else {
                  //     const foundByUrl = files.find((item) => item.url === newValue.task_image)
                  //     if (foundByUrl === undefined || !foundByUrl) {
                  //       setFiles([...files, { url: newValue.task_image, description: '', deleted: false, isUnitImage: true }])
                  //     }
                  //   }
                  // } else {
                  //   setFiles(files.filter((item) => !item.isUnitImage))
                  // }
                  formik.setFieldValue(
                    "unit_id",
                    newValue ? newValue.id : undefined
                  );
                }}
              />
            </>
          )}
          {/* task details  */}
          <Card>
            <Box sx={{ mb: 2, mt: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ textTransform: "uppercase", fontWeight: 600 }}
              >
                Task Details
              </Typography>
            </Box>
            <Box
              sx={{
                my: 1,
                px: 1,
                bgcolor: "background.paper",
                // boxShadow: 1,
              }}
            >
              <Box sx={{ mb: 2 }}>{renderPriorityButtons()}</Box>
              {renderField("task_title", "Task Title", "Enter a title")}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Task Type
                </Typography>
                {isDisabled ? (
                  <Typography variant="body1">
                    {TASK_TYPES.find(
                      (type) => type.value === formik.values.task_type
                    )?.label || "Not specified"}
                  </Typography>
                ) : (
                  <Autocomplete
                    options={TASK_TYPES}
                    getOptionLabel={(option) => option.label}
                    value={
                      TASK_TYPES.find(
                        (type) => type.value === formik.values.task_type
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      formik.setFieldValue(
                        "task_type",
                        newValue ? newValue.value : ""
                      )
                    }
                    disabled={isDisabled || !isManager}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select or add task type"
                        error={
                          formik.touched.task_type &&
                          Boolean(formik.errors.task_type)
                        }
                        helperText={
                          formik.touched.task_type && formik.errors.task_type
                        }
                        size="small"
                      />
                    )}
                  />
                )}
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Template
                </Typography>
                {isDisabled ? (
                  <Typography variant="body1">
                    {task_template_data?.data?.data.find(
                      (t) => t.id === formik.values.task_template_id
                    )?.template_name || "Not specified"}
                  </Typography>
                ) : (
                  <Autocomplete
                    options={task_template_data?.data?.data || []}
                    getOptionLabel={(option) => option.template_name || ""}
                    value={
                      task_template_data?.data?.data.find(
                        (t) => t.id === formik.values.task_template_id
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      formik.setFieldValue(
                        "task_template_id",
                        newValue ? newValue.id : ""
                      )
                    }
                    disabled={isDisabled || !isManager}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select a template"
                        error={
                          formik.touched.task_template_id &&
                          Boolean(formik.errors.task_template_id)
                        }
                        helperText={
                          formik.touched.task_template_id &&
                          formik.errors.task_template_id
                        }
                        size="small"
                      />
                    )}
                  />
                )}
              </Box>
              {renderField(
                "task_description",
                "Description",
                "Add a description...",
                true
              )}

              {formik.values.task_type === "Maintenance" && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Add an element
                  </Typography>
                  {isDisabled ? (
                    <Typography variant="body1">
                      {elements?.data?.data.find(
                        (e) => e.id === formik.values.element_id
                      )?.name || "Not specified"}
                    </Typography>
                  ) : (
                    <Autocomplete
                      options={elements?.data?.data || []}
                      getOptionLabel={(option) => option.name || ""}
                      value={
                        elements?.data?.data.find(
                          (e) => e.id === formik.values.element_id
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        formik.setFieldValue(
                          "element_id",
                          newValue ? newValue.id : ""
                        )
                      }
                      disabled={isDisabled || !isManager}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select an element"
                          error={
                            formik.touched.element_id &&
                            Boolean(formik.errors.element_id)
                          }
                          helperText={
                            formik.touched.element_id &&
                            formik.errors.element_id
                          }
                          size="small"
                        />
                      )}
                    />
                  )}
                </Box>
              )}

              <Box sx={{ display: "flex", mt: 2, gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Rate
                  </Typography>
                  {isDisabled ? (
                    <Typography variant="body1">
                      {`${formik.values.rate_amount || "Not specified"} - ${
                        formik.values.rate_unit || ""
                      }`}
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <TextField
                        placeholder="Add rate"
                        type="number"
                        name="rate_amount"
                        value={formik.values.rate_amount}
                        onChange={formik.handleChange}
                        disabled={isDisabled || !isManager}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney />
                            </InputAdornment>
                          ),
                        }}
                        size="small"
                        sx={{
                          flexGrow: 1,
                          "& .MuiOutlinedInput-root": { height: "40px" },
                        }}
                      />
                      <Select
                        value={formik.values.rate_unit}
                        onChange={formik.handleChange}
                        name="rate_unit"
                        disabled={isDisabled || !isManager}
                        size="small"
                        sx={{
                          width: "100px",
                          "& .MuiOutlinedInput-root": { height: "40px" },
                        }}
                      >
                        <MenuItem value="Hourly">hourly</MenuItem>
                        <MenuItem value="Daily">daily</MenuItem>
                        <MenuItem value="Monthly">monthly</MenuItem>
                        <MenuItem value="Fixed">fixed</MenuItem>
                      </Select>
                    </Box>
                  )}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Estimated time
                  </Typography>
                  {isDisabled ? (
                    <Typography variant="body1">
                      {formik.values.estimated_time || "Not specified"}
                    </Typography>
                  ) : (
                    <TextField
                      fullWidth
                      placeholder="hh:mm"
                      type="text"
                      name="estimated_time"
                      value={formik.values.estimated_time}
                      onChange={formik.handleChange}
                      disabled={isDisabled || !isManager}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Schedule />
                          </InputAdornment>
                        ),
                      }}
                      size="small"
                      sx={{ "& .MuiOutlinedInput-root": { height: "40px" } }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Card>

          {formik.values.is_recurring && (
            <Card sx={{ my: 2 }}>
              {/* {!task && (
              <Box
                sx={{
                  ml: "auto",
                  mr: 2,
                  display: "flex",
                  flexDirection: "row-reverse",
                  color: "#65748B",
                }}
              >
                <Typography>Make Repeating</Typography>
                <Switch
                  name="is_recurring"
                  checked={formik.values.is_recurring}
                  onChange={formik.handleChange}
                  disabled={isDisabled || task || !isManager}
                />
              </Box>
            )} */}
              {/* schedule was box here below------------ */}

              <Box
                sx={{
                  my: 1,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <DesktopDatePicker
                  error={Boolean(
                    formik.touched.end_date && formik.errors.end_date
                  )}
                  inputFormat="MM/dd/yyyy"
                  label="End Date"
                  name="end_date"
                  onChange={(newDate) =>
                    formik.setFieldValue(
                      "end_date",
                      newDate ? newDate.toString() : null
                    )
                  }
                  disabled={isDisabled || !isManager}
                  value={formik.values.end_date ?? null}
                  renderInput={(inputProps) => (
                    <TextField
                      required
                      {...inputProps}
                      size="small"
                      sx={{ mt: 1 }}
                      disabled={isDisabled || !isManager}
                    />
                  )}
                />
                <Select
                  error={Boolean(
                    formik.touched.frequency && formik.errors.frequency
                  )}
                  size="small"
                  sx={{ minWidth: "180px", mt: 1 }}
                  helperText={
                    formik.touched.frequency && formik.errors.frequency
                  }
                  name="frequency"
                  required
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.frequency}
                  disabled={isDisabled || !isManager}
                >
                  {TASK_FREQUENCY.map((_type) => (
                    <MenuItem key={_type.value} value={_type.value}>
                      {_type.label}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Card>
          )}
          <Card sx={{ my: 2, mt: 2 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ textTransform: "uppercase", fontWeight: 600 }}
            >
              Assignment
            </Typography>

            {isDisabled ? (
              <Box
                sx={{
                  mt: 2,
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 2,
                  alignItems: "start",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Team:
                </Typography>
                <Typography variant="body2">
                  {selTeam?.team_name || "Not assigned"}
                </Typography>

                {formik.values.task_type !== "Inspection" && (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Executor:
                    </Typography>
                    <Typography variant="body2">
                      {selExecutor
                        ? `${selExecutor?.first_name} ${selExecutor?.last_name}`
                        : "Not assigned"}
                    </Typography>
                  </>
                )}

                <Typography variant="body2" color="text.secondary">
                  Inspector:
                </Typography>
                <Typography variant="body2">
                  {selInspector
                    ? `${selInspector?.first_name} ${selInspector?.last_name}`
                    : "Not assigned"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Vendor:
                </Typography>
                <Typography variant="body2">
                  {selVendor
                    ? `${selVendor?.first_name} ${selVendor?.last_name}`
                    : "Not assigned"}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Team
                  </Typography>
                  <Autocomplete
                    options={allTeams ?? []}
                    getOptionLabel={(option) => option.team_name || ""}
                    value={
                      selTeam
                        ? allTeams?.find((_) => _.id === selTeam?.id)
                        : null
                    }
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={Boolean(
                          formik.touched.assigned_to_team_id &&
                            formik.errors.assigned_to_team_id
                        )}
                        fullWidth
                        helperText={
                          formik.touched.assigned_to_team_id &&
                          formik.errors.assigned_to_team_id
                        }
                        placeholder="Select task team"
                        variant="outlined"
                      />
                    )}
                    onChange={(event, newValue) => {
                      setSelTeam(newValue);
                      formik.setFieldValue(
                        "assigned_to_team_id",
                        newValue ? newValue.id : undefined
                      );
                      formik.setFieldValue(
                        "assigned_to_id",
                        newValue ? newValue.team_leader_id : undefined
                      );
                    }}
                  />
                </Box>

                {formik.values.task_type !== "Inspection" && (
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Executor
                    </Typography>
                    <Autocomplete
                      options={executors ?? []}
                      getOptionLabel={(option) =>
                        option.first_name
                          ? `${option.first_name} ${option.last_name}`
                          : ""
                      }
                      value={
                        selExecutor
                          ? executors?.find((_) => _.id === selExecutor?.id)
                          : null
                      }
                      size="small"
                      disabled={Boolean(selTeam)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={Boolean(
                            formik.touched.assigned_to_id &&
                              formik.errors.assigned_to_id
                          )}
                          fullWidth
                          helperText={
                            formik.touched.assigned_to_id &&
                            formik.errors.assigned_to_id
                          }
                          placeholder="Select task executor"
                          variant="outlined"
                        />
                      )}
                      onChange={(event, newValue) => {
                        setSelExecutor(newValue);
                        formik.setFieldValue(
                          "assigned_to_id",
                          newValue ? newValue.id : undefined
                        );
                      }}
                    />
                  </Box>
                )}

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Inspector
                  </Typography>
                  <Autocomplete
                    options={inspectors ?? []}
                    getOptionLabel={(option) =>
                      option?.first_name
                        ? `${option?.first_name} ${option?.last_name}`
                        : ""
                    }
                    value={
                      selInspector
                        ? inspectors?.find((_) => _?.id === selInspector?.id)
                        : null
                    }
                    size="small"
                    disabled={!isManager}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={Boolean(
                          formik.touched.inspected_by_id &&
                            formik.errors.inspected_by_id
                        )}
                        fullWidth
                        helperText={
                          formik.touched.inspected_by_id &&
                          formik.errors.inspected_by_id
                        }
                        placeholder="Select task inspector"
                        variant="outlined"
                      />
                    )}
                    onChange={(event, newValue) => {
                      setSelInspector(newValue);
                      formik.setFieldValue(
                        "inspected_by_id",
                        newValue ? newValue.id : undefined
                      );
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Vendor
                  </Typography>
                  <Autocomplete
                    options={vendors ?? []}
                    getOptionLabel={(option) =>
                      option.first_name
                        ? `${option.first_name} ${option.last_name}`
                        : ""
                    }
                    value={
                      selVendor
                        ? vendors?.find((_) => _.id === selVendor?.id)
                        : null
                    }
                    size="small"
                    disabled={!isManager || Boolean(selTeam)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={Boolean(
                          formik.touched.vendor_id && formik.errors.vendor_id
                        )}
                        fullWidth
                        helperText={
                          formik.touched.vendor_id && formik.errors.vendor_id
                        }
                        placeholder="Select task vendor"
                        variant="outlined"
                      />
                    )}
                    onChange={(event, newValue) => {
                      setSelVendor(newValue);
                      formik.setFieldValue(
                        "vendor_id",
                        newValue ? newValue.id : undefined
                      );
                    }}
                  />
                </Box>
              </Box>
            )}
          </Card>
          <Card>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ textTransform: "uppercase", fontWeight: 600 }}
              >
                Photos
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    name="is_default_Photo"
                    checked={formik.values.isDefaultPhoto}
                    onChange={(e) => {
                      formik.setFieldValue("isDefaultPhoto", e.target.checked);
                    }}
                  />
                }
                label="Use Default"
                labelPlacement="start"
              />
            </Box>

            {files?.filter((_) => !_.deleted)?.length > 0 && (
              <Box>
                <Grid container spacing={2}>
                  {files
                    ?.filter((_) => !_.deleted)
                    ?.slice(0, showAllPhotos ? undefined : 3)
                    .map((file, index) => (
                      <Grid item xs={3} key={index}>
                        <Box
                          sx={{
                            position: "relative",
                            paddingTop: "100%",
                            cursor:
                              isDisabled || !isManager ? "default" : "pointer",
                            "&:hover .remove-icon": { opacity: 1 },
                          }}
                          onClick={() =>
                            !isDisabled && isManager && handlePhotoClick(file)
                          }
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundImage: `url("${file.url}")`,
                              backgroundPosition: "center",
                              backgroundSize: "cover",
                              borderRadius: 1,
                            }}
                          />
                          {!isDisabled && isManager && (
                            <IconButton
                              size="small"
                              sx={{
                                position: "absolute",
                                top: -12,
                                right: -12,
                                bgcolor: "background.paper",
                                opacity: 0,
                                transition: "opacity 0.2s",
                              }}
                              className="remove-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onImageRemove?.(file.url);
                              }}
                            >
                              <Cancel fontSize="small" color="error" />
                            </IconButton>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  {!showAllPhotos &&
                  files?.filter((_) => !_.deleted)?.length > 3 ? (
                    <Grid item xs={3}>
                      <Box
                        sx={{
                          height: 0,
                          paddingTop: "100%",
                          position: "relative",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          cursor: "pointer",
                          transition: "all 0.3s",
                          "&:hover": {
                            borderColor: "primary.main",
                            "& .viewMoreLessText": {
                              color: "primary.main",
                            },
                          },
                        }}
                        onClick={() => setShowAllPhotos(true)}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            className="viewMoreLessText"
                          >
                            View More
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ) : (
                    showAllPhotos &&
                    files?.filter((_) => !_.deleted)?.length > 3 && (
                      <Grid item xs={3}>
                        <Box
                          sx={{
                            height: 0,
                            paddingTop: "100%",
                            position: "relative",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            cursor: "pointer",
                            transition: "all 0.3s",
                            "&:hover": {
                              borderColor: "primary.main",
                              "& .viewMoreLessText": {
                                color: "primary.main",
                              },
                            },
                          }}
                          onClick={() => setShowAllPhotos(false)}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Typography
                              variant="body2"
                              className="viewMoreLessText"
                            >
                              View Less
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )
                  )}
                </Grid>
              </Box>
            )}

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
            >
              <Box>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="task-image"
                  type="file"
                  multiple
                  onChange={onImageSelect}
                  disabled={isDisabled || !isManager}
                />
                <label htmlFor="task-image">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AddAPhoto />}
                    disabled={isDisabled || !isManager}
                  >
                    Add Photos
                  </Button>
                </label>
              </Box>
              {files?.filter((_) => !_.deleted)?.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={onImageRemoveAll}
                  disabled={isDisabled || !isManager}
                  startIcon={<DeleteSweep />}
                >
                  Remove All
                </Button>
              )}
            </Box>

            <Modal
              open={!!selectedPhoto}
              onClose={() => setSelectedPhoto(null)}
              aria-labelledby="photo-description-modal"
              aria-describedby="photo-description-modal"
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 400,
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" component="h2" gutterBottom>
                  Photo Description
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={selectedPhoto?.description || ""}
                  onChange={(e) =>
                    setSelectedPhoto({
                      ...selectedPhoto,
                      description: e.target.value,
                    })
                  }
                  disabled={isDisabled || !isManager}
                />
                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button onClick={() => setSelectedPhoto(null)}>Cancel</Button>
                  <Button
                    onClick={() => {
                      onImageDescriptionChange(
                        selectedPhoto.url,
                        selectedPhoto.description
                      );
                      setSelectedPhoto(null);
                    }}
                    disabled={isDisabled || !isManager}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            </Modal>
          </Card>
          {/* ---------------- checklist card -------------------- */}
          <Card sx={{ my: 3 }}>
            <Box sx={{ display: "flex" }}>
              <Box sx={{ mb: 2, mt: 2 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ textTransform: "uppercase", fontWeight: 600 }}
                >
                  Checklist
                </Typography>
              </Box>
              <FormControlLabel
                sx={{
                  ml: "auto",
                  mr: 2,
                  display: "flex",
                  flexDirection: "row-reverse",
                  color: "#65748B",
                }}
                control={
                  <Switch
                    name="is_complete"
                    checked={formik.values.is_complete}
                    onChange={(e) => {
                      formik.setFieldValue(
                        "is_complete",
                        e.currentTarget.checked
                      );
                      let data = [...checkList];
                      if (e.currentTarget.checked) {
                        const defaultCheckList = unitAreas?.data?.map((_) => ({
                          checklist_title: `Complete ${_.area_name}`,
                          description: `Complete ${_.area_name}`,
                          unit_area_id: _.id,
                          area_type: _.area_type,
                          action: "",
                          custom: true,
                          default: true,
                        }));
                        setCheckList([...data, ...defaultCheckList]);
                      } else {
                        let newChecklist = data?.filter((_) => !_.default);
                        setCheckList(newChecklist);
                      }
                    }}
                    disabled={isDisabled || task || !unitAreas || !isManager}
                  />
                }
                label="Use Default"
                labelPlacement="start"
              />
            </Box>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Autocomplete
                  options={unitAreas?.data ?? []}
                  getOptionLabel={(option) =>
                    option.area_name ? option.area_name : ""
                  }
                  size="small"
                  sx={{ minWidth: "33%" }}
                  disabled={isDisabled || !isManager}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      disabled={isDisabled || !isManager}
                      fullWidth
                      label="Select Unit Area"
                      placeholder="Select Unit Area"
                    />
                  )}
                  onChange={(event, newValue) => {
                    setSelUnitArea(newValue);
                  }}
                />
                <Autocomplete
                  options={
                    taskChecklist && selUnitArea && formik.values.task_type
                      ? taskChecklist?.data?.data?.filter(
                          (_) =>
                            _.area_type === selUnitArea.area_type &&
                            _.task_type === formik.values.task_type
                        )
                      : []
                  }
                  getOptionLabel={(option) =>
                    option.checklist_title ? option.checklist_title : ""
                  }
                  size="small"
                  freeSolo
                  clearOnBlur
                  sx={{ ml: 2, minWidth: "57%" }}
                  disabled={
                    isDisabled ||
                    !selUnitArea ||
                    !formik.values.task_type ||
                    !isManager
                  }
                  value={currentCheckList?.check_list || null}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      disabled={
                        isDisabled ||
                        !selUnitArea ||
                        !formik.values.task_type ||
                        !isManager
                      }
                      fullWidth
                      label="Select Checklist"
                      placeholder="Select Checklist"
                    />
                  )}
                  onChange={(event, newValue) => {
                    event.preventDefault();
                    if (newValue) {
                      if (typeof newValue === "string") {
                        setCurrentCheckList({
                          checklist_title: newValue,
                          description: newValue,
                          unit_area_id: selUnitArea.id,
                          area_type: selUnitArea.area_type,
                          action: "",
                          check_list: newValue,
                          custom: true,
                          [formik.values.task_type === "GuestSelection" &&
                          newValue["all_cat_ids"] !== undefined &&
                          newValue["all_cat_ids"].length > 0 &&
                          newValue["category_type"]
                            ? "all_cat_ids"
                            : // newValue['category_type'] === 'Product' ? 'cat_product_id' : newValue['category_type'] === 'Element' ? 'cat_element_id' : 'cat_amenity_id'
                              undefined]: newValue["all_cat_ids"],
                          // newValue[`cat_${newValue['category_type'].toLowerCase()}_id`],
                          [formik.values.task_type === "GuestSelection" &&
                          newValue["all_cat_ids"] !== undefined &&
                          newValue["all_cat_ids"].length > 0 &&
                          newValue["category_type"]
                            ? "category_type"
                            : undefined]: newValue["category_type"],
                        });
                      } else {
                        setCurrentCheckList({
                          check_list: newValue,
                          checklist_title: newValue.checklist_title,
                          description: newValue.description,
                          unit_area_id: selUnitArea.id,
                          area_type: selUnitArea.area_type,
                          action: "",
                          custom: false,
                          [formik.values.task_type === "GuestSelection" &&
                          newValue["all_cat_ids"] !== undefined &&
                          newValue["all_cat_ids"].length > 0 &&
                          newValue["category_type"]
                            ? "all_cat_ids"
                            : // newValue['category_type'] === 'Product' ? 'cat_product_id' : newValue['category_type'] === 'Element' ? 'cat_element_id' : 'cat_amenity_id'
                              undefined]: newValue["all_cat_ids"],
                          // newValue[`cat_${newValue['category_type'].toLowerCase()}_id`],
                          [formik.values.task_type === "GuestSelection" &&
                          newValue["all_cat_ids"] !== undefined &&
                          newValue["all_cat_ids"].length > 0 &&
                          newValue["category_type"]
                            ? "category_type"
                            : undefined]: newValue["category_type"],
                        });
                      }
                    } else {
                      setCurrentCheckList();
                    }
                  }}
                />
                <IconButton
                  disabled={
                    isDisabled ||
                    !selUnitArea ||
                    !formik.values.task_type ||
                    !isManager
                  }
                  className="checklistButton"
                  sx={{ backgroundColor: "primary.main", ml: 1 }}
                  onClick={() => {
                    if (currentCheckList) {
                      updateCheckList(
                        currentCheckList.checklist_title,
                        currentCheckList.description,
                        currentCheckList?.check_list?.checklist_code,
                        currentCheckList.unit_area_id,
                        currentCheckList.area_type,
                        currentCheckList.action,
                        currentCheckList.custom,
                        Object.keys(currentCheckList).includes("category_type")
                          ? `category_type=${currentCheckList["category_type"]}`
                          : undefined,
                        Object.keys(currentCheckList).includes("category_type")
                          ? `all_cat_ids=${currentCheckList[`all_cat_ids`]}`
                          : undefined
                        // Object.keys(currentCheckList).includes('cat_element_id') || Object.keys(currentCheckList).includes('cat_product_id') || Object.keys(currentCheckList).includes('cat_amenity_id') ?
                        // Object.keys(currentCheckList).includes('cat_element_id') ? currentCheckList['cat_element_id'] : Object.keys(currentCheckList).includes('cat_product_id') ? currentCheckList['cat_product_id'] : currentCheckList['cat_amenity_id']
                        // : undefined
                      );
                      setCurrentCheckList(null);
                    }
                  }}
                >
                  <CheckCircleOutline
                    fontSize="small"
                    sx={{ color: "white" }}
                  />
                </IconButton>
              </Box>
              <Box>
                {!formik.values.task_template_id
                  ? uniqueArea?.map((_area, idx) => (
                      <Accordion
                        key={idx}
                        sx={{
                          my: 2,
                          "&:before": { backgroundColor: "transparent" },
                        }}
                        //style={{ backgroundColor: "yellow" }}
                      >
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="button">
                            {
                              unitAreas?.data?.find(
                                (_) => _.id === parseInt(_area)
                              )?.area_name
                            }
                          </Typography>
                          <Divider sx={{ mt: 2 }} />
                        </AccordionSummary>
                        <Divider />
                        <AccordionDetails>
                          <List>
                            {checkList
                              ?.filter(
                                (_) => _.unit_area_id === parseInt(_area)
                              )
                              ?.map((_cl, clIdx) => (
                                <Box key={clIdx}>
                                  <ListItem key={clIdx} sx={{ p: 0 }}>
                                    {!isDisabled && isManager && (
                                      <IconButton
                                        onClick={() =>
                                          updateCheckList(
                                            _cl.checklist_title,
                                            _cl.description,
                                            _cl.checklist_code,
                                            _cl.unit_area_id,
                                            _cl.area_type,
                                            "remove"
                                          )
                                        }
                                      >
                                        <Cancel
                                          fontSize="small"
                                          sx={{
                                            color: "red",
                                          }}
                                        />
                                      </IconButton>
                                    )}
                                    <Typography>
                                      {_cl.checklist_title}
                                    </Typography>
                                  </ListItem>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    {guestTaskCategoryData &&
                                    formik.values.task_type ===
                                      "GuestSelection" &&
                                    _cl["category_type"] !== undefined &&
                                    _cl["all_cat_ids"] !== undefined &&
                                    _cl["all_cat_ids"].length > 0 &&
                                    _cl["category_type"] === "Element"
                                      ? guestTaskCategoryData["Element"]?.map(
                                          (elItem, idx) => (
                                            <Box
                                              key={idx}
                                              sx={{
                                                mx: 2,
                                                my: 1,
                                                display: "flex",
                                                flexDirection: "row",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                              }}
                                            >
                                              <Typography
                                                variant="subtitle2"
                                                sx={{ minWidth: "60%" }}
                                              >
                                                {elItem.name}
                                              </Typography>
                                              <TextField
                                                type="number"
                                                variant="outlined"
                                                size="small"
                                                label="Count"
                                                sx={{ width: "150px" }}
                                                name="count"
                                                min={0}
                                                onChange={(e) => {
                                                  let newGuestTaskCategoryData =
                                                    {
                                                      ...guestTaskCategoryData,
                                                    };
                                                  let elCategories = [
                                                    ...newGuestTaskCategoryData[
                                                      "Element"
                                                    ],
                                                  ];
                                                  elCategories[idx].count =
                                                    parseInt(e.target.value);
                                                  newGuestTaskCategoryData[
                                                    "Element"
                                                  ] = elCategories;
                                                  setGuestTaskCategoryData(
                                                    newGuestTaskCategoryData
                                                  );
                                                }}
                                                value={elItem.count}
                                                disabled={
                                                  isDisabled || !isManager
                                                }
                                              />
                                              <IconButton
                                                disabled={
                                                  !formik.values.task_type ||
                                                  !isManager
                                                }
                                                className="checklistButton"
                                                sx={{
                                                  backgroundColor:
                                                    "primary.main",
                                                  mx: 1,
                                                }}
                                                onClick={() => {
                                                  if (elItem.inventories) {
                                                    delete elItem.inventories;
                                                  }
                                                  (async () => {
                                                    await updateElement(elItem);
                                                    toast.success(
                                                      "Count changed"
                                                    );
                                                  })();
                                                }}
                                              >
                                                {isElementLoading ? (
                                                  <CircularProgress
                                                    style={{ color: "white" }}
                                                    size={16}
                                                  />
                                                ) : (
                                                  <CheckCircleOutline
                                                    fontSize="small"
                                                    sx={{ color: "white" }}
                                                  />
                                                )}
                                              </IconButton>
                                            </Box>
                                          )
                                        )
                                      : _cl["category_type"] === "Amenity"
                                      ? guestTaskCategoryData &&
                                        guestTaskCategoryData["Amenity"]?.map(
                                          (amnItem, idx) => (
                                            <Box
                                              key={idx}
                                              sx={{
                                                mx: 2,
                                                my: 1,
                                                display: "flex",
                                                flexDirection: "row",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                              }}
                                            >
                                              <Typography
                                                variant="subtitle2"
                                                sx={{ minWidth: "60%" }}
                                              >
                                                {amnItem.name}
                                              </Typography>
                                              <TextField
                                                type="number"
                                                variant="outlined"
                                                size="small"
                                                label="Count"
                                                sx={{ width: "150px" }}
                                                name="count"
                                                min={0}
                                                onChange={(e) => {
                                                  let newGuestTaskCategoryData =
                                                    {
                                                      ...guestTaskCategoryData,
                                                    };
                                                  let elCategories = [
                                                    ...newGuestTaskCategoryData[
                                                      "Amenity"
                                                    ],
                                                  ];
                                                  elCategories[idx].count =
                                                    parseInt(e.target.value);
                                                  newGuestTaskCategoryData[
                                                    "Amenity"
                                                  ] = elCategories;
                                                  setGuestTaskCategoryData(
                                                    newGuestTaskCategoryData
                                                  );
                                                }}
                                                value={amnItem.count}
                                                disabled={
                                                  isDisabled || !isManager
                                                }
                                              />
                                              <IconButton
                                                disabled={
                                                  !formik.values.task_type ||
                                                  !isManager
                                                }
                                                className="checklistButton"
                                                sx={{
                                                  backgroundColor:
                                                    "primary.main",
                                                  mx: 1,
                                                }}
                                                onClick={() => {
                                                  if (amnItem.inventories) {
                                                    delete amnItem.inventories;
                                                  }
                                                  (async () => {
                                                    await updateAmenity(
                                                      amnItem
                                                    );
                                                    toast.success(
                                                      "Count changed"
                                                    );
                                                  })();
                                                }}
                                              >
                                                {isAmenityLoading ? (
                                                  <CircularProgress
                                                    style={{ color: "white" }}
                                                    size={16}
                                                  />
                                                ) : (
                                                  <CheckCircleOutline
                                                    fontSize="small"
                                                    sx={{ color: "white" }}
                                                  />
                                                )}
                                              </IconButton>
                                            </Box>
                                          )
                                        )
                                      : _cl["category_type"] === "Product" &&
                                        guestTaskCategoryData &&
                                        guestTaskCategoryData["Product"]?.map(
                                          (proItem, idx) => (
                                            <Box
                                              key={idx}
                                              sx={{ mx: 2, my: 1 }}
                                            >
                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  flexDirection: "row",
                                                  alignItems: "center",
                                                  justifyContent:
                                                    "space-between",
                                                }}
                                              >
                                                <Typography
                                                  variant="subtitle2"
                                                  sx={{ minWidth: "60%" }}
                                                >
                                                  {proItem.name}
                                                </Typography>
                                                <TextField
                                                  type="number"
                                                  variant="outlined"
                                                  size="small"
                                                  label="Count"
                                                  sx={{ width: "150px" }}
                                                  name="count"
                                                  min={0}
                                                  onChange={(e) => {
                                                    let newGuestTaskCategoryData =
                                                      {
                                                        ...guestTaskCategoryData,
                                                      };
                                                    let elCategories = [
                                                      ...newGuestTaskCategoryData[
                                                        "Product"
                                                      ],
                                                    ];
                                                    elCategories[idx].count =
                                                      parseInt(e.target.value);
                                                    newGuestTaskCategoryData[
                                                      "Product"
                                                    ] = elCategories;
                                                    setGuestTaskCategoryData(
                                                      newGuestTaskCategoryData
                                                    );
                                                  }}
                                                  value={proItem.count}
                                                  disabled={
                                                    isDisabled || !isManager
                                                  }
                                                />
                                                <IconButton
                                                  disabled={
                                                    !formik.values.task_type ||
                                                    !isManager
                                                  }
                                                  className="checklistButton"
                                                  sx={{
                                                    backgroundColor:
                                                      "primary.main",
                                                    mx: 1,
                                                  }}
                                                  onClick={() => {
                                                    if (proItem.inventories) {
                                                      delete proItem.inventories;
                                                    }
                                                    (async () => {
                                                      await updateproduct(
                                                        proItem
                                                      );
                                                      toast.success(
                                                        "Count changed"
                                                      );
                                                    })();
                                                  }}
                                                >
                                                  {isProductLoading ? (
                                                    <CircularProgress
                                                      style={{
                                                        color: "white",
                                                      }}
                                                      size={16}
                                                    />
                                                  ) : (
                                                    <CheckCircleOutline
                                                      fontSize="small"
                                                      sx={{ color: "white" }}
                                                    />
                                                  )}
                                                </IconButton>
                                              </Box>
                                              <Typography
                                                variant="subtitle2"
                                                sx={{ minWidth: "100%" }}
                                              >
                                                {proItem?.user_comment}
                                              </Typography>
                                            </Box>
                                          )
                                        )}
                                  </Box>
                                </Box>
                              ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    ))
                  : templateAreatypes.length > 0 &&
                    templateAreatypes.map((tmpArea, idx) => (
                      <Accordion
                        key={idx}
                        sx={{
                          my: 2,
                          "&:before": { backgroundColor: "transparent" },
                        }}
                        //style={{ backgroundColor: "yellow" }}
                      >
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="button">
                            {tmpArea.area_name}
                          </Typography>
                          <Divider sx={{ mt: 2 }} />
                        </AccordionSummary>
                        <Divider />
                        <AccordionDetails>
                          {newtemplatechecklist.length > 0 &&
                            newtemplatechecklist
                              .filter(
                                (ckItem) =>
                                  ckItem.area_type === tmpArea.area_type
                              )
                              .map((item, idx) => (
                                <List key={idx}>
                                  <Box>
                                    <ListItem sx={{ p: 0 }}>
                                      {!isDisabled && isManager && (
                                        <IconButton>
                                          <Cancel
                                            fontSize="small"
                                            sx={{
                                              color: "red",
                                            }}
                                          />
                                        </IconButton>
                                      )}
                                      <Typography>
                                        {item.checklist_title}
                                      </Typography>
                                    </ListItem>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                      }}
                                    >
                                      {guestTaskCategoryData &&
                                      formik.values.task_type ===
                                        "GuestSelection" &&
                                      item.task_type === "GuestSelection" &&
                                      item["category_type"] === "Element"
                                        ? guestTaskCategoryData["Element"]?.map(
                                            (elItem, idx) => (
                                              <Box
                                                key={idx}
                                                sx={{
                                                  mx: 2,
                                                  my: 1,
                                                  display: "flex",
                                                  flexDirection: "row",
                                                  alignItems: "center",
                                                  justifyContent:
                                                    "space-between",
                                                }}
                                              >
                                                <Typography
                                                  variant="subtitle2"
                                                  sx={{ minWidth: "60%" }}
                                                >
                                                  {elItem.name}
                                                </Typography>
                                                <TextField
                                                  type="number"
                                                  variant="outlined"
                                                  size="small"
                                                  label="Count"
                                                  sx={{ width: "150px" }}
                                                  name="count"
                                                  min={0}
                                                  onChange={(e) => {
                                                    let newGuestTaskCategoryData =
                                                      {
                                                        ...guestTaskCategoryData,
                                                      };
                                                    let elCategories = [
                                                      ...newGuestTaskCategoryData[
                                                        "Element"
                                                      ],
                                                    ];
                                                    elCategories[idx].count =
                                                      parseInt(e.target.value);
                                                    newGuestTaskCategoryData[
                                                      "Element"
                                                    ] = elCategories;
                                                    setGuestTaskCategoryData(
                                                      newGuestTaskCategoryData
                                                    );
                                                  }}
                                                  value={elItem.count}
                                                  disabled={
                                                    isDisabled || !isManager
                                                  }
                                                />
                                                <IconButton
                                                  disabled={
                                                    !formik.values.task_type ||
                                                    !isManager
                                                  }
                                                  className="checklistButton"
                                                  sx={{
                                                    backgroundColor:
                                                      "primary.main",
                                                    mx: 1,
                                                  }}
                                                  onClick={() => {
                                                    if (elItem.inventories) {
                                                      delete elItem.inventories;
                                                    }
                                                    (async () => {
                                                      await updateElement(
                                                        elItem
                                                      );
                                                      toast.success(
                                                        "Count changed"
                                                      );
                                                    })();
                                                  }}
                                                >
                                                  {isElementLoading ? (
                                                    <CircularProgress
                                                      style={{
                                                        color: "white",
                                                      }}
                                                      size={16}
                                                    />
                                                  ) : (
                                                    <CheckCircleOutline
                                                      fontSize="small"
                                                      sx={{ color: "white" }}
                                                    />
                                                  )}
                                                </IconButton>
                                              </Box>
                                            )
                                          )
                                        : item["category_type"] === "Amenity"
                                        ? guestTaskCategoryData["Amenity"]?.map(
                                            (amnItem, idx) => (
                                              <Box
                                                key={idx}
                                                sx={{
                                                  mx: 2,
                                                  my: 1,
                                                  display: "flex",
                                                  flexDirection: "row",
                                                  alignItems: "center",
                                                  justifyContent:
                                                    "space-between",
                                                }}
                                              >
                                                <Typography
                                                  variant="subtitle2"
                                                  sx={{ minWidth: "60%" }}
                                                >
                                                  {amnItem.name}
                                                </Typography>
                                                <TextField
                                                  type="number"
                                                  variant="outlined"
                                                  size="small"
                                                  label="Count"
                                                  sx={{ width: "150px" }}
                                                  name="count"
                                                  min={0}
                                                  onChange={(e) => {
                                                    let newGuestTaskCategoryData =
                                                      {
                                                        ...guestTaskCategoryData,
                                                      };
                                                    let elCategories = [
                                                      ...newGuestTaskCategoryData[
                                                        "Amenity"
                                                      ],
                                                    ];
                                                    elCategories[idx].count =
                                                      parseInt(e.target.value);
                                                    newGuestTaskCategoryData[
                                                      "Amenity"
                                                    ] = elCategories;
                                                    setGuestTaskCategoryData(
                                                      newGuestTaskCategoryData
                                                    );
                                                  }}
                                                  value={amnItem.count}
                                                  disabled={
                                                    isDisabled || !isManager
                                                  }
                                                />
                                                <IconButton
                                                  disabled={
                                                    !formik.values.task_type ||
                                                    !isManager
                                                  }
                                                  className="checklistButton"
                                                  sx={{
                                                    backgroundColor:
                                                      "primary.main",
                                                    mx: 1,
                                                  }}
                                                  onClick={() => {
                                                    if (amnItem.inventories) {
                                                      delete amnItem.inventories;
                                                    }
                                                    (async () => {
                                                      await updateAmenity(
                                                        amnItem
                                                      );
                                                      toast.success(
                                                        "Count changed"
                                                      );
                                                    })();
                                                  }}
                                                >
                                                  {isAmenityLoading ? (
                                                    <CircularProgress
                                                      style={{
                                                        color: "white",
                                                      }}
                                                      size={16}
                                                    />
                                                  ) : (
                                                    <CheckCircleOutline
                                                      fontSize="small"
                                                      sx={{ color: "white" }}
                                                    />
                                                  )}
                                                </IconButton>
                                              </Box>
                                            )
                                          )
                                        : item["category_type"] === "Product" &&
                                          guestTaskCategoryData["Product"]?.map(
                                            (proItem, idx) => (
                                              <Box
                                                key={idx}
                                                sx={{ mx: 2, my: 1 }}
                                              >
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    justifyContent:
                                                      "space-between",
                                                  }}
                                                >
                                                  <Typography
                                                    variant="subtitle2"
                                                    sx={{ minWidth: "60%" }}
                                                  >
                                                    {proItem.name}
                                                  </Typography>
                                                  <TextField
                                                    type="number"
                                                    variant="outlined"
                                                    size="small"
                                                    label="Count"
                                                    sx={{ width: "150px" }}
                                                    name="count"
                                                    min={0}
                                                    onChange={(e) => {
                                                      let newGuestTaskCategoryData =
                                                        {
                                                          ...guestTaskCategoryData,
                                                        };
                                                      let elCategories = [
                                                        ...newGuestTaskCategoryData[
                                                          "Product"
                                                        ],
                                                      ];
                                                      elCategories[idx].count =
                                                        parseInt(
                                                          e.target.value
                                                        );
                                                      newGuestTaskCategoryData[
                                                        "Product"
                                                      ] = elCategories;
                                                      setGuestTaskCategoryData(
                                                        newGuestTaskCategoryData
                                                      );
                                                    }}
                                                    value={proItem.count}
                                                    disabled={
                                                      isDisabled || !isManager
                                                    }
                                                  />
                                                  <IconButton
                                                    disabled={
                                                      !formik.values
                                                        .task_type || !isManager
                                                    }
                                                    className="checklistButton"
                                                    sx={{
                                                      backgroundColor:
                                                        "primary.main",
                                                      mx: 1,
                                                    }}
                                                    onClick={() => {
                                                      if (proItem.inventories) {
                                                        delete proItem.inventories;
                                                      }
                                                      (async () => {
                                                        await updateproduct(
                                                          proItem
                                                        );
                                                        toast.success(
                                                          "Count changed"
                                                        );
                                                      })();
                                                    }}
                                                  >
                                                    {isProductLoading ? (
                                                      <CircularProgress
                                                        style={{
                                                          color: "white",
                                                        }}
                                                        size={16}
                                                      />
                                                    ) : (
                                                      <CheckCircleOutline
                                                        fontSize="small"
                                                        sx={{
                                                          color: "white",
                                                        }}
                                                      />
                                                    )}
                                                  </IconButton>
                                                </Box>
                                                <Typography
                                                  variant="subtitle2"
                                                  sx={{ minWidth: "100%" }}
                                                >
                                                  {proItem?.user_comment}
                                                </Typography>
                                              </Box>
                                            )
                                          )}
                                    </Box>
                                  </Box>
                                </List>
                              ))}
                        </AccordionDetails>
                      </Accordion>
                      // <Accordion
                      //   key={idx}
                      //   sx={{
                      //     my: 2,
                      //     "&:before": { backgroundColor: "transparent" },
                      //   }}
                      // //style={{ backgroundColor: "yellow" }}
                      // >
                      //   <AccordionSummary expandIcon={<ExpandMore />}>
                      //     <Typography variant="button">
                      //       {item.area_type}
                      //     </Typography>
                      //     <Divider sx={{ mt: 2 }} />
                      //   </AccordionSummary>
                      //   <Divider />
                      //   <AccordionDetails>
                      //     <List>
                      //       <ListItem sx={{ p: 0 }}>
                      //         {!isDisabled && isManager && (
                      //           <IconButton>
                      //             <Cancel
                      //               fontSize="small"
                      //               sx={{
                      //                 color: "red",
                      //               }}
                      //             />
                      //           </IconButton>
                      //         )}
                      //         <Typography>{item.checklist_title}</Typography>
                      //       </ListItem>
                      //     </List>
                      //   </AccordionDetails>
                      // </Accordion>
                    ))}
              </Box>
            </Box>
          </Card>
          <Card sx={{ display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ textTransform: "uppercase", fontWeight: 600 }}
              >
                TASK QUERIES
              </Typography>
            </Box>
            <Box sx={{ p: 1.5 }}>
              {task && task.owner_querries && task.owner_querries.length > 0 ? (
                task.owner_querries.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      justifyContent:
                        user.id === item?.sender?.id
                          ? "flex-end"
                          : "flex-start",
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "70%",
                        backgroundColor:
                          user.id === item?.sender?.id
                            ? "primary.main"
                            : "grey.100",
                        color:
                          user.id === item?.sender?.id
                            ? "common.white"
                            : "text.primary",
                        borderRadius: 1,
                        p: 1,
                        boxShadow: 1,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {item?.sender?.first_name} {item?.sender?.last_name} (
                        {item?.sender?.user_role?.role})
                      </Typography>
                      <Typography variant="body2">{item.comment}</Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  No queries yet
                </Typography>
              )}
            </Box>
            <Box sx={{ p: 1.5, borderTop: 1, borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type your query..."
                  value={taskQuery}
                  onChange={(e) => setTaskQuery(e.target.value)}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  disabled={
                    addQueryLoading || task?.status === "Rejected By Owner"
                  }
                  onClick={() => {
                    if (taskQuery.trim() !== "") {
                      addTaskQuery({
                        sender_id: user.id,
                        task_id: task.id,
                        comment: taskQuery,
                      });
                    } else {
                      toast.error("Please enter task query");
                    }
                  }}
                >
                  Send
                </Button>
              </Box>
            </Box>
          </Card>

          {task && user?.user_role?.role === "Owner" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                my: 2,
                width: "80%",
                mx: "auto",
              }}
            >
              <Button
                color="primary"
                size="small"
                variant="contained"
                disabled={
                  task.status === "Approved By Owner" ||
                  task.status === "Rejected By Owner" ||
                  task.owner_querries.length === 0
                }
                // sx={{ my: 1 }}
                onClick={() => {
                  (async () => {
                    await updateTaskStatus({
                      id: task.id,
                      status: "Approved By Owner",
                    });
                    toast.success("Task has been approved");
                  })();
                }}
              >
                Approve
              </Button>
              <Button
                color="primary"
                size="small"
                variant="contained"
                disabled={
                  task.status === "Approved By Owner" ||
                  task.status === "Rejected By Owner" ||
                  task.owner_querries.length === 0
                }
                // sx={{ my: 1 }}
                onClick={() => {
                  (async () => {
                    await updateTaskStatus({
                      id: task.id,
                      status: "Rejected By Owner",
                    });
                    toast.success("Task has been rejected");
                  })();
                }}
              >
                Reject
              </Button>
            </Box>
          )}
        </Box>
        {!isDisabled && (
          <Box
            sx={{
              backgroundColor: "white",
              px: 3,
              py: 1,
              zIndex: 4000,
              position: "sticky",
              bottom: 0,
            }}
          >
            <Button
              sx={{ m: 1, ml: "auto", minWidth: "100px" }}
              color="primary"
              fullWidth
              disabled={formik.isSubmitting}
              type="submit"
              variant="contained"
            >
              {formik.isSubmitting ? (
                <CircularProgress style={{ color: "white" }} size={26} />
              ) : (
                "Save Task"
              )}
            </Button>
          </Box>
        )}
      </form>

      {/* {currentTab === "inspectiondetails" && (
        <Box
          sx={{
            py: 4,
            px: 3,
          }}
        >
          <h6> Inspection Details</h6>
        </Box>
      )} */}
    </Drawer>
  );
};

TaskDrawer.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
