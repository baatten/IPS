import type { KmlMarker, Camera } from 'react-native-maps';

export type Lead = {
    id?: number
    firstname: string
    lastname: string
    address: string
    city: string
    state: string
    zipcode: string
    county: string
    phone: string
    age: number
    dobmon: any,
    latitude: number,
    longitude: number,
    marker?: KmlMarker,
    leadinteraction?: LeadInteraction[]
    distance: number,
    dobdate: Date
}

export type LeadInteraction = {
    date?: any
    id: number
    leadId: number
    userId?: number
    action?: string
    notes?: string
    saved: boolean
}

export type Location = {
    accuracy?: number,
    altitude?: number,
    altitudeAccuracy?: number,
    latitude: number,
    longitude: number
    speed?: number,
    timestamp?: string,
} | null