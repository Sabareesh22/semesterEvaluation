import React from "react";
import { TextField, Autocomplete, MenuItem } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

export default function MultiSelect(props) {
  console.log(props.value)
  return (
    <Autocomplete
      multiple
      sx={{
        backgroundColor:"white"
      }}
      options={props.options?props.options:[]}
      value={props.value}
      getOptionLabel={(option) => (option.label)}
      isOptionEqualToValue={(option,value)=>(option.value == value.value)}
      onChange={props.OnChange}
      disableCloseOnSelect
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label={props.label}
        
        />
      )}
      renderOption={(props, option, { selected }) => (
        <MenuItem
          {...props}
          key={option.label}
          value={option.value}
          sx={{ justifyContent: "space-between" }}
        >
          {option.label}
          
          {selected ? <CheckIcon color="info" /> : null}
        </MenuItem>
      )}
    />
  );
}
