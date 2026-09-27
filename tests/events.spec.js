import { test, expect } from '@playwright/test';

test.describe('Event Management API Tests', () => {
  let organizerToken = '';
  let attendeeToken = '';
  let eventId;

  // Obtain tokens for Organizer and Attendee using seed accounts
  test.beforeAll(async ({ request }) => {
    // Login Organizer
    const orgRes = await request.post('/login', {
      data: {
        email: 'alice@example.com',
        password: 'secret123'
      }
    });
    const orgData = await orgRes.json();
    organizerToken = orgData.token;

    // Login Attendee
    const attRes = await request.post('/login', {
      data: {
        email: 'akhlaquea01@gmail.com',
        password: 'secret123'
      }
    });
    const attData = await attRes.json();
    attendeeToken = attData.token;
  });

  test('1. Organizer can create a new event (201 Created)', async ({ request }) => {
    const response = await request.post('/events', {
      headers: {
        Authorization: `Bearer ${organizerToken}`
      },
      data: {
        title: 'Microservices & Distributed Systems 2026',
        description: 'Deep dive into event-driven architecture and containers.',
        date: '2026-11-20',
        time: '11:00 AM',
        capacity: 80
      }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBeTruthy();
    expect(body.data.title).toBe('Microservices & Distributed Systems 2026');

    eventId = body.data.id;
  });

  test('2. Attendee cannot create an event (403 Forbidden)', async ({ request }) => {
    const response = await request.post('/events', {
      headers: {
        Authorization: `Bearer ${attendeeToken}`
      },
      data: {
        title: 'Attendee Unauthorized Event',
        description: 'Should be rejected',
        date: '2026-11-20',
        time: '11:00 AM'
      }
    });

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  test('3. Unauthenticated request to create event fails (401 Unauthorized)', async ({ request }) => {
    const response = await request.post('/events', {
      data: {
        title: 'No Token Event',
        description: 'Should fail',
        date: '2026-11-20',
        time: '11:00 AM'
      }
    });

    expect(response.status()).toBe(401);
  });

  test('4. Anyone can list all events (Public GET /events)', async ({ request }) => {
    const response = await request.get('/events');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('5. Anyone can get event details by ID (Public GET /events/:id)', async ({ request }) => {
    const response = await request.get(`/events/${eventId}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(eventId);
    expect(body.data.title).toBe('Microservices & Distributed Systems 2026');
  });

  test('6. Organizer can update their event (PUT /events/:id)', async ({ request }) => {
    const response = await request.put(`/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${organizerToken}`
      },
      data: {
        title: 'Microservices & Distributed Systems 2026 (Updated)',
        capacity: 120
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.title).toBe('Microservices & Distributed Systems 2026 (Updated)');
    expect(body.data.capacity).toBe(120);
  });

  test('7. Attendee cannot update an event (403 Forbidden)', async ({ request }) => {
    const response = await request.put(`/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${attendeeToken}`
      },
      data: {
        title: 'Malicious Update'
      }
    });

    expect(response.status()).toBe(403);
  });

  test('8. Attendee cannot delete an event (403 Forbidden)', async ({ request }) => {
    const response = await request.delete(`/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${attendeeToken}`
      }
    });

    expect(response.status()).toBe(403);
  });

  test('9. Organizer can delete their event (DELETE /events/:id)', async ({ request }) => {
    const response = await request.delete(`/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${organizerToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('10. Fetching deleted event returns 404 Not Found', async ({ request }) => {
    const response = await request.get(`/events/${eventId}`);
    expect(response.status()).toBe(404);
  });
});
