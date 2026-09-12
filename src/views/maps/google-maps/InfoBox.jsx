import React, { useState } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

const StyledMapWithAnInfoBox = ({markerPosition , handleMapClick}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY
  });

  const [selectedMarker, setSelectedMarker] = useState(null);
  // const [markerPosition, setMarkerPosition] = useState({ lat: 28.027138, lng: 73.302155 });

  // const center = {
  //   lat: 28.5274851,
  //   lng: 77.1389452
  // };

  // const handleMapClick = (e) => {
  //   const newPosition = { lat: e.latLng.lat(), lng: e.latLng.lng() };
  //   setMarkerPosition(newPosition);
  // };

   

  return isLoaded ? (
    <>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px' }}
        center={markerPosition}
        zoom={4}
        onClick={handleMapClick}
      >
        <Marker position={markerPosition} />

        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            options={{ closeBoxURL: ``, enableEventPropagation: true }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div style={{ backgroundColor: `yellow`, opacity: 0.75, padding: `12px` }}>
              <h3>{selectedMarker.title}</h3>
              <div style={{ fontSize: `16px`, fontColor: `#08233B` }}>{selectedMarker.content}</div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    
    </>
  ) : (
    <></>
  );
};

export default StyledMapWithAnInfoBox;
