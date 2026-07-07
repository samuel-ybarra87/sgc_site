import { supabaseUrl } from '../mocks/handlers';
import type { Personnel } from '../lib/types';
import { rankAbbreviations } from '../lib/rankAbbreviations';
import { useAuth } from '../components/AuthContext';
import { vi } from 'vitest';

export const PERSONNEL = `${supabaseUrl}/rest/v1/personnel`;
export const TEAM = `${supabaseUrl}/rest/v1/teams`;
export const TEAM_PERSONNEL = `${supabaseUrl}/rest/v1/team_personnel`
export const MISSION = `${supabaseUrl}/rest/v1/missions`;
export const OBJECTIVE = `${supabaseUrl}/rest/v1/mission_objectives`;
export const MISSIONS_TEAMS = `${supabaseUrl}/rest/v1/missions_teams`;
export const TEST_USERS = {
    USER: { email: 'user@sgc.gov', role: 'user' },
    OFFICER: { email: 'officer@sgc.gov', role: 'officer' },
    ADMIN: { email: 'admin@sgc.gov', role: 'admin' },
} as const;

export function extractName(person: Personnel | undefined){
    if(!person) throw new Error("Personnel not found");
    const rank = rankAbbreviations[person.rank ?? ''];
    const prefix = person.personnel_type === 'military' ? `${rank} ` : (person.prefix ? `${person.prefix} ` : '');
    const name = `${person.first_name}${person.middle_name ? ` ${person.middle_name} `: ' '}${person.last_name ?? ''}${person.suffix ? ` ${person.suffix}` : ''}`
    
    return `${prefix}${name}`.trim();
}

export function extractDate(timestamp: string | null){
    if(!timestamp) throw new Error("End date not found");
    const [date, time] = timestamp.slice(0,16).split('T');

    return `${date} ${time}`;
}

export function mockLoginAs(profile: { email: string; role: "user" | "officer" | "admin" | null }){
    vi.mocked(useAuth).mockReturnValue({
            session: {
                user: { id: 'mock-user-id', email: profile.email }
            },
            error: null,
            role: profile.role,
            loading: false,
        } as any);
}