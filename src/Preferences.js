import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { Formik, Form, Field, useFormikContext, useField } from "formik";
import { Settings } from "@core-ds/icons/16";
import material_TextField from "@material-ui/core/TextField";

const TextField = (props) => <Field as={material_TextField} {...props} />;
export function Preferences({ onSave, defaults }) {
  const [open, setOpen] = useState(false);
  const submitHandler = async (data) => {
    onSave(data.width);
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
  console.log(values);
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
            <TextField autoFocus name="width" label="Width" />
          </ListItem>
        </List>
        <Button onClick={closeHandler}>Save</Button>
      </Form>
    </Drawer>
  );
}
