import { useEffect } from "react";
import { put } from "../utils/api";
import { getToken } from "../utils/auth";

const LocationTracker = () => {
  useEffect(() => {
    const token = getToken();

    if (!token) return;

    if (!navigator.geolocation) {
      console.log(
        "Geolocation not supported"
      );
      return;
    }

    const watchId =
      navigator.geolocation.watchPosition(
        async (position) => {
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          try {
            await put(
              "/user/update-location",
              {
                latitude,
                longitude,
              }
            );
          } catch (error) {
            console.error(
              "Location Update Error:",
              error
            );
          }
        },
        (error) => {
          console.error(
            "Location Error:",
            error
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

    return () => {
      navigator.geolocation.clearWatch(
        watchId
      );
    };
  }, []);

  return null;
};

export default LocationTracker;