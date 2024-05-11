import { forwardRef, useState, useImperativeHandle } from "react";

import Input from '@mui/material/Input';
import i18next from "../../classes/locale";

type TitleProps = {
    text: string,
    isEditable?: boolean,
};

export type EditableTitleHandle = {
    getValue: () => string;
};

export const Title = forwardRef((props: TitleProps, ref) => {
    const isEditable: boolean = props.isEditable ?? false;

    const [text, setText] = useState(props.text);

    useImperativeHandle(ref, () => ({

        getValue() {
            return text;
        }

    }));

    const onInput = (event: React.ChangeEvent) => {
        const newTitle = (event.target as HTMLTextAreaElement).value;
        setText(newTitle);
    };



    return <Input contentEditable={isEditable} className='note-title-input' onChange={onInput} placeholder={i18next.t("note.untitledNote")} defaultValue={props.text} />;
});