import { http, HttpResponse } from 'msw';
import {
  mockPersonnel,
  mockRoles,
  mockTeamData,
  mockTeams,
  mockMissionObjectives,
  mockMissions,
  mockMissionTeams,
  mockTeamPersonnelLink
} from '../lib/mockData';

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
      const missionIdParam =  url.searchParams.get('mission_id') // mission ids for various join tables
      
      // Team Detail request
      if(idParam && select && select.includes('commanding_officer_details')){
        const detail = mockDetailData?.find(data => data.id === idValue);
        return HttpResponse.json(detail || {});
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
        const item = mockData.filter(data => data.id === idValue);
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
  ...createCrudHandlers('missions_teams', mockMissionTeams),
  ...createCrudHandlers('mission_objectives', mockMissionObjectives),
];