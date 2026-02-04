import {useAuthStore} from "@/entities/user/model/store.js";
import {useEffect} from "react";
import {AppRouter} from "@/app/router";


export function AppProvider() {
    useEffect(() => {
        useAuthStore.getState().checkAuth();
    }, []);

    return <AppRouter />
}