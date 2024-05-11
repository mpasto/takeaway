import './NewNotePopup.css'
import NoteComponent from './NoteComponent';
import { Note } from '../../classes/note';
import { forwardRef, useImperativeHandle, useState } from 'react';

type NewNotePopupProps = {
    onBlur(): void
}


export type NewNotePopupHandle = {
    setNote: (note: Note) => void;
    getNote: () => Note;
    display(): void,
    hide(): void,
};


export const NewNotePopup = forwardRef((props: NewNotePopupProps, ref) => {
    const [stateNote, setStateNote] = useState<Note>();
    const [displayPopup, setDisplayPopup] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
        setNote(note: Note) {
            setStateNote(note)
        },
        getNote() {
            return stateNote;
        },
        display() {
            setDisplayPopup(true);
        },
        hide() {
            setDisplayPopup(false);
        }
    }));

    if (displayPopup && stateNote) {
        return <div className='new-note-popup-container' onBlur={props.onBlur}>
            <NoteComponent note={stateNote} />
        </div>;
    } else {
        return <></>;
    }
});

export default NewNotePopup;