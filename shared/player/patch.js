let $ = require("jquery")
//window.$ = window.jQuery = require('https://code.jquery.com/jquery-3.3.1.slim.min.js');
$(document).ready(function(){
  $('#app').append(`<div id='ytdownloader'/>`);
  console.log("Code successsfuly injected");
  var bundle = document.createElement('script');
  bundle.setAttribute('src', 'http://127.0.0.1:3001/ytdownloader/dist/build.js');
  var fontawesome = document.createElement('link');
  fontawesome.setAttribute('href','https://use.fontawesome.com/releases/v5.3.1/css/all.css');
  fontawesome.setAttribute('rel','stylesheet');
  fontawesome.setAttribute('integrity','sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU');
  fontawesome.setAttribute('crossorigin','anonymous');

  var material = document.createElement('link');
  material.setAttribute('href','https://unpkg.com/vue-material@beta/dist/vue-material.min.css');
  material.setAttribute('rel','stylesheet');



  document.body.appendChild(bundle);
  document.head.appendChild(fontawesome);
  document.head.appendChild(material);
});
