import type { Barber, Service } from '../types';

export const DUMMY_BARBERS: Barber[] = [
  { id: 'b-ravi', name: 'Ravi', status: 'Busy', currentCustomerToken: 'S-12', currentCustomerName: 'Kunal Patel' },
  { id: 'b-amit', name: 'Amit', status: 'Available' },
  { id: 'b-imran', name: 'Imran', status: 'On Break' },
];

export const DUMMY_SERVICES: Service[] = [
  { id: 's-haircut', nameEn: 'Haircut', nameGu: 'હેરકટ', durationMinutes: 30, price: 150, isActive: true },
  { id: 's-beard', nameEn: 'Beard Trim', nameGu: 'દાઢી ટ્રીમ', durationMinutes: 15, price: 80, isActive: true },
  { id: 's-spa', nameEn: 'Hair Spa', nameGu: 'હેર સ્પા', durationMinutes: 45, price: 400, isActive: true },
  { id: 's-color', nameEn: 'Hair Coloring', nameGu: 'હેર કલરિંગ', durationMinutes: 60, price: 500, isActive: true },
  { id: 's-facial', nameEn: 'Facial', nameGu: 'ફેશિયલ', durationMinutes: 40, price: 350, isActive: true },
  { id: 's-massage', nameEn: 'Head Massage', nameGu: 'હેડ મસાજ', durationMinutes: 20, price: 120, isActive: true },
];
