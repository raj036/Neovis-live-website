import { addDays, endOfDay, setHours, setMinutes, startOfDay, subDays } from 'date-fns';
import { createResourceId } from '../utils/create-resource-id';
import { deepCopy } from '../utils/deep-copy';

const now = new Date();

let events = [
  {
    id: '5e8882e440f6322fa399eeb8',
    allDay: false,
    color: '#FFFFFF',
    title: '10105',
    tasks: [
      {
        task_title: 'Change Over Inspection',
        task_description: 'F.M.',
        task_duration: '145m'
      },
      {
        task_title: 'Check Out',
        task_description: 'Z.C.',
        task_duration: '15m'
      },
    ],
    exec_moment: 'Changeover',
    status: 'To be cleaned',
    description: '1 bedroom partial clean',
    end: setHours(setMinutes(subDays(now, 6), 0), 7).getTime(),
    start: setHours(setMinutes(subDays(now, 6), 30), 8).getTime(),
  },
  // {
  //   id: '5e8882e440f6322fa3hwcvacv',
  //   allDay: false,
  //   color: '#FFFFFF',
  //   title: '10105',
  //   tasks: [
  //     {
  //       task_title: 'Change Over Inspection',
  //       task_description: 'F.M.',
  //       task_duration: '145m'
  //     },
  //     {
  //       task_title: 'Check Out',
  //       task_description: 'Z.C.',
  //       task_duration: '15m'
  //     },
  //   ],
  //   exec_moment: 'Changeover',
  //   status: 'To be cleaned',
  //   description: '1 bedroom partial clean',
  //   end: setHours(setMinutes(subDays(now, 6), 0), 19).getTime(),
  //   start: setHours(setMinutes(subDays(now, 6), 30), 17).getTime(),
  // },
  // {
  //   id: '5e8882e440f6322fbta4254',
  //   allDay: false,
  //   color: '#FFFFFF',
  //   title: '10205',
  //   exec_moment: 'Departure',
  //   status: 'To be cleaned',
  //   description: '2 bedroom partial clean',
  //   end: setHours(setMinutes(subDays(now, 5), 0), 19).getTime(),
  //   start: setHours(setMinutes(subDays(now, 5), 30), 17).getTime(),
  // },
  // {
  //   id: '5e8882e440f6322fa3ahcvcgv',
  //   allDay: false,
  //   color: '#FFFFFF',
  //   title: '10105',
  //   tasks: [
  //     {
  //       task_title: 'Change Over Inspection',
  //       task_description: 'F.M.',
  //       task_duration: '145m'
  //     },
  //     {
  //       task_title: 'Check Out',
  //       task_description: 'Z.C.',
  //       task_duration: '15m'
  //     },
  //   ],
  //   exec_moment: 'Changeover',
  //   status: 'To be cleaned',
  //   description: '1 bedroom partial clean',
  //   end: setHours(setMinutes(subDays(now, 6), 0), 19).getTime(),
  //   start: setHours(setMinutes(subDays(now, 6), 30), 17).getTime(),
  // },
  // {
  //   id: '5e8882e440f6322fa5w6d6fh',
  //   allDay: false,
  //   color: '#FFFFFF',
  //   title: '10105',
  //   tasks: [
  //     {
  //       task_title: 'Change Over Inspection',
  //       task_description: 'F.M.',
  //       task_duration: '145m'
  //     },
  //     {
  //       task_title: 'Check Out',
  //       task_description: 'Z.C.',
  //       task_duration: '15m'
  //     },
  //   ],
  //   exec_moment: 'Changeover',
  //   status: 'To be cleaned',
  //   description: '1 bedroom partial clean',
  //   end: setHours(setMinutes(subDays(now, 6), 0), 19).getTime(),
  //   start: setHours(setMinutes(subDays(now, 6), 30), 17).getTime(),
  // },
  {
    id: '5e8882e440f6322fbta4254',
    allDay: false,
    color: '#FFFFFF',
    title: '10205',
    exec_moment: 'Departure',
    status: 'To be cleaned',
    description: '2 bedroom partial clean',
    end: setHours(setMinutes(subDays(now, 5), 0), 19).getTime(),
    start: setHours(setMinutes(subDays(now, 5), 30), 17).getTime(),
  },
  {
    id: '5e8882e440f6322fakj41sj',
    allDay: false,
    color: '#FFFFFF',
    title: '6064',
    exec_moment: 'Arrival',
    status: 'Cleaned',
    description: 'KSM non rental',
    end: setHours(setMinutes(subDays(now, 7), 0), 19).getTime(),
    start: setHours(setMinutes(subDays(now, 7), 30), 17).getTime(),
  },
];

class CalendarApi {
  getEvents() {
    return Promise.resolve(deepCopy(events));
  }

  createEvent(data) {
    return new Promise((resolve, reject) => {
      try {
        const { allDay, description, end, start, title } = data;

        // Make a deep copy
        const clonedEvents = deepCopy(events);

        // Create the new event
        const event = {
          id: createResourceId(),
          allDay,
          description,
          end,
          start,
          title
        };

        // Add the new event to events
        clonedEvents.push(event);

        // Save changes
        events = clonedEvents;

        resolve(deepCopy(event));
      } catch (err) {
        console.error('[Calendar Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  updateEvent({ eventId, update }) {
    return new Promise((resolve, reject) => {
      try {
        // Make a deep copy
        const clonedEvents = deepCopy(events);

        // Find the event that will be updated
        const event = events.find((_event) => _event.id === eventId);

        if (!event) {
          reject(new Error('Event not found'));
          return;
        }

        // Update the event
        Object.assign(event, update);

        // Save changes
        events = clonedEvents;

        resolve(deepCopy(event));
      } catch (err) {
        console.error('[Calendar Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  deleteEvent(eventId) {
    return new Promise((resolve, reject) => {
      try {
        // Make a deep copy
        const clonedEvents = deepCopy(events);

        // Find the event that will be removed
        const event = events.find((_event) => _event.id === eventId);

        if (!event) {
          reject(new Error('Event not found'));
          return;
        }

        events = events.filter((_event) => _event.id !== eventId);

        // Save changes
        events = clonedEvents;

        resolve(true);
      } catch (err) {
        console.error('[Calendar Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }
}

export const calendarApi = new CalendarApi();
