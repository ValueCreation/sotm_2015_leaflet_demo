
	var map, basemapLayer, amenityLayer, polygonLayer, amenityClusterLayer, amenityHeatmapLayer, circleLayer, marker, fire_stationLayer, fireStation_or_vendingMachineLayer;
	var enable_click, click_flg;
	var features = [];
    var circleMarkers = [];
    var sizuoka_osm_point_url = 'http://services.arcgis.com/wlVTGRSYTzAbjjiC/arcgis/rest/services/sizuoka_osm_point/FeatureServer/0';
    var sizuoka_osm_polygon_url = "http://services.arcgis.com/wlVTGRSYTzAbjjiC/arcgis/rest/services/sizuoka_osm_polygon/FeatureServer/0";
    var fire_station = "https://gist.githubusercontent.com/ValueCreation/7ed5633114f480acfc77/raw/2333735423107a4e19fdcdc7ac422f8417c0d2bc/fire_station.geojson";
    var fireStation_or_vendingMachine = "https://gist.githubusercontent.com/ValueCreation/d62a74e6a29f3b3fddb5/raw/29c8a5457b55d2c57c846217613df6e863801975/fireStation_or_vendingMachine.geojson";

    function init() {
	
		basemapLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		                                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		                   });

	    amenityLayer = L.esri.featureLayer({
	                                  url: sizuoka_osm_point_url,
	                                  where: "amenity = 'school'" 
	                       });

	    amenityLayer.bindPopup(function(features) {
	        return "Amenity: " + features.properties.amenity + "<br/>Name: " + features.properties.name;
	    });

	    polygonLayer = L.esri.featureLayer({
	                                  url: sizuoka_osm_polygon_url
	                       });

	    polygonLayer.bindPopup(function(features) {
	        return "Building: " + features.properties.building + "<br/>Name: " + features.properties.name;
	    });

	    // クラスター
		amenityClusterLayer = L.esri.clusteredFeatureLayer({
	                                  url: sizuoka_osm_point_url
	                              });

	    amenityClusterLayer.bindPopup(function(features) {
	        return "Amenity: " + features.properties.amenity + "<br/>Name: " + features.properties.name;
	    });

	    // ヒートマップ
	    amenityHeatmapLayer = L.esri.heatmapFeatureLayer({
					                  url: sizuoka_osm_point_url,
					                  radius: 40
					              });

	    map = L.map('map', {
	                layers: [basemapLayer]
	              });
		
		map.setView([34.700679, 137.732041], 15);
        
        // geojson の表示
		$.getJSON(fireStation_or_vendingMachine, function(data) {
            fireStation_or_vendingMachineLayer = L.geoJson(data, {
		        pointToLayer: function (feature, latlng) {
				        return L.circleMarker(latlng, {
					       radius: 8,
					       fillColor: getColor(feature.properties.amenity),
					       color: "#000",
					       weight: 1,
					       opacity: 1,
					       fillOpacity: 0.8
				        });
			        },
                   	onEachFeature: onEachFeature
            	});
            map.addLayer(fireStation_or_vendingMachineLayer);
        });
        
        $.getJSON(fire_station, function(data) {
            fire_stationLayer = L.geoJson(data, {
		        pointToLayer: function (feature, latlng) {
				        return L.circleMarker(latlng, {
					       radius: 8,
					       fillColor: getColor(feature.properties.amenity),
					       color: "#000",
					       weight: 1,
					       opacity: 1,
					       fillOpacity: 0.8
				        });
			        },
               	onEachFeature: onEachFeature
            });
            map.addLayer(fire_stationLayer);
        });
        
		click_flg = false;

	}

	function getColor(amenity) {
	    return amenity == "fire_station" ? '#DC143C' :
	           amenity == "vending_machine"  ? '#0000FF' :
	                      '#228b22';
	}

	function onEachFeature(feature, layer) {
        var popupContent = "Amenity: " + feature.properties.amenity + "<br/>Name: " + feature.properties.name;
		layer.bindPopup(popupContent);
	}

	function blockUI() {
	   
	   $.blockUI({
	           message: '<h3><img src="images/ajax-loader.gif" />Now Loading...</h3>',
	           css: {
	              border: 'none',
	              padding: '10px',
	              backgroundColor: '#333',
	              opacity: .5,
	              color: '#fff'
	           },
	           overlayCSS: {
	              backgroundColor: '#000',
	              opacity: 0.6	
	           }
	   });

	}

    // ベースマップ
	$("input:radio[name='optionsBasemap']").click(function() {
        if (basemapLayer) {
           map.removeLayer(basemapLayer);
        }   
	    if ($("#basemap1:checked").val()) {
	        basemapLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { 
	        	                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	        	           });
            map.addLayer(basemapLayer);
	    } else if ($("#basemap2:checked").val()) {
	        basemapLayer = L.tileLayer("http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", { 
	        	                "id": "gsi",
	                            "copyright": "国土地理院"
	                       });
            map.addLayer(basemapLayer);
	    } else if ($("#basemap3:checked").val()) {
	    	basemapLayer = L.esri.basemapLayer('Topographic');
            map.addLayer(basemapLayer);
	    } else if ($("#basemap4:checked").val()) {
	    	basemapLayer = L.esri.basemapLayer('Streets');
            map.addLayer(basemapLayer);
	    } else if ($("#basemap5:checked").val()) {
	    	basemapLayer = L.esri.basemapLayer('Imagery');
            map.addLayer(basemapLayer);
	    }
	});
    
    // レイヤーのON、OFF
    $('#amenity').change(function() {
       if ($(this).is(':checked')) {
         map.addLayer(amenityLayer);
       } else {
         map.removeLayer(amenityLayer);
       }
       polygonLayer
    });
    
    $('#building').change(function() {
       if ($(this).is(':checked')) {
         map.addLayer(polygonLayer);
       } else {
         map.removeLayer(polygonLayer);
       }
    });

    $('#fire_station').change(function() {
       if ($(this).is(':checked')) {
         map.addLayer(fire_stationLayer);
       } else {
         map.removeLayer(fire_stationLayer);
       }
    });

    $('#fireStation_or_vendingMachine').change(function() {
       if ($(this).is(':checked')) {
         map.addLayer(fireStation_or_vendingMachineLayer);
       } else {
         map.removeLayer(fireStation_or_vendingMachineLayer);
       }
    });

    // 検索
    $("#amenityBtn").click(function() {

        if ($('#amenity').is(':checked')) {
            // mask
            blockUI();
      	    if ($("#amenityName").val()) {
	            amenityLayer.setWhere('amenity=\'' + $("#select_amenity").val() + '\' and name LIKE\'%' + $("#amenityName").val() + '%\'',
	     	                              function() {
                                             $.unblockUI(); 
                                          }                                          
            	                      );
	        } else {
	     	    amenityLayer.setWhere('amenity=\'' + $("#select_amenity").val() + '\'', 
	     	                              function() { 
                                             $.unblockUI(); 
                                          }
                                      );
	        }
	    }
    });
    
    // クラスター
    $('#clustered').change(function() {
       if ($(this).is(':checked')) {
         map.addLayer(amenityClusterLayer);
       } else {
         map.removeLayer(amenityClusterLayer);
       }
    });
    
    // ヒートマップ
    $('#heatmap').change(function() {
       if ($(this).is(':checked')) {
         map.addLayer(amenityHeatmapLayer);
       } else {
         map.removeLayer(amenityHeatmapLayer);
       }
    });
    
    // エリア作成
    $("#areaBtn").click(function() {
         var radius = $("#radius").val() * 1000;
         if (marker) {
            var latlng = marker.getLatLng();
			if (circleLayer) {
			   map.removeLayer(circleLayer);
			}
			circleLayer = L.circle([latlng.lat, latlng.lng], radius, {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.3
			}).addTo(map);
         }
         /*
         amenityLayer.query()
		     .where('amenity=\'' + $("#select_amenity").val() + '\'')
		     .run(function(error, featureCollection){
					for (var i = 0; i < featureCollection.features.length; i++) {
						var x = featureCollection.features[i].geometry.coordinates[0];
						var y = featureCollection.features[i].geometry.coordinates[1];
						circleLayer = L.circle([y, x], radius, {
                             color: 'red',
                             fillColor: '#f03',
                             fillOpacity: 0.5
						}).addTo(map);
					}		 
		 });
         */
    });

    // クリックイベント　
    $("#pointBtn").click(function() {
        if (click_flg === false) {
            map.on('click', onClick);
    	    click_flg = true;
        } else if (click_flg === true) {
            map.off('click', onClick);
            click_flg = false;
        }
    });

    // 地点作成
    function onClick(e) {
    	if (marker) {
           map.removeLayer(marker);    	
		}
		var greenIcon = L.icon({
		    iconUrl: 'http://leafletjs.com/docs/images/leaf-green.png',
		    shadowUrl: 'http://leafletjs.com/docs/images/leaf-shadow.png',

		    iconSize:     [38, 95], // size of the icon
		    shadowSize:   [50, 64], // size of the shadow
		    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
		    shadowAnchor: [4, 62],  // the same for the shadow
		    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
		});
        marker = new L.Marker(e.latlng, {icon: greenIcon, draggable:true});
        map.addLayer(marker);

        map.off('click', onClick);
        click_flg = false;
    }

    // クリア
    $("#areaClearBtn").click(function() {
        if (circleLayer) {
          map.removeLayer(circleLayer);
        }
        if (marker) {
          map.removeLayer(marker);

        }
        if (circleMarkers.length > 0) {
	        for (var i = 0; i < circleMarkers.length; i++) {
	            map.removeLayer(circleMarkers[i]);
	        }
            $(".number_title").text("0");
    	}
    });
    
    // エリア内分析
    $("#areaAnalysisBtn").click(function() {
		var query = L.esri.Tasks.query({
		    url: sizuoka_osm_point_url
		});
        var radius = $("#radius").val() * 1000;
        if (marker) {
            // mask
            blockUI();
            var latlng = marker.getLatLng();
            if (circleMarkers.length > 0) {
		        for (var i = 0; i < circleMarkers.length; i++) {
		            map.removeLayer(circleMarkers[i]);
		        }
                circleMarkers = [];
        	}
            query.nearby(latlng, radius);
            query.run(function(error, featureCollection, response){
			    //console.log('Found ' + featureCollection.features.length + ' features');
				for (var i = 0; i < featureCollection.features.length; i++) {
					var x = featureCollection.features[i].geometry.coordinates[0];
					var y = featureCollection.features[i].geometry.coordinates[1];
					var latlng = L.latLng(y, x);
	                circleMarker = L.circleMarker(latlng, {
												color: '#22B14C',
												weight: 2,
												opacity: 0.85,
												fillOpacity: 0.5
				    }).bindPopup("Amenity: " + featureCollection.features[i].properties.amenity + "<br/>Name: " + featureCollection.features[i].properties.name);
                    circleMarkers.push(circleMarker);
                }
                for (var i = 0; i < circleMarkers.length; i++) {
                   map.addLayer(circleMarkers[i]);
                }
                $(".number_title").text(circleMarkers.length);
                $.unblockUI();
            });
		}

    });


