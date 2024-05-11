import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import translationEN from "../assets/locales/en/MdxEditor.json";
import translationFR from "../assets/locales/fr/MdxEditor.json";

import noteTranslationEN from "../assets/locales/en/Note.json";
import noteTranslationFR from "../assets/locales/fr/Note.json";

import loginTranslationEN from "../assets/locales/en/Login.json";
import loginTranslationFR from "../assets/locales/fr/Login.json";

import headerTranslationEN from "../assets/locales/en/Header.json";
import headerTranslationFR from "../assets/locales/fr/Header.json";



const resources = {
    en: {
        translation: { ...translationEN, ...noteTranslationEN, ...loginTranslationEN, ...headerTranslationEN }
    },
    fr: {
        translation: { ...translationFR, ...noteTranslationFR, ...loginTranslationFR, ...headerTranslationFR }
    }
};

i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        debug: true,
        interpolation: {
            escapeValue: false,
        },
        //backend: {
        //    loadPath: '../../public/locales/{{lng}}/MdxEditor.json',
        //}
    });

export default i18next;