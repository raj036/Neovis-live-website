import PropTypes from "prop-types";
import NextLink from "next/link";
import { Box, Button, ListItem, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";

// Create a styled Tooltip component with a higher z-index
const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .MuiTooltip-tooltip`]: {
    zIndex: 1000, // This should be higher than the Drawer's z-index
  },
});

export const DashboardSidebarItem = (props) => {
  const {
    active,
    chip,
    depth,
    icon,
    info,
    path,
    title,
    onSelect,
    isMainMenu,
    itemHasChild,
    ...other
  } = props;

  let paddingLeft = 24;

  if (depth > 0) {
    paddingLeft = 32 + 8 * depth;
  }



  const buttonContent = (
    <Button
      component="a" // Make Button behave like an <a> tag
      startIcon={icon}
      endIcon={chip}
      disableRipple
      onClick={() => onSelect && onSelect(path)}
      sx={{
        borderRadius: 1,
        color: active ? "secondary.main" : "neutral.300",
        justifyContent: "flex-start",
        pl: `${paddingLeft}px`,
        pr: 1,
        mr: 1,
        textAlign: "left",
        textTransform: "none",
        width: "80%",
        ...(active && {
          backgroundColor: "rgba(255,255,255, 0.08)",
          fontWeight: "fontWeightBold",
        }),
        "& .MuiButton-startIcon": {
          color: active ? "secondary.main" : "neutral.400",
        },
        "&:hover": {
          backgroundColor: "rgba(255,255,255, 0.08)",
        },
      }}
    >
      <Box sx={{ flexGrow: 1 }}>{!isMainMenu && title}</Box>
      {info}
    </Button>
  );
  return (
    <ListItem disableGutters sx={{ display: "flex" }} {...other}>
      {isMainMenu ? (
        <StyledTooltip title={title} placement="right" arrow>
          <span>
            {!itemHasChild ? (
              <NextLink href={path} passHref>
                {buttonContent}
              </NextLink>
            ) : (
              buttonContent
            )}
          </span>
        </StyledTooltip>
      ) : (
        <NextLink href={path} passHref>
          {buttonContent}
        </NextLink>
      )}
    </ListItem>
  );
};

DashboardSidebarItem.propTypes = {
  active: PropTypes.bool,
  depth: PropTypes.number.isRequired,
  icon: PropTypes.node,
  info: PropTypes.node,
  path: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onSelect: PropTypes.func,
  isMainMenu: PropTypes.bool,
};

DashboardSidebarItem.defaultProps = {
  active: false,
  depth: 0,
};
