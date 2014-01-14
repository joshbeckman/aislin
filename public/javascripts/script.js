// Init scrollers
(function(window, document){
  var scrollers = document.getElementsByClassName('scroller'),
    length = scrollers.length,
    i = 0;
  function makeScroller() {
    return function(){
      var path = this.dataset.scrollTo;
      scrollTo(document.body, document.getElementById(path).offsetTop, 1000);
      window.history.pushState({foo:'bar'}, ('Aislin ' + path), '/#' + path);
    }
  }
  for (; i < length; i++) {
    scrollers[i].onclick = makeScroller();
  }
})(this, this.document);

// Custom ScrollTo
function scrollTo(element, to, duration) {
  var start = element.scrollTop,
      change = to - start,
      currentTime = 0,
      increment = 20;

  var animateScroll = function(){
    currentTime += increment;
    var val = Math.easeInOutQuad(currentTime, start, change, duration);
    element.scrollTop = val;
    if(currentTime < duration) {
      setTimeout(animateScroll, increment);
    }
  };
  animateScroll();
}
Math.easeInOutQuad = function (t, b, c, d) {
  t /= d/2;
  if (t < 1) return c/2*t*t + b;
  t--;
  return -c/2 * (t*(t-2) - 1) + b;
};