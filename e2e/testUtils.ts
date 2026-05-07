import { SupabaseClient } from "@supabase/supabase-js";
import { rankAbbreviations } from "../src/lib/rankAbbreviations"
import { e2eTestTeams, TEST_PERSONNEL_NAMES, TEST_TEAM_DESIGNATIONS } from "./mockData";
import { Personnel, Team } from "./interface";

export function extractName(person: Record<string, unknown>){
    const prefix = person.prefix ? `${person.prefix} ` : '';
    const abbrev = person.rank ? `${rankAbbreviations[`${person.rank}`] ?? person.rank} ` : '';
    const name = `${person.first_name} ${person.middle_name ? `${person.middle_name} ` : '' }${person.last_name}${person.suffix ? ` ${person.suffix}` : '' }`;
    return {
        link : person.personnel_type == 'military' ? `${abbrev}${name}` : `${prefix}${name}`,
        displayName : `${prefix}${name}`,
    }
}

export async function seedTestPersonnel(supabase: SupabaseClient, persons: Personnel[]) {
    // clean up previous runs
    const TestPersonnel = await fetchTestPersonnel(supabase);
    await deleteTestPersonnel(supabase, TestPersonnel);

    // Insert test data
    const { data, error } = await supabase
        .from('personnel')
        .insert(persons).select();

    if(error) throw new Error(`Failed to insert test personnel: ${error.message}`);
    if(!data || data.length === 0) throw new Error('No personnel data returned after insert');

    return data;
}

export async function fetchTestPersonnel(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('personnel')
        .select()
        .in('suffix', TEST_PERSONNEL_NAMES)
        .order('last_name', { ascending: true });

    if(error) throw new Error(`Failed to fetch personnel: ${error.message}`);

    return data;
}

export async function deleteTestPersonnel(supabase: SupabaseClient, persons: Personnel[]) {
    if(persons.length === 0) return;

    await Promise.all(persons.map(person =>
        supabase
            .from('personnel')
            .delete()
            .eq('first_name', person.first_name)
            .eq('last_name', person.last_name)
    ));
}

export async function seedTestTeams(supabase: SupabaseClient) {
    // Clean up previous runs
    const testTeams = await fetchTestTeams(supabase);
    await deleteTestTeams(supabase, testTeams);

    // Insert test teams
    const { data, error } = await supabase
        .from('teams')
        .insert(e2eTestTeams).select();

    if(error) throw new Error(`Failed to insert test teams: ${error.message}`);
    if(!data || data.length === 0) throw new Error('No team data returned after insert');

    return data;
}

export async function fetchTestTeams(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('teams')
        .select()
        .in('designation', TEST_TEAM_DESIGNATIONS)
        .order('designation', { ascending: true });

    if(error) throw new Error(`Failed to insert test teams: ${error.message}`);

    return data;
}

export async function deleteTestTeams(supabase: SupabaseClient, teams: Team[]) {
    if(teams.length === 0) return;
    
    await Promise.all(teams.map(team =>
        supabase
            .from('teams')
            .delete()
            .eq('designation', team.designation)
    ));
}