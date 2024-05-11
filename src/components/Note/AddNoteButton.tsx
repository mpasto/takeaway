import './AddNoteButton.css'
import { Fab } from "@mui/material";
import CreateIcon from '@material-ui/icons/Create';
import { Calendar } from "../../classes/caldav";

type AddNoteProps = {
    calendar?: Calendar,
    onClick?(): void,
}

function AddNoteButton(props: AddNoteProps) {
    if (typeof props.calendar !== "undefined") {
        return <Fab
            onClick={props.onClick ?? (() => { })}
            className="add-note-button"
            id="addNoteButton"
            sx={{ backgroundColor: 'primary.main' }
            }>
            <CreateIcon />
        </Fab >;
    } else {
        return <></>;
    }
}

export default AddNoteButton;