import { Cancel, CheckCircleOutline, ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Box, Card, CardContent, Divider, FormControlLabel, Grid, IconButton, List, ListItem, Switch, TextField, Typography } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'

const Step4 = ({
  title,
  isDisabled,
  formik,
  unitAreas,
  taskChecklist,
  selUnitArea,
  setSelUnitArea,
  currentCheckList,
  setCurrentCheckList,
  uniqueArea,
  setUniqueArea,
  setCheckList,
  checkList,
  useDefault,
  setUseDefault
}) => {
  

  const updateCheckList = (
    checklist_title,
    description,
    unit_area_id,
    area_type,
    action,
    custom
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
      data.push({
        checklist_title,
        description,
        unit_area_id,
        area_type,
        custom,
      });
    }

    setCheckList(data);
  };

  useEffect(() => {
    if (checkList?.length > 0) {
      let data = checkList
        .map((item) => item.unit_area_id)
        .filter((value, index, self) => self.indexOf(value) === index);
      setUniqueArea(data);
    } else {
      setUniqueArea([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkList]);

  const unitAreaSelector = useCallback(() => {
    return (
      <Autocomplete
        options={unitAreas?.data ?? []}
        getOptionLabel={(option) =>
          option.area_name ? option.area_name : ""
        }
        size="medium"
        sx={{ minWidth: "33%" }}
        freeSolo
        value={selUnitArea}
        disabled={useDefault || !unitAreas}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            label="Select Unit Area"
            placeholder="Select Unit Area"
          />
        )}
        onChange={(event, newValue) => {
          setSelUnitArea(newValue);
        }}
      />
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitAreas, selUnitArea, useDefault])

  const checklistSelector = useCallback(() => {
    return (
      <Autocomplete
        options={
          taskChecklist && selUnitArea && formik.values.task_type
            ? taskChecklist?.filter(
              (_) =>
                _.area_type === selUnitArea.area_type &&
                _.task_type === formik.values.task_type
            )
            : []
        }
        getOptionLabel={(option) =>
          option.checklist_title ? option.checklist_title : ""
        }
        size="medium"
        freeSolo
        sx={{ ml: 2, minWidth: "57%" }}
        disabled={
          isDisabled || !selUnitArea || !formik.values.task_type
        }
        value={currentCheckList?.check_list || ''}
        renderInput={(params) => (
          <TextField
            {...params}
            disabled={
              isDisabled ||
              !selUnitArea ||
              !formik.values.task_type
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
              });
            }
          } else {
            setCurrentCheckList();
            setSelUnitArea('')
          }
        }}
      />
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCheckList, taskChecklist, selUnitArea, isDisabled])

  return (
    <Card sx={{ mt: 5, minHeight: '312px' }}>
      <CardContent>
        {
          isDisabled &&
          <Typography sx={{ mb: 3 }} variant='h5'>
            {title}
          </Typography>
        }
        <Grid container spacing={3}>
          <Grid item xs={2} sm={4} md={4} sx={{
            display: 'flex',
            gap: 4,
            alignItems: 'start',
            mt: 1.5
          }}>
            <Typography variant='subtitle1'>
              Checklist:
            </Typography>
            <FormControlLabel
              sx={{ mt: 0.2 }}
              control={
                <Switch
                  size='small'
                  name="is_complete"
                  checked={useDefault}
                  onChange={(e) => {
                    setUseDefault(prevVal => !prevVal)
                    let data = [...checkList];

                    if (e.currentTarget.checked) {
                      const defaultCheckList = unitAreas?.data?.map(
                        (_) => ({
                          checklist_title: `Complete ${_.area_name}`,
                          description: `Complete ${_.area_name}`,
                          unit_area_id: _.id,
                          area_type: _.area_type,
                          action: "",
                          custom: true,
                          default: true,
                        })
                      );
                      setCheckList([...data, ...defaultCheckList]);
                      setSelUnitArea('');
                    } else {
                      let newChecklist = data?.filter((_) => !_.default);
                      setCheckList(newChecklist);
                    }
                  }}
                  disabled={isDisabled || !unitAreas}
                />
              }
              label="Use Default"
            />
          </Grid>

          <Grid item md={8} sm={8} xs={10}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {
                unitAreaSelector()
              }
              {
                checklistSelector()
              }

              <IconButton
                disabled={
                  isDisabled || !selUnitArea || !formik.values.task_type
                }
                className="checklistButton"
                sx={{ backgroundColor: "primary.main", ml: 1 }}
                onClick={() => {
                  if (currentCheckList) {
                    updateCheckList(
                      currentCheckList.checklist_title,
                      currentCheckList.description,
                      currentCheckList.unit_area_id,
                      currentCheckList.area_type,
                      currentCheckList.action,
                      currentCheckList.custom
                    );
                    setCurrentCheckList();
                  }
                }}
              >
                <CheckCircleOutline
                  fontSize="small"
                  sx={{ color: "white" }}
                />
              </IconButton>
            </Box>
            <Box sx={{ maxHeight: '180px', overflowY: 'auto', mt: 1 }}>
              {uniqueArea?.map((_area) => (
                <Accordion
                  key={_area}
                  sx={{
                    mb: 1.5,
                    "&:before": { backgroundColor: "transparent" },
                  }}
                //style={{ backgroundColor: "yellow" }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="body1">
                      {
                        unitAreas?.data?.find(
                          (_) => _.id === parseInt(_area)
                        )?.area_name
                      }
                    </Typography>
                    <Divider sx={{ mt: 2 }} />
                  </AccordionSummary>
                  <Divider />
                  <AccordionDetails sx={{ maxHeight: '150px', overflowY: 'auto' }}>
                    <List>
                      {checkList
                        ?.filter(
                          (_) => _.unit_area_id === parseInt(_area)
                        )
                        ?.map((_cl, clIdx) => (
                          <ListItem key={clIdx} sx={{ p: 0 }}>
                            {!isDisabled && (
                              !useDefault && (
                                <IconButton
                                onClick={() =>
                                  updateCheckList(
                                    _cl.checklist_title,
                                    _cl.description,
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
                              )
                            )}
                            <Typography>{_cl.checklist_title}</Typography>
                          </ListItem>
                        ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Step4