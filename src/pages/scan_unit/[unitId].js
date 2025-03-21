import React, { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "../../components/authentication/auth-guard";
import Head from "next/head";
import { TiTickOutline } from "react-icons/ti";
import Link from "next/link";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  TextField,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { useRouter } from "next/router";
import { SeverityPill } from "../../components/severity-pill";
import { useMutation, useQuery } from "react-query";
import useAxios from "../../services/useAxios";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import * as Yup from "yup";
import dayjs from "dayjs";
import { CheckCircleOutline } from "@mui/icons-material";
import { useAuth } from "../../hooks/use-auth";
import { getToken, getUser } from "../../utils/helper";
import { QuillEditor } from "../../components/quill-editor";
import { height } from "@mui/system";
import { Loader } from "../../components/loader";
import Image from "next/image";

import styles from "./unitID.module.css";
import bg from '../../../public/backgroundimage.png'
const unitLogo = "/static/bhavan-logo-new-aug-2023-03.jpg";

const UnitScan = () => {
  const token = getToken();
  const vinspectUser = getUser();
  console.log("token", token, vinspectUser);
  const { login } = useAuth();
  const router = useRouter();
  const customInstance = useAxios();
  const [unitId, setunitId] = useState();
  const [unitType, setUnittype] = useState();
  const [areaType, setAreaType] = useState();
  const [productTypeChecklist, setProductTypeChecklist] = useState([]);
  const [unitAreaId, setUnitAreaId] = useState();
  const [checkList, setcheckList] = useState([]);
  const [productIds, setProductIds] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    (async () => {
      // if(vinspectUser?.organization?.org_name === 'Histia Services' || vinspectUser?.organization?.id === 9) {
      //     await login('Jbmauritius@jebitech.com', 'Default@123');
      // } else {
      //     await login('jbadmin@jebitech.com', 'Default@123');
      // }
      await login("subhajit.paul@mindnerves.com", "123456");
    })();
  }, []);

  const { data, isLoading: unitLoading } = useQuery(
    ["unitById", unitId],
    () => customInstance.get(`units/${unitId}`),
    { enabled: unitId !== undefined && token !== undefined }
  );

  const { data: unitAreas, refetch: unitAreasRefetch } = useQuery(
    "taskUnitAreas",
    () =>
      customInstance.get(
        `unit-areas/unit-type-or-property?unit_type_id=${unitType}`
      ),
    { enabled: unitType !== undefined && token !== undefined }
  );

  const {
    mutateAsync: addTask,
    data: taskData,
    isLoading: taskLoading,
  } = useMutation((data) => customInstance.post(`tasks`, data));

  const { data: checklistData, isLoading: checkListLoading } = useQuery(
    "allTaskChecklist",
    () =>
      customInstance.get(
        `task-checklists?filter.area_type=$in:${areaType}&filter.task_type=$in:GuestSelection&filter.status=$in:Active`
      ),
    { enabled: areaType !== undefined && token !== undefined }
  );

  const { data: productData, isLoading: productLoading } = useQuery(
    "allproductList",
    () => customInstance.get(`products`),
    { enabled: token !== undefined }
  );

  const { mutateAsync: updateproduct, isLoading: isProductLoading } =
    useMutation((data) => {
      customInstance.patch(`products/${data?.id}`, data);
    });

  const isButtonDisabled = useMemo(() => {
    const countData = filteredProducts.map((item) => item?.count);
    if (countData.some((item) => item > 0)) {
      return false;
    } else {
      return true;
    }
  }, [filteredProducts]);

  useEffect(() => {
    if (taskData !== undefined) {
      setFilteredProducts(
        filteredProducts.map((item) => {
          item.count = 0;
          return item;
        })
      );
      setFilteredProducts(
        filteredProducts.map((item) => {
          item.user_comment = "";
          return item;
        })
      );
      toast.success(
        "Thank you for selecting your desired item, Our team will take care of the rest."
      );
    }
  }, [taskData]);

  const formik = useFormik({
    initialValues: {
      property_id: null,
      unit_type_id: null,
      unit_id: null,
      is_issue: false,
      remote_inspection: true,
      pet_present: false,
      task_title: "Guest Request Task",
      task_description: "Guest has requested for extra products",
      priority: "Urgent",
      task_type: "GuestSelection",
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
      if (checkList.length === 0) {
        toast.error("Please add atleast one checklist for the task.");
        return;
      }
      try {
        let rules;
        let task_date = dayjs(new Date()).format("YYYY-MM-DD");
        task_date = task_date + "T" + "23:59";
        let formatted_due_time = new Date().toISOString();

        await addTask({
          ...values,
          assigned_at: new Date().toISOString(),
          task_photos: [],
          status: "Pending",
          active_task_checklists: checkList,
          due_at: new Date(task_date),
          due_time: formatted_due_time,
        });
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        // toast.success("Task added successfully!");
        formik.resetForm();
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong!");
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (router.query.unitId !== undefined) {
      setunitId(router.query.unitId);
      formik.setFieldValue("unit_id", router.query.unitId);
    }
  }, [router.query.unitId]);

  console.log("unit", data, "unitType", unitType);
  console.log("unit areas", unitAreas);
  console.log("checklistData", checklistData);
  console.log("productTypeChecklist", productTypeChecklist);
  console.log("checkList", checkList);
  console.log("productids", productIds);

  useEffect(() => {
    if (productData !== undefined && productIds.length > 0) {
      console.log("products res", productData?.data?.data);
      const filteredProducts = productData?.data?.data?.filter((item) =>
        productIds.includes(item.id)
      );
      console.log("filteredProduct", filteredProducts);
      setFilteredProducts(
        filteredProducts.map((item) => ({ ...item, count: 0 }))
      );
      setComments(filteredProducts.map((item) => ({ value: "" })));
    }
  }, [productIds, productData]);

  useEffect(() => {
    if (data !== undefined) {
      setUnittype(data?.data?.unit_type_id);
      formik.setFieldValue("property_id", data?.data?.property_id);
      formik.setFieldValue("unit_type_id", data?.data?.unit_type_id);
    }
  }, [data]);

  useEffect(() => {
    if (unitAreas !== undefined) {
      setAreaType(unitAreas?.data[0]?.area_type);
      setUnitAreaId(unitAreas?.data[0]?.id);
    }
  }, [unitAreas]);

  useEffect(() => {
    if (checklistData !== undefined) {
      const productTypeChecklist = checklistData?.data?.data?.filter(
        (item) => item.category_type === "Product"
      );
      setProductTypeChecklist(productTypeChecklist);
      if (productTypeChecklist && productTypeChecklist.length > 0) {
        const checklists = productTypeChecklist.map((item) => ({
          checklist_title: item.checklist_title,
          description: item.description,
          checklist_code: item.checklist_code,
          unit_area_id: unitAreaId,
          area_type: item.area_type,
          category_type: item.category_type,
          all_cat_ids: item.all_cat_ids,
        }));
        setcheckList(checklists);
        let productIds = productTypeChecklist
          .map((item) => item.all_cat_ids)
          .flat();
        productIds = [...new Set(productIds.map((item) => item))];
        setProductIds(productIds);
      }
    }
  }, [checklistData]);

  return (
    <div >
      <Head>
        <title>Dashboard: Unit Scan</title>
      </Head>
      <div
      className="main"
        component="main"
        sx={{
          flexGrow: 1,
          py: 5,
        }}
      >
        {(unitLoading || productLoading || checkListLoading) && <Loader />}
        <div className={styles.mainWrapBook} style={{ backgroundImage: `url(${bg.src})` }} >
          <div>
            <div>
              {unitId && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      src={unitLogo}
                      alt="unitLogo"
                      width={50}
                      height={50}
                    />
                    <Typography
                      variant="subtitle1"
                      textAlign={"center"}
                      sx={{ ml: 2 }}
                    >
                      Enhance your stay with our convenient in room ordering
                      services
                    </Typography>
                  </Box>

                  <Typography variant="h4" textAlign={"center"} mt={3}>
                    {data?.data?.unit_name}
                  </Typography>
                </Box>
              )}
            </div>
            {unitId && (
              <Box
                sx={{
                  my: 2,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h6" sx={{ alignItems: "center" }}>
                  Menu of our offerings
                </Typography>
              </Box>
            )}
            <div className={styles.headerSection}>
              <a  href="" className={styles.backButton}>
                Back
              </a>
            </div>
          </div>
          <div>
            <div className={styles.parent}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((elItem, idx) => (
                  <div className={styles.serviceCard} key={idx}>
                    <div className={styles.cardHeader}>
                      <div className={styles.countWrapper}>
                        <span className={styles.count}>Count:</span>
                        <input
                          type="number"
                          className={styles.inputField}
                          name="count"
                          min={0}
                          onChange={(e) => {
                            if (parseInt(e.target.value) >= 0) {
                              const newfilteredProducts = [...filteredProducts];
                              newfilteredProducts[idx].count = parseInt(
                                e.target.value
                              );
                              setFilteredProducts(newfilteredProducts);
                            } else if (e.target.value.trim() === "") {
                              const newfilteredProducts = [...filteredProducts];
                              newfilteredProducts[idx].count = e.target.value;
                              setFilteredProducts(newfilteredProducts);
                            }
                          }}
                          value={elItem.count}
                        />
                        <button
                          className={`${styles.bookButton}`}
                          onClick={() => {
                            if (elItem.inventories) {
                              delete elItem.inventories;
                            }
                            if (elItem.count === "") {
                              toast.error("Please enter correct count");
                              return;
                            }
                            (async () => {
                              await updateproduct(elItem);
                              toast.success("Count changed");
                            })();
                          }}
                        >
                          <TiTickOutline />
                        </button>
                      </div>
                    </div>

                    <div className={styles.cardContent}>
                      <p className={styles.serviceId}>{elItem?.id}</p>
                      <h3 className={styles.serviceTitle}>{elItem.name}</h3>
                      <p className={styles.serviceDescription}>
                        {elItem?.description}
                      </p>

                      <textarea
                        className={styles.textArea}
                        name="comment"
                        placeholder="Enter your comment"
                        onChange={(e) => {
                          const newfilteredProducts = [...filteredProducts];
                          newfilteredProducts[idx].user_comment =
                            e.target.value;
                          setFilteredProducts(newfilteredProducts);
                        }}
                        value={elItem?.user_comment}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.noProducts}>
                  No products available for this unit
                </p>
              )}
            </div>
            {filteredProducts.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "10px",
                }}
              >
                <Button
                  sx={{ m: 1, minWidth: "100px" }}
                  //   type="submit"
                  disabled={isButtonDisabled || taskLoading || isProductLoading}
                  variant="contained"
                  onClick={() => {
                    formik.handleSubmit();
                    // setFilteredProducts(filteredProducts.map(item => {
                    //     item.count = 0
                    //     return item
                    // }))
                    // toast.success('Thank you for selectinh your desired item, Our team will take care of the rest.')
                  }}
                >
                  Request for product
                </Button>
              </Box>
            )}
            <Typography variant="h6" sx={{ alignItems: "center" }}>
              Our working hours are 10am to 5pm.
            </Typography>
            <Typography variant="h6" sx={{ alignItems: "center", mt: 2 }}>
              For any assistance you can reach us 24/7 on +971-527843672.
              Mr.Vikrant will be available for assistance.
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitScan;
