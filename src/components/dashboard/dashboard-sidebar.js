import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Menu,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { ClipboardList as ClipboardListIcon } from "../../icons/clipboard-list";
import { Home as HomeIcon } from "../../icons/home";
import { OfficeBuilding as OfficeBuildingIcon } from "../../icons/office-building";
import { Users as UsersIcon } from "../../icons/users";
import { Logo } from "../logo";
import { Scrollbar } from "../scrollbar";
import { DashboardSidebarSection } from "./dashboard-sidebar-section";
import { getUser } from "../../../src/utils/helper";
import { Settings, ToggleOn, AssessmentOutlined } from "@mui/icons-material";
import { toggleSidebar, openSidebar, closeSidebar } from "../../slices/sidebar";
import { useSelector, useDispatch } from "react-redux";
import ToggleButton from "./toggleButton";
import { maxWidth, width } from "@mui/system";

const getSections = (t, organizationId) => [
  {
    title: "",
    items: [
      {
        title: t("Dashboard"),
        path: "/dashboard",
        icon: <HomeIcon fontSize="small" />,
      },
      {
        title: t("Tasks"),
        path: "/dashboard/tasks",
        icon: <ClipboardListIcon fontSize="small" />,
        children: [
          {
            title: t("All Task"),
            path: "/dashboard/tasks",
          },
          {
            title: t("Unit Issue"),
            path: "/dashboard/tasks/unitissues",
          },
          {
            title: t("Templates"),
            path: "/dashboard/templates",
          },
          {
            title: t("Map View"),
            path: "/dashboard/map",
          },
          {
            title: t("Checklist"),
            path: "/dashboard/tasks/checklists",
          },
        ],
      },
      {
        title: t("Planning"),
        path: "/dashboard/planning",
        icon: <ClipboardListIcon fontSize="small" />,
        children: [
          {
            title: t("Task Configurations"),
            path: "/dashboard/planning/configuration",
          },
          {
            title: t("Task Planning"),
            path: "/dashboard/planning/task-planning",
          },
          {
            title: t("Dashboard"),
            path: "/dashboard/planning/dashboard",
          },
        ],
      },
      {
        title: t("Property"),
        path: "/dashboard/properties",
        icon: <OfficeBuildingIcon fontSize="small" />,
        children: [
          {
            title: t("Properties"),
            path: "/dashboard/properties",
          },
          {
            title: t("Unit Types"),
            path: "/dashboard/properties/unittypes",
          },
          {
            title: t("Unit Area"),
            path: "/dashboard/properties/unitareas",
          },
          {
            title: t("Units"),
            path: "/dashboard/properties/units",
          },
          {
            title: t("Unit Groups"),
            path: "/dashboard/properties/unitgroups",
          },
          {
            title: t("Company"),
            path: "/dashboard/properties/company",
          },
        ],
      },
      {
        title: t("Reservations"),
        path: "/dashboard/reservation",
        icon: <ClipboardListIcon fontSize="small" />,
        children: [
          {
            title: t("All Reservations"),
            path: "/dashboard/reservations",
          },
          {
            title: t("Plan Dashboard"),
            path: "/dashboard/reservations/plan-dashboard",
          },
        ],
      },
      {
        title: t("Users"),
        path: "/dashboard/users",
        icon: <UsersIcon fontSize="small" />,
        children: [
          {
            title: t("All Users"),
            path: "/dashboard/users",
          },
          {
            title: t("Role Access"),
            path: "/dashboard/roleaccess",
          },
          {
            title: t("Teams"),
            path: "/dashboard/teams",
          },
          {
            title: t("Owner"),
            path: "/dashboard/owner",
          },
        ],
      },
      {
        title: t("Configuration"),
        path: "/dashboard/configurations",
        icon: <ToggleOn fontSize="small" />,
        children: [
          {
            title: t("Amenities"),
            path: "/dashboard/configurations/amenities",
          },
          {
            title: t("Elements"),
            path: "/dashboard/configurations/elements",
          },
          {
            title: t("Products"),
            path: "/dashboard/configurations/products",
          },
          {
            title: t("Issue Type"),
            path: "/dashboard/configurations/issuetypes",
          },
          {
            title: t("Notification Config"),
            path: "/dashboard/configurations/notification",
          },
        ],
      },
      {
        title: t("Reports"),
        path: `https://goldfish-app-jb4xx.ondigitalocean.app/?organization_id=${organizationId || 'None'}`,
        icon: <AssessmentOutlined fontSize="small" />,
        external: true,
      },
      {
        title: t("Settings"),
        path: "/dashboard/settings",
        icon: <Settings fontSize="small" />,
        children: [
          {
            title: t("Account"),
            path: "/dashboard/accounts",
          },
          {
            title: t("Billing"),
            path: "/dashboard/billing",
          },
          {
            title: t("Integration"),
            path: "/dashboard/settings/integration",
          },
        ],
      },
    ],
  },
];

const ownerSection = (t, organizationId) => [
  {
    title: "",
    items: [
      {
        title: t("Tasks"),
        path: "/dashboard/tasks",
        icon: <ClipboardListIcon fontSize="small" />,
        children: [
          {
            title: t("All Task"),
            path: "/dashboard/tasks",
          },
        ],
      },
      {
        title: t("Reservations"),
        path: "/dashboard/reservation",
        icon: <ClipboardListIcon fontSize="small" />,
        children: [
          {
            title: t("All Reservations"),
            path: "/dashboard/reservations",
          },
          {
            title: t("Plan Dashboard"),
            path: "/dashboard/reservations/plan-dashboard",
          },
        ],
      },
      {
        title: t("Documents"),
        path: "/dashboard/owner/documents",
        icon: <ClipboardListIcon fontSize="small" />,
      },
      {
        title: t("Reports"),
        path: `https://6sgcqdj5-8050.inc1.devtunnels.ms/?organization_id=${organizationId || 'None'}`,
        icon: <AssessmentOutlined fontSize="small" />,
        external: true,
      },
    ],
  },
];

export const DashboardSidebar = (props) => {
  const { onClose, open } = props;
  const router = useRouter();
  const { t } = useTranslation();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"), {
    noSsr: true,
  });
  const dispatch = useDispatch();
  const [organizationId, setOrganizationId] = useState(null);
  const sections = useMemo(() => getSections(t, organizationId), [t, organizationId]);
  const ownerSections = useMemo(() => ownerSection(t, organizationId), [t, organizationId]);
  const user = getUser();

  const [selectedItem, setSelectedItem] = useState(router.asPath);

  useEffect(() => {
    const userDataString = localStorage.getItem('vInspection-user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        const orgId = userData.user.organization_id;
        setOrganizationId(orgId ? orgId.toString() : 'None');
        console.log(orgId);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        setOrganizationId('None');
      }
    } else {
      setOrganizationId('None');
    }
  }, []);

  const handleItemSelect = (path) => {
    const allItems =
      user.user_role.role === "Owner"
        ? ownerSections.flatMap((section) => section.items)
        : sections.flatMap((section) => section.items);
    const selectedParentItem = allItems.find(
      (item) =>
        item.path === path ||
        (item.children && item.children.some((child) => child.path === path))
    );

    if (selectedParentItem) {
      setSelectedItem(selectedParentItem.path);
    }
    if (open && !selectedParentItem?.children) {
      dispatch(closeSidebar());
    } else if (selectedItem && selectedParentItem?.children) {
      dispatch(openSidebar());
    }
  };

  const isSelectedItemChildren = (pathGiven) => {
    const allItems =
      user.user_role.role === "Owner"
        ? ownerSections.flatMap((section) => section.items)
        : sections.flatMap((section) => section.items);
    const selectedParentItem = allItems.find(
      (item) => item.path === (pathGiven || selectedItem)
    );
    return !!selectedParentItem?.children;
  };

  const handlePathChange = () => {
    if (!router.isReady) {
      return;
    }

    const allItems =
      user.user_role.role === "Owner"
        ? ownerSections.flatMap((section) => section.items)
        : sections.flatMap((section) => section.items);
    const currentParentItem = allItems.find(
      (item) =>
        item.path === router.asPath ||
        (item.children &&
          item.children.some((child) => child.path === router.asPath))
    );

    if (currentParentItem) {
      setSelectedItem(currentParentItem.path);
    } else {
      setSelectedItem(null);
    }
  };

  useEffect(handlePathChange, [router.isReady, router.asPath]);

  const renderChildItems = () => {
    const allItems =
      user.user_role.role === "Owner"
        ? ownerSections.flatMap((section) => section.items)
        : sections.flatMap((section) => section.items);
    const selectedParentItem = allItems.find(
      (item) => item.path === selectedItem
    );

    if (selectedParentItem && selectedParentItem.children) {
      return (
        <DashboardSidebarSection
          items={selectedParentItem.children}
          path={router.asPath}
          onSelect={handleItemSelect}
          title={selectedParentItem.title}
        />
      );
    }
    return null;
  };

  const content = (
    <>
      <Scrollbar
        sx={{
          height: "100%",
          "& .simplebar-content": {
            height: "100%",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {((isSelectedItemChildren() && open) ||
            isSelectedItemChildren(selectedItem)) && (
            <ToggleButton
              open={open && selectedItem && isSelectedItemChildren()}
            />
          )}
          <div>
            <Box
              sx={{
                p: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NextLink href="/" passHref>
                <a>
                  <Logo
                    sx={{
                      height: 42,
                      width: 42,
                    }}
                  />
                </a>
              </NextLink>
            </Box>
          </div>

          <Divider
            sx={{
              borderColor: "#2D3748",
              my: 3,
            }}
          />
          <Box sx={{ flexGrow: 1, display: "flex" }}>
            <Box sx={{ width: 60 }}>
              {user.user_role.role === "Owner"
                ? ownerSections.map((section) => (
                    <DashboardSidebarSection
                      key={section.title}
                      path={router.asPath}
                      onSelect={handleItemSelect}
                      active={selectedItem === section.path}
                      isMainMenu={true}
                      sx={{
                        mt: 1,
                        "& + &": {
                          mt: 1,
                        },
                      }}
                      {...section}
                    />
                  ))
                : sections.map((section) => (
                    <DashboardSidebarSection
                      key={section.title}
                      path={router.asPath}
                      onSelect={handleItemSelect}
                      isMainMenu={true}
                      active={selectedItem === section.path}
                      sx={{
                        mt: 1,
                        "& + &": {
                          mt: 1,
                        },
                      }}
                      {...section}
                    />
                  ))}
            </Box>
            {selectedItem && open && isSelectedItemChildren() && (
              <Box
                sx={{
                  width: 280,
                  borderLeft: "1px solid rgba(255, 255, 255, 0.12)",
                  ml: 2,
                  pl: 1,
                }}
              >
                {renderChildItems()}
              </Box>
            )}
          </Box>
        </Box>
      </Scrollbar>
    </>
  );

  return (
    <Drawer
      anchor="left"
      open
      PaperProps={{
        sx: {
          backgroundColor: "neutral.900",
          borderRightColor: "divider",
          borderRightStyle: "solid",
          borderRightWidth: (theme) => (theme.palette.mode === "dark" ? 1 : 0),
          color: "#FFFFFF",
          width: open && selectedItem && isSelectedItemChildren() ? 280 : 60,
        },
      }}
      variant="permanent"
    >
      {content}
    </Drawer>
  );
};

DashboardSidebar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};