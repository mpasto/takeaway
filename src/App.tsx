import { useEffect, useRef, useState } from 'react'
import './App.css'
import { Client, Calendar } from './classes/caldav'
import { Journal } from './classes/journal'
import { Note } from './classes/note'
import NoteContainer from './components/Note/NoteContainer'
import AddNoteButton from './components/Note/AddNoteButton'
import LoginPage from './components/Login/LoginPage'
import SearchAppBar from './components/Header/AppBar'
import { DrawerHandle, DrawerMenu } from './components/Header/Drawer'
import LoadingPage from './components/Login/LoadingPage'
import NewNotePopup, { NewNotePopupHandle } from './components/Note/NewNotePopup'

const APP_TITLE = "Takeaway";


type Credentials = {
  username: string,
  password: string,
}


function BasicApp() {

  //const localCredsStr = localStorage.getItem("credentials");
  const [credentials, setCredentials] = useState<Credentials | undefined>(undefined);
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [calendars, setCalendars] = useState<Calendar[] | undefined>(undefined);
  const [currentCalendar, setCurrentCalendar] = useState<Calendar | undefined>(undefined);
  const [notes, setNotes] = useState<Note[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);


  const setNewCalendar = async (calendar: Calendar) => {
    setCurrentCalendar(calendar);
    setNotes(await calendar.getNotes());
    setJournals(await calendar.getJournals());
  };



  useEffect(() => {
    async function fetchData(creds: Credentials) {
      const client = new Client(creds.username, creds.password);
      await client.buildClient();
      setClient(client);


      const calendars = await client.getCalendars();
      setCalendars(calendars);
      setCurrentCalendar(calendars[0]);

      setNotes(await calendars[0].getNotes());
      setJournals(await calendars[0].getJournals());
    }
    if (typeof credentials !== "undefined") {
      fetchData(credentials);
    }
  }, [credentials]);

  const handleSignIn = (username: string, password: string) => {
    const creds = { username: username, password: password };
    setCredentials(creds);
  }

  const drawerRef = useRef<DrawerHandle>();
  const toggleDrawer = () => {
    if (drawerRef.current) {
      drawerRef.current.toggleHeader();
    }
  };

  const newNotePopupRef = useRef<NewNotePopupHandle>();


  const addNewNote = async () => {
    if (currentCalendar) {
      console.log("Add note for calendar", currentCalendar.name);
      const newNote = await currentCalendar.createNote();

      if (newNotePopupRef.current) {
        newNotePopupRef.current.setNote(newNote);
        newNotePopupRef.current.display();
      }
    }


  };

  const handleBlurNewNotePopup = () => {
    if (newNotePopupRef.current) {
      const note = newNotePopupRef.current.getNote();

      note.updateInCalendar();
      // Hide note popup
      newNotePopupRef.current.hide();

      // Add note to list of all notes
      setNotes(notes.concat(note));

    }
  };

  if (typeof credentials === "undefined") {
    return <>
      <LoginPage handleSignIn={handleSignIn} />
    </>;
  } else if (typeof calendars === "undefined") {
    return <LoadingPage />;
  } else {

    return <>
      <SearchAppBar name={APP_TITLE} onSandwichClick={toggleDrawer} onSearchBarInput={() => { }} />

      <DrawerMenu ref={drawerRef} name={APP_TITLE} navItems={
        calendars.map((cal) => {
          return {
            name: cal.name,
            color: cal.color,
            action: async () => { console.log(cal.name); await setNewCalendar(cal); }
          }
        })
      }
      />
      <NoteContainer notes={notes} />
      <AddNoteButton calendar={currentCalendar} onClick={addNewNote} />
      <NewNotePopup ref={newNotePopupRef} onBlur={handleBlurNewNotePopup} />

    </>;
  }
}

function App() {
  return <BasicApp />;
}


export default App
