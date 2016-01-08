var map = L.map('map', {zoomControl: false}).setView([39.739800, -104.911276], 11);

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
}).addTo(map);

var bar = null;

var stations = $.getJSON("https://darkvengers.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT s.* FROM stations as s, denver as d WHERE ST_Within(s.the_geom, d.the_geom)", function(data) {
  stations = L.geoJson(data, {
    onEachFeature: function(feature, layer) {
      layer.cartodb_id = feature.properties.cartodb_id;
      layer.bindPopup('' + feature.properties.name + '');
      layer.on("click", addOnClick);
      layer.on("click", function(){
        infoBox.update(layer.feature.properties);
      })
    },
    pointToLayer: function(feature, latlng) {
      return L.marker(latlng, {
        icon: L.AwesomeMarkers.icon({
          icon: 'fa-subway fa-2x',
          markerColor: 'red',
          prefix: 'fa'
        }),
      });
    }
  }).addTo(map);
  map.fitBounds(stations.getBounds());
});

var lat;
var lng;
var routeControl;

function removeRouting(e) {
  if ($(".leaflet-routing-container").length) {
    map.removeControl(routeControl);
  };
};

function addRouting(e) {
  var barLat = this.getLatLng().lat;
  var barLng = this.getLatLng().lng;
  console.log(barLat, barLng);
  routeControl = L.Routing.control({
    waypoints: [
      L.latLng(lat, lng),
      L.latLng(barLat, barLng)
    ],
    lineOptions: {
      styles: [{
        color: 'white',
        opacity: 0.8,
        weight: 8
      }, {
        color: '#2676C6',
        opacity: 1,
        weight: 4
      }]
    },
    routeWhileDragging: false,
    createMarker: function() {
      return false
    },
    router: L.Routing.valhalla('valhalla-obkccAI', 'pedestrian'),
    formatter: new L.Routing.Valhalla.Formatter()
  }).addTo(map);
  routeControl.RoutingErrorEvent;
};

var stnName = undefined;
function addOnClick(e) {
  lat = this.getLatLng().lat;
  lng = this.getLatLng().lng;
  console.log(lat, lng);
  removeRouting(e);
  if (map.hasLayer(bar)) {
    map.removeLayer(bar);
  };
  $.getJSON("https://darkvengers.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM liquor ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint(" + lng + "," + lat + "), 4326) LIMIT 20", function(data) {
    bar = L.geoJson(data, {
      onEachFeature: function(feature, layer) {
        layer.bindPopup('' + feature.properties.bus_prof_n + '');
        layer.on("click", removeRouting);
        layer.on("click", addRouting);
      },
      pointToLayer: function(feature, latlng) {
        return L.marker(latlng, {
          icon: L.AwesomeMarkers.icon({
            icon: 'fa-beer fa-2x',
            markerColor: 'orange',
            prefix: 'fa'
          }),
        });
      }
    }).addTo(map);
    map.fitBounds(bar.getBounds());
  })
};

//info box
var infoBox = L.control({
  position: 'topleft'
});

infoBox.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'infoBox');
  this.update();
  return this._div;
};

infoBox.update = function(props) {
  this._div.innerHTML = '<h1>Ride and Drink</h1><hr><p>Click on a station to find the nearest bars.<p>' + (props ?
    '<h1><b>' + props.name + '</b></h1>' : '');
};


infoBox.addTo(map);
//end info box
