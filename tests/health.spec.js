import { test, expect } from '@playwright/test';

test.describe('Health Check API', () => {
  test('GET /health returns 200 OK and status', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeTruthy();
  });
});
