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
import SelectInstanceComponent from './components/Login/SelectInstancePage'

const APP_TITLE = "Takeaway";
const DEFAULT_INSTANCE_URL = "https://example.com/";
const INSTANCE_URL_LOCAL_STORAGE_KEY = "instanceURL";


type Credentials = {
  username: string,
  password: string,
}


function BasicApp() {

  const localInstanceURL = localStorage.getItem(INSTANCE_URL_LOCAL_STORAGE_KEY);
  const [instanceURL, setInstanceURL] = useState<string | undefined>(undefined);
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
    console.log("Set default instance url");
    setInstanceURL(localInstanceURL ?? DEFAULT_INSTANCE_URL);
  }, [localInstanceURL])



  useEffect(() => {
    //Check if an instance URL is stored

    async function fetchData(creds: Credentials, serverURL: string) {
      const client = new Client(creds.username, creds.password, serverURL);
      await client.buildClient();
      setClient(client);


      const calendars = await client.getCalendars();
      setCalendars(calendars);
      setCurrentCalendar(calendars[0]);

      setNotes(await calendars[0].getNotes());
      setJournals(await calendars[0].getJournals());
    }
    if (typeof credentials !== "undefined" && typeof instanceURL !== "undefined") {
      fetchData(credentials, instanceURL);
    }
  }, [credentials, instanceURL]);

  const handleSignIn = (username: string, password: string) => {
    const creds = { username: username, password: password };
    setCredentials(creds);
  }

  const handleSelectNewInstance = (url: string) => {
    console.log("Selectin new instance", url);
    localStorage.setItem(INSTANCE_URL_LOCAL_STORAGE_KEY, url);
    setInstanceURL(url);
  }

  const drawerRef = useRef<DrawerHandle>();
  const toggleDrawer = () => {
    if (drawerRef.current) {
      drawerRef.current.toggleHeader();
    }
  };

  const newNotePopupRef = useRef<NewNotePopupHandle>();

  const selectNewInstance = () => {
    console.log("exec select new instance")
    setInstanceURL(undefined);
  };


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

  if (typeof instanceURL === "undefined") {
    return <>
      <SelectInstanceComponent handleSelectNewInstance={handleSelectNewInstance} />
    </>;
  } else if (typeof credentials === "undefined") {
    return <>
      <LoginPage instanceURL={instanceURL} handleSignIn={handleSignIn} selectNewInstance={selectNewInstance} />
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
