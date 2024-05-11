import { Avatar, Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import { forwardRef, useImperativeHandle, useState } from "react";



type NavItem = {
    name: string,
    color?: string,
    action(): void,
}

type DrawerProps = {
    name: string,
    navItems: NavItem[],
}

export type DrawerHandle = {
    toggleHeader(): void,
};

export const DrawerMenu = forwardRef((props: DrawerProps, ref) => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const drawerWidth = 240;


    const handleDrawerToggle = () => {
        setDrawerOpen((prevState) => !prevState);
    };

    useImperativeHandle(ref, () => ({

        toggleHeader() {
            handleDrawerToggle();
        }

    }));

    type ColorCircleProps = { color?: string };

    const ColorCircle = (props: ColorCircleProps) => {
        if (typeof props.color !== "undefined") {
            const diameter = "30px";
            return <div style={{ backgroundColor: props.color, width: diameter, height: diameter, borderRadius: "50%" }}></div>;
        } else {
            return <></>;
        }
    }

    const drawer = <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
        <Typography variant="h6" sx={{ my: 2 }}>
            {props.name}
        </Typography>
        <Divider />
        <List>
            {props.navItems.map((item) => {

                return <ListItem key={item.name} disablePadding>
                    <ListItemButton sx={{ textAlign: 'center' }} onClick={item.action}>
                        <ColorCircle color={item.color} />
                        <ListItemText primary={item.name} />
                    </ListItemButton>
                </ListItem>;
            })}
        </List>
    </Box>;


    return <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
            keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
    >
        {drawer}
    </Drawer>;
});
