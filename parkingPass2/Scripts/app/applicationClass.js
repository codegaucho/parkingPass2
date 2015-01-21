/*
 * Tom Murphy
 *
 * 06/30/2014 - created
 *
 * the class representing the application
 *
 *
 * Requires:
 *  dojo (as this is a dojo object)
 *  
 *
 */
define(["dojo/_base/declare"], function (declare) {
    return declare(null, {

        constructor: function (isAdmin) {

            if (isAdmin) {
                
                //in the navigator, we have several hidden bits that need to be revealed to an admin
                require(["dojo/dom-class"], function (domClass) {
                    domClass.remove("navlist_item_Admin", "hide");
                    domClass.remove("navlist_item_ParkingTags", "hide");
                    domClass.remove("nav-tag-finder", "hide");
                });
            }

            //add page footer info if available
            this.addContactInfoToPageFooter();

            //add tag finder typeahead
            this.applySearchTypeahead(".tag-finder-typeahead");
        },
        
        strLeft: function (sourceStr, keyStr) {
            //@Left equivalent
            //Author: Phillip Roberts - phillroberts@yahoo.com
            //Released under GNU General Public License : http://www.gnu.org/copyleft/gpl.html
            return (sourceStr.indexOf(keyStr) == -1 | keyStr == '') ? '' : sourceStr.split(keyStr)[0];
        },


        /*
        createFlash: function (targetnode, flashClass, title, body) {
            //targetnode - where to put the alert
            //flashClass - the bootstrap alert class type (example "alert-warning")
            require(["dojo/dom-construct", "dojo/dom-class"], function (domConstruct, domClass) {
                var flash = domConstruct.create("div", null, targetnode, "last");
                domClass.add(flash, ["alert", "alert-dismissable", flashClass]);

                var opts = { "innerHTML": "x", "data-dismiss": "alert", "type": "button" };
                var node = domConstruct.create("button", opts, flash, "last");
                domClass.add(node, "close");

                if (title != null && title != "") {
                    domConstruct.create("h4", { innerHTML: title }, flash, "last");
                }

                domConstruct.create("p", { innerHTML: body }, flash, "last");

            });
        },
        */

        createFlash: function (targetnode, flash) {
            //different than the version we have been using as flash is an object.  Maps better to what we are passing in
            //targetnode - where to put the alert
            //flash.type - the bootstrap alert class type (example "alert-warning")
            var _obj = this;
            if (flash != null) {
                require(["dojo/dom-construct", "dojo/dom-class"], function (domConstruct, domClass) {
                    /*
                    var pos = "last";
                    if (flash.hasOwnProperty('pos')) {
                        pos = flash.pos;
                    }
                    */
                    var pos = (flash.hasOwnProperty('pos') ? flash.pos: "last")

                    var flashnode = domConstruct.create("div", null, targetnode, pos);

                    //test flash.type - if already has "alert-" prefix we are golden, if not, add the "alert-" prefix
                    if (_obj.strLeft(flash.flashClass, "-") != "alert") {
                        flash.flashClass = "alert-" + flash.flashClass;
                    }

                    domClass.add(flashnode, ["alert", "alert-dismissable", flash.flashClass]);

                    var opts = { "innerHTML": "x", "data-dismiss": "alert", "type": "button" };

                    var node = domConstruct.create("button", opts, flashnode, "last");
                    domClass.add(node, "close");

                    if (flash.hasOwnProperty('title')) {
                        domConstruct.create("h4", { innerHTML: flash.title }, flashnode, "last");
                    }

                    domConstruct.create("p", { innerHTML: flash.body }, flashnode, "last");

                });
            }
        },

        ticket_Bloodhound: function () {
            //build a bloodhound that lets us search tags for plate, name, license, ...
            var bh = new Bloodhound({
                datumTokenizer: function (d) {
                    //return Bloodhound.tokenizers.whitespace(d.name);
                    var tokenizeArray = [d.client, d.tagNumber, d.plates];
                    var tokenizeString = tokenizeArray.join(" ");
                    return Bloodhound.tokenizers.whitespace(tokenizeString);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                limit: 10,
                prefetch: {
                    url: dojoConfig.app.path + "Ticket/JSON",
                    //normally comment out cacheKey and let it use url - but we may be building more than one bloodhound based on this url
                    //cacheKey: "TicketBloodhoundPrefetch4",
                    //how long should we cache it for - default is 86400000 (1 day) - in development often useful to modify
                    //ttl: 86400000,
                    ajax: {
                        dataType: "json"
                    },
                    filter: function (list) {
                        return $.map(list, function (ticket) {
                            //we want to flatten things out
                            ticket.client = ticket.Client.DisplayName
                            //tag may be null - if so, give it bogus info
                            if (ticket.Tag == null) {
                                ticket.tagNumber = "unassigned";
                            } else {
                                ticket.tagNumber = ticket.Tag.Number;
                            }

                            var plateArray = [];
                            if (ticket.Vehicles.length > 0) {
                                ticket.Vehicles.forEach(function (vehicle) {
                                    plateArray.push(vehicle.Plate);
                                });

                                ticket.plates = plateArray.join(" ");
                                
                            } else {
                                ticket.plates = "no_plate";
                            }

                            return ticket;
                        });
                    }
                }
            });

            return bh;
        },

        applySearchTypeahead: function (selector) {
            //we are going to apply a typeahead to the search box to let them search on name, tag, license plate, ...
            //do we want to use multiple sources?  one for tags, one for plates, one for names?  prob more efficient to have a single source
            var _obj = this;
            require(["jquery", "r2/typeaheadClass", "hogan", "use!typeahead"], function ($, TypeaheadPrep, Hogan, Typeahead) {
                var tagsBH = _obj.ticket_Bloodhound();

                tagsBH.initialize();

                $(selector).typeahead({
                    hint: true,
                    highlight: true
                },
                {
                    name: 'tagsBH',
                    displayKey: 'client',
                    source: tagsBH.ttAdapter(),
                    templates: {
                        empty: [
                            '<div class="empty-message">',
                            'no parking tag found for this criteria',
                            '</div>'
                        ].join('\n'),
                        suggestion: function (e) {
                            var t = [
                                "<p>",
                                "{{client}}",
                                " ({{tagNumber}})",
                                " {{plates}}",
                                "</p>"
                            ].join('');

                            var tt = Hogan.compile(t);
                            return tt.render(e);
                        }
                    }
                }).on("typeahead:selected", function (event, suggestion, dataset) {
                    //open up the tag that we have found
                    //alert("plates = " + suggestion.plates);
                    var url = dojoConfig.app.path + "Ticket/Details/" + suggestion.Id;
                    window.location.href = url;
                    //_obj.populate(suggestion, dataset);
                }).on("typeahead:autocompleted", function (event, suggestion, dataset) {
                    //_obj.populate(suggestion, dataset);
                    var url = dojoConfig.app.path + "Ticket/Details/" + suggestion.Id;
                    window.location.href = url;
                });
            });
        },

        addContactInfoToPageFooter: function () {
            require(["dojo/request/xhr", "dojo/dom-construct", "parkingPass/connectr2", ], function (xhr, domConstruct, ConnectR2) {
                var cr2 = new ConnectR2();

                var url = dojoConfig.app.path + "Template/ByKeyAsJSON/Contact";
                xhr(url, {
                    handleAs: "json"
                }).then(function (data) {
                    //we have the contact doc as json, now stick this in
                    //From.Address and From.DisplayName

                    //instead of the mailto, replace this with a popup that gives various bits of info about the person - perhaps with an i circle
                    //var target = "mailto:" + data.From.Address + "?Subject=Re: " + window.location.href;
                    var title = "Contact " + data.From.DisplayName;
                    var inner = data.From.DisplayName + ", ";
                    //data-userinfo-dialog="jqueryUIDialog" data-userinfo-linkdisplay="clickable" data-userinfo-identifier="richardson.marva@epa.gov"  bootstrapModal
                    var e = domConstruct.create("a", { title: title, innerHTML: inner, "data-userinfo-dialog": "bootstrapModal", "data-userinfo-linkdisplay": "clickable", "data-userinfo-identifier": data.From.Address }, "page-footer-copy", "first");
                    cr2.processElement(e);
                    //domConstruct.create("a", { href: target, title: title, innerHTML: inner }, "page-footer-copy", "first");

                    //test out the i stuff
                    //domConstruct.create("a", {},"page-footer-copy", "first");
                    //<a class="glyphicon glyphicon-info-sign pointer" onclick="userInfoModal.displayUserInfo('@Html.DisplayFor(model => model.PCDC)');"></a>

                });
            });
        },


        addAdminNavigator: function () {
            alert("in applicationClass.addAdminNavigator - this should have been retired");
            //!!!!!!
            //we already have admin - just unhide
            //RETIRED

            //going to add a drop down for admin functions to navigator
            /*
            require(["dojo/dom-construct", "dojo/dom-class"], function (domConstruct, domClass) {
                var li = domConstruct.create("li", { id: "navlist_item_Admin" }, "navlist", "first");
                domClass.add(li, "dropdown");

                var a = domConstruct.create("a", { "data-toggle": "dropdown", "href": "#", "id": "adminNav", "innerHTML": "Admin" }, li, "last");

                var span = domConstruct.create("span", null, a, "last");
                domClass.add(span, "caret");

                var ul = domConstruct.create("ul", { "aria-labelledby": "adminNav" }, li, "last");
                domClass.add(ul, "dropdown-menu");

                li = domConstruct.create("li", null, ul, "last");
                a = domConstruct.create("a", { innerHTML: "Roles", href: dojoConfig.app.path + "Role" }, li, "last");

                li = domConstruct.create("li", null, ul, "last");
                a = domConstruct.create("a", { innerHTML: "Templates", href: dojoConfig.app.path + "Template" }, li, "last");

                li = domConstruct.create("li", null, ul, "last");
                a = domConstruct.create("a", { innerHTML: "Surveys", href: dojoConfig.app.path + "Survey" }, li, "last");

                li = domConstruct.create("li", null, ul, "last");
                domClass.add(li, "divider");

                li = domConstruct.create("li", null, ul, "last");
                a = domConstruct.create("a", { innerHTML: "Add Tag", href: dojoConfig.app.path + "Ticket/AdminCreate" }, li, "last");
            });
            */
        }

    });
});