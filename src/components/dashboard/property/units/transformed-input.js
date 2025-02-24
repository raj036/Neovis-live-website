import {
  Autocomplete,
  Box,
  Button,
  TextField
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { InputWrapper, QuillContainer, StyledReactQuill, StyledSelect } from "./styled-components";
import { InputTypes } from "./units.util";




export const TransformedInput = (props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState();
  const [savedValue, setSavedValue] = useState();
  const quillRef = useRef(null);

  const updatedProps = { ...props, disabled: props?.inputDisabled || false }

  const handleFocus = () => setIsFocused(true);
  const handleChange = (content) => setLocalValue(content);

  useEffect(() => {
    if (props?.value && props?.inputType === InputTypes.EDITOR) {
      setLocalValue(props.value);
      setSavedValue(props.value);
      if (quillRef.current) {
        quillRef.current.getEditor().setContents(props.value);
      }
    }
  }, [props.value]);

  const handleSave = () => {
    setSavedValue(localValue);
    props?.onChange(localValue);
    setIsFocused(false)
  }

  const handleCancel = () => {
    setLocalValue(savedValue);
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      editor.setContents(editor.clipboard.convert(savedValue));
    }
    setIsFocused(false)
  };


  switch (props?.inputType) {
    case InputTypes.TEXT:
      return (
        <InputWrapper>
          <div className="label">{props?.inputLabel}</div>
          <TextField className="input" {...updatedProps} InputProps={{ disableUnderline: true }} variant="outlined" />
        </InputWrapper>
      )
    case InputTypes.SELECT:
      return (
        <InputWrapper>
          <div className="label">{props?.inputLabel}</div>
          <StyledSelect className="input" fullWidth {...updatedProps} />
        </InputWrapper>
      )
    case InputTypes.EDITOR:
      return (
        <>
          <InputWrapper>
            <div className="label label__desc">{props?.inputLabel}</div>
            <QuillContainer>
              <StyledReactQuill
                className="input"
                {...updatedProps}
                modules={{ toolbar: !isFocused ? false : true }}
                ref={quillRef}
                value={localValue}
                onChange={handleChange}
                onClick={handleFocus}
              />
              {
                isFocused &&
                <Box sx={{ position: "absolute", right: 0 }}>
                  <Button onClick={handleCancel}>Cancel</Button>
                  <Button onClick={handleSave}>Save</Button>

                </Box>
              }
            </QuillContainer>
          </InputWrapper>

        </>
      )
    case InputTypes.AUTOCOMPLETE:
      return (
        <InputWrapper>
          <div className="label">{props?.inputLabel}</div>
          <Autocomplete
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "0",
              },
              "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                border: "none"
              },
              ".MuiOutlinedInput-root": {
                border: "none"
              },
            }}
            className="input"
            {...updatedProps}

          />
        </InputWrapper>
      )
    default:
      return null;
  }
}