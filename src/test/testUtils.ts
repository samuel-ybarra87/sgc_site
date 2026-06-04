import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

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

export function setupDeleteCapture(endpoint: string){
  let capturedID: string | null = null;
  server.use(
    http.delete(endpoint, async ({ request }) => {
      const url = new URL(request.url);
      const idParam = url.searchParams.get('id') || url.searchParams.get('mission_id');
      capturedID = idParam?.split('.')[1] || null;

      return HttpResponse.json({}, { status: 200 });
    })
  );
  return () => capturedID;
}