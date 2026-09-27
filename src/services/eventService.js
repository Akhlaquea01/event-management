import EventModel from '../models/eventModel.js';
import UserModel from '../models/userModel.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendEmail } from '../utils/email.js';

export class EventService {
    // Get all events
    static async getAllEvents() {
        return await EventModel.findAll();
    }

    // Get single event by ID
    static async getEventById(id) {
        const event = await EventModel.findById(id);
        if (!event) {
            throw new AppError('Event not found', 404);
        }
        return event;
    }

    // Create a new event (Organizers only)
    static async createEvent(eventData, organizerId) {
        const { title, description, date, time, capacity } = eventData;

        const newEvent = await EventModel.create({
            title,
            description,
            date,
            time,
            organizerId: Number(organizerId),
            capacity: capacity ? Number(capacity) : 100,
            participants: []
        });

        return newEvent;
    }

    // Update an event (Only the organizer who created it or admin)
    static async updateEvent(id, updateData, user) {
        const existingEvent = await EventModel.findById(id);
        if (!existingEvent) {
            throw new AppError('Event not found', 404);
        }

        // Authorization check: organizer ownership
        if (existingEvent.organizerId !== Number(user.id) && user.role !== 'admin') {
            throw new AppError('You are not authorized to update this event', 403);
        }

        const updatedEvent = await EventModel.update(id, updateData);
        return updatedEvent;
    }

    static async deleteEvent(id, user) {
        const existingEvent = await EventModel.findById(id);
        if (!existingEvent) {
            throw new AppError('Event not found', 404);
        }

        if (existingEvent.organizerId !== Number(user.id) && user.role !== 'admin') {
            throw new AppError('You are not authorized to delete this event', 403);
        }

        await EventModel.delete(id);
        return { message: 'Event deleted successfully' };
    }

    // Register attendee for an event
    static async registerForEvent(eventId, user) {
        const event = await EventModel.findById(eventId);
        if (!event) {
            throw new AppError('Event not found', 404);
        }

        const participants = Array.isArray(event.participants) ? event.participants : [];

        // Check if user is already registered
        const isAlreadyRegistered = participants.some(
            p => p.userId === Number(user.id) || p.email === user.email
        );
        if (isAlreadyRegistered) {
            throw new AppError('You are already registered for this event', 400);
        }

        // Check capacity limit
        if (participants.length >= (event.capacity || 100)) {
            throw new AppError('Event has reached maximum capacity', 400);
        }

        let attendeeName = user.name;
        if (!attendeeName) {
            const userProfile = await UserModel.findById(user.id);
            attendeeName = userProfile?.name || user.email.split('@')[0];
        }

        const updatedEvent = await EventModel.addParticipant(eventId, {
            userId: user.id,
            name: attendeeName,
            email: user.email
        });

        // Send email confirmation asynchronously (non-blocking)
        sendEmail({
            to: [{ email: user.email, name: attendeeName }],
            subject: `Registration Confirmed: ${event.title}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #4f46e5;">Registration Confirmed! 🎉</h2>
                    <p>Hi <strong>${attendeeName}</strong>,</p>
                    <p>You have successfully registered for <strong>${event.title}</strong>.</p>
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4f46e5;">
                        <p style="margin: 4px 0;"><strong>Date:</strong> ${event.date}</p>
                        <p style="margin: 4px 0;"><strong>Time:</strong> ${event.time}</p>
                        <p style="margin: 4px 0;"><strong>Description:</strong> ${event.description}</p>
                    </div>
                    <p style="color: #64748b; font-size: 14px;">See you at the event!</p>
                </div>
            `,
            text: `Hi ${attendeeName},\n\nYou have successfully registered for ${event.title}.\nDate: ${event.date}\nTime: ${event.time}\nDescription: ${event.description}\n\nSee you there!`
        }).catch(err => {
            console.error('[EventService] Failed to send registration email notification:', err?.message || err);
        });

        return {
            event: updatedEvent,
            participant: {
                userId: user.id,
                name: attendeeName,
                email: user.email
            }
        };
    }

    // Cancel registration for an attendee
    static async cancelRegistration(eventId, userId) {
        const event = await EventModel.findById(eventId);
        if (!event) {
            throw new AppError('Event not found', 404);
        }

        const isRegistered = event.participants?.some(p => p.userId === Number(userId));
        if (!isRegistered) {
            throw new AppError('You are not registered for this event', 400);
        }

        const updatedEvent = await EventModel.removeParticipant(eventId, userId);
        return updatedEvent;
    }

    // Get all events a specific user is registered for
    static async getUserRegistrations(userId) {
        return await EventModel.findRegisteredByUserId(userId);
    }
}

export default EventService;
