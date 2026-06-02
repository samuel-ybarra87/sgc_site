import { http, HttpResponse } from 'msw';
import {
  mockPersonnel,
  mockRoles,
  mockTeamData,
  mockTeams,
  mockMissionObjectives,
  mockMissions,
  mockTeamPersonnelLink,
  mockMissionTeamLink
} from '../lib/mockData';
import type { Team } from '../lib/types';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

function createCrudHandlers(
  resource: string,
  mockData: Record<string, unknown>[],
  mockDetailData?: Record<string, unknown>[]
){
  return [
    http.get(`${supabaseUrl}/rest/v1/${resource}`, ({ request }) =>{
      const url = new URL(request.url);
      const select = url.searchParams.get('select');
      const idParam = url.searchParams.get('id'); // 'id' => `eq.${id}`
      const idValue = idParam?.split('.')[1]; // eg. extract 'uuid-1 from 'eq.uuid-1'
      const missionIdParam =  url.searchParams.get('mission_id'); // mission ids for various join tables
      const teamIdParam = url.searchParams.get('team_id'); // team_ids for Mission Details

      // Join Table request
      if(idParam && idParam.startsWith('in.')){
        const idList = idParam.replace('in.(', '').replace(')', '').split(',');

        // Team list
        if(resource === 'teams'){
          const matches = mockData.filter(data => idList.includes(data.id as string));
          const sortedMatches: Team[] = (matches as Team[]).sort((a, b) => a.designation.localeCompare(b.designation));
          return HttpResponse.json(sortedMatches);
        }

        // Personnel List
        const matches = mockData.filter(data => idList.includes(data.id as string));
        return HttpResponse.json(matches);
      }

      // Team Detail request
      if(idParam && select && select.includes('commanding_officer_details')){
        const detail = mockDetailData?.find(data => data.id === idValue);
        return HttpResponse.json(detail || {});
      }

      // Team-Personnel request
      if(teamIdParam){
        const teamIds = teamIdParam.replace('in.(', '').replace(')', '').split(',');
        const matches = mockData.filter(data => teamIds.includes(data.team_id as string));
        return HttpResponse.json(matches);
      }

      // Mission Detail request
      if(idParam && select && select.includes('objectives')){
        const detail = mockData.find(data => data.id === idValue);
        return HttpResponse.json(detail || {});
      }

      // Mission Edit request
      if(missionIdParam){
        const mID = missionIdParam.split('.')[1];
        const matches = mockData.filter(data => data.mission_id === mID);
        return HttpResponse.json(matches);
      }

      // Other requests
      if (idParam) {
        const item = mockData.find(data => data.id === idValue);
        return HttpResponse.json(item);
      }

      return HttpResponse.json(mockData);
    }),
    http.delete(`${supabaseUrl}/rest/v1/${resource}`, () =>{
      return HttpResponse.json({});
    }),
  ];
}

export const handlers = [
  ...createCrudHandlers('roles', mockRoles),
  ...createCrudHandlers('personnel', mockPersonnel),
  ...createCrudHandlers('teams', mockTeams, mockTeamData),
  ...createCrudHandlers('team_personnel', mockTeamPersonnelLink),
  ...createCrudHandlers('missions', mockMissions),
  ...createCrudHandlers('missions_teams', mockMissionTeamLink),
  ...createCrudHandlers('mission_objectives', mockMissionObjectives),
];