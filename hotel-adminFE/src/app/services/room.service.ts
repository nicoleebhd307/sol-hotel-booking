import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';

export type RoomStatus = 'available' | 'occupied' | 'maintenance';

export interface RoomCapacity {
  adults: number;
  children: number;
}

export interface RoomType {
  _id: string;
  name: string;
  area: number;
  price_per_night: number;
  bed_options: string[];
  capacity: RoomCapacity;
  description: string;
  amenities: string[];
  rate_includes: string[];
  service_charge: number;
  vat: boolean;
}

export interface Room {
  _id: string;
  room_number: string;
  room_type_id: string;
  floor: number;
  status: RoomStatus;
  beach_view: boolean;
  is_active: boolean;
}

export interface RoomView {
  _id: string;
  room_number: string;
  floor: number;
  status: RoomStatus;
  is_active: boolean;
  room_type: {
    id: string;
    name: string;
  };
  price_per_night: number;
  capacity: RoomCapacity;
}

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/api/rooms`;

  constructor(private http: HttpClient) {}

  getRoomTypes(): Observable<RoomType[]> {
    return this.http.get<unknown>(`${this.apiUrl}/types`, { transferCache: false }).pipe(
      map((response) => {
        const rows = this.extractDataArray(response);
        return rows.map((item) => this.normalizeRoomType(item));
      })
    );
  }

  getRooms(): Observable<RoomView[]> {
    return forkJoin({
      rooms: this.getRawRooms(),
      roomTypes: this.getRoomTypes(),
    }).pipe(
      map(({ rooms, roomTypes }) => {
        const roomTypeMap = new Map(roomTypes.map((item) => [item._id, item]));

        return rooms
          .map((room) => {
            const roomType = roomTypeMap.get(room.room_type_id);

            return {
              _id: room._id,
              room_number: room.room_number,
              floor: room.floor,
              status: room.status,
              is_active: room.is_active,
              room_type: {
                id: room.room_type_id,
                name: roomType?.name || 'Unknown room type',
              },
              price_per_night: roomType?.price_per_night || 0,
              capacity: roomType?.capacity || { adults: 0, children: 0 },
            };
          })
          .sort((a, b) => Number(a.room_number) - Number(b.room_number));
      })
    );
  }

  private getRawRooms(): Observable<Room[]> {
    return this.http.get<unknown>(this.apiUrl, { transferCache: false }).pipe(
      map((response) => {
        const rows = this.extractDataArray(response);
        return rows.map((item) => this.normalizeRoom(item));
      })
    );
  }

  private extractDataArray(payload: unknown): Record<string, unknown>[] {
    if (Array.isArray(payload)) {
      return payload.filter((item): item is Record<string, unknown> => this.isRecord(item));
    }

    if (this.isRecord(payload) && Array.isArray(payload['data'])) {
      return payload['data'].filter((item): item is Record<string, unknown> => this.isRecord(item));
    }

    return [];
  }

  private normalizeRoom(item: Record<string, unknown>): Room {
    const status = this.toText(item['status'], 'available').toLowerCase();
    const mappedStatus: RoomStatus =
      status === 'occupied' || status === 'maintenance' ? status : 'available';

    return {
      _id: this.toText(item['_id'], ''),
      room_number: this.toText(item['room_number'], '-'),
      room_type_id: this.toText(item['room_type_id'], ''),
      floor: this.toNumber(item['floor'], 0),
      status: mappedStatus,
      beach_view: Boolean(item['beach_view']),
      is_active: item['is_active'] !== false,
    };
  }

  private normalizeRoomType(item: Record<string, unknown>): RoomType {
    return {
      _id: this.toText(item['_id'], ''),
      name: this.toText(item['name'], 'Unknown room type'),
      area: this.toNumber(item['area'], 0),
      price_per_night: this.toNumber(item['price_per_night'], 0),
      bed_options: this.toStringArray(item['bed_options']),
      capacity: this.toCapacity(item['capacity']),
      description: this.toText(item['description'], ''),
      amenities: this.toStringArray(item['amenities']),
      rate_includes: this.toStringArray(item['rate_includes']),
      service_charge: this.toNumber(item['service_charge'], 0),
      vat: Boolean(item['vat']),
    };
  }

  private toCapacity(value: unknown): RoomCapacity {
    if (!this.isRecord(value)) {
      return { adults: 0, children: 0 };
    }

    return {
      adults: this.toNumber(value['adults'], 0),
      children: this.toNumber(value['children'], 0),
    };
  }

  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => this.toText(item, ''))
      .filter((item) => item.length > 0);
  }

  private toText(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }

  private toNumber(value: unknown, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
