import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const { data } = await axios.get('/profile');
                setUser(data);
            } catch (err) {
                console.error('Failed to fetch user profile', err);
                setError('Failed to load user profile');
            } finally {
                setReady(true);
            }
        };

        fetchUserProfile();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, ready, error }}>
            {children}
        </UserContext.Provider>
    );
}
