import ICAL from "ical.js";
import { formatDateForICal, Calendar, RequestStatus } from './caldav';

import { Category, CategoryFactory } from "./category";
import { throwIfUndefined } from "./type_utils";

const PRODID = "+//example.com//Takeaway 1.0//EN";


type NoteFields = {
    summary?: string,
    description?: string,
    categories?: Category[],
    color?: string,
    created?: Date,
    lastModified?: Date,
    dtstamp?: Date,
    dtstart?: Date,
    sequence?: number,
    status?: string,
    uid?: string,
}

function vJournalize(fields: NoteFields, version: string = "2.0", prodId: string = PRODID) {
    let vCalStr = "BEGIN:VCALENDAR\r\n";

    function addFieldIfNotUndefined(fieldName: string, fieldValue: string | undefined) {
        if (fieldValue !== undefined) {
            vCalStr += `${fieldName}:${fieldValue}\r\n`;
        }
    }

    function formatDateIfNotUndefined(field: Date | undefined) {
        return typeof field !== "undefined" ? formatDateForICal(field) : undefined;
    }


    addFieldIfNotUndefined("VERSION", version);
    addFieldIfNotUndefined("PRODID", `${prodId}`);

    vCalStr += "BEGIN:VJOURNAL\r\n";

    addFieldIfNotUndefined("CATEGORIES", fields.categories?.map((cat: Category) => {
        return cat.name;
    }).join(","));
    addFieldIfNotUndefined("CREATED", formatDateIfNotUndefined(fields.created));
    addFieldIfNotUndefined("COLOR", fields.color);
    addFieldIfNotUndefined("DESCRIPTION", fields.description?.replace(/(?:\n)/g, "\\n"));
    addFieldIfNotUndefined("DTSTAMP", formatDateIfNotUndefined(fields.dtstamp));
    addFieldIfNotUndefined("DTSTART", formatDateIfNotUndefined(fields.dtstart));
    addFieldIfNotUndefined("SEQUENCE", fields.sequence?.toString());
    addFieldIfNotUndefined("STATUS", fields.status);
    addFieldIfNotUndefined("SUMMARY", fields.summary);
    addFieldIfNotUndefined("UID", fields.uid);

    vCalStr += "END:VJOURNAL\r\nEND:VCALENDAR";

    return vCalStr;
}

type ObjectField = [string, object, string, ...string[]]

class Note {
    title: string;
    calendar: Calendar;
    etag?: string;
    url: string;
    description?: string;
    categories?: Category[];
    color?: string;
    created: Date;
    lastModified: Date;
    dtstamp: Date;
    sequence: number;
    status: string;
    uid: string;
    version: string = "2.0";
    prodId: string = PRODID;

    constructor(title: string, calendar: Calendar, uid: string, etag: string, url: string, description?: string, categories?: Category[], color?: string, created?: Date, lastModified?: Date, dtstamp?: Date, sequence?: number, status?: string, version?: string, prodId?: string) {
        this.title = title;
        this.calendar = calendar;
        this.etag = etag;
        this.uid = uid;
        this.url = url;
        this.description = description;
        this.categories = categories;
        this.color = color;
        this.created = created ?? new Date();
        this.lastModified = lastModified ?? new Date();
        this.dtstamp = dtstamp ?? new Date();
        this.sequence = sequence ?? 0;
        this.status = status ?? "";
        this.version = version ?? "2.0";
        this.prodId = prodId ?? PRODID;

        if (typeof categories !== "undefined") {
            categories.forEach((cat: Category) => {
                cat.addNote(this);
            })
        }
    }

    static async createEmptyNote(calendar: Calendar): Promise<Note> {
        return new Note("", calendar, await calendar.generateNewUUID(), "", "");
    }

    static parseObjectFields(objectFields: Array<ObjectField>): NoteFields {
        let color: string | undefined;
        let created: Date | undefined;
        let lastModified: Date | undefined;
        let dtstamp: Date | undefined;
        let dtstart: Date | undefined;
        let summary: string | undefined;
        let description: string | undefined;
        let noteStatus: string | undefined;
        let sequence: number | undefined;
        let uid: string | undefined;
        let categories: Category[] | undefined;

        objectFields.forEach(
            (data) => {
                const fieldName = data[0];
                const fieldValue = data[3];
                switch (fieldName) {
                    case "categories":
                        categories = data.slice(3).map((catName: string) => {
                            return CategoryFactory.createOrReturn(catName);
                        });
                        break;
                    case "color":
                        color = fieldValue;
                        break;
                    case "created":
                        created = new Date(fieldValue);
                        break;
                    case "last-modified":
                        lastModified = new Date(fieldValue);
                        break;
                    case "dtstamp":
                        dtstamp = new Date(fieldValue);
                        break;
                    case "dtstart":
                        dtstart = new Date(fieldValue);
                        break;
                    case "description":
                        description = fieldValue;
                        break;
                    case "sequence":
                        sequence = parseInt(fieldValue);
                        break;
                    case "status":
                        noteStatus = fieldValue;
                        break;
                    case "summary":
                        summary = fieldValue;
                        break;
                    case "uid":
                        uid = fieldValue;
                        break;
                    default:
                        break;
                }
            }
        );
        return {
            summary: summary,
            description: description,
            categories: categories,
            color: color,
            created: created,
            lastModified: lastModified,
            dtstamp: dtstamp,
            dtstart: dtstart,
            sequence: sequence,
            status: noteStatus,
            uid: uid,
        }
    }


    static parseFromVJournal(journal: string, calendar: Calendar, etag: string, url: string): Note {
        const result = ICAL.parse(journal);
        const props = result[1];
        const version: string = props[0][3];
        const prodID: string = props[1][3];

        const objectFields: Array<ObjectField> = result[2][0][1];
        const fields = Note.parseObjectFields(objectFields);


        return new Note(fields.summary ?? "", calendar, fields.uid ?? "", etag, url, fields.description, fields.categories, fields.color, fields.created, fields.lastModified, fields.dtstamp, fields.sequence, fields.status, version, prodID);
    }

    toExistingVJournal(): string {
        if (typeof this.uid !== "undefined") {
            return vJournalize({
                categories: this.categories,
                color: this.color,
                created: this.created,
                description: this.description,
                dtstamp: this.dtstamp,
                lastModified: this.lastModified,
                sequence: this.sequence,
                status: this.status,
                summary: this.title,
                uid: this.uid,
            }, this.version, this.prodId)
        } else {
            throw Error("Cannot convert to existing journal : note has no UID");
        }
    }

    async updateInCalendar(): Promise<RequestStatus> {
        const data = this.toExistingVJournal();
        throwIfUndefined(this.etag);
        const resp = await this.calendar.updateNote(this.url, data, this.etag);
        if (resp.status == RequestStatus.Success) {
            this.etag = resp.etag;
        }
        return resp.status;
    }

    async deleteInCalendar(): Promise<RequestStatus> {
        throwIfUndefined(this.etag);
        return await this.calendar.deleteNote(this.url, this.etag);
    }
}

export { Note, vJournalize };
export type { ObjectField, NoteFields };
