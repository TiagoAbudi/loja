import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface Profile {
    id: string;
    role: 'admin' | 'funcionario';
    funcionario_id: number | null;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        const fetchSessionAndProfile = async () => {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                console.error("Erro ao pegar sessão inicial:", sessionError);
                setLoading(false);
                return;
            }

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                const { data: userProfile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                
                if (profileError) {
                    console.error("Erro ao buscar perfil:", profileError);
                } else {
                    setProfile(userProfile as Profile);
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        };

        fetchSessionAndProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, newSession) => {
                fetchSessionAndProfile();
            }
        );

        return () => subscription.unsubscribe();
    }, []);
    
    const value = { session, user, profile, loading };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <p>Carregando...</p> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};