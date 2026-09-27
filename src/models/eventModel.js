import { readData, writeData } from '../utils/fileHelper.js';

const EVENTS_FILE = '../data/events.json';

class EventModel {
    constructor({
        id,
        title,
        description,
        date,
        time,
        organizerId,
        creator,
        capacity = 100,
        participants = [],
        createdAt
    }) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.date = date;
        this.time = time;
        this.organizerId = organizerId !== undefined ? organizerId : creator;
        this.capacity = Number(capacity) || 100;
        this.participants = participants;
        this.createdAt = createdAt || new Date().toISOString();
    }

    // Read all events
    static async findAll() {
        return await readData(EVENTS_FILE);
    }

    // Find event by ID
    static async findById(id) {
        const events = await readData(EVENTS_FILE);
        return events.find(e => e.id === Number(id));
    }

    // Find all events created by a specific organizer
    static async findByOrganizerId(organizerId) {
        const events = await readData(EVENTS_FILE);
        return events.filter(e => e.organizerId === Number(organizerId));
    }

    // Create and persist a new event
    static async create(eventData) {
        const events = await readData(EVENTS_FILE);

        const newEvent = new EventModel({
            id: events.length > 0 ? events[events.length - 1].id + 1 : 1,
            ...eventData
        });

        events.push(newEvent);
        await writeData(EVENTS_FILE, events);
        return newEvent;
    }

    // Update an existing event by ID
    static async update(id, updateData) {
        const events = await readData(EVENTS_FILE);
        const index = events.findIndex(e => e.id === Number(id));

        if (index === -1) {
            return null;
        }

        // Merge updates while preserving id, organizerId, and createdAt
        events[index] = {
            ...events[index],
            ...updateData,
            id: events[index].id,
            organizerId: events[index].organizerId,
            createdAt: events[index].createdAt
        };

        await writeData(EVENTS_FILE, events);
        return events[index];
    }

    // Delete an event by ID
    static async delete(id) {
        const events = await readData(EVENTS_FILE);
        const initialLength = events.length;
        const filteredEvents = events.filter(e => e.id !== Number(id));

        if (filteredEvents.length === initialLength) {
            return false;
        }

        await writeData(EVENTS_FILE, filteredEvents);
        return true;
    }

    // Add a participant to an event
    static async addParticipant(eventId, { userId, name, email }) {
        const events = await readData(EVENTS_FILE);
        const event = events.find(e => e.id === Number(eventId));

        if (!event) {
            return null;
        }

        if (!Array.isArray(event.participants)) {
            event.participants = [];
        }

        const newParticipant = {
            userId: Number(userId),
            name,
            email,
            registeredAt: new Date().toISOString()
        };

        event.participants.push(newParticipant);
        await writeData(EVENTS_FILE, events);
        return event;
    }

    // Remove a participant from an event
    static async removeParticipant(eventId, userId) {
        const events = await readData(EVENTS_FILE);
        const event = events.find(e => e.id === Number(eventId));

        if (!event || !Array.isArray(event.participants)) {
            return null;
        }

        event.participants = event.participants.filter(p => p.userId !== Number(userId));
        await writeData(EVENTS_FILE, events);
        return event;
    }

    // Find all events that a user has registered for
    static async findRegisteredByUserId(userId) {
        const events = await readData(EVENTS_FILE);
        return events.filter(
            event =>
                Array.isArray(event.participants) &&
                event.participants.some(p => p.userId === Number(userId))
        );
    }
}

export default EventModel;