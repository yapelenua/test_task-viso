import React, { useState, useEffect } from 'react';
import GoogleMapReact from 'google-map-react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { ApiKey } from '../helpers/api-key';
import { firestore } from "../firebase/firebase";
import { IMarker } from '../types/marker.types';

const MapComponent: React.FC = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<IMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<IMarker | null>(null);

  const fetchMarks = () => {
    const newMarkers: IMarker[] = [];
    firestore.collection('quests').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const marker = new window.google.maps.Marker({
          position: { lat: data.location.lat, lng: data.location.lng },
          map,
          draggable: true,
        });

        marker.addListener('click', () => {
          setSelectedMarker({ id: doc.id, marker });
        });

        newMarkers.push({ id: doc.id, marker });
      });
      setMarkers(newMarkers);
    });
  };

  useEffect(() => {
    fetchMarks()
  }, []);

  const handleApiLoaded = (mapInstance: any) => {
    setMap(mapInstance);
  };

  const handleMapClick = async (event: any) => {
    if (!map || selectedMarker) return;

    const newMarker = new window.google.maps.Marker({
      position: { lat: event.lat, lng: event.lng },
      map,
      draggable: true,
    });

    const timestamp = firebase.firestore.FieldValue.serverTimestamp();

    const docRef = await firestore.collection('quests').add({
      location: { lat: event.lat, lng: event.lng },
      timestamp,
      next: null,
    });

    newMarker.addListener('click', () => {
      setSelectedMarker({ id: docRef.id, marker: newMarker });
    });

    newMarker.addListener('dragend', async (event: any) => {
      const position = newMarker.getPosition();
      if (position) {
        const newPosition = { lat: position.lat(), lng: position.lng() };
        const infoWindow = new window.google.maps.InfoWindow();
        infoWindow.setContent(`Pin dropped at: ${newPosition.lat}, ${newPosition.lng}`);
        infoWindow.setPosition(newPosition);
        infoWindow.open(map);
        setSelectedMarker(null);
      }
    });
  };

  const handleDeleteMarker = async () => {
    if (selectedMarker) {
      const { id, marker } = selectedMarker;
      marker.setMap(null);
      await firestore.collection('quests').doc(id).delete();
      setMarkers(prevMarkers => prevMarkers.filter(item => item.id !== id));
      setSelectedMarker(null);
    }
  };

  const handleDeleteAllMarkers = async () => {
    try {
      const batch = firestore.batch();
      markers.forEach(({ id }) => {
        const docRef = firestore.collection('quests').doc(id);
        batch.delete(docRef);
      });
      await batch.commit();
      setMarkers([]);
    } catch (error) {
      console.error('Error deleting all markers: ', error);
    }
  };

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: ApiKey }}
        defaultCenter={{ lat: 0, lng: 0 }}
        defaultZoom={4}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map }) => handleApiLoaded(map)}
        onClick={handleMapClick}
      >
      </GoogleMapReact>
      {selectedMarker && (
        <div className="button-container">
          <button className="button" onClick={handleDeleteMarker}>Delete Selected Marker</button>
        </div>
      )}
      <div className="button-container">
        <button className="button delete-all-button" onClick={handleDeleteAllMarkers}>Delete All Markers</button>
      </div>
    </div>
  );
};

export default MapComponent;
