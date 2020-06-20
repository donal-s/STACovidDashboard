import React, { useEffect } from 'react';
import L from 'leaflet';
import './GeoHeatMap.css';

const GeoHeatMap = () => {

  const areas = [
    {
      area: 'Aberdeen City',
      lat: 57.1667,
      lng: -2.1667,
      totalCases: 60
    },
    {
      area: 'Aberdeenshire',
      lat: 57.2869,
      lng: -2.3816,
      totalCases: 50
    }
  ]

  const areaComponents = areas.map((a, id) => (

    <div id='area-component' key={id}>

      <h3>{a.area}</h3>
    </div>

  ));

  const calculateRadius = (totalCases) => {
    return totalCases * 600;
  };

  const createSeeds = (baseLayer) => {

    const circles = areas.map((a, id) => (

      L.circle([a.lat, a.lng], {
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.5,
        radius: calculateRadius(a.totalCases)
      }).addTo(baseLayer)
    ));

  };

  useEffect(() => {

    // create map
    const geoHeatMap = L.map('map', {
      center: [57.4907, -4.7026],
      zoom: 7,
      doubleClickZoom: false,
      closePopupOnClick: false,
      dragging: false,
      zoomSnap: false,
      zoomDelta: false,
      trackResize: false,
      touchZoom: false,
      scrollWheelZoom: false,
      layers: [
        L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
          attribution:
            '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }),
      ]
    });

    createSeeds(geoHeatMap);

  }, []);

  return (
    <>
      <div className="tracker">
        <h1 id='title'>Covid-19 Tracker</h1>
        <hr></hr>
        <h3>TOTAL CONFIRMED CASES</h3>
        <h1 id='total-cases'>300K</h1>
        <ul>
          <li>Active Cases 140,000</li>
          <li>Recovered Cases 130,000</li>
          <li>Fatal Cases 30,000</li>
        </ul>
        <hr></hr>
        {areaComponents}
      </div>
      <div id="map"></div>
    </>
  )

}

export default GeoHeatMap;
