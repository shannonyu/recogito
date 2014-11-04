define(['georesolution/common', 'common/map'], function(common, MapBase) {
  
  var searchresults = {},
      searchresultsLayer;
  
  var DetailsMap = function(div, opt_basemap) {
    var self = this;
    
    MapBase.apply(this, arguments);
    
    searchresultsLayer = L.featureGroup();
    searchresultsLayer.addTo(this.map);
    
    $(div).on('click', '.gazetteer-id', function(e) {
      self.fireEvent('selectSearchresult', searchresults[e.target.href].result);
      return false;
    });
  }
  DetailsMap.prototype = Object.create(MapBase.prototype);
  
  DetailsMap.prototype.addSearchresult = function(result) {
    if (result.coordinate) {
      var marker = L.marker(result.coordinate);
      marker.bindPopup(
        '<strong>' + result.title + '</strong>' +
        '<br/>' +
        '<small>' + result.names.slice(0, 8).join(', ') + '</small>' +
        '<br/>' + 
        '<a href="' + result.uri + '" class="gazetteer-id" title="Click to confirm" onclick="return false;"><span class="icon">&#xf14a;</span> ' + common.Utils.formatGazetteerURI(result.uri)) + '</a>';
                
      marker.on('mouseover', function() { marker.openPopup(); });

      searchresults[result.uri] = { result: result, marker: marker };
      searchresultsLayer.addLayer(marker);
    }
  };
  
  DetailsMap.prototype.selectSearchresult = function(uri) {
    var result = searchresults[uri];
    if (result)
      result.marker.openPopup();
  }
  
  DetailsMap.prototype.fitToSearchresults = function() {
    var self = this,
        bounds,
        searchBounds = searchresultsLayer.getBounds(),
        annotationBounds = this.getAnnotationBounds();
    
    bounds = (searchBounds.isValid()) ? searchBounds : annotationBounds;
    if (annotationBounds.isValid())
      bounds.extend(annotationBounds);
      
    if (bounds)
      this.map.fitBounds(bounds, { maxZoom: self.getCurrentMinZoom() });
  };
  
  DetailsMap.prototype.clearSearchresults = function() {
    searchresultsLayer.clearLayers();
    this.fitToAnnotations();
  };
  
  DetailsMap.prototype.destroy = function() {
    searchresults = {};
    MapBase.prototype.destroy.call(this);
  };
  
  return DetailsMap;
    
});
