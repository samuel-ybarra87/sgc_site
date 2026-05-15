import { SupabaseClient } from "@supabase/supabase-js";
import { rankAbbreviations } from "../src/lib/rankAbbreviations"
import { e2eTestTeams, TEST_PERSONNEL_NAMES, TEST_ROLE_NAMES, TEST_TEAM_DESIGNATIONS } from "./mockData";
import { Personnel, Role, Team } from "./interface";

export function extractName(person: Record<string, unknown>){
    const prefix = person.prefix ? `${person.prefix} ` : '';
    const abbrev = person.rank ? `${rankAbbreviations[`${person.rank}`] ?? person.rank} ` : '';
    const name = `${person.first_name} ${person.middle_name ? `${person.middle_name} ` : '' }${person.last_name}${person.suffix ? ` ${person.suffix}` : '' }`;
    return {
        link : person.personnel_type == 'military' ? `${abbrev}${name}` : `${prefix}${name}`,
        displayName : `${prefix}${name}`,
        listName: `${person.personnel_type === 'military' ? person.rank : person.prefix} ${person.first_name}${person.middle_name ? ` ${person.middle_name} ` : ' '}${person.last_name} ${person.suffix}`
    }
}

export async function deleteTestData(supabase: SupabaseClient){
    await supabase
        .from('personnel')
        .update({ team_id: null, role_id: null })
        .eq('suffix', 'TEST');
    
    await deleteTestPersonnel(supabase, await fetchTestPersonnel(supabase));
    await deleteTestRoles(supabase, await fetchTestRoles(supabase));
    await deleteTestTeams(supabase, await fetchTestTeams(supabase));
}

export async function seedTestPersonnel(supabase: SupabaseClient, persons: Personnel[]) {
    // clean up previous runs
    const TestPersonnel = await fetchTestPersonnel(supabase);
    await deleteTestPersonnel(supabase, TestPersonnel);

    // Insert test data
    const { data, error } = await supabase
        .from('personnel')
        .insert(persons)
        .select();

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

    if(error) throw new Error(`Failed to fetch test teams: ${error.message}`);

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

export async function seedTestRoles(supabase: SupabaseClient, roles: Role[]) {
    // Clean up previous runs
    const TestRoles = await fetchTestRoles(supabase);
    await deleteTestRoles(supabase, TestRoles);
    
    // Insert test roles
    const { data, error } = await supabase
        .from('roles')
        .insert(roles).select();

    if(error) throw new Error(`Failed to insert test roles: ${error.message}`);
    if(!data || data.length === 0) throw new Error('No roles data returned after insert');

    return data;
}

export async function fetchTestRoles(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('roles')
        .select()
        .in('name', TEST_ROLE_NAMES)
        .like('name', 'Test%')
        .order('name', { ascending: true });

    if(error) throw new Error(`Failed to fetch roles: ${error.message}`);

    return data;
}

export async function deleteTestRoles(supabase: SupabaseClient, roles: Role[]) {
    if(roles.length === 0) return;

    await Promise.all(roles.map(role =>
        supabase
            .from('roles')
            .delete()
            .eq('name', role.name)
    ));
}