import { test, expect } from '@playwright/test';

test.describe('Participant Management API Tests', () => {
  let organizerToken = '';
  let attendeeToken = '';
  let eventId;

  test.beforeAll(async ({ request }) => {
    // 1. Login Organizer
    const orgRes = await request.post('/login', {
      data: {
        email: 'alice@example.com',
        password: 'secret123'
      }
    });
    const orgData = await orgRes.json();
    organizerToken = orgData.token;

    // 2. Create a fresh event for participant testing
    const eventRes = await request.post('/events', {
      headers: {
        Authorization: `Bearer ${organizerToken}`
      },
      data: {
        title: 'Participant Workshop 2026',
        description: 'Interactive session for testing attendee bookings.',
        date: '2026-12-05',
        time: '03:00 PM',
        capacity: 30
      }
    });
    const eventData = await eventRes.json();
    eventId = eventData.data.id;

    // 3. Login Attendee
    const attRes = await request.post('/login', {
      data: {
        email: 'akhlaquea01@gmail.com',
        password: 'secret123'
      }
    });
    const attData = await attRes.json();
    attendeeToken = attData.token;
  });

  // Cleanup: Delete test event after tests complete
  test.afterAll(async ({ request }) => {
    if (eventId && organizerToken) {
      await request.delete(`/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${organizerToken}`
        }
      });
    }
  });

  test('1. Attendee can register for an event (POST /events/:id/register)', async ({ request }) => {
    const response = await request.post(`/events/${eventId}/register`, {
      headers: {
        Authorization: `Bearer ${attendeeToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.participant.email).toBe('akhlaquea01@gmail.com');
  });

  test('2. Reject duplicate registration for the same event (400 Bad Request)', async ({ request }) => {
    const response = await request.post(`/events/${eventId}/register`, {
      headers: {
        Authorization: `Bearer ${attendeeToken}`
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('already registered');
  });

  test('3. Attendee can view their registered events (GET /events/my-registrations)', async ({ request }) => {
    const response = await request.get('/events/my-registrations', {
      headers: {
        Authorization: `Bearer ${attendeeToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.some((e) => e.id === eventId)).toBe(true);
  });

  test('4. Attendee can cancel their registration (DELETE /events/:id/register)', async ({ request }) => {
    const response = await request.delete(`/events/${eventId}/register`, {
      headers: {
        Authorization: `Bearer ${attendeeToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('5. Unauthenticated user cannot register for an event (401 Unauthorized)', async ({ request }) => {
    const response = await request.post(`/events/${eventId}/register`);

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
  });
});
