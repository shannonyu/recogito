define(['common/hasEvents'], function(HasEvents) {
          
  var element,
      
      /** List of supported gazetteers **/
      KnownGazetteers = {
        'http://pleiades.stoa.org' : 'Pleiades',
        'http://data.pastplace.org' : 'PastPlace',
        'http://www.imperium.ahlfeldt.se': 'DARE'
      },
      
      /** Helper function that groups search results by gazetteers **/
      groupByGazetteer = function(results) {
        var allGrouped = {};
        
        jQuery.each(results, function(idx, result) {
          var gazetteer = KnownGazetteers[result.uri.substr(0, result.uri.indexOf('/', 7))],
              key = (gazetteer) ? gazetteer : 'Other', 
              group = allGrouped[key];
          
          if (group)
            group.push(result);
          else
            allGrouped[key] = [result];
        });     
        
        return allGrouped
      };
  
  /** An overlay component for the details map to filter search results **/
  var SearchresultsFilter = function(el) {
    HasEvents.apply(this, arguments);   
    
    el.dblclick(function(e) { e.stopPropagation(); })
    el.hide();
    element = el;
  };
  SearchresultsFilter.prototype = Object.create(HasEvents.prototype);
  
  SearchresultsFilter.prototype.show = function(response) {
    var grouped = groupByGazetteer(response.results),
        html = response.results.length + ' Results for <em>' + response.query + '</em>';
    
    html += '<ul>';
    for (gazetteer in grouped) {
      html += '<li><input type="checkbox" value="' + gazetteer + '" checked="true">' + grouped[gazetteer].length + ' ' + gazetteer + '</li>';
    }
    html += '</ul>';
    
    element.html(html);
    element.show();
  };
  
  return SearchresultsFilter;
  
});
