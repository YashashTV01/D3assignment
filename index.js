// Define margin, height, and width for the SVG container

var height = 900;
var width = 900;

// Create an SVG container 
var svg = d3.select("#map")
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .append("g")
    .attr("id", "svg_id");

// Set up a geographical projection for the map
var projection = d3.geoNaturalEarth1()
    .translate([width / 2, height / 2])
    .scale(3000)
    .center([-5, 53]);

// Create a path generator using the projection
var path = d3.geoPath().projection(projection);

// Load the UK map data from a JSON file
d3.json('./uk.json', function (error, ukMapData) {
    if (error) throw error;

    // Append path elements for each country
    svg.selectAll(".country")
        .data(ukMapData.features)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", path)
        .append('title')
        .text(function (d) {
            return d.properties.name; 
        });

    // Load cities data after loading the map
    reloadData();
});

// Function to reload cities data
function reloadData() {
    // Get the number of cities from the input field
    var numberOfCities = document.getElementById('citiesNumber').value || 10;

    //This helps to  Fetch random cities data from the API 
    d3.json(`http://34.38.72.236/Circles/Towns/${numberOfCities}`, function (error, data) {
        if (error) throw error;

        // Clear existing map elements
        svg.selectAll(".towns").remove();
        svg.selectAll('.city_name').remove();

        // Draw city names first
        var radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(data, d => d.Population)])
            .range([0, 10]);

        // Append and update text elements for city names
        var cityNames = svg.selectAll('city_name')
            .data(data);

        cityNames.enter()
            .append('text')
            .merge(cityNames)
            .attr('class', 'city_name')
            .attr("x", function (d) {
                return projection([d.lng, d.lat])[0];
            })
            .attr("y", function (d) {
                return projection([d.lng, d.lat])[1];
            })
            .text(function (d) {
                return d.Town;
            })
            .attr('dx', '15')
            .attr('dy', '10');

        cityNames.exit().remove();

        // Append and update circle elements for each town
        var towns = svg.selectAll('.towns')
            .data(data);

        towns.enter()
            .append('circle')
            .merge(towns)
            .attr("class", "towns")
            .attr("cx", function (d) {
                return projection([d.lng, d.lat])[0];
            })
            .attr("cy", function (d) {
                return projection([d.lng, d.lat])[1];
            })
            .attr("r", function (d) {
                return radiusScale(d.Population);
            })
            .on('mouseover', function (d) {
                showTownDetailsTooltip(d);
            })
            .on('mouseout', function () {
                hideTownDetailsTooltip();
            });

        towns.exit().remove();
    });
}

// This function will help to display town details in a tooltip on mouseover
function showTownDetailsTooltip(town) {
    d3.select("#townDetailsTooltip")
        .style("display", "block")
        .html(`
            <strong>${town.Town}</strong><br>
            County: ${town.County}<br>
            Population: ${town.Population}<br>
            Longitude: ${town.lng.toFixed(2)}<br>
            Latitude: ${town.lat.toFixed(2)}
        `)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 15) + "px");
}

// This function will help to hide the town details tooltip on mouseout
function hideTownDetailsTooltip() {
    d3.select("#townDetailsTooltip")
        .style("display", "none");
}
// This function is helping to update the number of cities based on the given slider value
function updateCitiesNumber() {
    var sliderValue = document.getElementById('citiesNumberSlider').value;
    document.getElementById('citiesNumber').value = sliderValue;
    reloadData();
}
