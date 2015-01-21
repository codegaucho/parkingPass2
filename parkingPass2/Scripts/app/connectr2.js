/*
 * Tom Murphy
 *
 * 10/14/2014 - created
 *
 * This class will provide a mechanism for displaying user info
 * options will be given to allow bootstrap, jquery, dojo, and other dialog types
 * use with 
        * require js
        * dojo
        * ... (loads of amd loaders out there)
 *
 *
 *  Requires:
 *      jquery - could have used dojo or whatever, but more of our applications already have jquery loaded.  We could have used require to load it as needed, but assuming it is already loaded through a standard script tag.
 *        NOTE - use jQuery 1.11 or better - before that not all were amd compatible      
 *
 *      hogan - needs to be listed in your dojoConfig (if using dojo), or in your require.config (if using requirejs), or wherever appropriate if using a different amd loader
 *      xstyle - a css loaded.  needs to be listed in your dojoConfig or require.config.
 *      text - require-text = a require plugin for loading text resources.  could have used dojo/text, but wanted to make this as generic as possible
 *
 *  Specific Pre-requisites:
 *       Bootstrap:  If using the bootstrap modal, we are going to need to load bootstrap's js and css file
 *       Dojo: If using the dojo dialog, we are going to need to load dojo and the css needed for the dialog.  Also a theme must be specified in some wrapper (usually body)
 *
 */

/*
//Author: Phillip Roberts - phillroberts@yahoo.com
//Released under GNU General Public License : http://www.gnu.org/copyleft/gpl.html


//@Left equivalent
function strLeft(sourceStr, keyStr){
return (sourceStr.indexOf(keyStr) == -1 | keyStr=='') ? '' : sourceStr.split(keyStr)[0];
}

//@Right equivalent
function strRight(sourceStr, keyStr){
idx = sourceStr.indexOf(keyStr);
return (idx == -1 | keyStr=='') ? '' : sourceStr.substr(idx+ keyStr.length);
}

//@RightBack equivalent
function rightBack(sourceStr, keyStr){
arr = sourceStr.split(keyStr);
return (sourceStr.indexOf(keyStr) == -1 | keyStr=='') ? '' : arr.pop()
}

//@LeftBack equivalent
function leftBack(sourceStr, keyStr){
arr = sourceStr.split(keyStr)
arr.pop();
return (keyStr==null | keyStr=='') ? '' : arr.join(keyStr)
}

//@Middle equivalent
function middle(sourceStr, keyStrLeft, keyStrRight){
return strLeft(strRight(sourceStr,keyStrLeft), keyStrRight);
} 
*/
define(["dojo/_base/declare"], function (declare) {
    return declare(null, {
        //we are keeping a hash of all users, so we don't request info for the same user more than once
        userHash: {},

        //the inner template.  We will build as part of the constructor 
        userTemplate_compiled: null,

        atLeft: function (sourceStr, keyStr) {
            return (sourceStr.indexOf(keyStr) == -1 | keyStr == '') ? '' : sourceStr.split(keyStr)[0];
        },

        atRight: function (sourceStr, keyStr) {
            idx = sourceStr.indexOf(keyStr);
            return (idx == -1 | keyStr == '') ? '' : sourceStr.substr(idx + keyStr.length);
        },

        constructor: function () {
            //compile template - we are going to need no matter what comes next
            var _obj = this;
            /*
            //we can complile now, or later
            require(["hogan", "text!/Content/userinfo.html"], function (Hogan, template) {
                _obj.userTemplate_compiled = Hogan.compile(template);
            });
            */
            require(['xstyle/css!/Content/test'], function () {
                //note by putting the require to css here in the constructor,
                //the css may not be loaded when needed
                //for this application, it is sufficient where the dialogs are user triggered, there is no rush, so this is fine
                //but for other applications, this may not be the case, and in those cases you want to wrap your builder with the xstyle require
                //benefit of doing it this way, if css fails to load, everything proceeds on
            });
        },

        addUserToHash: function (identifier, modaltype, theme) {
            //given a user, and a user type, will fetch their info from active directory, add them to our hash, and then trigger our modal (depending on type)
            var _obj = this;
            //can be called with one parameter or two.  If one is given, assumes it is a ename
            //given a users lanid or upn, will get their info from Active Directory
            //identifier will be the identifier - either the lanid or the upn

            //modaltype will tell us what we are doing with this once fetched

            var jsonpurl = "https://x0202tnythnetpd.aa.ad.epa.gov/adservice/api/users/ADUser/" + identifier + "?callback=?";

            $.getJSON(jsonpurl, function (json) {
                //first thing set hash - we don't care what type it is
                _obj.userHash[identifier] = json;

                //now display the info
                //userInfoModal.replaceDataAndDisplayModal(json);
                switch (modaltype) {
                    case "bootstrapModal":
                        _obj.displayUserModal_Bootstrap(identifier);
                        break;
                    case "dojoDialog":
                        _obj.displayUser_DojoDialog(identifier);
                        break;
                    case "jqueryUIDialog":
                        _obj.displayUser_JQueryUIDialog(identifier, theme);
                        break;
                    case "raw":
                        alert("raw");
                        break;
                }
            });
        },

        // **********************************************************
        // ***   Bootstrap specific bits
        // ***
        // *** NOTE: template for the Bootstrap Modal is kept in a html file at  Content/bootstrapModal.html
        // **********************************************************

        displayUserModal_Bootstrap: function (identifier) {
            //identifier - users lanid or upn
            //will pop up a Bootstrap modal with this users info inside
            var _obj = this;

            //first see if we already have info on this user
            if (_obj.userHash.hasOwnProperty(identifier)) {
                //we have info on this user, see if a modal already exists
                if (_obj.bootstrapModal_created) {
                    _obj.showBootstrapModal(_obj.userHash[identifier]);
                } else {
                    _obj.createBootstrapModal(_obj.userHash[identifier]);
                }
            } else {
                //no info on this user - go get some
                _obj.addUserToHash(identifier, "bootstrapModal")
            }
        },

        bootstrapModal_created: false,
        createBootstrapModal: function (userjson) {
            var _obj = this;
            //note - for those using dojo as a loader, we could have just used dojo/text, but wanted to make this generic
            //require(["dojo/text!/Content/bootstrapModal.html?4"], function (template) {
            require(["text!/Content/bootstrapModal.html"], function (template) {
                //we don't need a real template for the modal, so just inject it.
                //but perhaps we should compile it to give the bootstrapModal a unique identifier or allow us to add other things?
                $("body").append(template);
                _obj.bootstrapModal_created = true;

                //here we need to hook up the typeahead box to allow them to lookup the info on a different user

                //now render the template into the modal div
                _obj.showBootstrapModal(userjson);
            });
            /*
            var _obj = this;
            //we don't need a real template for the modal, so just inject it.
            //but perhaps we should compile it to give the bootstrapModal a unique identifier?
            $("body").append(_obj.buildBootstrapModalTemplate());
            _obj.bootstrapModal_created = true;

            //here we need to hook up the typeahead box to allow them to lookup the info on a different user

            //now render the template into the modal div
            _obj.showBootstrapModal(userjson);
            */
        },

        showBootstrapModal: function (userjson) {
            var _obj = this;
            //require(["text!/Content/bootstrapModal.html?4"], function (template) {
            require(["hogan", "text!/Content/userinfo.html"], function (Hogan, template) {
                if (_obj.userTemplate_compiled == null) {
                    //must be first time - compile template
                    _obj.userTemplate_compiled = Hogan.compile(template);
                }

                var userHTML = _obj.userTemplate_compiled.render(userjson);

                //now stick in the modal
                //these should NOT use specific ids, instead they should use classes inside the modal #userModal.modal-body, #userModal.modal-title
                $("#userModalTitle").html("User Info: " + userjson.cn);
                $("#userModalBody").html(userHTML);

                //and change the class on the modal so it is visible
                //should be the unique id we create when we render the template
                $('#userModal').modal('show');

                //here we need to make the supervisor name clickable
                _obj.processSelector(".userInfoDialog_childModal", "bootstrapModal");

            });
        },

        // **********************************************************
        // ***   Dojo Dialog specific bits
        // **********************************************************

        dojoDialog: null,

        displayUser_DojoDialog: function (identifier) {
            //identifier - users lanid or upn
            //will pop up a Dojo Dialog with this users info inside
            var _obj = this;

            //first see if we already have info on this user
            if (_obj.userHash.hasOwnProperty(identifier)) {
                //we have info on this user, see if a modal already exists
                if (_obj.dojoDialog == null) {
                    _obj.createDojoDialog(_obj.userHash[identifier]);
                } else {
                    _obj.showDojoDialog(_obj.userHash[identifier]);
                }
            } else {
                //no info on this user - go get some
                _obj.addUserToHash(identifier, "dojoDialog")
            }
        },

        createDojoDialog: function (userjson) {
            var _obj = this;
            require(["dijit/Dialog"], function (Dialog) {
                _obj.dojoDialog = new Dialog({
                    title: "User Information: " + userjson.displayName,
                    //content: _obj.userTemplate_compiled.render(userjson),
                    content: "getting user info",
                    style: "width: 600px"
                });

                _obj.showDojoDialog(userjson);
            });
        },

        showDojoDialog: function (userjson) {
            var _obj = this;

            require(["hogan", "text!/Content/userinfo.html"], function (Hogan, template) {
                if (_obj.userTemplate_compiled == null) {
                    //must be first time - compile template
                    _obj.userTemplate_compiled = Hogan.compile(template);
                }

                var userHTML = _obj.userTemplate_compiled.render(userjson);

                _obj.dojoDialog.set("title", "User Information: " + userjson.displayName)
                _obj.dojoDialog.set("content", userHTML)
                _obj.dojoDialog.show();
            });
        },


        // **********************************************************
        // ***   JQueryUI Dialog specific bits
        // **********************************************************

        jqueryUIDialog_created: false,

        displayUser_JQueryUIDialog: function (identifier, theme) {
            //identifier - users lanid or upn
            //will pop up a JQueryUIDialog with this users info inside
            var _obj = this;

            //first see if we already have info on this user
            if (_obj.userHash.hasOwnProperty(identifier)) {
                //we have info on this user, see if a modal already exists
                if (_obj.jqueryUIDialog_created) {
                    _obj.showJQueryUIDialog(_obj.userHash[identifier]);
                } else {
                    _obj.createJQueryUIDialog(_obj.userHash[identifier], theme);
                }
            } else {
                //no info on this user - go get some
                _obj.addUserToHash(identifier, "jqueryUIDialog", theme);
            }
        },

        createJQueryUIDialog: function (userjson, theme) {
            //NOTE:  use of jquery UI requires a theme stylesheet - 
            // the page builder may have already loaded it, in which case we don't need to pass a theme
            // or they could have passed in a theme, in which case we should load it now.we could load it here
            var _obj = this;
            //ideally we would have jquery-ui stored with the dialog in its own file - and we would ask for this using "jquery-ui/dialog
            //as I currently have it pointing at the cdn which is one file, we specify it this way
            var requireArray = ["jquery", "jquery-ui"];
            if (theme != undefined) {
                //a theme is being passed in, go ahead and load it up
                //themes include
                // black-tie blitzer cupertino dark-hive dot-luv eggplant excite-bike flick hot-sneaks 
                //humanity le-frog mint-choc overcast pepper-grinder redmond smoothness south-street start sunny swanky-purse trontastic ui-darkness ui-lightness vader
                var cssurl = "xstyle/css!//code.jquery.com/ui/1.11.2/themes/" + theme + "/jquery-ui.css";
                requireArray.push(cssurl);
            }

            require(requireArray, function ($) {
                $("body").append('<div id="userInfoJQueryUIDialog" title="User Information"><p id="userInfoJQueryUIDialog_body">some such stuff</p></div>');
                $("#userInfoJQueryUIDialog").dialog({
                    autoOpen: false,
                    modal: true,
                    minWidth: 600
                });
                _obj.jqueryUIDialog_created = true;

                //now render the template into the modal div
                _obj.showJQueryUIDialog(userjson);
            });

        },

        showJQueryUIDialog: function (userjson) {
            var _obj = this;
            //compiling and rendering the template requires Hogan
            require(["hogan", "text!/Content/userinfo.html", "jquery", "jquery-ui"], function (Hogan, template, $) {
                if (_obj.userTemplate_compiled == null) {
                    //must be first time - compile template
                    _obj.userTemplate_compiled = Hogan.compile(template);
                }

                var userHTML = _obj.userTemplate_compiled.render(userjson);

                $("#userInfoJQueryUIDialog_body").html(userHTML);

                $("#userInfoJQueryUIDialog").dialog("open");
                

            });
        },


        // **********************************************************
        // ***   The portion that processes the document and turns the tags into links or adds buttons
        // **********************************************************
        processSelector: function (selector, modalType) {
            //selector - a selector to find all the elements that we may want to make active for connectR2 dialogs
            //modalType - normally we don't provide this, but if we do, we will not bother checking for the data-userinfo-identifier field - usually used for child modals
            selector = (selector == undefined) ? "[data-userinfo-identifier]" : selector + "[data-userinfo-identifier]";
            //<p data-userinfo-display="bootstrapModal" data-userinfo-type="image" data-upn="richardson.marva@epa.gov">Marva Richardson</p>
            //to identify user name, use data-upn OR data-lanid as attributes
            //to control the display of the link on the page, use data-userinfo-linkdisplay = "clickable", "image" (may add others).  If left blank, default is image
            //to control the image displayed (if using data-userinfo-type=image) use data-userinfo-img="http://icons.iconarchive.com/icons/visualpharm/must-have/16/Information-icon.png"
            //to control the type of dialog, use data-userinfo-dialog="bootstrapModal", "dojoDialog", jqueryDialog" ...
            //to control who's info will be displayed, use data-userinfo-identifier
            //will search the document for those elements where we have used custom data attributes
            var _obj = this;
            $(selector).each(function (index, element) {
                _obj.processElement(element, modalType);
                
            });
        },

        processElement: function (element, modalType) {
            var _obj = this;
            //get identifier but remove all leading and trailing spaces
            var identifier = $(element).attr("data-userinfo-identifier").trim();

            //get link display type
            var linkDisplay = $(element).attr("data-userinfo-linkdisplay");
            linkDisplay = (linkDisplay == undefined) ? "image" : linkDisplay;

            //get modalType - used on selector of for each, so must be there
            //in some cases (child modals, for instance), we don't care if the element specifies a modalType - we are going to use a specified type
            modalType = (modalType == undefined) ? $(element).attr("data-userinfo-dialog") : modalType;

            //get theme - used on jqueryui stuff
            //default to redmond if none exist
            // black-tie blitzer cupertino dark-hive dot-luv eggplant excite-bike flick hot-sneaks humanity le-frog mint-choc overcast 
            // pepper-grinder redmond smoothness south-street start sunny swanky-purse trontastic ui-darkness ui-lightness vader
            var theme = $(element).attr("data-userinfo-theme");
            theme = (theme == undefined) ? "redmond" : theme;

            if (linkDisplay == "clickable") {
                $(element).click(function () {
                    _obj.userInfoClickHandler(modalType, identifier, theme);
                });
            } else {
                //must be an image link
                var imgurl = $(element).attr("data-userinfo-img");
                //give it a default image if none defined
                imgurl = (imgurl == undefined) ? "http://png-2.findicons.com/files/icons/1254/flurry_system/16/get_info.png" : imgurl;

                var clkImg = $('<img class="userInfoIcon">');
                clkImg.attr("src", imgurl);
                clkImg.click(function () {
                    _obj.userInfoClickHandler(modalType, identifier, theme);
                });

                clkImg.appendTo(element);
            }
        },

        userInfoClickHandler: function (modalType, identifier, theme) {
            var _obj = this;
            switch (modalType) {
                case "bootstrapModal":
                    _obj.displayUserModal_Bootstrap(identifier);
                    break;
                case "dojoDialog":
                    _obj.displayUser_DojoDialog(identifier);
                    break;
                case "jqueryUIDialog":
                    _obj.displayUser_JQueryUIDialog(identifier, theme);
                    break;
                case "raw":
                    alert("raw");
                    break;
            }
        }


    });
});
