import { SupabaseClient } from "@supabase/supabase-js";
import { rankAbbreviations } from "../src/lib/rankAbbreviations"
import type { Personnel } from "../src/lib/types"

export function extractName(person: Record<string, unknown>){
    const prefix = person.prefix ? `${person.prefix} ` : '';
    const abbrev = person.rank ? `${rankAbbreviations[`${person.rank}`] ?? person.rank} ` : '';
    const name = `${person.first_name} ${person.middle_name ? `${person.middle_name} ` : '' }${person.last_name}${person.suffix ? ` ${person.suffix}` : '' }`;
    return {
        link : person.personnel_type == 'military' ? `${abbrev}${name}` : `${prefix}${name}`,
        displayName : `${prefix}${name}`,
    }
}

export async function seedTestPersonnel(supabase: SupabaseClient, persons: any[]) {
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
        .in('middle_name', ['Test'])
        .order('last_name', { ascending: true });

    if(error) throw new Error(`Failed to fetch personnel: ${error.message}`);

    return data;
}

export async function deleteTestPersonnel(supabase: SupabaseClient, persons: any[]) {
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
    await deleteTestTeams(supabase);

    // Insert test teams
    const { data, error } = await supabase
        .from('teams')
        .insert([
            { designation: 'SG-Test-1', status: 'active' },
            { designation: 'SG-Test-2', status: 'active' },
            { designation: 'SG-Unassigned-Test', status: 'inactive' }
        ]).select();

    if(error) throw new Error(`Failed to insert test teams: ${error.message}`);
    if(!data || data.length === 0) throw new Error('No team data returned after insert');

    return data;
}

export async function fetchTestTeams(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('teams')
        .select()
        .in('designation', ['SG-Test-1', 'SG-Test-2', 'SG-Unassigned-Test'])
        .order('designation', { ascending: true });

    if(error) throw new Error(`Failed to insert test teams: ${error.message}`);

    return data;
}

export async function deleteTestTeams(supabase: SupabaseClient) {
    await supabase
        .from('teams')
        .delete()
        .eq('designation', 'SG-Test-1');
    await supabase
        .from('teams')
        .delete()
        .eq('designation', 'SG-Test-2');
    await supabase
        .from('teams')
        .delete()
        .eq('designation', 'SG-Unassigned-Test');
}