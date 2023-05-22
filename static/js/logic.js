// United States Geological Survey - USGS Earthquakes (last 7 days, all week)

// Store the API endpoint as query URL
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json (url).then(function(data) {
    console.log(data.features);

    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

// Function to determine marker size by magnitude
function markerSize(magnitude) {
    return magnitude * 35000;
};
  
// Function to determine marker color by depth
function markerColor(depth){
if (depth < 10) return "#FACC96";
    else if (depth < 30) return "#E6988C";
    else if (depth < 50) return "#D6818D";
    else if (depth < 70) return "#C16B8F";
    else if (depth < 90) return "#8B5B92";
    else return "#634E90";
};

// Define a function to create map feataures
function createFeatures(earthquakeData) {

    // Define a function that we want to run once for each feature in the features array.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr>\
                         <p>Date: ${new Date(feature.properties.time)}</p>\
                         <p>Magnitude: ${feature.properties.mag}</p>\
                         <p>Latitude: ${feature.geometry.coordinates[1]}</p>\
                         <p>Longitude: ${feature.geometry.coordinates[0]}</p>\
                         <p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    };

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,

        // Point to layer used to alter markers
        pointToLayer: function(feature, latlng) {

        // Style of markers
        let markers = {
          radius: markerSize(feature.properties.mag),
          fillColor: markerColor(feature.geometry.coordinates[2]),
          fillOpacity: 1,
          color: "black",
          stroke: true,
          weight: 0.5
        }
        return L.circle(latlng,markers);
      }

    });

    // Create map and add features
    createMap(earthquakes);
};

// Function to create the map
function createMap(earthquakes) {

    // Create street base layer
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create topo base layer
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }); 

    // Only one base layer can be shown at a time
    let baseMaps = {
        Street: street,
        Topography: topo
    };
  
    // Overlays that can be toggled on or off
    let overlayMaps = {
        Earthquakes: earthquakes
    };
  
    // Create a map object, and set the default layers
    let myMap = L.map("map", {
        center: [0, 0],
        zoom: 3,
        layers: [street, earthquakes]
    });
  
    // Create a legend
    let legend = L.control({position: 'bottomright'});
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend"),
        depth = [-10, 10, 30, 50, 70, 90];

        div.innerHTML += "<h3 style='text-align: center'>Depth</h3><hr>"

        for (var i = 0; i < depth.length; i++) {
            div.innerHTML +=
            '<i style="background:' + markerColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }

        return div;
    };

    // Pass our map layers into a layer control
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);
    legend.addTo(myMap)
};