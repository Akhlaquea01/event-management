import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

test.describe('Authentication API Tests', () => {
  const timestamp = Date.now();
  const organizerEmail = `org_auth_${timestamp}@test.com`;
  const attendeeEmail = `att_auth_${timestamp}@test.com`;
  const password = 'password123';

  // Cleanup created test users after all tests finish
  test.afterAll(async () => {
    try {
      const usersFile = path.resolve('src/data/users.json');
      const data = await fs.readFile(usersFile, 'utf-8');
      const users = JSON.parse(data);
      const cleaned = users.filter(
        (u) => u.email !== organizerEmail && u.email !== attendeeEmail
      );
      await fs.writeFile(usersFile, JSON.stringify(cleaned, null, 2), 'utf-8');
    } catch {
      // Ignore cleanup error
    }
  });

  test('1. Register Organizer successfully', async ({ request }) => {
    const response = await request.post('/register', {
      data: {
        name: 'Test Organizer',
        email: organizerEmail,
        password,
        role: 'organizer'
      }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.email).toBe(organizerEmail);
    expect(body.data.role).toBe('organizer');
    expect(body.data.password).toBeUndefined(); // Password must not be returned
  });

  test('2. Register Attendee successfully', async ({ request }) => {
    const response = await request.post('/register', {
      data: {
        name: 'Test Attendee',
        email: attendeeEmail,
        password,
        role: 'attendee'
      }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.email).toBe(attendeeEmail);
    expect(body.data.role).toBe('attendee');
  });

  test('3. Prevent duplicate email registration', async ({ request }) => {
    const response = await request.post('/register', {
      data: {
        name: 'Duplicate User',
        email: attendeeEmail,
        password
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('already exists');
  });

  test('4. Login Organizer with valid credentials', async ({ request }) => {
    const response = await request.post('/login', {
      data: {
        email: organizerEmail,
        password
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.token).toBeTruthy();
    expect(body.user.role).toBe('organizer');
  });

  test('5. Login Attendee with valid credentials', async ({ request }) => {
    const response = await request.post('/login', {
      data: {
        email: attendeeEmail,
        password
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.token).toBeTruthy();
    expect(body.user.role).toBe('attendee');
  });

  test('6. Reject login with incorrect password', async ({ request }) => {
    const response = await request.post('/login', {
      data: {
        email: attendeeEmail,
        password: 'incorrect_password'
      }
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  test('7. Reject login for non-existent email', async ({ request }) => {
    const response = await request.post('/login', {
      data: {
        email: 'nobody@nowhere.com',
        password: 'any_password'
      }
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
  });
});
