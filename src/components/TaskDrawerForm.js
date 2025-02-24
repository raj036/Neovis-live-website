// import React from 'react' 

// const TaskDrawerForm = () => {
//   const formik = useFormik({
//     initialValues: {
//       property_id: null,
//       unit_type_id: null,
//       unit_id: null,
//       is_issue: false,
//       remote_inspection: true,
//       pet_present: false,
//       task_title: "",
//       task_description: "",
//       priority: "Medium",
//       task_type: "",
//       issue_category_id: null,
//       issue_type_id: null,
//       element_id: null,
//       task_template_id: null,
//       rate_amount: 0,
//       rate_unit: "Fixed",
//       estimated_time: 0,
//       due_at: null,
//       due_time: null,
//       is_recurring: false,
//       is_complete: false,
//       frequency: 2,
//       end_date: null,
//       assigned_to_id: null,
//       inspected_by_id: null,
//       vendor_id: null,
//       task_photos: [],
//       rrulestr: "",
//       is_task_hold: false,
//       assigned_to_team_id: null,
//       isDefaultPhoto: true,
//     },
//     validationSchema: Yup.object({
//       property_id: Yup.string().required(),
//       unit_type_id: Yup.string().required(),
//       unit_id: Yup.string().required(),
//     }),
//     onSubmit: async (values, helpers) => {
//       if (
//         formik.values.task_template_id &&
//         newtemplatechecklist.length === 0 &&
//         checkList.length === 0
//       ) {
//         toast.error("Please add atleast one checklist for the task.");
//         return;
//       }
//       // if (checkList.length === 0) {
//       //   toast.error("Please add atleast one checklist for the task.");
//       //   return;
//       // }
//       try {
//         let rules;
//         if (values.is_recurring) {
//           rules = new RRule({
//             freq: values.frequency,
//             dtstart: new Date(values.due_at),
//             until: new Date(values.end_date),
//           });
//         }

//         let task_date = dayjs(new Date(values.due_at)).format("YYYY-MM-DD");

//         if (values.due_time) {
//           task_date =
//             task_date + "T" + dayjs(new Date(values.due_time)).format("HH:mm");
//         } else {
//           task_date = task_date + "T" + "23:59";
//         }

//         let formatted_due_time = null;
//         if (values.due_time) {
//           formatted_due_time = new Date(values.due_time).toISOString();
//         }

//         if (task) {
//           let images = await uploadImages();
//           let data = { ...values };
//           delete data.property;
//           delete data.unit_type;
//           delete data.unit;
//           delete data.created_by;
//           delete data.rrulestr;
//           delete data.inspected_by;
//           delete data.assigned_to;
//           delete data.due_time;
//           delete data.task_inspection;
//           delete data.video_stream;
//           delete data.owner_querries;

//           await updateTask({
//             ...data,
//             assigned_at: data.assigned_to_id && new Date().toISOString(),
//             task_photos: images,
//             active_task_checklists: formik.values.task_template_id
//               ? newtemplatechecklist
//               : checkList,
//             due_at: new Date(task_date),
//             due_time: formatted_due_time,
//           });
//         } else {
//           let images = await uploadImages();
//           await addTask({
//             ...values,
//             assigned_at: values.assigned_to_id && new Date().toISOString(),
//             task_photos: images,
//             status: "Pending",
//             active_task_checklists: formik.values.task_template_id
//               ? newtemplatechecklist
//               : checkList,
//             due_at: new Date(task_date),
//             due_time: formatted_due_time,
//             rrulestr: rules ? rules.toString() : "",
//           });
//         }
//         await queryClient.refetchQueries(["allTasks"], {
//           active: true,
//           exact: true,
//         });
//         helpers.setStatus({ success: true });
//         helpers.setSubmitting(false);
//         toast.success(
//           task ? "Task updated successfully!" : "Task added successfully!"
//         );
//         formik.resetForm();
//         setFiles([]);
//         setSelProprty();
//         setSelUnittype();
//         setSelUnit();
//         setSelExecutor();
//         setSelInspector();
//         setSelVendor();
//         setCheckList([]);
//         setTimeout(() => {
//           onClose?.();
//         }, 200);
//       } catch (err) {
//         console.error(err);
//         toast.error("Something went wrong!");
//         helpers.setStatus({ success: false });
//         helpers.setErrors({ submit: err.message });
//         helpers.setSubmitting(false);
//       }
//     },
//   });
//   return (
//     <div>
//        <form
//           onSubmit={formik.handleSubmit}
//           className="taskdrawer"
//           style={{
//             overflowY: "scroll",
//             position: "relative",
//             display: "flex",
//             flexDirection: "column",
//             flex: 1,
//           }}
//         ></form>
//     </div>
//   )
// }

// export default TaskDrawerForm