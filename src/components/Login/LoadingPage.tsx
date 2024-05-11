import { CircularProgress } from "@mui/material";
import i18next from "../../classes/locale";

export default function LoadingPage() {
    return <div style={{ width: "100%", height: "100%", flexDirection: "row", display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <CircularProgress />
            <h2>{i18next.t("loading.loadingNotes")}</h2>
        </div>
    </div>;
}