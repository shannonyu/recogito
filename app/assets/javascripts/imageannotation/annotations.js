define([], function() {
  
  var _annotations = [];
  
  var Annotations = function() { };
  
  Annotations.getRect = function(annotation) {     
    var geom = annotation.shapes[0].geometry,
        a = { x: geom.x, 
              y: geom.y },
        b = { x: a.x + Math.cos(geom.a) * geom.l,
              y: a.y - Math.sin(geom.a) * geom.l },
        c = { x: b.x - geom.h  * Math.sin(geom.a),
              y: b.y - geom.h * Math.cos(geom.a) },
        d = { x: a.x - geom.h * Math.sin(geom.a),
              y: a.y - geom.h * Math.cos(geom.a) };
        
    return [ a, b, c, d ];
  };    
  
  var _getBBox = function(rect) {
    return {
      top: Math.min(rect[0].y, rect[1].y, rect[2].y, rect[3].y),
      right: Math.max(rect[0].x, rect[1].x, rect[2].x, rect[3].x),
      bottom: Math.max(rect[0].y, rect[1].y, rect[2].y, rect[3].y),
      left: Math.min(rect[0].x, rect[1].x, rect[2].x, rect[3].x)
    }
  };
  
  var _intersects = function(x, y, rect) {
    var inside = false;
    var j = 3; // rect.length - 1 (but we know rect.length is always 4)
    for (var i=0; i<4; i++) {
      if ((rect[i].y > y) != (rect[j].y > y) && 
          (x < (rect[j].x - rect[i].x) * (y - rect[i].y) / (rect[j].y-rect[i].y) + rect[i].x)) {
        inside = !inside;
      }
      j = i;
    }
    return inside;
  };
  
  Annotations.prototype.getAll = function() {
    return _annotations;
  };
  
  Annotations.prototype.getAnnotationsAt = function(x, y) {
    // TODO optimize with a quadtree
    var hovered = [];
    jQuery.each(_annotations, function(idx, annotation) {
      var rect = Annotations.getRect(annotation);
      if(_intersects(x, y, rect))
        hovered.push(annotation);
    });
    return hovered;
  }
  
  Annotations.prototype.add = function(a) {
    if (jQuery.isArray(a))
      _annotations = jQuery.merge(_annotations, a);
    else
      _annotations.push(a);    
  };
  
  Annotations.prototype.remove = function(id) {
    _annotations = jQuery.grep(_annotations, function(a) {
      return a.id != id;
    });    
  };
    
  return Annotations;
  
});
