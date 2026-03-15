import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AREA_COORDINATES, MAP_CENTER } from '../../utils/constants';
import { useEffect } from 'react';

// Fix default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createColorIcon = (color, size = 14) => L.divIcon({
  className: '',
  html: `<div style="
    width:${size}px;height:${size}px;
    background:${color};
    border:2px solid rgba(255,255,255,0.7);
    border-radius:50%;
    box-shadow:0 0 10px ${color}88;
  "></div>`,
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2],
});

const CYAN_ICON   = createColorIcon('#00d4ff', 14);
const ORANGE_ICON = createColorIcon('#f97316', 14);
const GREEN_ICON  = createColorIcon('#10b981', 16);
const PURPLE_ICON = createColorIcon('#a78bfa', 14);

function FlyTo({ area }) {
  const map = useMap();
  useEffect(() => {
    if (area && AREA_COORDINATES[area]) {
      map.flyTo([AREA_COORDINATES[area].lat, AREA_COORDINATES[area].lng], 13, { duration: 1.2 });
    }
  }, [area, map]);
  return null;
}

export default function DelhiMap({
  height = 400,
  currentArea = null,
  destinationArea = null,
  suggestedArea = null,
  onlineDrivers = [],
  flyTo = null,
}) {
  const darkTile = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  return (
    <div className="map-container" style={{ height }}>
      <MapContainer
        center={[MAP_CENTER.lat, MAP_CENTER.lng]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer url={darkTile} attribution="&copy; CartoDB" />
        {flyTo && <FlyTo area={flyTo} />}

        {/* Current / rider area */}
        {currentArea && AREA_COORDINATES[currentArea] && (
          <>
            <Circle
              center={[AREA_COORDINATES[currentArea].lat, AREA_COORDINATES[currentArea].lng]}
              radius={1000}
              pathOptions={{ color: '#00d4ff', fillColor: '#00d4ff', fillOpacity: 0.08, weight: 1 }}
            />
            <Marker
              position={[AREA_COORDINATES[currentArea].lat, AREA_COORDINATES[currentArea].lng]}
              icon={CYAN_ICON}
            >
              <Popup className="dark-popup">
                <strong>📍 {currentArea}</strong><br />
                {currentArea === suggestedArea ? 'Current & Suggested' : 'Current Location'}
              </Popup>
            </Marker>
          </>
        )}

        {/* Destination */}
        {destinationArea && AREA_COORDINATES[destinationArea] && (
          <Marker
            position={[AREA_COORDINATES[destinationArea].lat, AREA_COORDINATES[destinationArea].lng]}
            icon={PURPLE_ICON}
          >
            <Popup><strong>🏁 {destinationArea}</strong><br />Destination</Popup>
          </Marker>
        )}

        {/* Suggested area for driver */}
        {suggestedArea && AREA_COORDINATES[suggestedArea] && suggestedArea !== currentArea && (
          <>
            <Circle
              center={[AREA_COORDINATES[suggestedArea].lat, AREA_COORDINATES[suggestedArea].lng]}
              radius={1500}
              pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1, weight: 2, dashArray: '8' }}
            />
            <Marker
              position={[AREA_COORDINATES[suggestedArea].lat, AREA_COORDINATES[suggestedArea].lng]}
              icon={GREEN_ICON}
            >
              <Popup><strong>🎯 {suggestedArea}</strong><br />AI Recommended Hotspot</Popup>
            </Marker>
          </>
        )}

        {/* Online Drivers */}
        {onlineDrivers.map((driver, i) => {
          const coords = AREA_COORDINATES[driver.area || driver];
          if (!coords) return null;
          return (
            <Marker
              key={i}
              position={[coords.lat + (Math.random() - 0.5) * 0.01, coords.lng + (Math.random() - 0.5) * 0.01]}
              icon={ORANGE_ICON}
            >
              <Popup><strong>🚗 Driver Online</strong><br />{driver.area || driver}</Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
