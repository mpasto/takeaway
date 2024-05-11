import { forwardRef, useRef, useState, useImperativeHandle } from "react";
import { MDXEditor, toolbarPlugin, BoldItalicUnderlineToggles, UndoRedo, InsertCodeBlock, CreateLink, linkDialogPlugin, linkPlugin, ListsToggle, listsPlugin, headingsPlugin, quotePlugin, MDXEditorMethods } from '@mdxeditor/editor';
import usePrefersColorScheme from "use-prefers-color-scheme";
import i18next from "../../classes/locale";

type MarkdownEditorProps = {
    content: string,
};

export type MarkdownEditorHandle = {
    getContent: () => string;
};

export const MarkdownEditor = forwardRef((props: MarkdownEditorProps, ref) => {

    const editorRef = useRef<MDXEditorMethods>(null);

    const prefersColorScheme = usePrefersColorScheme();
    const mdDarkTheme = prefersColorScheme === "dark" ? "dark-theme" : "";

    const initialContent = props.content;


    const [content, setContent] = useState(initialContent);


    useImperativeHandle(ref, () => ({

        getContent() {
            return content;
        },

    }));

    const onChange = () => {
        if (editorRef.current) {
            setContent(editorRef.current.getMarkdown());
        }
    };



    const translate = (key, defaultValue, interpolations) => { return i18next.t(key, defaultValue, interpolations) };
    return <MDXEditor markdown={initialContent}
        className={"markdown-editor " + mdDarkTheme}
        contentEditableClassName="markdown-editor-content"
        plugins={[
            headingsPlugin(),
            quotePlugin(),
            listsPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            toolbarPlugin({
                toolbarContents: () => (
                    <>
                        <UndoRedo />
                        <BoldItalicUnderlineToggles />
                        <ListsToggle />
                        <InsertCodeBlock />
                        <CreateLink />
                    </>
                )
            })
        ]}

        translation={translate}

        ref={editorRef}

        onChange={onChange}


    />;


});