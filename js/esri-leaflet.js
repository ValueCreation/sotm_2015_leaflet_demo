
	var map, basemapLayer, amenityLayer, amenityClusterLayer, amenityHeatmapLayer;

    function init() {
	
		basemapLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		                                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		                   });

	    var sizuoka_osm_point_url = 'http://services.arcgis.com/wlVTGRSYTzAbjjiC/arcgis/rest/services/sizuoka_osm_point/FeatureServer/0';

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
					                  radius: 50
					              });

	    map = L.map('map', {
	                layers: [basemapLayer, amenityLayer]
	              });
		
		map.setView([34.98, 138.38], 10);

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

    $('#clustered').change(function() {
       if ($(this).is(':checked')) {
         map.addLayer(amenityClusterLayer);
       } else {
         map.removeLayer(amenityClusterLayer);
       }
    });

    $('#heatmap').change(function() {
       if ($(this).is(':checked')) {
         map.addLayer(amenityHeatmapLayer);
       } else {
         map.removeLayer(amenityHeatmapLayer);
       }
    });

