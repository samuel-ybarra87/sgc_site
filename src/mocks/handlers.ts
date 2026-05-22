import { http, HttpResponse } from 'msw';
import { mockPersonnel, mockRoles, mockTeamData, mockTeams, mockMissionObjectives, mockMissions } from '../lib/mockData';

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
      
      // Detail request
      if(idParam && select && select.includes('commanding_officer_details')){
        const idValue = idParam.split('.')[1]; // eg. extract 'team-sg-1 from 'eq.team-sg-1'
        const detail = mockDetailData?.find(t => t.id === idValue);
        return HttpResponse.json(detail || {});
      }
      
      // List views
      if (idParam) {
        const index = idParam.split('.')[1]; // extract id
        const list = mockData.find(i => i.id === index);
        return HttpResponse.json(list);
      }

      return HttpResponse.json(mockData);
    }),
    http.delete(`${supabaseUrl}/rest/v1/${resource}`, () =>{
      return HttpResponse.json({});
    }),
  ];
}

export const handlers = [
  ...createCrudHandlers('personnel', mockPersonnel),
  ...createCrudHandlers('teams', mockTeams, mockTeamData),
  ...createCrudHandlers('roles', mockRoles),
  ...createCrudHandlers('missions', mockMissions),
  ...createCrudHandlers('mission_objectives', mockMissionObjectives)
];