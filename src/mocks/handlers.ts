import { http, HttpResponse } from 'msw';
import { mockPersonnel, mockRoles, mockTeams } from '../lib/mockData';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

function createCrudHandlers(resource: string, mockData: Record<string, unknown>[]){
  return [
    http.get(`${supabaseUrl}/rest/v1/${resource}`, ({ request }) =>{
      const url = new URL(request.url);
      const id = url.searchParams.get('id'); // 'id' => `eq.${id}`
      const index = id ? Number(id.slice(3)) - 1 : 0;
      if (id) return HttpResponse.json(mockData[index]);
      return HttpResponse.json(mockData);
    }),
    http.delete(`${supabaseUrl}/rest/v1/${resource}`, () =>{
      return HttpResponse.json({});
    }),
  ];
}

export const handlers = [
  ...createCrudHandlers('personnel', mockPersonnel),
  ...createCrudHandlers('teams', mockTeams),
  ...createCrudHandlers('roles', mockRoles),
  // ...createCrudHandlers('missions', mockMissions)
];