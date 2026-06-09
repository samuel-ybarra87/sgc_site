import { SupabaseClient } from "@supabase/supabase-js";
import { rankAbbreviations } from "../src/lib/rankAbbreviations"
import { e2eTestTeams, e2eMockMissions, TEST_PERSONNEL_NAMES, TEST_ROLE_NAMES, TEST_TEAM_DESIGNATIONS, TEST_MISSIONS, TEST_OBJECTIVES } from "./mockData";
import { Mission, MissionObjective, MissionTeamLink, Personnel, Role, Team, TeamPersonnelLink } from "./interface";

export function extractName(person: Record<string, unknown>){
    const prefix = person.prefix ? `${person.prefix} ` : '';
    const rank = person.rank ? `${person.rank} ` : '';
    const abbrev = person.rank ? `${rankAbbreviations[`${person.rank}`] ?? person.rank} ` : '';
    const name = `${person.first_name}${person.middle_name ? ` ${person.middle_name}` : '' }${person.last_name ? ` ${person.last_name}`: ''}${person.suffix ? ` ${person.suffix}` : '' }`;
    return {
        link : person.personnel_type == 'military' ? `${abbrev}${name}` : `${prefix}${name}`,
        displayName : `${prefix}${name}`,
        listName: `${person.personnel_type === 'military' ? rank : prefix}${name}`,
        abbrevName: `${person.personnel_type === 'military' ? abbrev : prefix}${name}`
    }
}

export async function deleteTestData(supabase: SupabaseClient){
    // Nullify
    await supabase
        .from('personnel')
        .update({ team_id: null, role_id: null })
        .eq('suffix', 'TEST');

    await supabase
        .from('teams')
        .update({ commanding_officer: null })
        .in('designation', TEST_TEAM_DESIGNATIONS);
    
    await deleteTestRoles(supabase, await fetchTestRoles(supabase));

    const TEAMLIST = await fetchTestTeams(supabase)
    const TEAMIDS = TEAMLIST.map(team => team.id);
    const TEAMLINKLIST = await fetchTeamPersonnelLinks(supabase, TEAMIDS);
    
    await deleteTeamPersonnelLinks(supabase, TEAMLINKLIST);
    await deleteTestPersonnel(supabase, await fetchTestPersonnel(supabase));
    await deleteTestTeams(supabase, TEAMLIST);

    const MISSIONLIST = await fetchTestMissions(supabase);
    const MISSIONIDS = MISSIONLIST.map(mission => mission.id);
    const MISSIONLINKLIST = await fetchMissionTeamLinks(supabase, MISSIONIDS);

    await deleteMissionsTeamsLinks(supabase, MISSIONLINKLIST);
    await deleteTestObjectives(supabase, await fetchTestObjectives(supabase));
    await deleteTestMissions(supabase, MISSIONLIST)
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
        .insert(e2eTestTeams)
        .select();

    if(error) throw new Error(`Failed to insert test teams: ${error.message}`);
    if(!data || data.length === 0) throw new Error('No team data returned after insert');

    return data;
}

export async function updateTeam(supabase: SupabaseClient, team: Team) {
    const { data, error } = await supabase
        .from('teams')
        .update({ commanding_officer: team.commanding_officer })
        .eq('designation', team.designation)
        .select()
        .single();
    
    if(error) throw new Error(`Failed to update team: ${error.message}`);

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

export async function seedTeamPersonnelLinks(supabase: SupabaseClient, teamPersonnelLink: TeamPersonnelLink[]) {
    // clean up previous runs
    const TEAMLIST = await fetchTestTeams(supabase);
    const ids = TEAMLIST.map(team => team.id);
    const LINKLIST: TeamPersonnelLink[] = await fetchTeamPersonnelLinks(supabase, ids);
    await deleteTeamPersonnelLinks(supabase, LINKLIST);

    // Insert test data
    const { error } = await supabase
        .from('team_personnel')
        .insert(teamPersonnelLink);
    
    if(error) throw new Error(`Faild to insert test team-personnel links: ${error.message}`);
}

export async function fetchTeamPersonnelLinks(supabase: SupabaseClient, teamIDs: string[]) {
    const { data, error } = await supabase
        .from('team_personnel')
        .select()
        .in('team_id', teamIDs);
    
    if(error) throw new Error(`Failed to fetch teamPersonnelLinks: ${error.message}`);

    return data;    
}

export async function deleteTeamPersonnelLinks(supabase: SupabaseClient, teamPersonnelLinks: TeamPersonnelLink[]) {
    await Promise.all(teamPersonnelLinks.map(link =>
        supabase
            .from('team_personnel')
            .delete()
            .eq('team_id', link.team_id)
    ));
}

export async function seedTestMissions(supabase: SupabaseClient) {
    // clean up previous runs
    const MISSIONLIST = await fetchTestMissions(supabase);
    const ids = MISSIONLIST.map(mission => mission.id);
    const LINKLIST: MissionTeamLink[] = await fetchMissionTeamLinks(supabase, ids);
    await deleteMissionsTeamsLinks(supabase, LINKLIST);
    const OBJECTIVES = await fetchTestObjectives(supabase);
    await deleteTestObjectives(supabase, OBJECTIVES);
    await deleteTestMissions(supabase, MISSIONLIST);

    // Insert test data
    const { data, error } = await supabase
        .from('missions')
        .insert(e2eMockMissions)
        .select()
        .order('name');

    if(error) throw new Error(`Failed to insert test missions: ${error.message}`);
    if(!data || data.length === 0) throw new Error('No missions data returned after insert');

    return data;
}

export async function seedTestObjectives(supabase: SupabaseClient, objectives: MissionObjective []) {
    // Insert test data
    const { data, error } = await supabase
        .from('mission_objectives')
        .insert(objectives)
        .select();

    if(error) throw new Error(`Failed to insert test objectives: ${error.message}`);
    if(!data || data.length === 0) throw new Error('No objectives data returned after insert');

    return data;
}

export async function seedMissionTeamLinks(supabase: SupabaseClient, missionTeamLink: MissionTeamLink[]) {
    // clean up previous runs
    const MISSIONLIST = await fetchTestMissions(supabase);
    const ids = MISSIONLIST.map(mission => mission.id);
    const LINKLIST: MissionTeamLink[] = await fetchMissionTeamLinks(supabase, ids);
    await deleteMissionsTeamsLinks(supabase, LINKLIST);

    // Insert test data
    const { error } = await supabase
        .from('missions_teams')
        .insert(missionTeamLink);
    
    if(error) throw new Error(`Faild to insert test mission-team links: ${error.message}`);
}

export async function fetchTestMissions(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('missions')
        .select()
        .in('name', TEST_MISSIONS)
        .order('name', { ascending: true });

    if(error) throw new Error(`Failed to fetch missions: ${error.message}`);

    return data;
}

export async function fetchTestObjectives(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('mission_objectives')
        .select()
        .in('objective', TEST_OBJECTIVES)
        .order('objective', { ascending: true });

    if(error) throw new Error(`Failed to fetch objectives: ${error.message}`);

    return data;
}

export async function fetchMissionTeamLinks(supabase: SupabaseClient, missionIDs: string[]) {
    const { data, error } = await supabase
        .from('missions_teams')
        .select()
        .in('mission_id', missionIDs);

    if(error) throw new Error(`Failed to fetch missionTeamLinks: ${error.message}`);

    return data;
}

export async function deleteMissionsTeamsLinks(supabase: SupabaseClient, missionTeamLinks: MissionTeamLink[]) {
    await Promise.all(missionTeamLinks.map(link =>
        supabase
            .from('missions_teams')
            .delete()
            .eq('mission_id', link.mission_id)
    ));
}

export async function deleteTestObjectives(supabase: SupabaseClient, objectives: MissionObjective[]) {
    await Promise.all(objectives.map(obj =>
        supabase
            .from('mission_objectives')
            .delete()
            .eq('mission_id', obj.mission_id)
    ));
}

export async function deleteTestMissions(supabase: SupabaseClient, missions: Mission[]) {
    await Promise.all(missions.map(mission =>
        supabase
            .from('missions')
            .delete()
            .eq('name', mission.name)
    ));
}