import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { App } from './App.jsx'

L.Marker.prototype.options.icon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
