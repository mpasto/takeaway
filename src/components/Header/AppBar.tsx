import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import { Search } from './Search';

type SearchAppBarProps = {
    name: string,
    onSandwichClick(): void,
    onSearchBarInput(inputValue: string): void,
};

export default function SearchAppBar(props: SearchAppBarProps) {
    return (
        <Box sx={{ flexGrow: 1, zIndex: 10 }} position="sticky">
            <AppBar >
                < Toolbar >
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        sx={{ mr: 2 }}
                        onClick={props.onSandwichClick}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
                    >
                        {props.name}
                    </Typography>

                    <Search onSearchBarInput={props.onSearchBarInput} />

                </Toolbar>
            </AppBar >
        </Box >
    );
}