import tsdav, { DAVCalendar, DAVClient, DAVNamespaceShort } from 'tsdav';
import { v4 as uuidv4 } from 'uuid';
import { Journal } from './journal';
import { Note } from './note';
import { throwIfUndefined } from './type_utils';

enum RequestStatus {
    Success = 1,
    Fail
}

type UpdateResponse = {
    status: RequestStatus,
    etag?: string
};



async function makeClient(username: string, password: string, serverUrl: string): Promise<DAVClient> {

    const client = await tsdav.createDAVClient({
        serverUrl: serverUrl,
        credentials: {
            username: username,
            password: password
        },
        authMethod: 'Basic',
        defaultAccountType: 'caldav',
    });

    return client;
}


function filterOutJournals(arr: (Journal | Note)[]): Note[] {
    return arr.filter(item => !(item instanceof Journal));
}


function filterOutNotes(arr: (Journal | Note)[]): Journal[] {
    return arr.filter(item => item instanceof Journal) as Journal[];
}

class Calendar {
    name: string;
    color?: string;
    davCalendar: DAVCalendar;
    client: DAVClient;
    journalAndNotes?: (Journal | Note)[];

    constructor(name: string, color: string, davCalendar: DAVCalendar, client: DAVClient) {
        this.name = name;
        this.color = color;
        this.davCalendar = davCalendar;
        this.client = client;
    }

    static fromDAVCalendar(davCalendar: DAVCalendar, client: DAVClient) {
        let calName = "";
        if (typeof (davCalendar.displayName) === "string") {
            calName = davCalendar.displayName;
        }

        return new Calendar(calName ?? "Unnamed calendar", davCalendar.calendarColor ?? undefined, davCalendar, client);
    }

    async getTodo() {
        const calendarObjects = await this.client.fetchCalendarObjects({
            calendar: this.davCalendar,
            filters: {
                'comp-filter': {
                    _attributes: {
                        name: "VCALENDAR",
                    },
                    'comp-filter': {
                        _attributes: {
                            name: "VTODO",
                        },
                    },
                },
            },
        });
        return calendarObjects;
    }

    async fetchJournalsAndNotes() {
        const calendarObjects = await this.client.fetchCalendarObjects({
            calendar: this.davCalendar,
            filters: {
                'comp-filter': {
                    _attributes: {
                        name: "VCALENDAR",
                    },
                    'comp-filter': {
                        _attributes: {
                            name: "VJOURNAL",
                        },
                    },
                },
            },
        });
        const journalAndNotes = calendarObjects.map((journ) => Journal.parseNoteOrJournalFromVJournal(journ.data, this, journ.etag ?? "", journ.url ?? ""));
        this.journalAndNotes = journalAndNotes;
    }

    async getJournalsAndNotes(forceFetch: boolean = false): Promise<(Journal | Note)[]> {
        if (forceFetch || typeof this.journalAndNotes === "undefined") {
            await this.fetchJournalsAndNotes();
            throwIfUndefined(this.journalAndNotes);
            return this.journalAndNotes;
        } else {
            return this.journalAndNotes;
        }
    }

    async getNotes(forceFetch: boolean = false): Promise<Note[]> {
        return filterOutJournals(await this.getJournalsAndNotes(forceFetch));
    }

    async getJournals(forceFetch: boolean = false): Promise<Journal[]> {
        return filterOutNotes(await this.getJournalsAndNotes(forceFetch));
    }

    async updateNote(url: string, data: string, etag: string): Promise<UpdateResponse> {
        const rep = await this.client.updateObject({ url: url, data: data, etag: etag });

        console.log(rep)

        if (rep.status == 201) {
            return { status: RequestStatus.Success, etag: "" };
        } else {
            return { status: RequestStatus.Fail };
        }
    }

    async deleteNote(url: string, etag: string): Promise<RequestStatus> {
        const rep = await this.client.deleteObject({ url: url, etag: etag });
        if (rep.status == 200) {
            return RequestStatus.Success;
        } else {
            return RequestStatus.Fail;
        }
    }

    async getObjectEtagByUrl(url: string): Promise<string> {
        const [find_etag_result] = await this.client.propfind({
            url: url,
            props: {
                [`${DAVNamespaceShort.DAV}:getetag`]: {},
            },
            depth: '0',
        });
        return find_etag_result.props?.getetag;
    }

    async createNote(): Promise<Note> {
        const newNote = await Note.createEmptyNote(this);

        const result = await this.client.createCalendarObject({ calendar: this.davCalendar, filename: `${newNote.uid}.ics`, iCalString: newNote.toExistingVJournal() });

        if (result.status != 201) {
            throw Error("Error creating new note");
        }

        const url = this.davCalendar.url + `${newNote.uid}.ics`;
        const etag = await this.getObjectEtagByUrl(url);

        newNote.url = url;
        newNote.etag = etag;


        return newNote;
    }

    async generateNewUUID(): Promise<string> {
        const allUUIDs: string[] = (await this.getJournalsAndNotes()).map((j) => (j.uid));
        let uuid: string;
        do {
            uuid = uuidv4();

        } while (allUUIDs.includes(uuid));
        return uuid;
    }
}


class Client {
    username: string;
    password: string;
    client: DAVClient | undefined = undefined;
    serverURL: string;

    constructor(username: string, password: string, serverURL: string) {
        this.username = username;
        this.password = password;
        this.serverURL = serverURL;
    }

    async buildClient() {
        this.client = await makeClient(this.username, this.password, this.serverURL);
    }

    awaitClientAndApply = async <T extends (...args: any[]) => any>(f: T, ...args: Parameters<T>): Promise<ReturnType<T>> => {
        if (typeof this.client === "undefined") {
            await this.buildClient();
        }

        if (typeof this.client !== "undefined") {
            return f(...args);
        } else {
            throw Error("Client is undefined");
        }
    }


    async getCalendars(): Promise<Calendar[]> {
        return this.awaitClientAndApply(async () => {
            const client = this.client;
            throwIfUndefined(client);
            const calendars = (await client.fetchCalendars()).map((cal) => Calendar.fromDAVCalendar(cal, client));
            return calendars;
        })
    }
}


function formatDateForICal(date: Date) {
    const year = Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'utc' }).format(date);
    const month = Intl.DateTimeFormat('en', { month: '2-digit', timeZone: 'utc' }).format(date);
    const day = Intl.DateTimeFormat('en', { day: '2-digit', timeZone: 'utc' }).format(date);
    const hour = Intl.DateTimeFormat('en', { hour: '2-digit', timeZone: 'utc', hour12: false }).format(date).split(' ')[0];
    const minute = Intl.DateTimeFormat('en', { minute: '2-digit', timeZone: 'utc' }).format(date).split(' ')[0];
    const second = Intl.DateTimeFormat('en', { second: '2-digit', timeZone: 'utc' }).format(date).split(' ')[0];
    return `${year}${month}${day}T${hour}${minute}${second}Z`;
}


export { formatDateForICal, Client, Calendar, RequestStatus }