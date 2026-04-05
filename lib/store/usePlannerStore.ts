import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export interface Place {
  id: string;
  name: string;
  district: string;
  coordinates?: [number, number];
  dayOffset?: number; // Which day it is assigned to, or undefined
}

export interface BudgetItem {
  id: string;
  category: "Accommodation" | "Food" | "Transport" | "Activities" | "Other";
  description: string;
  cost: number;
}

export interface TripData {
  id: string;
  tripName: string;
  dateRange: { from?: Date; to?: Date };
  travelers: number;
  origin: string;
  destinations: string[]; // List of district IDs
  placesToExplore: Place[];
  budgetItems: BudgetItem[];
  notes: string;
  createdAt: string;
}

interface PlannerStore {
  trips: Record<string, TripData>;
  activeTripId: string | null;
  setActiveTrip: (id: string) => void;
  createTrip: (id: string, initialDistrict?: string) => void;
  deleteTrip: (id: string) => void;

  // Actions for active trip
  updateActiveTrip: (updates: Partial<TripData>) => void;
  addDestination: (districtId: string) => void;
  removeDestination: (districtId: string) => void;
  addPlace: (place: Omit<Place, "id">) => void;
  removePlace: (placeId: string) => void;
  updatePlaceDay: (placeId: string, dayOffset: number | undefined) => void;
  addBudgetItem: (item: Omit<BudgetItem, "id">) => void;
  removeBudgetItem: (id: string) => void;
}

const defaultTripData = (id: string, initialDistrict?: string): TripData => ({
  id,
  tripName: "My Awesome Trip",
  dateRange: {},
  travelers: 1,
  origin: "",
  destinations: initialDistrict ? [initialDistrict] : [],
  placesToExplore: [],
  budgetItems: [],
  notes: "",
  createdAt: new Date().toISOString(),
});

export const usePlannerStore = create<PlannerStore>()(
  persist(
    (set, get) => ({
      trips: {},
      activeTripId: null,

      setActiveTrip: (id) => set({ activeTripId: id }),

      createTrip: (id, initialDistrict) =>
        set((state) => {
          if (state.trips[id]) return state; // Don't overwrite if it exists
          return {
            trips: { ...state.trips, [id]: defaultTripData(id, initialDistrict) },
            activeTripId: id,
          };
        }),

      deleteTrip: (id) =>
        set((state) => {
          const newTrips = { ...state.trips };
          delete newTrips[id];
          return {
            trips: newTrips,
            activeTripId: state.activeTripId === id ? null : state.activeTripId,
          };
        }),

      updateActiveTrip: (updates) =>
        set((state) => {
          if (!state.activeTripId || !state.trips[state.activeTripId]) return state;
          return {
            trips: {
              ...state.trips,
              [state.activeTripId]: {
                ...state.trips[state.activeTripId],
                ...updates,
              },
            },
          };
        }),

      addDestination: (districtId) =>
        set((state) => {
          if (!state.activeTripId) return state;
          const trip = state.trips[state.activeTripId];
          if (trip.destinations.includes(districtId)) return state;
          return {
            trips: {
              ...state.trips,
              [state.activeTripId]: {
                ...trip,
                destinations: [...trip.destinations, districtId],
              },
            },
          };
        }),

      removeDestination: (districtId) =>
        set((state) => {
          if (!state.activeTripId) return state;
          const trip = state.trips[state.activeTripId];
          return {
            trips: {
              ...state.trips,
              [state.activeTripId]: {
                ...trip,
                destinations: trip.destinations.filter((d) => d !== districtId),
                // Optionally could also remove places associated with this district
                placesToExplore: trip.placesToExplore.filter((p) => p.district !== districtId),
              },
            },
          };
        }),

      addPlace: (place) =>
        set((state) => {
          if (!state.activeTripId) return state;
          const trip = state.trips[state.activeTripId];
          return {
            trips: {
              ...state.trips,
              [state.activeTripId]: {
                ...trip,
                placesToExplore: [...trip.placesToExplore, { ...place, id: uuidv4() }],
              },
            },
          };
        }),

      removePlace: (placeId) =>
        set((state) => {
          if (!state.activeTripId) return state;
          const trip = state.trips[state.activeTripId];
          return {
            trips: {
              ...state.trips,
              [state.activeTripId]: {
                ...trip,
                placesToExplore: trip.placesToExplore.filter((p) => p.id !== placeId),
              },
            },
          };
        }),

      updatePlaceDay: (placeId, dayOffset) =>
        set((state) => {
          if (!state.activeTripId) return state;
          const trip = state.trips[state.activeTripId];
          return {
            trips: {
              ...state.trips,
              [state.activeTripId]: {
                ...trip,
                placesToExplore: trip.placesToExplore.map((p) =>
                  p.id === placeId ? { ...p, dayOffset } : p
                ),
              },
            },
          };
        }),

      addBudgetItem: (item) =>
        set((state) => {
          if (!state.activeTripId) return state;
          const trip = state.trips[state.activeTripId];
          return {
            trips: {
              ...state.trips,
              [state.activeTripId]: {
                ...trip,
                budgetItems: [...trip.budgetItems, { ...item, id: uuidv4() }],
              },
            },
          };
        }),

      removeBudgetItem: (id) =>
        set((state) => {
          if (!state.activeTripId) return state;
          const trip = state.trips[state.activeTripId];
          return {
            trips: {
              ...state.trips,
              [state.activeTripId]: {
                ...trip,
                budgetItems: trip.budgetItems.filter((b) => b.id !== id),
              },
            },
          };
        }),
    }),
    {
      name: "bd-tour-planner-storage",
      // Custom revive logic for Date objects when recreating from localstorage
      merge: (persistedState: any, currentState) => {
        return {
          ...currentState,
          ...persistedState,
          trips: Object.fromEntries(
            Object.entries(persistedState.trips || {}).map(([id, trip]: [string, any]) => [
              id,
              {
                ...trip,
                dateRange: {
                  from: trip.dateRange?.from ? new Date(trip.dateRange.from) : undefined,
                  to: trip.dateRange?.to ? new Date(trip.dateRange.to) : undefined,
                },
              },
            ])
          ),
        };
      },
    }
  )
);
