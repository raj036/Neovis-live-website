import { Fragment, useState } from "react";
import PropTypes from "prop-types";
import {
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    Tooltip,
} from "@mui/material";
import { Scrollbar } from "../../../scrollbar";
import { SeverityPill } from "../../../severity-pill";
import { useRouter } from "next/router";
import { ViewButton } from "../../view-button";
import { EditButton } from "../../edit-button";
import HistoryDrawer from "../../history-drawer";
import RestoreIcon from '@mui/icons-material/Restore';

export const TaskPlanningListTable = (props) => {
    const {
        onPageChange,
        onRowsPerPageChange,
        page,
        taskPlanning,
        taskPlanningCount,
        rowsPerPage,
        editable,
        ...other
    } = props;

    const [openHistoryDrawer, setOpenHistoryDrawer] = useState(false);
    const [planningId, setPlanningId] = useState();

    const handleClick = (id) => {
        setOpenHistoryDrawer(true);
        setPlanningId(id)
      };
    
      const handleClose = () => {
        setOpenHistoryDrawer(false);
        setPlanningId();
      };

    const router = useRouter();

    return (
        <div {...other}>
            <Scrollbar>
                <Table sx={{ minWidth: 1200 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Planning Id</TableCell>
                            <TableCell>Property</TableCell>
                            <TableCell>Unit Type</TableCell>
                            <TableCell>Unit Group</TableCell>
                            <TableCell>Units</TableCell>
                            <TableCell>Task Config</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell width="12%" align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {taskPlanning?.map((planning) => {
                            return (
                                <Fragment key={planning.id}>
                                    <TableRow hover>
                                        <TableCell align="center">{planning?.id}</TableCell>
                                        <TableCell >{planning?.property?.property_name}</TableCell>
                                        <TableCell >{planning?.unit_types?.map(d => d.unit_type_name).join(", ")}</TableCell>
                                        <TableCell >{planning?.unit_groups?.map(d => d.name).join(", ")}</TableCell>
                                        <TableCell >{planning?.units?.map(d => d.unit_name).join(", ")}</TableCell>
                                        <TableCell > {planning?.task_configs?.map(d => d.name).join(", ")} </TableCell>
                                        <TableCell align="center">
                                            <SeverityPill
                                                color={"success"}
                                            >
                                                {planning.status}
                                            </SeverityPill>
                                        </TableCell>
                                        <TableCell align="center">
                                            {editable && (
                                                <EditButton
                                                    path={`/dashboard/planning/task-planning/${planning?.id}/edit`}
                                                    title="Edit"
                                                />
                                            )}
                                            <ViewButton
                                                path={`/dashboard/planning/task-planning/${planning?.id}/detail`}
                                                title="View"
                                            />
                                            {
                                                planning.status === 'Executed' && (
                                                    <>
                                                        <Tooltip title="History">
                                                            <IconButton component="a" onClick={() => handleClick(planning.id)}>
                                                                <RestoreIcon fontSize="medium" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <HistoryDrawer
                                                            isOpen={openHistoryDrawer}
                                                            handleClose={handleClose}
                                                            planningId={planningId}
                                                        />
                                                    </>
                                                )
                                            }
                                        </TableCell>
                                    </TableRow>
                                </Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </Scrollbar>
            <TablePagination
                component="div"
                count={taskPlanningCount}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </div>
    );
};

TaskPlanningListTable.propTypes = {
    taskPlanning: PropTypes.array.isRequired,
    taskPlanningCount: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onRowsPerPageChange: PropTypes.func,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};
