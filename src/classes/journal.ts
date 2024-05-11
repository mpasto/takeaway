import { Note, ObjectField, vJournalize } from './note';
import { Category } from './category';
import ICAL from "ical.js";
import { Calendar } from './caldav';

class Journal extends Note {
    date: Date;

    constructor(title: string, calendar: Calendar, uid: string, etag: string, url: string, date: Date, description?: string, categories?: Category[], color?: string, created?: Date, lastModified?: Date, dtstamp?: Date, sequence?: number, status?: string, version?: string, prodId?: string) {
        super(title, calendar, uid, etag, url, description, categories, color, created, lastModified, dtstamp, sequence, status, version, prodId);
        this.date = date;
    }

    /**
     * parseFromJournal
     */
    static parseFromVJournal(journal: string, calendar: Calendar, etag: string, url: string): Journal {
        const result = ICAL.parse(journal);
        const props = result[1];
        const version: string = props[0][3];
        const prodID: string = props[1][3];

        const objectFields: Array<ObjectField> = result[2][0][1];
        const fields = Note.parseObjectFields(objectFields);

        return new Journal(fields.summary ?? "", calendar, fields.uid ?? "", etag, url, fields.dtstart ?? new Date(), fields.description, fields.categories, fields.color, fields.created, fields.lastModified, fields.dtstamp, fields.sequence, fields.status, version, prodID);
    }

    static parseNoteOrJournalFromVJournal(journal: string, calendar: Calendar, etag: string, url: string): Note | Journal {
        const result = ICAL.parse(journal);
        const props = result[1];
        const version: string = props[0][3];
        const prodID: string = props[1][3];

        const objectFields: Array<[string, object, string, string]> = result[2][0][1];
        const fields = Note.parseObjectFields(objectFields);


        if (fields.dtstart !== undefined) {
            return new Journal(fields.summary ?? "", calendar, fields.uid ?? "", etag, url, fields.dtstart ?? new Date(), fields.description, fields.categories, fields.color, fields.created, fields.lastModified, fields.dtstamp, fields.sequence, fields.status, version, prodID);
        } else {
            return new Note(fields.summary ?? "", calendar, fields.uid ?? "", etag, url, fields.description, fields.categories, fields.color, fields.created, fields.lastModified, fields.dtstamp, fields.sequence, fields.status, version, prodID);
        }


    }

    toExistingVJournal(): string {
        if (typeof this.uid !== "undefined") {
            return vJournalize({
                categories: this.categories,
                color: this.color,
                created: this.created,
                description: this.description,
                dtstamp: this.dtstamp,
                dtstart: this.date,
                lastModified: this.lastModified,
                sequence: this.sequence,
                status: this.status,
                summary: this.title,
                uid: this.uid,
            }, this.version, this.prodId)
        } else {
            throw Error("Cannot convert to existing journal : journal has no UID");
        }
    }
}

export { Journal }
