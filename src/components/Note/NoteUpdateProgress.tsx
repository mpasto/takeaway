import { CircularProgress } from "@mui/material";
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

enum NoteStatus {
    None = 1,
    Updating,
    Updated,
    FailedUpdate,
}


type NoteUpdateProgressProps = {
    status: NoteStatus
};


function NoteUpdateProgress(props: NoteUpdateProgressProps) {
    const Icon = () => {
        switch (props.status) {
            case NoteStatus.Updating:
                return <CircularProgress className="note-update-progress-icon" size={24} />;
            case NoteStatus.Updated:
                return <CloudDoneIcon className="note-update-progress-icon" />;
            case NoteStatus.FailedUpdate:
                return <ErrorOutlineIcon className="note-update-progress-icon" />;
            default:
                return <div></div>;
        }
    };

    return <div className="note-update-progress-icon-container">
        <Icon />
    </div>;
}

export { NoteUpdateProgress, NoteStatus };