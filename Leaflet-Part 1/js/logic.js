// Assign data source to a variable
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Assign coordinates an zoom to a variable
coords = [39.8283, -98.5795];
zoomLevel = 5;

//   Create function to create markers and popup
function onEachFeature(feature, marker) {
    marker.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.geometry.coordinates[2]}</p>`);
}

// Create function to associate marker size to magnitude. Multiply magnitude to make marker more visible
function getSize(mag) {
    let radius = mag*3;
    return radius;
}

// Create function to associate marker color to depth
function getColor(depth) {
    let color = "#00FF00";
    if(depth >= 90) {
        color = "#581845";
    }
    else if(depth >= 70) {
        color = "#900C3F";
    }
    else if(depth >= 50) {
        color = "#C70039";
    }
    else if(depth >= 30) {
        color = "#FF5733";
    }
    else if(depth >= 10) {
        color = "#FFC300";
    }
    return color
}

// Create the function that makes the geojson layer
function createFeatures(earthquakeData) {
    let earthquakes = L.geoJSON(earthquakeData, {
        // Change standard maker to a circle and set radius to magnitude and color to depth
        pointToLayer: function(feature, latlng) {
            return new L.CircleMarker(latlng, {
                radius: getSize(feature.properties.mag),
                color: getColor(feature.geometry.coordinates[2]),
                fillOpacity: 1,
                stroke: false
            });
        },
        onEachFeature: onEachFeature
    });
    createMap(earthquakes);
}

// Create the function that makes the map
function createMap(earthquakes) {
    let streetLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    );
    let myMap = L.map("map", {
        center: coords,
        zoom: zoomLevel,
        layers: [streetLayer, earthquakes]
    });
    // Set up the legend.
    let legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let limits = [-10, 10, 30, 50, 70, 90];

        let legendInfo = "<h4>Depth of <br>Earthquake</h4>";
        div.innerHTML = legendInfo;

        // loop through our depth intervals and generate a label with a colored square for each interval
        for (var i = 0; i < limits.length; i++) {
            div.innerHTML +=
                '<li style="background-color:' + getColor(limits[i] + 1) + '"></li> ' +
                limits[i] + (limits[i + 1] ? '&ndash;' + limits[i + 1] + '<br>' : '+');
        }
        return div;
    };

    // Adding the legend to the map
    legend.addTo(myMap);
}

// Use d3 to read the json data.
d3.json(url).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    console.log(data);
    createFeatures(data.features);
  });