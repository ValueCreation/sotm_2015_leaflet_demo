
	var map, basemapLayer, amenityLayer, amenityClusterLayer, amenityHeatmapLayer, circleLayer, marker;
	var enable_click, click_flg;
	var features = [];
    var circleMarkers = [];
    var sizuoka_osm_point_url = 'http://services.arcgis.com/wlVTGRSYTzAbjjiC/arcgis/rest/services/sizuoka_osm_point/FeatureServer/0';

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
	                layers: [basemapLayer, amenityLayer]
	              });
		
		map.setView([34.98, 138.38], 10);

		click_flg = false;

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


