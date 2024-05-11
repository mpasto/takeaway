import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import i18next from '../../classes/locale';

const SearchComp = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: "50px",//theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    color: alpha(theme.palette.secondary.main, 1),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.primary.main,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    height: '48px',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        //transition: theme.transitions.create('width'),
        [theme.breakpoints.up('sm')]: {
            width: '50ch',
            /*'&:focus': {
                width: '40ch',
            },*/
        },
    },
}));

type SearchProps = {
    onSearchBarInput(inputValue: string): void,
};


function Search(props: SearchProps) {

    return <SearchComp>
        <SearchIconWrapper>
            <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
            placeholder={i18next.t("header.searchNotes")}
            inputProps={{ 'aria-label': 'search' }}
            onInput={
                (event) => {
                    props.onSearchBarInput((event.target as HTMLInputElement).value);
                }
            }
        />
    </SearchComp>;
}

export { Search };
export type { SearchProps };
