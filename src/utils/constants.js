export const USER_STATUSES = ["Active", "Inactive"];
export const PROPERTY_STATUSES = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

export const STATUSES = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

export const INVENTORY_CATEGORIES = [
  { label: "Element", value: "Element" },
  { label: "Amenity", value: "Amenity" },
  { label: "Product", value: "Product" },
];

export const INSPECTION_STATUSES = [
  { label: "Pending", value: "Pending" },
  { label: "Complete", value: "Complete" },
];

export const PROPERTY_TYPES = [
  { label: "Vacation Rental", value: "Vacation Rental" },
  { label: "Hotel", value: "Hotel" },
  { label: "Service Apartment", value: "Service Apartment" },
];

export const RESERVATION_STATUSES = [
  { label: "Declined", value: "DECLINED" },
  { label: "Quotation", value: "QUOTATION" },
  { label: "Deleted", value: "DELETED" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "PENDING" },
  { label: "Provisional", value: "PROVISIONAL" },
]

export const UNITTYPE_CLASS = [
  { label: "Room", value: "Room" },
  { label: "House", value: "House" },
  { label: "Bungalow", value: "Bungalow" },
  { label: "Villa", value: "Villa" },
  { label: "Camp", value: "Camp" },
];

export const AREA_TYPES = [
  { label: "Bedroom", value: "Bedroom" },
  { label: "Bathroom", value: "Bathroom" },
  { label: "Kitchen", value: "Kitchen" },
  { label: "LivingRoom", value: "LivingRoom" },
  { label: "Pool", value: "Pool" },
  { label: "Balcony", value: "Balcony" },
  { label: "Terrace", value: "Terrace" },
  { label: "Lobby", value: "Lobby" },
  { label: "MaidRoom", value: "MaidRoom" },
  { label: "PowderRoom", value: "PowderRoom" },
  { label: "EntireBuilding", value: "EntireBuilding" },
  { label: "EntireArea", value: "EntireArea" },
  { label: "Lawn", value: "Lawn" },
];

export const UNIT_CONDITIONS = [
  { label: "Vacant", value: "Vacant" },
  { label: "Ready", value: "Ready" },
  { label: "Occupied", value: "Occupied" },
  { label: "Dirty", value: "Dirty" },
  { label: "Cleaning", value: "Cleaning" },
  { label: "Servicing", value: "Servicing" },
  { label: "Inspecting", value: "Inspecting" },
  { label: "Blocked", value: "Blocked" },
];

export const TASK_TYPES = [
  { label: "Housekeeping", value: "Housekeeping" },
  { label: "Maintenance", value: "Maintenance" },
  { label: "Inspection", value: "Inspection" },
  { label: "Guest Request", value: "GuestSelection" },
];

export const ELEMENT_TYPES = [
  { label: "Furniture", value: "Furniture" },
  { label: "Appliance", value: "Appliance" },
  { label: "Electrical", value: "Electrical" },
  { label: "Other", value: "Other" },
];

export const TASK_PRIORITIES = [
  { label: "Watch", value: "Watch" },
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
  { label: "Urgent", value: "Urgent" },
];

export const TASK_STATUSES = [
  { label: "Pending", value: "Pending" },
  { label: "Assigned", value: "Assigned" },
  { label: "Ongoing", value: "Ongoing" },
  { label: "Completed", value: "Completed" },
  { label: "Inspected", value: "Inspected" },
  { label: "Overdue", value: "Overdue" },
  { label: "On Hold", value: "On Hold" },
  { label: "ReOpen", value: "ReOpen" },
  { label: "ReOpen Ongoing", value: "ReOpenOngoing" },
  { label: "ReOpen Completed", value: "ReOpenCompleted" },
  { label: "ReOpen Inspected", value: "ReOpenInspected" },
];

export const INSPECTOR_TASK_STATUS = [
  { label: "Inspected", value: "Inspected" },
  { label: "ReOpen", value: "ReOpen" },
  { label: "ReOpen Completed", value: "ReOpenCompleted" },
]

export const TASK_FREQUENCY = [
  { label: "WEEKLY", value: 2 },
  { label: "DAILY", value: 3 },
  { label: "MONTHLY", value: 1 },
];

export const DUE_STATUS = [
  { label: "Today", value: "0" },
  { label: "Tomorrow", value: "1" },
  { label: "This Week", value: "7" },
];

export const TASK_CONFIG_EXEC_MOMENT = [
  { label: "Arrival", value: "Arrival" },
  { label: "Depart", value: "Depart" },
  { label: "Change Over", value: "Change Over" },
  { label: "Stay", value: "Stay" }
]

export const TASK_CONFIG_PRIORITIES = [
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

export const PLANNIG_STATUSES = [
  { label: "Created", value: "Created" },
  { label: "Executed", value: "Executed" },
  { label: "Rejected", value: "Rejected" },
];

export const CONFIGURATION = [
  { label: "Config 1", value: "1" },
  { label: "Config 2", value: "2" },
  { label: "Config 3", value: "3" },
];

export const WEEKDAYS = [
  { label: "Sunday", value: "Sunday", id: 0 },
  { label: "Monday", value: "Monday", id: 1 },
  { label: "Tuesday", value: "Tuesday", id: 2 },
  { label: "Wednesday", value: "Wednesday", id: 3 },
  { label: "Thursday", value: "Thursday", id: 4 },
  { label: "Friday", value: "Friday", id: 5 },
  { label: "Saturday", value: "Saturday", id: 6 },
]

export const STAY_TYPES = [
  { label: "Daily", value: "Daily" },
  { label: "Weekly", value: "Weekly" },
  { label: "Specific Days", value: "SpecificDays" },
]

export const GOOGLE_MAPS_APIKEY = "AIzaSyCraSNfyN4PuuLEZx6zQue5R14k5b8deFA";
// "AIzaSyDkeDTB5Xf6dW4mFM_QZ9KI5Qsy16ruk98";

/*
export enum InspectionType {
  Virtual = 'Virtual',
  Physical = 'Physical',
}

export enum TaskStatus {
  Pending = 'Pending',
  Assigned = 'Assigned',
  Ongoing = 'Ongoing',
  Completed = 'Completed',
  Inspected = 'Inspected',
  Overdue = 'Overdue',
  OnHold = 'On Hold',
}


*/
