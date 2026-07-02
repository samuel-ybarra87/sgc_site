import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    session: any;
    error: any;
    role: 'user' | 'officer' | 'admin' | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, error: null, role: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<any>(null);
    const [role, setRole] = useState<'user' | 'officer' | 'admin' | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchProfileRole = async (userId: string) => {
    
        // Create a promise that rejects after 3 seconds so we don't hang forever
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Supabase Query Timed Out")), 3000)
        );

        const query = supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        // Race the actual query against 3-second timeout
        const { data, error }: any = await Promise.race([query, timeout]);

        if (!error && data) {
            setRole(data.role);
        }

        if(error){
            setLoading(true);
            setError(error);
        }
    };

    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchProfileRole(session.user.id).then(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        // 2. Listen for auth changes (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, currentSession) => {
            setSession(currentSession);
            if (currentSession?.user) {
                await fetchProfileRole(currentSession.user.id);
            } else {
                setRole(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ session, error, role, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);