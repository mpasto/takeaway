import '@mdxeditor/editor/style.css';
import './NoteComponent.css'
import { useRef, useState } from 'react';
import { EditableTitleHandle, Title } from './NoteTitle';
import { MarkdownEditor, MarkdownEditorHandle } from './MarkdownEditor';
import i18next from "../../classes/locale";
import { CategoryChip } from './CategoryChip';
import { Category } from '../../classes/category';
import { Note } from '../../classes/note';

import { Card, CardHeader } from '@mui/material';
import { NoteUpdateProgress, NoteStatus } from './NoteUpdateProgress';
import { RequestStatus } from '../../classes/caldav';
import { DeleteNoteButton, DeleteStatus } from './DeleteNoteButton';


type NoteProps = {
    note: Note,
    onBlur?(): void,
    onNoteDelete?(): void
};


function NoteComponent(props: NoteProps) {

    const [note, setNote] = useState(props.note);
    const [updateStatus, setUpdateStatus] = useState(NoteStatus.None);
    const [deleteStatus, setDeleteStatus] = useState(DeleteStatus.None);


    const titleRef = useRef<EditableTitleHandle>(null);
    const editorRef = useRef<MarkdownEditorHandle>(null);


    const defaultBlurHandle = () => {

        let edited = false;
        const editedNote = note;
        if (titleRef.current) {
            const newTitle = titleRef.current.getValue();
            if (newTitle !== note.title) {
                editedNote.title = newTitle;
                edited = true;
            }
        }

        if (editorRef.current) {
            const newContent = editorRef.current.getContent();
            console.log(newContent)
            if (newContent !== note.description) {
                editedNote.description = newContent;
                edited = true;
            }
        }

        if (edited) {
            editedNote.lastModified = new Date();
            setNote(editedNote);
            setUpdateStatus(NoteStatus.Updating);

            const updateNoteOnServer = async () => {
                const reqStatus = await note.updateInCalendar();
                if (reqStatus == RequestStatus.Success) {
                    setUpdateStatus(NoteStatus.Updated);
                } else {
                    setUpdateStatus(NoteStatus.FailedUpdate);
                }
            };

            updateNoteOnServer();
        }



    };

    const handleBlur = props.onBlur ?? defaultBlurHandle;



    const dateStr = note.lastModified ? i18next.t("note.lastModified", { lastModified: note.lastModified }) : "";

    const categories = note.categories ?? [];

    const onNoteDelete = props.onNoteDelete ?? (() => { });


    const deleteNote = async () => {
        const result = await props.note.deleteInCalendar();

        if (result == RequestStatus.Success) {
            setDeleteStatus(DeleteStatus.Deleted);
        } else {
            setDeleteStatus(DeleteStatus.DeleteFailed);
        }

        onNoteDelete();
    };



    return <Card style={{ backgroundColor: note.color ?? "" }} onBlur={handleBlur} className='note'>

        <CardHeader className="note-header" title={
            <>
                <Title ref={titleRef} text={note.title} isEditable={true} />
                <DeleteNoteButton onClick={deleteNote} status={deleteStatus} />
            </>
        } />


        <MarkdownEditor ref={editorRef} content={note.description ?? ""} />

        <div className="note-info">
            <div className='note-categories-container'>{
                categories.map((cat: Category, key: number) => { return <CategoryChip name={cat.name} key={key} /> })
            }</div>
            <div className="note-update-info">
                <span className="note-last-modified">{dateStr}</span>
                <NoteUpdateProgress status={updateStatus} />
            </div>
        </div>
    </Card >;
}

export default NoteComponent;