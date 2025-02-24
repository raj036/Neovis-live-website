import PropTypes from "prop-types";
import { List, ListSubheader } from "@mui/material";
import { DashboardSidebarItem } from "./dashboard-sidebar-item";

const renderNavItems = ({ isMainMenu, items, path, onSelect, depth = 0 }) => (
  <List disablePadding>
    {items.map((item) => (
      <DashboardSidebarItem
        key={item.title}
        active={path === item.path}
        chip={item.chip}
        depth={depth}
        icon={item.icon}
        info={item.info}
        path={item.path}
        title={item.title}
        onSelect={onSelect}
        isMainMenu={isMainMenu}
        itemHasChild={!isMainMenu ? false : !!item.children}
      />
    ))}
  </List>
);

export const DashboardSidebarSection = (props) => {
  const { items, path, title, isMainMenu, onSelect, ...other } = props;
  return (
    <List
      subheader={(
        <ListSubheader
          disableGutters
          disableSticky
          sx={{
            color: 'neutral.500',
            fontSize: '0.75rem',
            fontWeight: 700,
            lineHeight: 2.5,
            ml: 4,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </ListSubheader>
      )}
      {...other}
    >
      {renderNavItems({
        items,
        path,
        onSelect,
        isMainMenu,
      })}
    </List>
  );
};

DashboardSidebarSection.propTypes = {
  items: PropTypes.array.isRequired,
  path: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onSelect: PropTypes.func,
};
