import { SupabaseClient } from "@supabase/supabase-js";
import { rankAbbreviations } from "../src/lib/rankAbbreviations"

export function extractName(person: Record<string, unknown>){
    const prefix = person.prefix ? `${person.prefix} ` : '';
    const abbrev = person.rank ? `${rankAbbreviations[`${person.rank}`] ?? person.rank} ` : '';
    const name = `${person.first_name} ${person.middle_name ? `${person.middle_name} ` : '' }${person.last_name}${person.suffix ? ` ${person.suffix}` : '' }`;
    return {
        link : person.personnel_type == 'military' ? `${abbrev}${name}` : `${prefix}${name}`,
        displayName : `${prefix}${name}`,
    }
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