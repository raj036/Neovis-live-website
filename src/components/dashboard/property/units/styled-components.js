import {
    Badge,
    Box,
    Button,
    Card,
    ImageListItem,
    Divider,
    ImageList,
    Typography,
    Select
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { QuillEditor } from "../../../quill-editor";


export const ViewQrButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(1),
    marginRight: 'auto',
    position: 'absolute',
    top: -100,
    right: 0,
}));

export const StyledCard = styled(Card)({
    border: 'none',
    boxShadow: 'none',
});

export const InputWrapper = styled('div')(({ theme }) => ({
    display: "flex",
    width: " 100%",
    margin: "0.8rem auto",
    '& .label': {
        color: "#949494",
        fontWeight: 600,
        flex: 1,
        alignContent: "center",
        '&__desc': {
            alignContent: "flex-start",
            marginTop: "1rem"
        },
    },
    '& .input': {
        '.MuiAutocomplete-popupIndicator, & .MuiSelect-icon': {
            display: 'none',
        },
        '&:hover .MuiSelect-icon, &.Mui-focused .MuiSelect-icon, &:hover .MuiAutocomplete-popupIndicator': {
            display: 'inline-block',
        },
        flex: 4,
        marginLeft: 0,
        '&:hover': {
            borderRadius: '10px',
            background: '#dddddd',
            transition: "0.8s ease-in-out",
        },

    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'transparent',
        },
        '&:hover fieldset': {
            borderColor: 'transparent',
        },
        '&.Mui-disabled fieldset': {
            borderColor: 'transparent',
        },
        '&.Mui-disabled:hover fieldset': {
            borderColor: 'transparent',
        },

    },
}));

export const StyledSelect = styled(Select)(({ theme }) => ({

    '& .MuiOutlinedInput-notchedOutline': {
        border: 0,
    },
    '&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
        border: 0,
    },
    '&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: 0,
    },

}));

export const ImageEditor = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    maxHeight: "28.75rem",
    overflowY: "scroll",
    scrollbarWidth: "thin",
    scrollbarColor: " #bdbdbd #ffffff",
}));

export const StyledPopup = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[24],
    padding: theme.spacing(4),
}));

export const MainContainer = styled(Box)(({ theme }) => ({
    width: "80%",
    margin: 'auto'
}));

export const QuillContainer = styled('div')(({ theme }) => ({
    width: "80%",
    position: "relative",
}));

export const StyledReactQuill = styled(QuillEditor)(({ theme }) => ({
    border: 'none',
    '& .quill': {
        display: 'flex',
        flexDirection: 'column-reverse'
    },
    '.ql-snow .ql-picker.ql-expanded .ql-picker-options': {
        bottom: '100%',
        top: 'auto'
    },
    '&:hover .ql-container, &:hover .ql-toolbar': {
        border: `1px solid ${theme.palette.divider}`,
    },
    '& .ql-container:focus-within, & .ql-toolbar:focus-within': {
        border: `1px solid ${theme.palette.divider}`,
    },
}));

export const StyledImageListItem = styled(ImageListItem)(({ theme }) => ({
    '&:hover': { cursor: 'pointer' },
    position: 'relative',
}));

export const StyledImage = styled('img')({
    borderRadius: '10%',
    height: 120,
    width: "100%"
});

export const DefaultBadge = styled(Badge)(({ theme }) => ({
    position: 'absolute',
    left: 50,
    top: 99,
    backgroundColor: 'white',
    borderRadius: 'none',
}));

export const TaskBadge = styled(Badge)(({ theme }) => ({
    position: 'absolute',
    right: 25,
    top: 25,
    borderRadius: 'none',
    '& .MuiBadge-badge': {
        padding: '1.1rem 0.3rem',
    },
}));

export const StyledTypography = styled(Typography)(({ theme }) => ({
    textAlign: 'right',
    width: '100%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    transition: 'color 0.3s ease',
    '&:hover': {
        color: theme.palette.primary.main,
    },
}));