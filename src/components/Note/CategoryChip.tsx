import { Chip } from "@mui/material";

type CategoryChipProps = {
    name: string,
};

function CategoryChip(props: CategoryChipProps) {
    return <Chip label={props.name} />
}

export { CategoryChip }