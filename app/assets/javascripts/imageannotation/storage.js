define(['imageannotation/config', 'imageannotation/events'], function(Config, Events) {
  
  var Storage = function(eventBroker) {
	  
    var STORE_URI = '/recogito/api/annotations',
        GDOC_ID = Config.gdoc_id,
        GDOC_PART_ID = Config.gdoc_part_id,
        
        /** Creates a new annotation via HTTP POST **/
        storeAnnotation = function(annotation) {
          annotation.gdoc_id = GDOC_ID;
    
          if (GDOC_PART_ID)
            annotation.gdoc_part_id = GDOC_PART_ID;
    
          $.ajax({
            url: STORE_URI,
            type: 'POST',
            data: JSON.stringify(annotation),
            contentType: 'application/json',
            success: function(response) {
              annotation.id = response.id;
              annotation.last_edit = response.last_edit;
            },
            error: function(response) {
			        eventBroker.fireEvent(Events.STORE_CREATE_ERROR, response);
			      }
          });
        },
        
        /** Updates an annotation via HTTP PUT **/
        updateAnnotation = function(a)  {
          var data = (Config.gdoc_part_id) ? 
                '{ "gdoc_part_d": ' + Config.gdoc_part_id + ', "corrected_toponym": "' + a.corrected_toponym  + '", "comment": "' + a.comment + '" }' :
                '{ "gdoc_id": ' + Config.gdoc_id + ', "corrected_toponym": "' + a.corrected_toponym + '", "comment": "' + a.comment + '" }';
                
          $.ajax({
            url: STORE_URI + '/' + a.id,
            type: 'PUT',
            data: data,
            contentType : 'application/json',
            error: function(response) {
			        eventBroker.fireEvent(Events.STORE_UPDATE_ERROR, response);
			      }
          });  
        },
        
        /** Deletes an annotation via HTTP DELETE **/
        deleteAnnotation = function(annotation) {
          $.ajax({
            url: STORE_URI + '/' + annotation.id,
            type: 'DELETE',
            error: function(response) { 
			        eventBroker.fireEvent(Events.STORE_DELETE_ERROR, response); 
			      }
          })
        },
        
        /** Loads all annotations from the server **/
        loadAll = function() {
          var params = (GDOC_PART_ID) ? '?gdocPart=' + GDOC_PART_ID : '?gdoc=' + GDOC_ID;
	        $.getJSON(STORE_URI + params, function(data) { eventBroker.fireEvent(Events.STORE_ANNOTATIONS_LOADED, data); });     
        };
        
    // Register handlers
    eventBroker.addHandler(Events.INITIALIZE, loadAll)
    eventBroker.addHandler(Events.ANNOTATION_CREATED, storeAnnotation);
    eventBroker.addHandler(Events.ANNOTATION_UPDATED, updateAnnotation);
    eventBroker.addHandler(Events.ANNOTATION_DELETED, deleteAnnotation);
  };
  
  return Storage;
  
});
