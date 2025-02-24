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
import { AuthGuard } from "../../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../../components/dashboard/dashboard-layout";
import { UnittypeEditForm } from "../../../../../components/dashboard/property/unittypes/unittype-edit-form";
import { gtm } from "../../../../../lib/gtm";
import { PencilAlt as PencilAltIcon } from "../../../../../icons/pencil-alt";
import { useRouter } from "next/router";
import useAxios from "../../../../../services/useAxios";
import { BackButton } from "../../../../../components/dashboard/back-button";
import { SeverityPill } from "../../../../../components/severity-pill";
import { UnitareaListTable } from "../../../../../components/dashboard/property/unitareas/unitarea-list-table";
import { UnitListTable } from "../../../../../components/dashboard/property/units/unit-list-table";

const UnittypeCreate = () => {
  const router = useRouter();
  const customInstance = useAxios();

  const [isEdit, setIsEdit] = useState(false);
  const [unittypeId, setUnittypeId] = useState();
  const [propertyId, setPropertyId] = useState();
  const [currentTab, setCurrentTab] = useState("details");

  const tabs = [
    { label: "Details", value: "details" },
    { label: "Unit Areas", value: "unitAreas" },
    { label: "Units", value: "units" },
  ];

  const { data, isLoading, isFetching } = useQuery(
    ["unittypeById", unittypeId],
    () => customInstance.get(`unit-types/${unittypeId}`),
    { enabled: unittypeId !== undefined }
  );

  const { data: unitAreas } = useQuery(
    "unitAreasOnUnitType",
    () =>
      customInstance.get(
        `unit-areas/unit-type-or-property?unit_type_id=${unittypeId}`
      ),
    { enabled: unittypeId !== undefined }
  );

  const { data: units } = useQuery(
    "unitsOnUnitType",
    () =>
      customInstance.get(
        `units/unit-type-or-property?unit_type_id=${unittypeId}`
      ),
    { enabled: unittypeId !== undefined }
  );

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  useEffect(() => {
    if (router) {
      setPropertyId(router.query.propertyId);
      if (router.query.unittypeId !== "newunittype") {
        setUnittypeId(router.query.unittypeId);
      }
      if (router.query.type && router.query.type !== "detail") {
        setCurrentTab("details");
        setIsEdit(true);
      }
    }
  }, [router]);

  return (
    <AuthGuard>
      <DashboardLayout isLoading={isLoading || isFetching}>
        <Head>
          <title>Dashboard: Unittype Create</title>
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
              <BackButton
                path={`/dashboard/properties/unittypes?propertyId=${propertyId}`}
                as="/dashboard/properties/unittypes"
                title="Unit Type"
              />
              {unittypeId && (
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
                        {data?.data?.unit_type_name
                          ?.substr(0, 2)
                          ?.toUpperCase()}
                      </Avatar>
                      <div>
                        <Typography variant="h4">
                          {data?.data?.unit_type_name}
                        </Typography>
                        <SeverityPill color={"primary"}>
                          {data?.data?.unit_class}
                        </SeverityPill>
                        {/* <Chip label={data?.data?.type} size="small" /> */}
                      </div>
                    </Grid>
                    {!isEdit && (
                      <Grid item sx={{ m: -1 }}>
                        <NextLink
                          href={`/dashboard/properties/unittypes/${unittypeId}/edit?propertyId=${propertyId}`}
                          as={`/dashboard/properties/unittypes/${unittypeId}/edit`}
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
              {!unittypeId && (
                <Typography variant="h4">Create a new unit type</Typography>
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
              <UnittypeEditForm
                isEdit={isEdit}
                propertyId={propertyId}
                unittype={unittypeId ? data?.data : null}
              />
            )}
            {currentTab === "unitAreas" && (
              <UnitareaListTable
                onPageChange={() => {}}
                onRowsPerPageChange={() => {}}
                page={0}
                unitareas={unitAreas ? unitAreas?.data : []}
                unitareasCount={unitAreas ? unitAreas?.data?.length : 0}
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
                rowsPerPage={1000}
                editable={false}
              />
            )}
          </Container>
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
};

export default UnittypeCreate;
