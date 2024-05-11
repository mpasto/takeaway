import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import IconButton from '@mui/material/IconButton';

type DeleteNoteProps = {
    status: DeleteStatus,
    onClick(): void
}

enum DeleteStatus {
    None = 1,
    Deleted,
    DeleteFailed
}

function DeleteNoteButton(props: DeleteNoteProps) {


    switch (props.status) {
        case DeleteStatus.None:
            return <IconButton color="secondary" className="note-delete-button" aria-label="delete">
                <DeleteOutlineIcon color="secondary" className="note-delete-icon" onClick={props.onClick} />
            </IconButton>;
        case DeleteStatus.DeleteFailed:
            return <ErrorOutlineIcon className="note-delete-button" />;
        case DeleteStatus.Deleted:
            return <></>;
    }
}

export { DeleteNoteButton, DeleteStatus };