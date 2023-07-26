"use-client";

import { useState, useMemo, useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Circle,
  MarkerClusterer,
} from "@react-google-maps/api";
import Places from "./Place";
import Distance from "./distance";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

export default function Map() {
  const [office, setOffice] = useState();
  const [directions, setDirection] = useState();
  const mapRef = useRef();
  const center = useMemo(() => ({ lat: 36.6485258, lng: 138.1950371 }), []);
  const options = useMemo(() => ({
    mapId: "2cfbcd8903e7c24d",
    disableDefaultUI: true,
    clickableIcons: false,
  }));
  const onLoad = useCallback((map) => ((mapRef.current = map), []));
  const houses = useMemo(
    () => generateHouses(office ? office : center),
    [office]
  );

  const fetchDirections = (house) => {
    if (!office) return;

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: house,
        destination: office,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        console.log("result:", result);
        if (status === "OK" && result) {
          setDirection(result);
        }
      }
    );
  };

  const [distance, setDistance] = useState(0);

  const getDistanceFromLatLngInKm = (lat1, lng1, lat2, lng2) => {
    const deg2rad = (deg) => {
      return deg * (Math.PI / 180);
    };

    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLng = deg2rad(lng2 - lng1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const filterHouses = (distance) => {
    return houses.filter((house) => {
      if (!office) return;
      return (
        getDistanceFromLatLngInKm(
          office.lat,
          office.lng,
          house.lat,
          house.lng
        ).toFixed(2) <= distance
      );
    });
  };

  const home = useMemo(() => {
    return distance < 10 && office ? houses : filterHouses(distance);
  }, [distance, office]);

  return (
    <div className="container">
      <div className="controls">
        <h1>Commute?</h1>
        <Places
          setOffice={(position) => {
            setOffice(position);
            mapRef.current?.panTo(position);
          }}
        />
        {!office && <p>Enter the address of your office.</p>}
        {office && (
          <div>
            <span
              className="highlight"
              style={{
                textAlign: "center",
                padding: "10px 20px",
                display: "block",
              }}
            >
              {distance} km{" "}
            </span>
            <Slider
              marks={{ 0: "0", 50: "50" }}
              value={distance}
              // disabled={!office}
              dots
              step={10}
              max={50}
              trackStyle={{ backgroundColor: "#5c9dad", height: 5 }}
              onChange={(value) => setDistance(value)}
            />
          </div>
        )}

        {directions  && <Distance leg={directions.routes[0].legs[0]} />}
      </div>
      <div className="map">
        <GoogleMap
          zoom={15}
          center={center}
          options={options}
          mapContainerClassName="map-container"
          onLoad={onLoad}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  zIndex: 50,
                  strokeColor: "#1976d2",
                  strokeWeight: 5,
                },
              }}
            />
          )}

          {office && (
            <>
              <Marker position={office} />
              <Circle center={office} radius={15000} options={closeOptions} />
              <Circle center={office} radius={30000} options={middleOptions} />
              <Circle center={office} radius={45000} options={farOptions} />

              <MarkerClusterer>
                {(clusterer) =>
                  home.map((house) => (
                    <Marker
                      key={house.lat}
                      position={house}
                      clusterer={clusterer}
                      onClick={() => {
                        fetchDirections(house);
                      }}
                    />
                  ))
                }
              </MarkerClusterer>
            </>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}

const defaultOptions = {
  strokeOpacity: 0.5,
  strokeWeight: 2,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
};
const closeOptions = {
  ...defaultOptions,
  zIndex: 3,
  fillOpacity: 0.05,
  strokeColor: "#8BC34A",
  fillColor: "#8BC34A",
};
const middleOptions = {
  ...defaultOptions,
  zIndex: 2,
  fillOpacity: 0.05,
  strokeColor: "#FBC02D",
  fillColor: "#FBC02D",
};
const farOptions = {
  ...defaultOptions,
  zIndex: 1,
  fillOpacity: 0.05,
  strokeColor: "#FF5252",
  fillColor: "#FF5252",
};

const generateHouses = (position) => {
  const _houses = [];
  for (let i = 0; i < 100; i++) {
    const direction = Math.random() < 0.5 ? -2 : 2;
    _houses.push({
      lat: position.lat + Math.random() / direction,
      lng: position.lng + Math.random() / direction,
    });
  }
  return _houses;
};
