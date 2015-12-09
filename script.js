//testing

var map = L.map('map').setView([39.739800, -104.911276], 11);

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
}).addTo(map);

var bar = null;

var bndStyle = {
  "color": "#b51010",
  "fillColor": "rgba(145, 13, 13, 0)",
  "weight": 5,
  "opacity": 0.5
};

var stationIcon = L.divIcon({
  className: 'fa-stationIcon',
  html: '<i class="fa fa-subway fa-2x"></i>',
  iconSize: [28, 33]
});

var barIcon = L.divIcon({
  className: 'fa-barIcon',
  html: '<i class="fa fa-beer fa-2x"></i>',
  iconSize: [28, 33]
});

stations = $.getJSON("https://darkvengers.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT s.* FROM stations as s, denver as d WHERE ST_Within(s.the_geom, d.the_geom)", function(data) {
  stations = L.geoJson(data, {
    onEachFeature: function(feature, layer) {
      layer.cartodb_id = feature.properties.cartodb_id;
      layer.bindPopup('' + feature.properties.name + '');
      layer.on("click", onClick);
    },
    pointToLayer: function(feature, latlng) {
      return L.marker(latlng, {
        icon: stationIcon
      });
    }
  }).addTo(map);
  map.fitBounds(stations.getBounds());
})

function onClick(e) {
  lat = this.getLatLng().lat;
  lng = this.getLatLng().lng;
  if (map.hasLayer(bar)) {
    map.removeLayer(bar);
  };
  $.getJSON("https://darkvengers.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM liquor ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint(" + lng + "," + lat + "), 4326) LIMIT 20", function(data) {
    bar = L.geoJson(data, {
      onEachFeature: function(feature, layer) {
        layer.bindPopup('' + feature.properties.bus_prof_n + '');
      },
      pointToLayer: function(feature, latlng) {
        return L.marker(latlng, {
          icon: barIcon
        });
      }
    }).addTo(map);
    map.fitBounds(bar.getBounds());
  })
}
