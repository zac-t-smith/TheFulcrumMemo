import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  conflictEvents,
  conflictMetadata,
  insuranceExclusionZone,
  getEventsThrough,
  getEventsForDay,
  type ConflictEvent,
} from '@/data/iranConflictData';

// Fix Leaflet default marker icon issue with bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// =============================================================================
// TYPES
// =============================================================================

interface GDELTEvent {
  id: string;
  lat: number;
  lng: number;
  name: string;
  url: string;
  sourcecountry: string;
  tone: number;
  dateadded: string;
  html?: string;
  query?: string;
  timestamp: number;
  isNew?: boolean;
  eventType: 'attack' | 'shipping' | 'infrastructure' | 'interception' | 'diplomatic';
}

interface AISVessel {
  mmsi: string;
  name: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  flag: string;
  type: 'tanker' | 'cargo' | 'military' | 'other';
  destination?: string;
  draft?: number;
  lastUpdate: number;
}

interface LiveFeedEvent {
  id: string;
  timestamp: number;
  type: 'attack' | 'shipping' | 'infrastructure' | 'interception' | 'diplomatic';
  source: 'gdelt' | 'ais' | 'curated';
  title: string;
  location?: string;
  lat?: number;
  lng?: number;
  url?: string;
  isNew: boolean;
}

interface LayerState {
  curatedEvents: boolean;
  gdeltLive: boolean;
  aisVessels: boolean;
  infrastructure: boolean;
  exclusionZone: boolean;
  shippingRoutes: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Event type colors and icons
const eventTypeConfig: Record<string, { color: string; label: string; emoji: string }> = {
  strike_us: { color: '#1F3A5F', label: 'US/Coalition Strike', emoji: '💥' },
  strike_israel: { color: '#1F3A5F', label: 'Israeli Strike', emoji: '💥' },
  strike_iran: { color: '#C8102E', label: 'Iranian Strike', emoji: '🔥' },
  shipping: { color: '#4F7F7A', label: 'Shipping Event', emoji: '🚢' },
  infrastructure_energy: { color: '#B07D2B', label: 'Energy Infrastructure', emoji: '🛢️' },
  infrastructure_water: { color: '#4F7F7A', label: 'Water Infrastructure', emoji: '💧' },
  naval: { color: '#1F3A5F', label: 'Naval Engagement', emoji: '⚓' },
  ground_offensive: { color: '#2E7D4F', label: 'Ground Offensive', emoji: '🎖️' },
  interception: { color: '#7A6C9D', label: 'Interception', emoji: '🛡️' },
  military: { color: '#4a4a4a', label: 'Military Movement', emoji: '🪖' },
  political: { color: '#7A6C9D', label: 'Political Event', emoji: '🏛️' },
  diplomatic: { color: '#2E7D4F', label: 'Diplomatic Event', emoji: '🤝' },
};

// Fallback for unknown event types
const defaultEventConfig = { color: '#4a4a4a', label: 'Event', emoji: '📍' };
const getEventConfig = (type: string) => eventTypeConfig[type] || defaultEventConfig;

// Live event type colors
const liveEventColors: Record<LiveFeedEvent['type'], string> = {
  attack: '#C8102E',
  shipping: '#4F7F7A',
  infrastructure: '#B07D2B',
  interception: '#B7791F',
  diplomatic: '#ffffff',
};

// Hormuz shipping lane coordinates
const hormuzShippingLane: [number, number][] = [
  [26.5, 56.5],
  [26.0, 56.2],
  [25.5, 55.5],
  [25.0, 54.5],
];

// Optimized GDELT attack queries (rotate through these)
const GDELT_ATTACK_QUERIES = [
  { query: 'iran airstrike bombing', type: 'attack' as const },
  { query: 'missile drone intercept gulf', type: 'interception' as const },
  { query: 'tehran strike explosion', type: 'attack' as const },
  { query: 'bahrain kuwait qatar saudi attack', type: 'attack' as const },
  { query: 'hezbollah lebanon strike', type: 'attack' as const },
  { query: 'hormuz tanker attack ship', type: 'shipping' as const },
  { query: 'iran oil refinery fire', type: 'infrastructure' as const },
  { query: 'israel iran strike military', type: 'attack' as const },
];

// Cache keys and expiries
const GDELT_CACHE_KEY = 'gdelt_attack_events_cache';
const GDELT_CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes
const AIS_CACHE_KEY = 'ais_vessels_cache';
const AIS_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes
const QUERY_ROTATION_INTERVAL = 60 * 1000; // 1 minute per query

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Create custom marker icons for curated events
const createCustomIcon = (type: ConflictEvent['type'], isHighlighted: boolean) => {
  const config = getEventConfig(type);
  const size = isHighlighted ? 32 : 24;
  const pulseClass = isHighlighted ? 'animate-pulse' : '';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative flex items-center justify-center ${pulseClass}" style="width: ${size}px; height: ${size}px;">
        <div class="absolute inset-0 rounded-full opacity-30" style="background-color: ${config.color};"></div>
        <div class="absolute inset-1 rounded-full flex items-center justify-center text-xs" style="background-color: ${config.color}; border: 2px solid rgba(255,255,255,0.8);">
          <span style="font-size: ${isHighlighted ? '14px' : '10px'};">${config.emoji}</span>
        </div>
        ${isHighlighted ? `<div class="absolute inset-0 rounded-full animate-ping opacity-50" style="background-color: ${config.color};"></div>` : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// Create GDELT live event marker (semi-transparent with dotted border)
const createGDELTIcon = (eventType: LiveFeedEvent['type'], isNew: boolean) => {
  const color = liveEventColors[eventType];
  const size = isNew ? 20 : 16;

  return L.divIcon({
    className: 'gdelt-marker',
    html: `
      <div class="relative flex items-center justify-center" style="width: ${size}px; height: ${size}px;">
        <div class="absolute inset-0 rounded-full" style="background-color: ${color}; opacity: 0.4; border: 2px dashed ${color};"></div>
        ${isNew ? `<div class="absolute inset-0 rounded-full animate-ping" style="background-color: ${color}; opacity: 0.3;"></div>` : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// Create vessel icon with heading rotation
const createVesselIcon = (type: AISVessel['type'], heading: number) => {
  const colors = {
    tanker: '#4F7F7A',
    cargo: '#4a4a4a',
    military: '#C8102E',
    other: '#7A6C9D',
  };
  const color = colors[type];

  return L.divIcon({
    className: 'vessel-marker',
    html: `
      <div class="relative" style="width: 16px; height: 16px; transform: rotate(${heading}deg);">
        <svg viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1">
          <path d="M12 2L4 20h16L12 2z"/>
        </svg>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
};

// Classify GDELT event type based on content
function classifyGDELTEvent(name: string, query: string): LiveFeedEvent['type'] {
  const lowerName = name.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('intercept') || lowerName.includes('intercept') || lowerName.includes('air defense')) {
    return 'interception';
  }
  if (lowerQuery.includes('tanker') || lowerQuery.includes('ship') || lowerName.includes('vessel') || lowerName.includes('tanker')) {
    return 'shipping';
  }
  if (lowerQuery.includes('refinery') || lowerQuery.includes('oil') || lowerName.includes('infrastructure') || lowerName.includes('refinery')) {
    return 'infrastructure';
  }
  if (lowerName.includes('diplomat') || lowerName.includes('negotiate') || lowerName.includes('sanction')) {
    return 'diplomatic';
  }
  return 'attack';
}

// Cache helpers
function getCachedData<T>(key: string, expiry: number): T | null {
  try {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > expiry) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCachedData<T>(key: string, data: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Storage might be full, ignore
  }
}

// =============================================================================
// HOOKS
// =============================================================================

// Optimized GDELT hook with rotating attack-specific queries
function useGDELTAttackEvents(enabled: boolean) {
  const [events, setEvents] = useState<GDELTEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [currentQueryIndex, setCurrentQueryIndex] = useState(0);
  const seenUrlsRef = useRef(new Set<string>());

  const fetchQuery = useCallback(async (queryConfig: typeof GDELT_ATTACK_QUERIES[0]) => {
    try {
      const response = await fetch(
        `https://api.gdeltproject.org/api/v2/geo/geo?query=${encodeURIComponent(queryConfig.query)}&mode=PointData&format=GeoJSON&timespan=1h`
      );

      if (!response.ok) return [];

      const data = await response.json();
      const newEvents: GDELTEvent[] = [];

      if (data?.features) {
        for (const feature of data.features) {
          if (feature.geometry?.coordinates && feature.properties) {
            const [lng, lat] = feature.geometry.coordinates;
            const url = feature.properties.url || '';

            // Filter to Middle East region and deduplicate
            if (lat >= 15 && lat <= 45 && lng >= 30 && lng <= 65 && !seenUrlsRef.current.has(url)) {
              seenUrlsRef.current.add(url);
              const name = feature.properties.name || 'News Event';

              newEvents.push({
                id: `gdelt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                lat,
                lng,
                name,
                url,
                sourcecountry: feature.properties.sourcecountry || 'Unknown',
                tone: feature.properties.tone || 0,
                dateadded: feature.properties.dateadded || new Date().toISOString(),
                html: feature.properties.html,
                query: queryConfig.query,
                timestamp: Date.now(),
                isNew: true,
                eventType: classifyGDELTEvent(name, queryConfig.query),
              });
            }
          }
        }
      }

      return newEvents;
    } catch {
      return [];
    }
  }, []);

  // Rotate through queries
  useEffect(() => {
    if (!enabled) return;

    const fetchCurrentQuery = async () => {
      setLoading(true);
      const queryConfig = GDELT_ATTACK_QUERIES[currentQueryIndex];
      const newEvents = await fetchQuery(queryConfig);

      if (newEvents.length > 0) {
        setEvents(prev => {
          // Mark old events as not new
          const updated = prev.map(e => ({ ...e, isNew: false }));
          // Add new events
          const combined = [...newEvents, ...updated];
          // Keep only last 100 events
          const trimmed = combined.slice(0, 100);
          setCachedData(GDELT_CACHE_KEY, trimmed);
          return trimmed;
        });
        setLastUpdate(new Date());
      }

      setLoading(false);
      setCurrentQueryIndex((prev) => (prev + 1) % GDELT_ATTACK_QUERIES.length);
    };

    // Initial fetch
    const cached = getCachedData<GDELTEvent[]>(GDELT_CACHE_KEY, GDELT_CACHE_EXPIRY);
    if (cached) {
      setEvents(cached.map(e => ({ ...e, isNew: false })));
    }

    fetchCurrentQuery();

    // Rotate queries every minute
    const interval = setInterval(fetchCurrentQuery, QUERY_ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [enabled, currentQueryIndex, fetchQuery]);

  return { events, loading, error, lastUpdate };
}

// AIS vessel tracking hook
function useAISVessels(enabled: boolean, apiKey?: string) {
  const [vessels, setVessels] = useState<AISVessel[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled || !apiKey) {
      const cached = getCachedData<AISVessel[]>(AIS_CACHE_KEY, AIS_CACHE_EXPIRY);
      if (cached) setVessels(cached);
      return;
    }

    const connectWebSocket = () => {
      try {
        const socket = new WebSocket('wss://stream.aisstream.io/v0/stream');
        socketRef.current = socket;

        socket.onopen = () => {
          setConnected(true);
          setError(null);
          socket.send(JSON.stringify({
            Apikey: apiKey,
            BoundingBoxes: [[[23.0, 54.0], [27.5, 60.0]]],
            FilterMessageTypes: ['PositionReport'],
          }));
        };

        socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.MessageType === 'PositionReport' && msg.MetaData && msg.Message?.PositionReport) {
              const pos = msg.Message.PositionReport;
              const meta = msg.MetaData;

              let type: AISVessel['type'] = 'other';
              const nameLower = (meta.ShipName || '').toLowerCase();
              if (nameLower.includes('tanker') || nameLower.includes('crude') || nameLower.includes('vlcc')) {
                type = 'tanker';
              } else if (nameLower.includes('cargo') || nameLower.includes('container')) {
                type = 'cargo';
              } else if (meta.MMSI?.toString().startsWith('3') || nameLower.includes('navy')) {
                type = 'military';
              }

              const vessel: AISVessel = {
                mmsi: meta.MMSI?.toString() || 'Unknown',
                name: meta.ShipName || 'Unknown Vessel',
                lat: pos.Latitude,
                lng: pos.Longitude,
                heading: pos.TrueHeading || pos.Cog || 0,
                speed: pos.Sog || 0,
                flag: meta.country || 'Unknown',
                type,
                destination: pos.Destination,
                draft: pos.Draught,
                lastUpdate: Date.now(),
              };

              setVessels(prev => {
                const updated = prev.filter(v => v.mmsi !== vessel.mmsi);
                const newVessels = [...updated, vessel];
                setCachedData(AIS_CACHE_KEY, newVessels);
                return newVessels;
              });
            }
          } catch {
            // Invalid message, ignore
          }
        };

        socket.onerror = () => {
          setError('AIS connection error');
          setConnected(false);
        };

        socket.onclose = () => {
          setConnected(false);
          setTimeout(connectWebSocket, 5000);
        };
      } catch {
        setError('Failed to connect to AIS stream');
      }
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [enabled, apiKey]);

  return { vessels, connected, error };
}

// =============================================================================
// COMPONENTS
// =============================================================================

interface ConflictMapProps {
  throughDay?: number;
  highlightDay?: number;
  className?: string;
  height?: string;
  showLegend?: boolean;
  showDaySlider?: boolean;
  showLayerControls?: boolean;
  showLiveFeed?: boolean;
  aisApiKey?: string;
}

// Live Event Feed Component
const LiveEventFeed = ({
  gdeltEvents,
  curatedEvents,
  isOpen,
  onClose,
  onEventClick,
}: {
  gdeltEvents: GDELTEvent[];
  curatedEvents: ConflictEvent[];
  isOpen: boolean;
  onClose: () => void;
  onEventClick: (lat: number, lng: number) => void;
}) => {
  // Combine and sort events
  const feedEvents: LiveFeedEvent[] = useMemo(() => {
    const combined: LiveFeedEvent[] = [];

    // Add GDELT events
    gdeltEvents.slice(0, 30).forEach(e => {
      combined.push({
        id: e.id,
        timestamp: e.timestamp,
        type: e.eventType,
        source: 'gdelt',
        title: e.name.slice(0, 100),
        location: e.sourcecountry,
        lat: e.lat,
        lng: e.lng,
        url: e.url,
        isNew: e.isNew || false,
      });
    });

    // Add recent curated events
    curatedEvents.slice(-10).forEach(e => {
      combined.push({
        id: `curated-${e.date}-${e.target}`,
        timestamp: Date.parse(e.date) || Date.now(),
        type: e.type.includes('strike') ? 'attack' : e.type.includes('shipping') ? 'shipping' : 'infrastructure',
        source: 'curated',
        title: `${e.target}: ${e.description}`,
        lat: e.lat,
        lng: e.lng,
        isNew: false,
      });
    });

    return combined.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
  }, [gdeltEvents, curatedEvents]);

  const newEventCount = feedEvents.filter(e => e.isNew).length;

  if (!isOpen) {
    return (
      <button
        onClick={() => {}}
        className="absolute top-3 left-64 z-[1000] bg-background/95 backdrop-blur-sm px-3 py-2 rounded border border-border hover:border-primary transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Live Feed</span>
          {newEventCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold animate-pulse">
              {newEventCount}
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="absolute top-14 left-64 z-[1000] bg-background/95 backdrop-blur-sm rounded border border-border w-80 max-h-[400px] overflow-hidden flex flex-col"
    >
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-wider text-primary">Live Event Feed</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs">×</button>
      </div>

      {/* Data delay disclaimer */}
      <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/20">
        <p className="text-[9px] text-amber-400">
          GDELT updates: ~15 min lag. Auto-coded from news, may contain inaccuracies.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {feedEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={event.isNew ? { opacity: 0, backgroundColor: 'rgba(239, 68, 68, 0.3)' } : { opacity: 1 }}
              animate={{ opacity: 1, backgroundColor: 'transparent' }}
              transition={{ duration: 0.5 }}
              onClick={() => event.lat && event.lng && onEventClick(event.lat, event.lng)}
              className={cn(
                'p-3 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors',
                event.isNew && 'bg-red-500/10'
              )}
            >
              <div className="flex items-start gap-2">
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: liveEventColors[event.type] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      'px-1.5 py-0.5 rounded text-[8px] uppercase',
                      event.source === 'curated' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/60'
                    )}>
                      {event.source === 'curated' ? 'Verified' : 'GDELT'}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-foreground leading-relaxed line-clamp-2">
                    {event.title}
                  </p>
                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[9px] text-primary hover:underline mt-1 inline-block"
                    >
                      Source →
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Layer toggle panel component
const LayerTogglePanel = ({
  layers,
  setLayers,
  gdeltLoading,
  gdeltLastUpdate,
  aisConnected,
  aisError,
  vesselCount,
  gdeltEventCount,
}: {
  layers: LayerState;
  setLayers: React.Dispatch<React.SetStateAction<LayerState>>;
  gdeltLoading: boolean;
  gdeltLastUpdate: Date | null;
  aisConnected: boolean;
  aisError: string | null;
  vesselCount: number;
  gdeltEventCount: number;
}) => {
  const toggleLayer = (key: keyof LayerState) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const LayerToggle = ({
    label,
    layerKey,
    isLive,
    status,
    count,
    lastUpdate,
  }: {
    label: string;
    layerKey: keyof LayerState;
    isLive?: boolean;
    status?: 'loading' | 'connected' | 'error' | 'disabled';
    count?: number;
    lastUpdate?: Date | null;
  }) => (
    <div className="space-y-0.5">
      <label className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 p-1 rounded transition-colors">
        <input
          type="checkbox"
          checked={layers[layerKey]}
          onChange={() => toggleLayer(layerKey)}
          className="w-3 h-3 accent-primary"
        />
        <span className="text-[9px] text-muted-foreground flex-1">{label}</span>
        {isLive && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/20 rounded text-[8px] text-emerald-400">
            <span className={cn('w-1.5 h-1.5 rounded-full bg-emerald-400', status === 'connected' && 'animate-pulse')} />
            LIVE
          </span>
        )}
        {status === 'loading' && (
          <span className="text-[8px] text-amber-400">...</span>
        )}
        {count !== undefined && count > 0 && (
          <span className="text-[8px] text-cyan-400">{count}</span>
        )}
      </label>
      {lastUpdate && layers[layerKey] && (
        <p className="text-[8px] text-muted-foreground/50 pl-5">
          Updated: {lastUpdate.toLocaleTimeString()}
        </p>
      )}
    </div>
  );

  return (
    <div className="absolute top-14 left-3 z-[1000] bg-background/95 backdrop-blur-sm p-3 rounded border border-border w-56">
      <p className="text-[9px] uppercase tracking-wider text-primary mb-2">Layers</p>
      <div className="space-y-1">
        <LayerToggle label="Curated Events (Verified)" layerKey="curatedEvents" />
        <LayerToggle
          label="Live Attacks (GDELT)"
          layerKey="gdeltLive"
          isLive
          status={gdeltLoading ? 'loading' : layers.gdeltLive ? 'connected' : 'disabled'}
          count={layers.gdeltLive ? gdeltEventCount : undefined}
          lastUpdate={gdeltLastUpdate}
        />
        <LayerToggle
          label="Live Vessels (AIS)"
          layerKey="aisVessels"
          isLive
          status={aisError ? 'error' : aisConnected ? 'connected' : 'disabled'}
          count={layers.aisVessels ? vesselCount : undefined}
        />
        <div className="border-t border-border my-2" />
        <LayerToggle label="Insurance Exclusion Zone" layerKey="exclusionZone" />
        <LayerToggle label="Shipping Routes" layerKey="shippingRoutes" />
      </div>

      {/* Legend for live vs curated */}
      <div className="mt-3 pt-2 border-t border-border space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white/80" />
          <span className="text-[8px] text-muted-foreground">Verified (solid)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white/40 border-2 border-dashed border-white/60" />
          <span className="text-[8px] text-muted-foreground">GDELT (auto-coded)</span>
        </div>
      </div>
    </div>
  );
};

// Map controller for programmatic panning
function MapController({ targetPosition }: { targetPosition: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (targetPosition) {
      map.flyTo(targetPosition, 8, { duration: 0.5 });
    }
  }, [targetPosition, map]);

  return null;
}

export const ConflictMap = ({
  throughDay = conflictMetadata.conflictDay,
  highlightDay,
  className,
  height = '500px',
  showLegend = true,
  showDaySlider = false,
  showLayerControls = true,
  showLiveFeed = true,
  aisApiKey = import.meta.env.VITE_AISSTREAM_API_KEY,
}: ConflictMapProps) => {
  const [selectedDay, setSelectedDay] = useState(throughDay);
  const [selectedEvent, setSelectedEvent] = useState<ConflictEvent | null>(null);
  const [liveFeedOpen, setLiveFeedOpen] = useState(false);
  const [targetPosition, setTargetPosition] = useState<[number, number] | null>(null);

  // Layer visibility state
  const [layers, setLayers] = useState<LayerState>({
    curatedEvents: true,
    gdeltLive: false,
    aisVessels: false,
    infrastructure: true,
    exclusionZone: true,
    shippingRoutes: true,
  });

  const effectiveDay = showDaySlider ? selectedDay : throughDay;
  const effectiveHighlightDay = highlightDay ?? effectiveDay;

  const events = useMemo(() => getEventsThrough(effectiveDay), [effectiveDay]);
  const highlightedEvents = useMemo(() => getEventsForDay(effectiveHighlightDay), [effectiveHighlightDay]);

  // Live data hooks
  const { events: gdeltEvents, loading: gdeltLoading, lastUpdate: gdeltLastUpdate } = useGDELTAttackEvents(layers.gdeltLive);
  const { vessels: aisVessels, connected: aisConnected, error: aisError } = useAISVessels(layers.aisVessels, aisApiKey);

  const center: [number, number] = [28.0, 52.0];
  const defaultZoom = 5;

  // Get unique event types for legend
  const activeTypes = useMemo(() => {
    const types = new Set(events.map(e => e.type));
    return Array.from(types);
  }, [events]);

  // Count new GDELT events
  const newGdeltEventCount = gdeltEvents.filter(e => e.isNew).length;

  const handleEventClick = (lat: number, lng: number) => {
    setTargetPosition([lat, lng]);
    setTimeout(() => setTargetPosition(null), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn('relative rounded-lg overflow-hidden border border-border', className)}
    >
      {/* Data as of label */}
      <div className="absolute top-3 right-3 z-[1000] bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded border border-border">
        <span className="text-[10px] text-muted-foreground">
          Day {effectiveDay} | {layers.gdeltLive && gdeltLastUpdate ? `GDELT: ${gdeltLastUpdate.toLocaleTimeString()}` : 'Live feeds off'}
        </span>
      </div>

      {/* Day slider */}
      {showDaySlider && (
        <div className="absolute top-3 left-3 right-32 z-[1000] bg-background/90 backdrop-blur-sm px-4 py-2 rounded border border-border">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">Day 1</span>
            <input
              type="range"
              min={1}
              max={conflictMetadata.conflictDay}
              value={selectedDay}
              onChange={(e) => setSelectedDay(parseInt(e.target.value))}
              className="flex-1 h-1 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              Day {conflictMetadata.conflictDay}
            </span>
          </div>
        </div>
      )}

      {/* Layer toggle panel */}
      {showLayerControls && (
        <LayerTogglePanel
          layers={layers}
          setLayers={setLayers}
          gdeltLoading={gdeltLoading}
          gdeltLastUpdate={gdeltLastUpdate}
          aisConnected={aisConnected}
          aisError={aisError}
          vesselCount={aisVessels.length}
          gdeltEventCount={gdeltEvents.length}
        />
      )}

      {/* Live Feed Toggle Button */}
      {showLiveFeed && layers.gdeltLive && (
        <button
          onClick={() => setLiveFeedOpen(!liveFeedOpen)}
          className="absolute top-14 left-64 z-[1000] bg-background/95 backdrop-blur-sm px-3 py-2 rounded border border-border hover:border-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">
              {liveFeedOpen ? 'Hide Feed' : 'Live Feed'}
            </span>
            {newGdeltEventCount > 0 && !liveFeedOpen && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold animate-pulse">
                {newGdeltEventCount}
              </span>
            )}
          </div>
        </button>
      )}

      {/* Live Event Feed */}
      <AnimatePresence>
        {showLiveFeed && layers.gdeltLive && liveFeedOpen && (
          <LiveEventFeed
            gdeltEvents={gdeltEvents}
            curatedEvents={events}
            isOpen={liveFeedOpen}
            onClose={() => setLiveFeedOpen(false)}
            onEventClick={handleEventClick}
          />
        )}
      </AnimatePresence>

      {/* Map container */}
      <div style={{ height }} className="w-full">
        <MapContainer
          center={center}
          zoom={defaultZoom}
          minZoom={3}
          maxZoom={10}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <MapController targetPosition={targetPosition} />

          {/* Dark theme tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Insurance exclusion zone polygon */}
          {layers.exclusionZone && (
            <Polygon
              positions={insuranceExclusionZone.coordinates}
              pathOptions={{
                color: '#C8102E',
                fillColor: '#C8102E',
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '5, 10',
              }}
            />
          )}

          {/* Hormuz shipping lane */}
          {layers.shippingRoutes && (
            <Polyline
              positions={hormuzShippingLane}
              pathOptions={{
                color: '#4F7F7A',
                weight: 3,
                dashArray: '10, 10',
                opacity: 0.7,
              }}
            />
          )}

          {/* Curated event markers (solid, verified) */}
          {layers.curatedEvents && events.map((event, index) => {
            const isHighlighted = highlightedEvents.some(
              (he) => he.lat === event.lat && he.lng === event.lng && he.target === event.target
            );

            return (
              <Marker
                key={`curated-${event.date}-${event.target}-${index}`}
                position={[event.lat, event.lng]}
                icon={createCustomIcon(event.type, isHighlighted)}
                eventHandlers={{
                  click: () => setSelectedEvent(event),
                }}
              >
                <Popup className="conflict-popup">
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="px-2 py-0.5 rounded text-[9px] uppercase tracking-wider"
                        style={{
                          backgroundColor: `${getEventConfig(event.type).color}20`,
                          color: getEventConfig(event.type).color,
                        }}
                      >
                        {getEventConfig(event.type).label}
                      </span>
                      <span className="px-1.5 py-0.5 bg-primary/20 rounded text-[8px] text-primary">
                        VERIFIED
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">
                      {event.target}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                    {event.impact && (
                      <p className="text-xs text-primary mt-2 font-semibold">
                        Impact: {event.impact}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Day {event.day} • {event.date}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* GDELT live event markers (semi-transparent, auto-coded) */}
          {layers.gdeltLive && gdeltEvents.map((event) => (
            <Marker
              key={event.id}
              position={[event.lat, event.lng]}
              icon={createGDELTIcon(event.eventType, event.isNew || false)}
            >
              <Popup className="conflict-popup">
                <div className="p-2 min-w-[220px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-0.5 rounded text-[9px] uppercase"
                      style={{
                        backgroundColor: `${liveEventColors[event.eventType]}20`,
                        color: liveEventColors[event.eventType],
                      }}
                    >
                      {event.eventType}
                    </span>
                    <span className="px-1.5 py-0.5 bg-white/10 rounded text-[8px] text-white/60">
                      AUTO-CODED
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-foreground mb-2 leading-relaxed">
                    {event.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    Source: {event.sourcecountry} • {new Date(event.timestamp).toLocaleString()}
                  </p>
                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary hover:underline"
                    >
                      Read article →
                    </a>
                  )}
                  <p className="text-[9px] text-amber-400/70 mt-2 italic">
                    ⚠ Unverified. May contain inaccuracies.
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* AIS vessel markers */}
          {layers.aisVessels && aisVessels.map((vessel) => (
            <Marker
              key={`ais-${vessel.mmsi}`}
              position={[vessel.lat, vessel.lng]}
              icon={createVesselIcon(vessel.type, vessel.heading)}
            >
              <Popup className="conflict-popup">
                <div className="p-2 min-w-[180px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[9px] uppercase',
                        vessel.type === 'tanker' && 'bg-cyan-500/20 text-cyan-400',
                        vessel.type === 'cargo' && 'bg-gray-500/20 text-gray-400',
                        vessel.type === 'military' && 'bg-red-500/20 text-red-400',
                        vessel.type === 'other' && 'bg-purple-500/20 text-purple-400'
                      )}
                    >
                      {vessel.type}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {vessel.flag}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-foreground mb-1">
                    {vessel.name}
                  </h4>
                  <div className="space-y-1 text-[10px] text-muted-foreground">
                    <p>MMSI: {vessel.mmsi}</p>
                    <p>Speed: {vessel.speed.toFixed(1)} kts</p>
                    <p>Heading: {vessel.heading}°</p>
                    {vessel.destination && <p>Dest: {vessel.destination}</p>}
                    {vessel.draft && <p>Draft: {vessel.draft}m</p>}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-background/90 backdrop-blur-sm p-3 rounded border border-border max-w-[200px]">
          <p className="text-[9px] uppercase tracking-wider text-primary mb-2">Legend</p>
          <div className="grid grid-cols-1 gap-1.5">
            {layers.curatedEvents && activeTypes.slice(0, 5).map((type) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: getEventConfig(type).color }}
                >
                  <span className="text-[8px]">{getEventConfig(type).emoji}</span>
                </div>
                <span className="text-[9px] text-muted-foreground">
                  {getEventConfig(type).label}
                </span>
              </div>
            ))}
            {layers.gdeltLive && (
              <div className="flex items-center gap-2 border-t border-border pt-1 mt-1">
                <div className="w-3 h-3 rounded-full bg-white/40 border border-dashed border-white/60"></div>
                <span className="text-[9px] text-muted-foreground">GDELT (unverified)</span>
              </div>
            )}
            {layers.exclusionZone && (
              <div className="flex items-center gap-2 border-t border-border pt-1 mt-1">
                <div className="w-3 h-3 border-2 border-dashed border-red-500 rounded-sm opacity-50"></div>
                <span className="text-[9px] text-muted-foreground">War Risk Zone</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hormuz CLOSED label */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded">
        <span className="text-[10px] text-white font-bold tracking-wider">
          HORMUZ: CLOSED TO WESTERN SHIPPING
        </span>
      </div>

      {/* AIS status */}
      {layers.aisVessels && !aisApiKey && (
        <div className="absolute bottom-12 right-3 z-[1000] bg-amber-500/90 backdrop-blur-sm px-3 py-1 rounded">
          <span className="text-[9px] text-white">
            AIS: No API key configured
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default ConflictMap;
