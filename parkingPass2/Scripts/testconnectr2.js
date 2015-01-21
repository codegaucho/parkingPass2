requirejs.config({
    paths: {
        "bootstrap": "//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min",
        "domReady": "//cdnjs.cloudflare.com/ajax/libs/require-domReady/2.0.1/domReady.min",
        jquery: "//code.jquery.com/jquery-1.11.1.min",
        connectr2: "http://x0202tnythnetpd.aa.ad.epa.gov/common/connectr2/connectr2"
    }
});

//in this example I only need jquery so I can load bootstrap
//and I only need bootstrap so that I can demo the bootstrap modal
////maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js
//if a particular application is not using the bootstrap modal, we don't need to load bootstrap (bootstrap is not yet AMD)
//require(['connectr2', 'jquery', 'bootstrap', 'domReady!'], function (ConnectR2, $) {
alert("here");
require(['connectr2', 'jquery', 'bootstrap', 'domReady!'], function (ConnectR2, $) {
    ConnectR2.processSelector();
})



