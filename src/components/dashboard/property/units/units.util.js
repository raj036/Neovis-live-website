
export const isMainImage = (files, file, index) => {
    return file.default ? true : files?.filter((_) => !_.deleted)?.find((_) => _.default === true) ? false : index === 0 ? true : false;
}

export const isTaskImage = (files, file, index) => {
    return file.isTaskImage ? true : files?.filter((_) => !_.deleted)?.find((_) => _.isTaskImage === true) ? false : index === 0 ? false : false
}

export const isRoomImage = (files, file, index) => {
    return file.isTaskRoomImage ? true : files?.filter((_) => !_.deleted)?.find((_) => _.isTaskRoomImage === true) ? false : index === 0  ? true : false
}

export const getImageTypes = (files, file, index) => {
    let types = [];
    if (isMainImage(files, file, index)) {
        types.push('DEFAULT')
    }
    if (isTaskImage(files, file, index)) {
        types.push('TASK')
    }
    if (isRoomImage(files, file,index)) {
        types.push('ROOM')
    }
    return types;
}

export const tabsData = [
    { label: 'Basic Details', value: "1" },
    { label: 'Images', value: "2" },
    { label: 'Address', value: "3" },
    { label: 'Costs', value: "4" },
    { label: 'Inventory', value: "5" }
]

export const InputTypes = {
    TEXT: "text",
    SELECT: "select",
    EDITOR: "editor",
    AUTOCOMPLETE: "autocomplete"
}

