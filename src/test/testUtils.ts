import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { supabaseUrl } from '../mocks/handlers';

export const PERSONNEL = `${supabaseUrl}/rest/v1/personnel`;
export const TEAM = `${supabaseUrl}/rest/v1/teams`
export const MISSION = `${supabaseUrl}/rest/v1/missions`
export const OBJECTIVE = `${supabaseUrl}/rest/v1/mission_objectives`
export const MISSIONS_TEAMS = `${supabaseUrl}/rest/v1/missions_teams`

export function setupPostCapture(endpoint: string) {
  let capturedBody: unknown;
  server.use(
    http.post(endpoint, async ({ request }) => {
      capturedBody = await request.json();
      return HttpResponse.json([capturedBody], { status: 201 });
    })
  );
  return () => capturedBody;
}

export function setupPatchCapture(endpoint: string) {
  let capturedBody: unknown;
  server.use(
    http.patch(endpoint, async ({ request }) => {
      capturedBody = await request.json();
      return HttpResponse.json([capturedBody], { status: 200 });
    })
  );
  return () => capturedBody;
}