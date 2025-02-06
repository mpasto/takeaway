import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import i18next from "../../classes/locale";


type SelectInstanceProps = {
    instanceURL?: string,
    handleSelectNewInstance: (url: string) => void,
}

export default function SelectInstanceComponent(props: SelectInstanceProps) {
    const instanceURL = props.instanceURL;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const instance = data.get('instance')?.toString();

        if ((typeof instance !== "undefined")) {
            props.handleSelectNewInstance(instance);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    {i18next.t("login.changeCALDAVInstanceURL")}
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="instance"
                        label={i18next.t("login.instanceURL")}
                        name="instance"
                        autoComplete="instance"
                        autoFocus
                        defaultValue={instanceURL ?? ""}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {i18next.t("login.submit")}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}