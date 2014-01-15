// Init scrollers
(function(window, document){
  var scrollers = document.getElementsByClassName('scroller'),
    length = scrollers.length,
    i = 0;
  function makeScroller(scrollToPath) {
    return function(){
      var path = scrollToPath;
      scrollTo(window, document.getElementById(path).offsetTop, 1000);
      window.history.pushState({foo:'bar'}, ('Aislin ' + path), '/#' + path);
    };
  }
  for (; i < length; i++) {
    scrollers[i].onclick = makeScroller(scrollers[i].dataset.scrollTo);
  }
})(this, this.document);

// Custom ScrollTo
window.scrollTo = function(element, to, duration) {
  var start = element.scrollY,
      change = to - start,
      currentTime = 0,
      increment = 20;

  var animateScroll = function(){
    currentTime += increment;
    var val = Math.easeInOutQuad(currentTime, start, change, duration);
    element.scroll(0, val);
    if(currentTime < duration) {
      setTimeout(animateScroll, increment);
    }
  };
  animateScroll();
};
Math.easeInOutQuad = function (t, b, c, d) {
  t /= d/2;
  if (t < 1) return c/2*t*t + b;
  t--;
  return -c/2 * (t*(t-2) - 1) + b;
};