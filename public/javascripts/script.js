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

// Init demo
(function(window, document){
  var btn = document.getElementById('demo-button');
  function makeDemoRun () {
    return function() {
      var input = document.getElementById('demo-input'),
          btn = document.getElementById('demo-button'),
          img = document.getElementById('demo-image'),
          elem = document.getElementById('demo-resp'),
          url = window.location.origin + '/id?i=' + input.value;
      img.src = input.value;
      elem.innerHTML = 'Running...';
      btn.innerHTML = 'Running...';
      request(url, function(err,data,xhr){
        handleDemoResponse(JSON.parse(data), elem);
        btn.innerHTML = 'Analyze Colors';
      })
    };
  }
  btn.onclick = makeDemoRun();
  function handleDemoResponse (data, elem) {
    if (data.query) {
      var length = data.colors.length,
        i = 0;
      elem.innerHTML = '<p>File size: <code>' + data.identity['Filesize'].toString() + '</code><br>Elapsed time: <code>' + data.query['elapsed time'].toString() + ' ms</code><br>Pixels per second: <code>' + data.identity['Pixels per second'].toString() + '</code><br>Date created: <code>' + data.identity.Properties['date:create'].toString() + '</code><br>Gamma: <code>' + (data.identity['Gamma'].toString() || '[stripped]') + '</code><br><em>...etc...</em></p>';
      for (; i < length; i++) {
        passColor(elem, data.colors[i].hex, (30 * i));
      }
    } else {
      html  = '<h3 class="error">Error:</h3>';
      html += '<code>' + data + '</code>';
      elem.innerHTML = html;
    }
    function passColor (elem, color, wait) {
      setTimeout(function(){elem.innerHTML += '<span class="demo-color" style="background-color:' + color + ';"></span>';}, wait);
    }
  }
  var demoUrls = document.getElementsByClassName('demo-url'),
    leng = demoUrls.length,
    i = 0;
  function makeDemoUrlListen (url) {
    return function(){
      document.getElementById('demo-input').value = url;
    };
  }
  for (; i < leng; i++) {
    demoUrls[i].onclick = makeDemoUrlListen(demoUrls[i].dataset.demoUrl);
  };
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
// Custom Request
var request = function(url,cb,method,post,contenttype){
var requestTimeout,xhr;
try{ xhr = new XMLHttpRequest(); }catch(e){
try{ xhr = new ActiveXObject("Msxml2.XMLHTTP"); }catch (error){
if(console)console.log("tinyxhr: XMLHttpRequest not supported");
return null;
}
}
requestTimeout = setTimeout(function() {xhr.abort(); cb(new Error("tinyxhr: aborted by a timeout"), "",xhr); }, 10000);
xhr.onreadystatechange = function(){
if (xhr.readyState != 4) return;
clearTimeout(requestTimeout);
cb(xhr.status != 200?new Error("tinyxhr: server respnse status is "+xhr.status):false, xhr.responseText,xhr);
};
xhr.open(method?method.toUpperCase():"GET", url, true);
if(!post){
xhr.send();
}else{
xhr.setRequestHeader('Content-type', contenttype?contenttype:'application/x-www-form-urlencoded');
xhr.send(post);
}
}