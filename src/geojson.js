GeoJSON = (function() {
    var GeoJSON = {};


    GeoJSON.attach = function(geojson, mapType, options) {

        if (mapType.toLowerCase() == "google") {
            attachGoogleMapsObjects(geojson, options);
        } else if (mapType.toLowerCase() == "svg") {
            drawSVGMap(geojson, options);
        }
    }




    var attachGoogleMapsObjects = function (geojson, options) {

        if ('map' in options) {
            options.markerOptions = options.markerOptions || {};
            options.markerOptions.map = options.map;

            options.polylineOptions = options.polylineOptions || {};
            options.polylineOptions.map = options.map;
        } else {
            console.err("No map attached");
            return
        }

        geojson.bounds = new google.maps.LatLngBounds();

        if (geojson.type == "FeatureCollection") {
            geojson.features.forEach(function (feature) {
                processFeature(feature, options);
                if ('marker' in feature) {
                    geojson.bounds.extend(feature.marker.getPosition());
                }
            })
        }

        function processFeature(feature, options) {
            var geometry = feature.geometry;
            switch (geometry.type) {
                case "Point":
                    var latlng = coordToLatLng(geometry.coordinates);

                    feature.marker = new google.maps.Marker($.extend(true, {}, options.markerOptions));
                    feature.marker.setPosition(latlng);


                    break;
                case "MultiPoint":
                    break;
                case "LineString":
                    var path = [];
                    geometry.coordinates.forEach(function (coord) {
                        path.push(coordToLatLng(coord));
                    })
                    feature.polyline = new google.maps.Polyline(options.polylineOptions);
                    feature.polyline.setPath(path);
                    break;
                case "MultiLineString":
                    break;
                case "Polygon":
                    break;
                case "GeometryCollection":
                    break;

            }

        }

        function coordToLatLng(coord) {
            // Reverse the order of coord
            return new google.maps.LatLng(coord[1], coord[0]);
        }
    }

    function drawSVGMap(data, options) {
        console.log(options)
        var width = $(window).width(),
            height = $(window).height();

        var projection = d3.geo.mercator()
            .scale(200)
            //.center([-96, 38.3])
            //.clipExtent([[-122,38],[96,40]])
            //.rotate(100)
            .translate([width / 2, height / 2]);

        var path = d3.geo.path()
            .projection(projection);

        var svg = d3.select(options.divId).append("svg")
            .attr("width", width)
            .attr("height", height);

        d3.json("http://data.hivetrix.com/world-50m.json", function (error, topo) {
            svg.insert("path", ".graticule")
                .datum(topojson.feature(topo, topo.objects.land))
                .attr("class", "land")
                .attr("d", path);

            svg.insert("path", ".graticule")
                .datum(topojson.mesh(topo, topo.objects.countries, function (a, b) {
                    return a !== b
                }))//&& !(a.id / 1000 ^ b.id / 1000); }))
                .attr("class", "county-boundary")
                .attr("d", path);

            drawRoutes(data.routes.features, svg, path);
            drawAirports(data.airports.features, svg, projection);
        });


        function drawRoutes(features, svg, path) {
            var routes = svg.append("g")
                .attr("class", "routes")
                .selectAll("path")
                .data(features)
                .enter().append("path")
                .attr("d", function (d) {
                    return path(d.geometry);
                })
        }

        function drawAirports(features, svg, projection) {
            var airports = svg.append("g")
                .attr("class", "airports")
                .selectAll("g")
                .data(features)
                .enter().append("g")
                .attr("class", "airport")
                .append("circle")
                .attr("transform", function (d) {
                    return "translate(" + projection(d.geometry.coordinates).join(",") + ")";
                })
                .attr("r", 5)

        }

    }

    return GeoJSON;
}())

