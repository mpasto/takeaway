import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import i18next from "../../classes/locale";
import { Trans } from 'react-i18next';


type SignInProps = {
    instanceURL: string,
    handleSignIn: (username: string, password: string) => void,
    selectNewInstance: () => void,
}

export default function SignIn(props: SignInProps) {
    const handleSignIn = props.handleSignIn;
    const instanceURL = props.instanceURL;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const username = data.get('username')?.toString();
        const password = data.get('password')?.toString();

        if ((typeof username !== "undefined") && (typeof password !== "undefined")) {
            handleSignIn(username, password);
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
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    {i18next.t("login.signIn")}
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label={i18next.t("login.username")}
                        name="username"
                        autoComplete="username"
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label={i18next.t("login.password")}
                        type="password"
                        id="password"
                        autoComplete="current-password"
                    />
                    <FormControlLabel
                        control={<Checkbox name="remember" value={true} color="primary" />}
                        label={i18next.t("login.rememberMe")}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {i18next.t("login.signInAction")}
                    </Button>

                    <p className='select-instance-url-paragraph'>
                        <Trans i18nKey="login.currentInstanceIs" instance={instanceURL}> Current instance is <Link href={instanceURL}>{{ instance: instanceURL }}</Link>. </Trans>
                        <Link className='select-instance-url-link' onClick={props.selectNewInstance}>{i18next.t("login.selectDifferentInstance")}</Link>
                    </p>
                </Box>
            </Box>
        </Container>
    );
}