/*
 * Tom Murphy
 *
 * 06/19/2014 - created wrapper and passed control to Daisy Tang
 *
 * Daisy Tang
 * 
 *
 *  GIS Data Navigator
 *  a dojo object defined to represent the data navigator portion of the application
 *
 *
 *
 */
define(["dojo/_base/declare"], function (declare) {
    return declare(null, {

        constructor: function (targetNode, lanid) {
            var _obj = this;
            alert("in the data navigator scripts constructor - yeah ha");

            _obj.someDataNavigatorMethod(targetNode);

            _obj.initiateDataNavigator(targetNode);

            //a flash message can be placed anywhere, but the design also has a "flash-placeholder" that can be used for standard flash messages
            _obj.createFlash("flash-placeholder", "alert-warning", "Here is a Flash", "hey, this is a flash", "first");
        },

        initiateDataNavigator: function(targetNode) {
            //here we are going to create a left pane and a right pane for use by the data navigator
            var _obj = this; 
            require(["dojo/dom-construct", "dojo/dom-class"], function (domConstruct, domClass) {
                var row = domConstruct.create("div", null, targetNode, "last");
                domClass.add(row, "row");

                var leftpane = domConstruct.create("div", null, row, "last");
                domClass.add(leftpane, "col-lg-4");
                //make a persistent connection to this

                var rightpane = domConstruct.create("div", null, row, "last");
                domClass.add(rightpane, "col-lg-8");

                //now fill left and right panes with whatever content they need
                //left pane needs to know about right pane, so pass this along
                _obj.buildDataNavigator(leftpane, rightpane);


            });
        },

        buildDataNavigator: function(leftpane, rightpane) {
            //we are going to build a data navigator in the left pane, and put the target in the right
            var _obj = this;
            //just as a goof, will stick a jumbotron in there - but daisy will replace this with the constructor for the actual navigator
            require(["dojo/dom-construct", "dojo/dom-class", "dojo/on"], function (domConstruct, domClass, on) {
                var jumbotron = domConstruct.create("div", null, leftpane, "last");
                domClass.add(jumbotron, "jumbotron");

                domConstruct.create("h1", {innerHTML: "Data Navigator"}, jumbotron, "last");
                domConstruct.create("p", {innerHTML: "The navigator will be built here, and will be beautiful"}, jumbotron, "last");

                //as a goof, will build a bootstrap button - but we could have also built a dojo button and not needed the "on"
                var button = domConstruct.create("button", {innerHTML: "Populate Right"}, jumbotron, "last");
                domClass.add(button, ["btn", "btn-primary", "btn-lg"]);

                //now hook up event
                on(button, "click", function() {
                    alert("button clicked");
                    jumbotron = domConstruct.create("div", null, rightpane, "last");
                    domClass.add(jumbotron, "jumbotron");

                    domConstruct.create("h1", {innerHTML: "Target"}, jumbotron, "last");
                    domConstruct.create("p", {innerHTML: "This will be the results side of things"}, jumbotron, "last");
				
                });
            });

        },

        someDataNavigatorMethod: function(targetNode) {
            alert("in someDataNavigatorMethod with a targetNode of " + targetNode);
        },

        createFlash: function (targetnode, flashClass, title, body, position) {
            //targetnode - where to put the alert
            //flashClass - the bootstrap alert class type (example "alert-warning")
            require(["dojo/dom-construct", "dojo/dom-class"], function (domConstruct, domClass) {
                var flash = domConstruct.create("div", null, targetnode, position);
                domClass.add(flash, ["alert", "alert-dismissable", flashClass]);

                var opts = { "innerHTML": "x", "data-dismiss": "alert", "type": "button" };
                var node = domConstruct.create("button", opts, flash, "last");
                domClass.add(node, "close");

                if (title != null && title != "") {
                    domConstruct.create("h4", { innerHTML: title }, flash, "last");
                }

                domConstruct.create("p", { innerHTML: body }, flash, "last");

            });
        }
        

    });
});
