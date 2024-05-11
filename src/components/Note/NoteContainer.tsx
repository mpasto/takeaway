import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Note } from '../../classes/note';
import NoteComponent from './NoteComponent';
import './NoteContainer.css'


type NoteContainerProps = {
    notes: Note[]
    sort?: SortNotes,
    order?: OrderNotes,
};


enum SortNotes {
    LastModified,
    Title
}

enum OrderNotes {
    Ascending = 1,
    Descending = -1
}


function getSortFunction(sort: SortNotes, order: OrderNotes) {
    const sortLastModifiedAscendingFn = (a: Note, b: Note) => {
        return +(a.lastModified > b.lastModified) - +(a.lastModified < b.lastModified);
    };

    const sortTitleAscendingFn = (a: Note, b: Note) => {
        return +(a.title > b.title);
    };

    switch (sort) {
        case SortNotes.LastModified:
            return (a: Note, b: Note) => (order * sortLastModifiedAscendingFn(a, b));
        case SortNotes.Title:
            return (a: Note, b: Note) => (order * sortTitleAscendingFn(a, b));
        default:
            throw Error(`Could not parse sort function from value sort: ${sort}, order: ${order}`);
    }
}





function NoteContainer(props: NoteContainerProps) {
    const [nColumns, setNColumns] = useState(1);
    const [noteGroups, setNoteGroups] = useState<Array<Array<Note>>>([]);
    const [notes, setNotes] = useState<Note[]>(props.notes);

    const containerRef = useRef<HTMLDivElement>(null);







    //Change the number of columns in the layout when resizing the window
    useLayoutEffect(() => {
        function getContainerDimensions() {
            if (containerRef.current) {
                const { innerWidth: width, innerHeight: height } = window;
                return {
                    width,
                    height
                };
            }
        }

        const getOrderBase = () => {
            const width = getContainerDimensions()?.width ?? 0;

            if (width < 701) {
                return 1;
            } else if (width < 1001) {
                return 2;
            } else if (width < 1501) {
                return 3;
            } else if (width < 2001) {
                return 4;
            } else {
                return 5;
            }
        }

        function handleResize() {
            const base = getOrderBase();
            setNColumns(base);
        }

        setNColumns(getOrderBase());


        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [containerRef]);

    useEffect(() => {
        setNotes(props.notes);
    }, [props.notes]);

    useEffect(() => {

        const sortFn = getSortFunction(props.sort ?? SortNotes.LastModified, props.order ?? OrderNotes.Descending);

        function updateNoteGroups() {
            const newNoteGroups: Array<Array<Note>> = [];

            for (let column = 0; column < nColumns; column++) {
                newNoteGroups.push([]);
            }


            notes.sort(sortFn).map((note: Note, idx: number) => {
                const column = idx % nColumns;
                newNoteGroups[column].push(note);
            });

            setNoteGroups(newNoteGroups);
        }

        updateNoteGroups();

    }, [nColumns, notes, props.sort, props.order]);


    return <div className='note-column-wrapper' ref={containerRef}>
        {
            noteGroups.map((group: Note[], gIdx: number) => {
                return <div className='note-container' key={gIdx}>
                    {
                        group.map((note: Note) => {
                            return <NoteComponent note={note} key={note.uid} onNoteDelete={
                                () => {
                                    notes.splice(notes.indexOf(note), 1);
                                    setNotes(notes);
                                }
                            } />
                        })
                    }
                </div>;
            })
        }
    </div>;
}

export default NoteContainer;