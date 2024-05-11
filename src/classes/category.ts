import { Note } from "./note";
import { throwIfUndefined } from "./type_utils";

class Category {
    name: string;
    notes: Note[];

    constructor(name: string) {
        this.name = name;
        this.notes = [];
    }

    addNote(note: Note) {
        this.notes.push(note);
    }
}

interface FactoryInterface<T> {
    allInstances: Record<string, T>,
    namesList: string[],
    create(args?: unknown): T,
    createOrReturn(args?: unknown): T,
    getAll(): T[],
    getByName(name: string): T | undefined,
}

const CategoryFactory: FactoryInterface<Category> = {
    allInstances: {},
    namesList: [],
    create: function (name: string) {
        const newCategory = new Category(name);
        if (name in this.namesList) {
            throw Error(`Category "${name}" is already in registry.`);
        }
        this.allInstances[name] = newCategory;
        return newCategory;
    },

    createOrReturn: function (name: string) {
        if (name in this.namesList) {
            const cat = this.getByName(name);
            throwIfUndefined(cat);
            return cat;
        } else {
            return this.create(name);
        }
    },

    getAll() {
        return this.namesList.map((name: string) => this.allInstances[name]);
    },

    getByName(name: string) {
        return this.allInstances[name];
    }
};

export { Category, CategoryFactory }