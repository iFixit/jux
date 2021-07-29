import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import MaterialSwitch from "@material-ui/core/Switch";
import { Formik, Form, Field, useFormikContext } from "formik";
import { Settings } from "@core-ds/icons/16";
import material_TextField from "@material-ui/core/TextField";
import { getScreenshotTarget } from "./screenshot_urls";

const TextField = (props) => <Field as={material_TextField} {...props} />;
const Switch = (props) => {
  const Component = ({ label, value, name, onChange }) => (
    <FormControlLabel
      control={
        <MaterialSwitch checked={value} onChange={onChange} name={name} />
      }
      label={label}
    />
  );
  return <Field as={Component} {...props} />;
};

export function Preferences({ onSave, defaults }) {
  const [open, setOpen] = useState(false);
  const submitHandler = async (data) => {
    onSave(data);
    setOpen(false);
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Settings />
      </Button>
      <Formik initialValues={defaults} onSubmit={submitHandler}>
        <PreferencesDrawer
          open={open}
          onClose={() => setOpen(false)}
          setData={submitHandler}
        />
      </Formik>
    </>
  );
}

function PreferencesDrawer({ open, onClose, setData }) {
  const { values } = useFormikContext();
  const closeHandler = () => {
    setData(values);
    onClose();
  };
  return (
    <Drawer open={open} onClose={closeHandler}>
      <Form>
        <Typography variant="h5">Preferences</Typography>
        <List>
          <ListItem>
            <TextField name="width" label="Width" />
          </ListItem>
          <ListItem>
            <Switch name="diff" label="Diff Mode" />
          </ListItem>
          {getScreenshotTarget() && (
            <ListItem>
              <Switch name="screenshot" label="Screenshot Mode" />
            </ListItem>
          )}
        </List>
        <Button onClick={closeHandler}>Save</Button>
        <Button onClick={onClose}>Cancel</Button>
      </Form>
    </Drawer>
  );
}
