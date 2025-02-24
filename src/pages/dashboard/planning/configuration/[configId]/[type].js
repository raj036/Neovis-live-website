import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import * as Yup from "yup";
import NextLink from "next/link";
import { Box, Button, CircularProgress, Container, IconButton, Step, StepLabel, Stepper, Tooltip, Typography } from '@mui/material'
import { useFormik } from "formik";
import { useMutation, useQueries, useQuery } from 'react-query'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'
import { grey } from '@mui/material/colors'
import { DashboardLayout } from '../../../../../components/dashboard/dashboard-layout'
import { AuthGuard } from '../../../../../components/authentication/auth-guard'
import { PencilAlt as PencilAltIcon } from "../../../../../icons/pencil-alt";
import { BackButton } from '../../../../../components/dashboard/back-button'
import useAxios from '../../../../../services/useAxios'
import Step1 from '../../../../../components/dashboard/task/configuration/config-step-1'
import Step2 from '../../../../../components/dashboard/task/configuration/config-step-2'
import Step3 from '../../../../../components/dashboard/task/configuration/config-step-3'
import Step4 from '../../../../../components/dashboard/task/configuration/config-step-4'


const TaskConfiguration = () => {
  const [mode, setMode] = useState("add");
  const [activeStep, setActiveStep] = useState(0);
  const [reservationAddons, setReservationAddons] = useState([]);
  const [selProperty, setSelProperty] = useState([]);
  const [selUnitGroup, setSelUnitGroup] = useState([]);
  const [selUnitArea, setSelUnitArea] = useState();
  const [selUnits, setSelectedUnits] = useState([]);
  const [units, setUnits] = useState([]);
  const [unitsApiData, setUnitsApiData] = useState([]);
  const [currentCheckList, setCurrentCheckList] = useState([]);
  const [useDefault, setUseDefault] = useState(false);
  const [uniqueArea, setUniqueArea] = useState([]);
  const [checkList, setCheckList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [configId, setConfigId] = useState();
  const [descriptionErr, setDescriptionErr] = useState({
    description: false,
    task_description: false
  })
  const steps = ["Task Config Info", "Selectors", "Config Properties", "Checklist"];

  const backBtnColor = (code = 700) => {
    return grey[code];
  }

  const router = useRouter();
  const customInstance = useAxios();

  const { data: amenities } = useQuery("amenities", () =>
    customInstance.get(`amentities`)
  );

  const { mutateAsync: addConfiguration } = useMutation((data) =>
    customInstance.post(`task-rule`, data)
  );

  const { data: configData, refetch: configByIdRefetch, isLoading, isFetching } = useQuery("getConfig", () =>
    customInstance.get(`task-rule/${configId}`),
    { enabled: (configId !== undefined && configId !== "newconfig") }
  );

  const { mutateAsync: updateConfigRefetch } = useMutation((data) =>
    customInstance.patch(`task-rule/${configId}`, data)
  );

  const { data: properties } = useQuery("allProperty", () =>
    customInstance.get(`properties`)
  );

  const { data: unitgroups, refetch: unitGroupRefetch } = useQuery(
    "unitsGroups",
    () => customInstance.get(`properties/${selProperty?.id}`),
    { enabled: selProperty?.id !== undefined }
  );

  const { data: unitAreas, refetch: unitAreasRefetch } = useQuery(
    "taskUnitAreas",
    () =>
      customInstance.get(
        `unit-areas/unit-type-or-property?property_id=${selProperty?.id}`
      ),
    { enabled: selProperty?.id !== undefined }
  );

  const { data: taskChecklist } = useQuery("taskChecklist", () =>
    customInstance.get(`task-checklists`)
  );

  const unitData = useQueries(
    selUnitGroup.map(ug => {
      return {
        queryKey: ['units', ug.id],
        queryFn: () => customInstance.get(`unit-group/${ug.id}`),
        enabled: selUnitGroup.length > 0,
        onSuccess: (data) => setUnitsApiData((prevData) => [...prevData, data])
      }
    })
  );

  useEffect(() => {
    if (unitsApiData?.every(api => api.status === 200)) {
      const data = new Set();
      unitsApiData?.forEach(u =>
        u?.data?.units?.forEach(unitObj =>
          data.add(JSON.stringify(unitObj))
        )
      );
      let _unitData = [];
      for (const item of data) {
        _unitData.push(JSON.parse(item));
      }
      setUnits(_unitData);
    }
  }, [unitsApiData]);

  useEffect(() => {
    if (router) {
      if (router.query.type === "edit") {
        setMode("edit");
      } else if (router.query.type === "detail") {
        setMode("detail");
      }

      if (router.query.configId !== "addConfig") {
        setConfigId(router.query.configId);
      }
    }
    return () => {
      setActiveStep(0);
      formik.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  useEffect(() => {
    if (selProperty?.id) {
      unitGroupRefetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selProperty, unitGroupRefetch, selUnitGroup]);

  const formik = useFormik({
    initialValues: {
      name: "",
      code: "",
      description: "",
      task_title: "",
      task_description: "",
      task_type: "",
      property_id: null,
      unit_group_ids: [],
      unit_ids: [],
      amenties: [],
      execution_moment: "",
      stay_type: null,
      stay_days: [],
      priority: "Medium",
      cost_amount: 0,
      cost_type: "Fixed",
      duration: 0
    },
    validationSchema: Yup.object({
      name: Yup.string().required(),
      code: Yup.string().required(),
      description: Yup.string().required().max(5000),
      task_title: Yup.string().required(),
      task_description: Yup.string().required().max(5000),
      task_type: Yup.string().required(),
      property_id: Yup.number().required(),
      unit_group_ids: Yup.array().required().min(1),
      unit_ids: Yup.array().required(),
      execution_moment: Yup.string().required(),
      stay_type: Yup.string().nullable(true)
        .when('execution_moment', {
          is: 'Stay',
          then: Yup.string().required(),
        }),
      stay_days: Yup.array()
        .when('stay_type',{
          is: stay_type => stay_type === "Weekly" || stay_type === "SpecificDays",
          then: Yup.array().required().min(1)
        }),
      cost_amount: Yup.number().required().min(0, "Invalid amount"),
      cost_type: Yup.string().required(),
      duration: Yup.number().required().min(0, "Invalid duration"),
    }),
    onSubmit: (values, helpers) => {
      if (checkList.length === 0) {
        toast.error("Please add atleast one checklist.");
        return;
      } else {
        try {
          setLoading(true);
          values.unit_ids = values.unit_ids.map(unit => unit?.id);
          values.unit_group_ids = values.unit_group_ids.map(unit => unit?.id);
          values.amenties = values.amenties?.map(unit => unit?.id);
          const additional_condition = "additional_condition";
          let condition;
          if (values.execution_moment === "Arrival" ||
            values.execution_moment === "Change Over") {
            condition = "onArrival"
          } else {
            condition = "onDeparture"
          }

          const data = {
            ...values,
            is_default_checklist: useDefault,
            additional_condition,
            condition,
            active_task_checklists: checkList
          }
          if (mode === 'edit') {
            updateConfigRefetch(data);
          } else {
            addConfiguration(data);
          }
          setLoading(false);
          helpers.setStatus({ success: true });
          helpers.setSubmitting(false);
          toast.success(`Configuration ${mode === 'edit' ? 'updated' : 'added'} successfully!`);
          formik.resetForm();
          setActiveStep(0);
          router.push('/dashboard/planning/configuration')
        } catch (err) {
          console.error(err);
          setLoading(false);
          toast.error("Something went wrong!");
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: err.message });
          helpers.setSubmitting(false);
        }
      }
    }
  })

  const fieldObject = {
    step1: [
      {
        name: 'name',
        type: 'string'
      },
      {
        name: 'code',
        type: 'string'
      },
      {
        name: 'description',
        type: 'html'
      },
    ],
    step2: [
      {
        name: 'property_id',
        type: 'number'
      },
      {
        name: 'unit_group_ids',
        type: 'array'
      },
      {
        name: 'unit_ids',
        type: 'array'
      },
    ],
    step3: [
      {
        name: 'task_title',
        type: 'string'
      },
      {
        name: 'task_type',
        type: 'string'
      },
      {
        name: 'task_description',
        type: 'html'
      },
      {
        name: 'execution_moment',
        type: 'string'
      },
      {
        name: 'cost_amount',
        type: 'number'
      },
      {
        name: 'duration',
        type: 'number'
      },
    ]
  }

  useEffect(() => {
    let data = amenities?.data?.data?.filter(
      (_) => !formik.values.amenties?.includes(_.id) && _.add_on === true
    ) ?? [];

    setReservationAddons(data)
  }, [formik.values.amenties, amenities])

  useEffect(() => {
    formik.resetForm();
    setActiveStep(0);
    if (mode !== 'add') {
      if (configData !== undefined) {
        Object.keys(configData.data)
          .filter((key) =>
            formik.initialValues.hasOwnProperty(key)
          )
          .map((key) => {
            if (key === 'property_id') {
              // Pass incoming property object 
              setSelProperty(configData?.data?.property);
              formik.setFieldValue('property_id', configData?.data.property_id)
              return;
            }
            if (key === 'amenties') {
              if (configData?.data?.amenties.length) {
                let incomingAmenities = [];
                configData?.data?.amenties.forEach(id => {
                  incomingAmenities = reservationAddons.filter(addon => addon.id === id)
                })
                formik.setFieldValue('amenties', incomingAmenities)
              }
              return;
            }
            formik.setFieldValue(key, configData.data[key]);
          })
        formik.setFieldValue('unit_group_ids', configData?.data?.unit_groups);
        formik.setFieldValue('unit_ids', configData?.data?.units);
        setCheckList(configData?.data?.active_task_checklists);
        setUseDefault(configData?.data?.is_default_checklist);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configData, mode])

  function validateHTMLContent(name) {
    if (formik.values[name]?.trim() === "") {
      setDescriptionErr(prevVal => ({ ...prevVal, [name]: true }));
      return true;
    }

    // Covert string to html format
    const parser = new DOMParser();
    const htmlString = formik.values[name];
    const parsedContent = parser.parseFromString(htmlString, 'text/html');
    const childCount = parsedContent.body.childElementCount;

    // Check if textcontent is present 
    if (childCount) {
      const err = [];
      for (let i = 0; i < childCount; i++) {
        // If textcontent present push true else false
        if (parsedContent.body.children[i].textContent?.trim() === '') {
          err.push(true);
        } else {
          err.push(false);
          break;
        }
      }
      // If there is any valid text content set error to false and vice versa
      if (err.includes(false)) {
        setDescriptionErr(prevVal => ({ ...prevVal, [name]: false }));
        return false;
      } else {
        setDescriptionErr(prevVal => ({ ...prevVal, [name]: true }));
        return true;
      }
    }
  }

  async function validateStep(fields, activeStep) {
    const errlog = fields.map((f) => {
      if ((f.type === 'string' ? formik.values[f.name]?.trim() === "" :
           f.type === 'array' ? !formik.values[f.name].length > 0 :
           f.type === 'html' ? validateHTMLContent(f.name) :
           formik.values[f.name] === null) || 
           formik.values[f.name] === undefined || 
           formik.values[f.name] === ""
      ) {
        return true;
      } else {
        return false;
      }
    })
    if(activeStep === 2) {
      if (formik.values.execution_moment === "Stay") {
        formik.setFieldTouched('stay_type', true);
      } else if (
        formik.values.execution_moment === "Stay" && 
        formik.values.stay_type === "Weekly" ||
        formik.values.stay_type === "SpecificDays" ) 
      {
        formik.setFieldTouched('stay_days', true)
      }

      await formik.validateForm();
      if(formik.errors.stay_type || formik.errors.stay_days) {
        errlog.push(true);
      }
    }
    if (errlog.includes(true)) {
      fields.forEach(f => formik.setFieldTouched(f.name));
      toast.error("Please fill all required fields.");
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  }

  const handleNext = () => {
    if (activeStep === 0) {
      validateStep(fieldObject.step1, 0);
    } else if (activeStep === 1) {
      validateStep(fieldObject.step2, 1);
    } else {
      validateStep(fieldObject.step3, 2);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <AuthGuard>
      <DashboardLayout
        isLoading={isLoading || isFetching}
      >
        <Head>
          <title>Dashboard: Task Configuration</title>
        </Head>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 5,
          }}
        >
          <Container maxWidth="md" >
            <BackButton
              path={`/dashboard/planning/configuration`}
              as="/dashboard/planning/configuration"
              title="All Configurations"
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant='h4'>
                {`${mode === "add" ? 'Create New' : mode === "edit" ? 'Edit' : 'View'} Configuration`}
              </Typography>
              {
                mode === 'detail' &&
                <Tooltip title="Edit Configuration">
                  <NextLink
                    href={`/dashboard/planning/configuration/${configId}/edit`}
                    passHref
                  >
                    <Button
                      variant='outlined'
                      component="a"
                      endIcon={<PencilAltIcon fontSize="small" />}>
                      Edit
                    </Button>
                  </NextLink>
                </Tooltip>
              }
            </Box>
            <form onSubmit={formik.handleSubmit}>
              {
                // If mode is add or edit then show form stepwise
                (mode === "add" || mode === "edit") &&
                <>
                  <Stepper sx={{ my: 4 }} activeStep={activeStep} >
                    {
                      steps.map((label, index) => {
                        return (
                          <Step key={label} >
                            <StepLabel>{label}</StepLabel>
                          </Step>
                        )
                      })
                    }
                  </Stepper>

                  <Box>
                    {
                      activeStep === 0 ?
                        <Step1
                          formik={formik}
                          descriptionErr={descriptionErr}
                          setDescriptionErr={setDescriptionErr}
                        /> :
                        activeStep === 1 ?
                          <Step2
                            formik={formik}
                            properties={properties}
                            unitgroups={unitgroups}
                            units={units}
                            selProperty={selProperty}
                            setSelProperty={setSelProperty}
                            selUnitGroup={selUnitGroup}
                            setSelUnitGroup={setSelUnitGroup}
                            selUnits={selUnits}
                            setSelectedUnits={setSelectedUnits}
                          /> :
                          activeStep === 2 ?
                            <Step3
                              formik={formik}
                              reservationAddons={reservationAddons}
                              descriptionErr={descriptionErr}
                              setDescriptionErr={setDescriptionErr}
                            /> :
                            <Step4
                              formik={formik}
                              selUnitArea={selUnitArea}
                              setSelUnitArea={setSelUnitArea}
                              unitAreas={unitAreas}
                              taskChecklist={taskChecklist?.data?.data || []}
                              currentCheckList={currentCheckList}
                              setCurrentCheckList={setCurrentCheckList}
                              uniqueArea={uniqueArea}
                              setUniqueArea={setUniqueArea}
                              checkList={checkList}
                              setCheckList={setCheckList}
                              useDefault={useDefault}
                              setUseDefault={setUseDefault}
                            />
                    }
                    <Box sx={{ pt: 2 }}>
                      <Button
                        variant='contained'
                        sx={{
                          color: 'white',
                          borderColor: backBtnColor(),
                          backgroundColor: backBtnColor(500),
                          ":hover": {
                            borderColor: backBtnColor(600),
                            backgroundColor: backBtnColor(600)
                          }
                        }}
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        size='medium'
                      >
                        Back
                      </Button>

                      <Button
                        size='medium'
                        variant='contained'
                        sx={{ float: "right" }}
                        // disabled={Object.keys(formik.errors).length > 0}
                        onClick={activeStep === steps.length - 1 ? formik.handleSubmit : handleNext}>
                        {loading === true ?
                          <CircularProgress style={{ color: "white" }} size={26} /> :
                          activeStep === steps.length - 1 ?
                            `${mode === 'edit' ? 'Edit' : 'Create'} Configuration` :
                            'Next'
                        }
                      </Button>
                    </Box>
                  </Box>
                </>
              }

              {
                // If mode is detail then show form in single page
                mode === "detail" &&
                <>
                  <Step1
                    formik={formik}
                    isDisabled={mode === "detail"}
                    title={steps[0]}
                    descriptionErr={descriptionErr}
                    setDescriptionErr={setDescriptionErr}
                  />
                  <Step2
                    formik={formik}
                    properties={properties}
                    unitgroups={unitgroups}
                    units={units}
                    selProperty={selProperty}
                    setSelProperty={setSelProperty}
                    selUnitGroup={selUnitGroup}
                    setSelUnitGroup={setSelUnitGroup}
                    selUnits={selUnits}
                    setSelectedUnits={setSelectedUnits}
                    isDisabled={mode === "detail"}
                    title={steps[1]}
                  />
                  <Step3
                    formik={formik}
                    reservationAddons={reservationAddons}
                    isDisabled={mode === "detail"}
                    title={steps[2]}
                    descriptionErr={descriptionErr}
                    setDescriptionErr={setDescriptionErr}
                  />
                  <Step4
                    formik={formik}
                    selUnitArea={selUnitArea}
                    setSelUnitArea={setSelUnitArea}
                    unitAreas={unitAreas}
                    taskChecklist={taskChecklist?.data?.data || []}
                    currentCheckList={currentCheckList}
                    setCurrentCheckList={setCurrentCheckList}
                    uniqueArea={uniqueArea}
                    setUniqueArea={setUniqueArea}
                    checkList={checkList}
                    setCheckList={setCheckList}
                    title={steps[3]}
                    isDisabled={mode === "detail"}
                    useDefault={useDefault}
                    setUseDefault={setUseDefault}
                  />
                </>
              }
            </form>
          </Container>
        </Box>
      </DashboardLayout>
    </AuthGuard>
  )
}

export default TaskConfiguration