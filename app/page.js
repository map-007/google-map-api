"use client";

import Map from "@/components/Map";
import { useLoadScript } from "@react-google-maps/api";

export default function Home() {
  const { isLoaded } = useLoadScript({
    // googleMapsApiKey: process.env.PUBLIC_GOOGLE_MAPS_API_KEY,
    googleMapsApiKey: "AIzaSyBWfpDBobjNmwd2PF_imTLhiYnNOhoUXPs",
    libraries: ["places"],
  });

  if (!isLoaded) return <div>Loading...</div>;
  return <Map />;
}
