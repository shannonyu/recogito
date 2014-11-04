define(['georesolution/common', 'georesolution/details/detailsMap', 'georesolution/details/searchresultsFilter'], function(common, Map, FilterOverlay) {
  
  var DetailsView = function(eventBroker) {
    var map,
        element = jQuery(
          '<div id="annotation-details">' +
          '  <div id="clicktrap">' +
          '    <div id="details-popup">' +
          '      <div class="header">' +
          '        »<span class="toponym"></span>«' +
          '        <span class="header-icons">' + 
          '          <a class="skip-prev icon" title="Skip to Previous Annotation">&#xf0d9;</a>' + 
          '          <a class="skip-next icon" title="Skipt to Next Annotation">&#xf0da;</a>' +
          '          <a class="exit icon" title="Close">&#xf00d;</a>' + 
          '        </span>' +
          '      </div> <!-- header -->' +
          
          '      <div class="body">' +
          '        <div class="controls">' +
          '          <div class="statusbar">' +
          '            <div class="status verified" title="Verified"><span class="icon">&#xf14a;</span></div>' +        
          '            <div class="status not-verified" title="Not Verified"><span class="icon">&#xf059;</span></div>' +     
          '            <div class="status false-detection" title="False Detection"><span class="icon">&#xf057;</span></div>' +   
          '            <div class="status ignore" title="Ignore this toponym"><span class="icon">&#xf05e;</span></div>' + 
          '            <div class="status no-suitable-match" title="No suitable gazetteer match available"><span class="icon">&#xf024;</span></div>' + 
          '            <div class="status ambiguous" title="Multiple possible gazetteer matches available"><span class="icon">&#xf024;</span></div>' + 
          '            <div class="status multiple" title="Toponym refers to multiple places"><span class="icon">&#xf024;</span></div>' + 
          '            <div class="status not-identifyable" title="Not Identifiable"><span class="icon">&#xf024;</span></div>' + 
          '          </div>' +
          '        </div>' +
          
          '        <div id="details-map">' +
          '          <div id="details-search">' +
          '            <input><span class="icon">&#xf002;</span>' + 
          '          </div>' +
          '          <div id="results-filter">' +
          '          </div>' +
          '        </div>' +
          '      </div> <!-- body -->' +
          '    </div>' +
          '  </div>' +
          '</div>'
        ),
        
        /** Event map **/
        Events = eventBroker.events,
        
        /** DOM element shorthands **/
        toponym = element.find('.toponym'),
        btnExit = element.find('.header-icons .exit'),
        searchContainer = element.find('#details-search'),
        searchInput = element.find('.body input'),
        
        /** The search results filter map overlay **/
        filterOverlay = new FilterOverlay(element.find('#results-filter')),
        
        /** Shorthand **/
        stopPropagation = function(e) { e.stopPropagation() },
    
        /** Open the details view with a new annotation **/
        show = function(annotation, previous, next, opt_basemap) {
          window.location.hash = annotation.id;
          toponym.html(annotation.toponym);
          element.show();
          map.refresh();
          map.addAnnotation(annotation);
          map.addSequence(annotation, previous, next);
          searchInput.focus();
        },
        
        /** Close the details view **/
        hide = function() {
          window.location.hash = '';
          map.clearSearchresults();
          element.hide();          
        },
        
        /** Gazetteer search **/
        search = function(query) {
          map.clearSearchresults();
          jQuery.getJSON('api/search/place?query=' + query, function(response) {
            filterOverlay.show(response);
            jQuery.each(response.results, function(idx, result) {
              map.addSearchresult(result);
            });
          });
        };
    
    /** UI events **/
    searchInput.keypress(function(e) {
      if (e.which == 13)
        search(e.target.value.toLowerCase());
    });
    
    
    searchContainer.dblclick(stopPropagation);
    searchContainer.mousemove(stopPropagation);
    
    /** Lifecycle events **/
    eventBroker.addHandler(Events.SHOW_ANNOTATION_DETAILS, function(e) { show(e.annotation, e.previous, e.next, e.basemap); });
    btnExit.click(hide);
    
    /** Add to DOM **/        
    element.hide();
    jQuery(document.body).append(element);    
    map = new Map(document.getElementById('details-map'));
  };
  
  return DetailsView;
  
});
