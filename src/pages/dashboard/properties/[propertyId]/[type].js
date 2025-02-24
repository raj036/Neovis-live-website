import { useEffect, useState } from "react";
import NextLink from "next/link";
import Head from "next/head";
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useQuery } from "react-query";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { PropertyEditForm } from "../../../../components/dashboard/property/property-edit-form";
import { gtm } from "../../../../lib/gtm";
import { PencilAlt as PencilAltIcon } from "../../../../icons/pencil-alt";
import { useRouter } from "next/router";
import useAxios from "../../../../services/useAxios";
import { SeverityPill } from "../../../../components/severity-pill";
import { BackButton } from "../../../../components/dashboard/back-button";
import { UnitTypeListTable } from "../../../../components/dashboard/property/unittypes/unittype-list-table";
import { UnitListTable } from "../../../../components/dashboard/property/units/unit-list-table";

const PropertyCreate = () => {
  const router = useRouter();
  const customInstance = useAxios();

  const [isEdit, setIsEdit] = useState(false);
  const [propertyId, setPropertyId] = useState();
  const [currentTab, setCurrentTab] = useState("details");

  const tabs = [
    { label: "Details", value: "details" },
    { label: "Unit Types", value: "unittypes" },
    { label: "Units", value: "units" },
  ];

  const { data, isLoading, isFetching } = useQuery(
    ["propertyById", propertyId],
    () => customInstance.get(`properties/${propertyId}`),
    { enabled: propertyId !== undefined }
  );

  const { data: unitTypes } = useQuery(
    "unitTypesOnProperty",
    () => customInstance.get(`unit-types/property/${propertyId}`),
    { enabled: propertyId !== undefined }
  );

  const { data: units } = useQuery(
    "unitsOnProperty",
    () =>
      customInstance.get(
        `units/unit-type-or-property?property_id=${propertyId}`
      ),
    { enabled: propertyId !== undefined }
  );

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  useEffect(() => {
    if (router) {
      if (router.query.propertyId !== "newproperty") {
        setPropertyId(router.query.propertyId);
      }
      if (router.query.type && router.query.type !== "detail") {
        setIsEdit(true);
        setCurrentTab("details");
      }
    }
  }, [router]);

  return (
    <AuthGuard>
      <DashboardLayout isLoading={isLoading || isFetching}>
        <Head>
          <title>Dashboard: Property Create</title>
        </Head>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 5,
          }}
        >
          <Container maxWidth="md">
            <div>
              <BackButton path="/dashboard/properties" title="Properties" />
              {propertyId && (
                <>
                  <Grid container justifyContent="space-between" spacing={3}>
                    <Grid
                      item
                      sx={{
                        alignItems: "center",
                        display: "flex",
                        overflow: "hidden",
                      }}
                    >
                      <Avatar
                        src={
                          data?.data?.main_image
                            ? data?.data?.main_image
                            : data?.data?.images?.[0]
                        }
                        sx={{
                          height: 64,
                          mr: 2,
                          width: 64,
                        }}
                      >
                        {data?.data?.property_name?.substr(0, 2)?.toUpperCase()}
                      </Avatar>
                      <div>
                        <Typography variant="h4">
                          {data?.data?.property_name}
                        </Typography>
                        <SeverityPill
                          color={
                            data?.data?.property_type === "Hotel"
                              ? "primary"
                              : data?.data?.property_type === "Vacation Rental"
                              ? "secondary"
                              : "info"
                          }
                        >
                          {data?.data?.property_type}
                        </SeverityPill>
                        {/* <Chip label={data?.data?.type} size="small" /> */}
                      </div>
                    </Grid>
                    {!isEdit && (
                      <Grid item sx={{ m: -1 }}>
                        <NextLink
                          href={`/dashboard/properties/${propertyId}/edit`}
                          passHref
                        >
                          <Button
                            component="a"
                            endIcon={<PencilAltIcon fontSize="small" />}
                            sx={{ m: 1 }}
                            variant="outlined"
                            onClick={() => setIsEdit(true)}
                          >
                            Edit
                          </Button>
                        </NextLink>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </div>

            <Box sx={{ mb: 3 }}>
              {!propertyId && (
                <Typography variant="h4">Create a new property</Typography>
              )}
            </Box>
            {!isEdit && (
              <>
                <Tabs
                  indicatorColor="primary"
                  onChange={handleTabsChange}
                  scrollButtons="auto"
                  sx={{ mt: 3 }}
                  textColor="primary"
                  value={currentTab}
                  variant="scrollable"
                >
                  {tabs.map((tab) => (
                    <Tab key={tab.value} label={tab.label} value={tab.value} />
                  ))}
                </Tabs>
                <Divider sx={{ mb: 2 }} />
              </>
            )}

            {currentTab === "details" && (
              <PropertyEditForm
                isEdit={isEdit}
                property={propertyId ? data?.data : null}
              />
            )}
            {currentTab === "unittypes" && (
              <UnitTypeListTable
                onPageChange={() => {}}
                onRowsPerPageChange={() => {}}
                page={0}
                unittypes={unitTypes ? unitTypes?.data : []}
                unittypesCount={unitTypes ? unitTypes?.data?.length : 0}
                rowsPerPage={100}
                editable={false}
              />
            )}
            {currentTab === "units" && (
              <UnitListTable
                onPageChange={() => {}}
                onRowsPerPageChange={() => {}}
                page={0}
                units={units ? units?.data : []}
                unitsCount={units ? units?.data?.length : 0}
                rowsPerPage={100}
                editable={false}
              />
            )}
          </Container>
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
};

export default PropertyCreate;
