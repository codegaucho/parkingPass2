/*
 * Tom Murphy
 *
 * 06/30/2014 - created
 * 07/02/2014 - added disclaimer fetch for selfCreate
 *
 * the class defined whenever we are working with things in the template controller
 *
 *
 * Requires:
 *  dojo (duh, as this is a dojo object)
 *  
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
        _widget: null,

        constructor: function () {
            //are we doing anything in the constructor?
            _widget = this;
        },

        personnelTypeHash: {
            "1": "Employee",
            "2": "Intern",
            "3": "Employee - nonR2",
            "4": "Voluneer",
            "5": "SEE",
            "6": "SEE - nonR2",
            "7": "Grantee",
            "8": "Grantee - nonR2",
            "9": "Other Fed Agency",
            "10": "International Visitor",
            "11": "Contractor",
            "12": "Contractor - nonR2",
            "13": "Contractor - Physical Access Only",
            "99": "Unknown"
        },

        strLeft: function (sourceStr, keyStr){
            return (sourceStr.indexOf(keyStr) == -1 | keyStr=='') ? '' : sourceStr.split(keyStr)[0];
        },

        strRight: function (sourceStr, keyStr){
            idx = sourceStr.indexOf(keyStr);
            return (idx == -1 | keyStr=='') ? '' : sourceStr.substr(idx+ keyStr.length);
        },

        createFlash: function (title, body, flashClass, targetnode, position) {
            //we are retiring this in lieu of the app.createFlash, which takes an object
            //flashClass - the bootstrap alert class type (example "alert-warning")
            //targetnode - where to put the alert - use "flash-placeholder" if in doubt
            //position - usually "first" or "last"  default is "last"
            flashClass = (flashClass == null) ? "alert-info" : flashClass;
            targetnode = (targetnode == null) ? "flash-placeholder" : targetnode;
            position = (position == null) ? "last" : position;
            
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
        },

        applyStateTypeahead: function (selector, valuefield) {
            var _obj = this;
            require(["r2/typeaheadClass", "hogan", "use!typeahead"], function (TypeaheadPrep, Hogan, Typeahead) {
                //template for typeahead

                var t = '<p><strong>{{name}}</strong> – {{abbreviation}}</p>'

                var tt = Hogan.compile(t);

                //closure for suggestion to pass to typeahead
                var typeahead_template = {
                    suggestion: function (e) {
                        return tt.render(e);
                    }
                };

                var typeaheadPrep = new TypeaheadPrep();
                var bloodhound = typeaheadPrep.states.buildBloodhound();
                bloodhound.initialize();

                var state_typeahead_onSelect = function (e, datum) {
                    //_obj.fillInClientInfo(datum);
                    //are we doing anything?
                }

                //now apply typeahead to from field
                typeaheadPrep.applyTypeahead(selector, bloodhound.ttAdapter(), typeahead_template, state_typeahead_onSelect, valuefield);
            });
        },

        AD_Bloodhound: function () {
            //we need a typeahead for AD users, so build a bloodhound for this
            var bh = new Bloodhound({
                datumTokenizer: function (d) {
                    //return Bloodhound.tokenizers.whitespace(d.name);
                    var tokenizeArray = [d.lanId, d.firstName, d.lastName, d.upn];
                    var tokenizeString = tokenizeArray.join(" ");
                    return Bloodhound.tokenizers.whitespace(tokenizeString);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                limit: 10,
                prefetch: {
                    url: 'https://x0202tnythnetpd.aa.ad.epa.gov/adservice/api/users/ADUsersList/all/region-r02',
                    ajax: {
                        dataType: "jsonp"
                    },
                    //normally comment out cacheKey and let it use url - but we may be building more than one bloodhound based on this url
                    //cacheKey: "ActiveUserBloodhoundPrefetch",
                    //how long should we cache it for - default is 86400000 (1 day) - in development often useful to modify
                    //ttl: 86400000,
                    filter: function (list) {
                        return $.map(list, function (user) {
                            user.fullName = user.firstName + " " + user.lastName;
                            return user;
                        });
                    }
                }
            });

            return bh;
        },

        MUL_Bloodhound: function () {
            //we need a typeahead for Master User List users, so build a bloodhound for this
            var bh = new Bloodhound({
                datumTokenizer: function (d) {
                    //return Bloodhound.tokenizers.whitespace(d.name);
                    var tokenizeArray = [d.lanId, d.firstName, d.lastName, d.email];
                    var tokenizeString = tokenizeArray.join(" ");
                    return Bloodhound.tokenizers.whitespace(tokenizeString);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                limit: 10,
                prefetch: {
                    url: 'http://intranet.r02.epa.gov/RestService/rest/userinfo/javascript/abbr/all',
                    ajax: {
                        dataType: "jsonp"
                    },
                    //normally comment out cacheKey and let it use url - but we may be building more than one bloodhound based on this url
                    //cacheKey: "ActiveUserBloodhoundPrefetch",
                    //how long should we cache it for - default is 86400000 (1 day) - in development often useful to modify
                    //ttl: 86400000,
                    filter: function (list) {
                        return $.map(list, function (user) {
                            user.fullName = user.firstName + " " + user.lastName;
                            return user;
                        });
                    }
                }
            });

            return bh;
        },

        PACS_Bloodhound: function () {
            //we need a typeahead for Master User List users, so build a bloodhound for this
            var bh = new Bloodhound({
                datumTokenizer: function (d) {
                    //return Bloodhound.tokenizers.whitespace(d.name);
                    var tokenizeArray = [d.fullName];
                    var tokenizeString = tokenizeArray.join(" ");
                    return Bloodhound.tokenizers.whitespace(tokenizeString);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                limit: 10,
                prefetch: {
                    url: 'https://x0202tnythnetpd.aa.ad.epa.gov/adservice/api/users/PacsUsersNames',
                    ajax: {
                        dataType: "jsonp"
                    },
                    //normally comment out cacheKey and let it use url - but we may be building more than one bloodhound based on this url
                    cacheKey: "PACSBloodhoundPrefetch",
                    //how long should we cache it for - default is 86400000 (1 day) - in development often useful to modify
                    //ttl: 86400000,
                    filter: function (list) {
                        return $.map(list, function (user) {
                            user.fullName = user;
                            return {fullName: user};
                        });
                    }
                }
            });

            return bh;
        },

        applyADTypeahead: function (selector, valuefield) {
            //where are we using this - are we?
            var _obj = this;
            require(["r2/typeaheadClass", "hogan", "use!typeahead"], function (TypeaheadPrep, Hogan, Typeahead) {
                //template for typeahead

                //template needed for eventual typeahead
                var t = [
                    '<p class="typeahead-address-suggestion-email">{{upn}}</p>',
                    '<p class="typeahead-address-suggestion-firstname">{{firstName}}</p>',
                    '<p class="typeahead-address-suggestion-lastname">{{lastName}}</p>',
                    '<p class="typeahead-address-suggestion-lanid">{{lanId}}</p>'
                ].join('');


                var tt = Hogan.compile(t);

                //need to create a closure for suggestion to pass over to typeahead
                var typeahead_template = {
                    suggestion: function (e) {
                        return tt.render(e);
                    }
                };

                //typeahead stuff
                var typeaheadPrep = new TypeaheadPrep();
                var bloodhound = _obj.AD_Bloodhound();
                bloodhound.initialize();

                var ad_typeahead_onSelect = function (e, datum) {
                    //_obj.populateFromAD(datum);
                    //alert(datum.lanId);
                    _obj.postFetch_AD(datum);
                }

                //now apply typeahead to from field
                typeaheadPrep.applyTypeahead(selector, bloodhound.ttAdapter(), typeahead_template, ad_typeahead_onSelect, valuefield);
            });
        },

        applyMultipleSourceTypeahead: function (selector) {
            var _obj = this;
            require(["r2/typeaheadClass", "hogan", "use!typeahead"], function (TypeaheadPrep, Hogan, Typeahead) {
                var ADPeople = _obj.AD_Bloodhound();
                var MULPeople = _obj.MUL_Bloodhound();
                var PACSPeople = _obj.PACS_Bloodhound();

                ADPeople.initialize();
                MULPeople.initialize();
                PACSPeople.initialize();

                $(selector).typeahead({
                    highlight: true
                },
                {
                    name: 'ADPeople',
                    displayKey: 'fullName',
                    source: ADPeople.ttAdapter(),
                    templates: {
                        header: '<h3 class="source-name">Active Directory</h3>'
                    }
                },
                {
                    name: 'PACSPeople',
                    displayKey: 'fullName',
                    source: PACSPeople.ttAdapter(),
                    templates: {
                        header: '<h3 class="source-name">PACS</h3>'
                    }
                },
                {
                    name: 'MULPeople',
                    displayKey: 'ename',
                    source: MULPeople.ttAdapter(),
                    templates: {
                        header: '<h3 class="source-name">Master User List</h3>'
                    }
                }).on("typeahead:selected", function (event, suggestion, dataset) {
                    _obj.populate(suggestion, dataset);
                }).on("typeahead:autocompleted", function (event, suggestion, dataset) {
                    _obj.populate(suggestion, dataset);
                });
            });
        },

        populate: function (suggestion, dataset) {
            //alert("suggestion = " + JSON.stringify(suggestion));
            var _obj = this;
            var _url;
            switch (dataset) {
                case "ADPeople":
                    _url = "https://x0202tnythnetpd.aa.ad.epa.gov/adservice/api/users/ADUser/" + suggestion.lanId;
                    _obj.genericFetchInfo(_url, app.ticket.populateFromAD, "Active Directory");

                    //we also must make the appropriate fields read only vs editable ad_read ad_edit
                    _obj.adjustReadEditFields("AD");

                    break;
                case "MULPeople":
                    //not all returned will have lanId
                    //_url = "http://intranet.r02.epa.gov/RestService/rest/userinfo/javascript/lanid/" + suggestion.lanId;
                    _url = "https://intranet.r02.epa.gov/RestService/rest/userinfo/javascript/ename/" + suggestion.ename;
                    _obj.genericFetchInfo(_url, app.ticket.populateFromMUL, "Master User List");

                    //we also must make the appropriate fields read only vs editable ad_read ad_edit
                    _obj.adjustReadEditFields("MUL");

                    break;
                case "PACSPeople":
                    _url = "https://x0202tnythnetpd.aa.ad.epa.gov/adservice/api/users/PacsUser/" + suggestion.fullName;
                    _obj.genericFetchInfo(_url, app.ticket.populateFromPACS, "PACS");

                    //we also must make the appropriate fields read only vs editable ad_read ad_edit
                    _obj.adjustReadEditFields("PACS");

                    break;
            }
        },

        insertTemplateLanguage: function (key, targetNode) {
            //given a template key, and a target node, will retrieve body of template and shove it in
            //typically used to add the disclaimer language
            require(["dojo/request/xhr", "dojo/dom"], function (xhr, dom) {
                var url = dojoConfig.app.path + "Template/ByKeyAsJSON/" + key;
                xhr(url, {
                    handleAs: "json"
                }).then(function (data) {
                    dom.byId(targetNode).innerHTML = data.Body;
                });
            });
        },
        
        selfCreate: function (lanid) {
            //a user is creating a pass request themselves.  Go get their info from AD or MUL and fill in the info
            var _obj = this;

            var _url;
            // now go ahead and fill in their info from AD
            _url = "https://x0202tnythnetpd.aa.ad.epa.gov/adservice/api/users/ADUser/" + lanid;
            _obj.genericFetchInfo(_url, _obj.populateFromAD, "Active Directory");

            // or, fill in their info from Master User List
            //all http://intranet.r02.epa.gov/RestService/rest/userinfo/javascript/all
            //_url = "http://intranet.r02.epa.gov/RestService/rest/userinfo/javascript/lanid/" + lanid;
            //_obj.genericFetchInfo(_url, _obj.populateFromMUL, "Master User List");

            //populate disclaimer
            _obj.insertTemplateLanguage("Disclaimer", "disclaimer");

            //make the state a typeahead
            _obj.applyStateTypeahead(".state-typeahead", "abbreviation");
        },

        convertToDisplayName: function (somename, separator) {
            var _obj = this;
            try {
                return _obj.strRight(somename, separator) + " " + _obj.strLeft(somename, separator);
            } catch (e) {
                return somename;
            }
        },

        populateFromAD: function (data) {
            //we have been handed data from AD, now go and populate the form
            var _obj = this;

            require(["dojo/dom-attr"], function (domAttr) {
                //could have set all fields using 
                //document.getElementById("Client_ExpirationDate").value = data.expirationDate;
                //but as we are using dojo, do it the dojo way

                domAttr.set("Client_AD_LanId", "value", data.lanId);
                domAttr.set("Client_AD_FirstName", "value", data.firstName);
                domAttr.set("Client_AD_LastName", "value", data.lastName);
                domAttr.set("Client_AD_Phone", "value", data.phone);
                domAttr.set("Client_AD_Email", "value", data.email);
                domAttr.set("Client_AD_PersonnelType", "value", data.personnelType);
                domAttr.set("Client_AD_Affiliation", "value", data.affiliation);
                domAttr.set("Client_AD_UPN", "value", data.upn);
                domAttr.set("Client_AD_WorkForceID", "value", data.workForceID);
                domAttr.set("Client_AD_ManagerName", "value", data.managerName);
                domAttr.set("Client_AD_CN", "value", data.cn);
                domAttr.set("Client_AD_Company", "value", data.company);
                domAttr.set("Client_AD_Organization", "value", data.organization);
                domAttr.set("Client_AD_AmpBox", "value", data.ampBox);

                //note, this works on everything but IE9 - and we will have 250 ie 9 machines - drats
                domAttr.set("Client_AD_ExpirationDate", "value", data.expirationDate);
                

                //now do the translations and fill in the stuff in client object

                //display name is first last
                domAttr.set("Client_DisplayName", "value", data.firstName + " " + data.lastName);

                //should this be switche to be firstName la/stName?
                var supervisorDisplayName = _widget.convertToDisplayName(data.managerName, ", ");
                domAttr.set("Client_Supervisor", "value", supervisorDisplayName);
                //domAttr.set("Client_Supervisor", "value", data.managerName);
                //document.getElementById("Client_Supervisor").value = data.managerName;

                domAttr.set("Client_LanId", "value", data.lanId);
                domAttr.set("Client_AmpBox", "value", data.ampBox);
                domAttr.set("Client_Organization", "value", data.organization);
                domAttr.set("Client_Company", "value", data.company);
                domAttr.set("Client_Phone", "value", data.phone);
                domAttr.set("Client_Email", "value", data.email);
                domAttr.set("Client_SystemOfRecord", "value", "AD");

                //PersonnelType is special as we need a select when PACS
                domAttr.set("Client_PersonnelType", "value", data.personnelType);
                domAttr.set("Client_PersonnelType_Select", "value", data.personnelType);

                //this works because the field is set with a type of datetime
                //AD is not consistent - for some non-expiring users, the date is 9999-12-31T23:59:59.9999999, but for others it is null
                if (data.expirationDate == null || data.expirationDate == "9999-12-31T23:59:59.9999999") {
                    //should it be 9999-12-31T23:59:59.999Z  ????
                    domAttr.set("Client_ExpirationDate", "value", "9999-12-31T23:59:59.999Z");
                } else {
                    domAttr.set("Client_ExpirationDate", "value", data.expirationDate);
                }
            });
            
            
        },

        populateFromPACS: function (data) {
            var _obj = this;
            //data in pacs is odd - there is an array of accounts, and each account may have an array of cardInfos
            var activeCards = [];
            require(["dojo/_base/array"], function (array) {
                array.forEach(data, function (item, i) {
                    //now spin through cardinfos
                    array.forEach(item.cardInfos, function (cardinfoitem, j) {
                        if (cardinfoitem.inactive == false) {
                            //we have an active card
                            var element = {};
                            element.cardID = cardinfoitem.cardId;
                            element.cardInfoID = cardinfoitem.cardInfoID;
                            element.activeDateTime = cardinfoitem.activeDateTime;
                            element.inactiveDateTime = cardinfoitem.inactiveDateTime;
                            element.expirationDateTime = cardinfoitem.expirationDateTime;
                            element.firstName = item.firstName;
                            element.lastName = item.lastName;
                            element.dateTimeOfTxn = item.dateTimeOfTxn;

                            activeCards.push(element);
                        }
                    });
                });

                if (activeCards.length == 0) {
                    alert("user has no active cards");
                } else if (activeCards.length == 1) {
                    app.ticket.populateFromPACS_element(activeCards[0]);
                    //_widget.populateFromPACS_element(activeCards[0]);
                } else {
                    alert("user has multiple cards");
                    //make them select an active card
                }
            });
        },

        populateFromPACS_element: function (element) {
            //we have identified a single card to use - populate the record with this
            require(["dojo/dom-attr"], function (domAttr) {
                domAttr.set("Client_PACS_CardID", "value", element.cardID);
                domAttr.set("Client_PACS_CardInfoID", "value", element.cardInfoID);
                domAttr.set("Client_PACS_ActiveDateTime", "value", element.activeDateTime);
                domAttr.set("Client_PACS_InactiveDateTime", "value", element.inactiveDateTime);
                domAttr.set("Client_PACS_ExpirationDateTime", "value", element.expirationDateTime);
                domAttr.set("Client_PACS_FirstName", "value", element.firstName);
                domAttr.set("Client_PACS_LastName", "value", element.lastName);
                domAttr.set("Client_PACS_DateTimeOfTxn", "value", element.dateTimeOfTxn);

                //now the client info
                domAttr.set("Client_DisplayName", "value", element.firstName + " " + element.lastName);
                domAttr.set("Client_SystemOfRecord", "value", "PACS");

                //and now for expiration date
                //this works because the field is set with a type of datetime
                domAttr.set("Client_ExpirationDate", "value", element.expirationDateTime);

                //finally, blank the fields for which we have no info
                domAttr.set("Client_LanId", "value", "");
                domAttr.set("Client_AmpBox", "value", "");
                domAttr.set("Client_Organization", "value", "");
                domAttr.set("Client_Company", "value", "");
                domAttr.set("Client_Phone", "value", "");
                domAttr.set("Client_Email", "value", "");

                //PersonnelType is special as we need a select when PACS
                domAttr.set("Client_PersonnelType", "value", "");
                domAttr.set("Client_PersonnelType_Select", "value", "");

            });
        },

        populateFromMUL: function (data) {
            var _obj = this;
            require(["dojo/dom-attr"], function (domAttr) {
                domAttr.set("Client_MUL_EmployeeId", "value", data.employeeId);
                domAttr.set("Client_MUL_EName", "value", data.ename);
                domAttr.set("Client_MUL_LanId", "value", data.lanId);
                domAttr.set("Client_MUL_Org", "value", data.org);
                domAttr.set("Client_MUL_Phone", "value", data.phone);
                domAttr.set("Client_MUL_Location", "value", data.location);
                domAttr.set("Client_MUL_AmpBox", "value", data.ampBox);
                domAttr.set("Client_MUL_EpaEmployee", "value", data.epaEmployee);
                domAttr.set("Client_MUL_EmpType", "value", data.empType);
                domAttr.set("Client_MUL_Email", "value", data.email);
                domAttr.set("Client_MUL_ContractCompany", "value", data.contractCompany);
                domAttr.set("Client_MUL_SupervisorFirst", "value", data.supervisorFirst);
                domAttr.set("Client_MUL_Expiration", "value", data.expiration);

                //now do the translations and fill in the stuff in client
                //should this use firstName + " " + lastName?
                domAttr.set("Client_DisplayName", "value", data.ename);
                domAttr.set("Client_Supervisor", "value", data.supervisorFirst);
                domAttr.set("Client_LanId", "value", data.lanId);
                domAttr.set("Client_AmpBox", "value", data.ampBox);
                domAttr.set("Client_Organization", "value", data.org);

                if (data.contractCompany == null) {
                    //must be epa
                    domAttr.set("Client_Company", "value", "EPA");
                } else {
                    domAttr.set("Client_Company", "value", data.contractCompany);
                }
                
                domAttr.set("Client_Phone", "value", data.phone);
                domAttr.set("Client_Email", "value", data.email);
                domAttr.set("Client_SystemOfRecord", "value", "MUL");

                //PersonnelType is special as we need a select when PACS
                //and MUL has a code that needs to be resolved   
               
                if (_widget.personnelTypeHash.hasOwnProperty(data.empType)) {
                    domAttr.set("Client_PersonnelType", "value", _widget.personnelTypeHash[data.empType]);
                    domAttr.set("Client_PersonnelType_Select", "value", _widget.personnelTypeHash[data.empType]);
                } else {
                    domAttr.set("Client_PersonnelType", "value", "Unknown");
                    domAttr.set("Client_PersonnelType_Select", "value", "Unknown");
                }

                //now work out expiration date
                //for employees, it is "never"
                //this works because the field is set with a type of datetime
                if (data.expiration == "never") {
                    domAttr.set("Client_ExpirationDate", "value", "12/31/9999");
                } else {
                    domAttr.set("Client_ExpirationDate", "value", data.expiration);
                }
            });
        },

        genericFetchInfo: function (url, postFetch, feedName) {
            //given a url, will go and fetch the information, and then execute postfetch
            var _obj = this;
            require(["dojo/request/script"], function (script) {
                script.get(url, {
                    jsonp: "callback"
                }).then(function (data) {
                    postFetch(data);
                }, function (err) {
                    // Handle the error condition
                    alert("error fetching " + feedName + " Data");
                    var _title = "Error Fetching " + feedName + " Data";
                    var _body = "Unable to find " + feedName + " Data at " + url + "<p><strong>" + err.name + ":</strong> " + err.message + "</p>";
                    _obj.createFlash(_title, _body, "alert-danger");
                });
            });
        },

        addOptionsToPersonnelTypeSelect: function () {
            //will spin through personnelTypeHash and add an option for each one
            var _obj = this;
            require(["dojo/dom-construct"], function (domConstruct) {
                for (var key in _obj.personnelTypeHash) {
                    domConstruct.create("option", { value: _obj.personnelTypeHash[key], innerHTML: _obj.personnelTypeHash[key] }, "Client_PersonnelType_Select", "last");
                }
            });
            
        },

        adminCreate: function () {
            //an admin is creating a pass request.
            //they are going to need to select a system of record (MUL, PACS, or AD), select a user, and fill in the appropriate info.
            var _obj = this;

            //add options to the personnelType select
            _obj.addOptionsToPersonnelTypeSelect();

            //make the state a typeahead
            _obj.applyStateTypeahead(".state-typeahead", "abbreviation");

            /* moved this to a typeahead triggered from the AdminCreate
            //for testing, stick in AD select
            if (_obj.clientFilteringSelect_AD == null) {
                _obj.buildClientFilteringSelect_AD();
            }

            //for testing, stick in PACS select
            if (_obj.clientFilteringSelect_PACS == null) {
                _obj.buildClientFilteringSelect_PACS();
            }

            //for testing, stick in MUL select
            if (_obj.clientFilteringSelect_MUL == null) {
                _obj.buildClientFilteringSelect_MUL();
            }
            */

            //above were the select, we now use typeahead    
            app.ticket.applyMultipleSourceTypeahead("#testMultiTypeahead");
            
        },

        clientFilteringSelect_AD: null,
        clientFilteringSelect_PACS: null,
        clientFilteringSelect_MUL: null,

        postFetch_AD: function (data) {
            //retired
            var _obj = this;
            require(["dojo/store/Memory", "dijit/form/FilteringSelect", "dojo/_base/array"], function (Memory, FilteringSelect, array) {
                array.forEach(data, function (item, i) {
                    item.id = item.lanId;
                });

                _obj.clientFilteringSelect_AD = new FilteringSelect({
                    //id: "lanId",
                    store: new Memory({data: data }),
                    autoComplete: true,
                    onChange: function (lanId) {
                        var _url = "https://x0202tnythnetpd.aa.ad.epa.gov/adservice/api/users/ADUser/" + lanId;
                        app.ticket.genericFetchInfo(_url, app.ticket.populateFromAD, "Active Directory");

                        //we also must make the appropriate fields read only vs editable ad_read ad_edit
                        app.ticket.adjustReadEditFields("AD");
                    },
                    searchAttr: "upn"
                }).placeAt("Client_AD", "only").startup();
            });
        },

        postFetch_PACS: function (namearray) {
            //retired
            //pacs returns an array of user names
            var _obj = this;
            require(["dojo/store/Memory", "dijit/form/FilteringSelect", "dojo/_base/array"], function (Memory, FilteringSelect, array) {
                var data = [];

                array.forEach(namearray, function (item, i) {
                    var element = {};
                    element.id = item;
                    element.name = item;
                    data.push(element);
                });

                _obj.clientFilteringSelect_PACS = new FilteringSelect({
                    //id: "id",
                    store: new Memory({ data: data }),
                    autoComplete: true,
                    onChange: function (id) {
                        var _url = "https://x0202tnythnetpd.aa.ad.epa.gov/adservice/api/users/PacsUser/" + id;
                        app.ticket.genericFetchInfo(_url, app.ticket.populateFromPACS, "PACS");

                        //we also must make the appropriate fields read only vs editable ad_read ad_edit
                        app.ticket.adjustReadEditFields("PACS");
                    },
                    searchAttr: "id"
                }).placeAt("Client_PACS", "only").startup();

            });
        },

        postFetch_MUL: function (data) {
            //retired
            var _obj = this;
            require(["dojo/store/Memory", "dijit/form/FilteringSelect", "dojo/_base/array"], function (Memory, FilteringSelect, array) {
                array.forEach(data, function (item, i) {
                    item.id = item.lanId;
                });

                _obj.clientFilteringSelect_MUL = new FilteringSelect({
                    store: new Memory({ data: data }),
                    autoComplete: true,
                    onChange: function (lanId) {
                        var _url = "http://intranet.r02.epa.gov/RestService/rest/userinfo/javascript/lanid/" + lanId;
                        app.ticket.genericFetchInfo(_url, app.ticket.populateFromMUL, "Master User List");

                        //we also must make the appropriate fields read only vs editable ad_read ad_edit
                        app.ticket.adjustReadEditFields("MUL");
                    },
                    searchAttr: "ename"
                }).placeAt("Client_MUL", "only").startup();
            });
        },

        adjustReadEditFields: function (source) {
            //source is going to be AD, MUL, or PACS.  We are going to adjust all the fields to allow editing to those that need to be editable - based on source
            require(["dojo/dom", "dojo/query", "dojo/NodeList-dom"], function (dom, query) {
                var selector = "." + source + "_read";
                query(selector).forEach(function (node) {
                    node.readOnly = true;
                });

                selector = "." + source + "_edit";
                query(selector).forEach(function (node) {
                    node.readOnly = false;
                });


                selector = "." + source + "_disabled";
                query(selector).forEach(function (node) {
                    node.disabled = true;
                });

                selector = "." + source + "_enabled";
                query(selector).forEach(function (node) {
                    node.disabled = false;
                });
            });
        },

        buildClientFilteringSelect_AD: function () {
            //retired
            //the admin is using AD as the source for names, build them a filtering select with AD as the source
            var _obj = this;
            var url = "https://x0202tnythnetpd.aa.ad.epa.gov/adservice/api/users/ADUsersList/all/region-r02";
            var feedName = "Active Directory";

            _obj.genericFetchInfo(url, _obj.postFetch_AD, feedName);

            //we also must make the appropriate fields read only vs editable ad_read ad_edit
            //should be on chance of the system of record - temp moved to the on change of the filtering select
            //_obj.adjustReadEditFields("AD");
            
        },

        buildClientFilteringSelect_PACS: function () {
            //retired
            //the admin is using PACS as the source for names, build them a filtering select with PACS as the source
            var _obj = this;
            var url = "https://x0202tnythnetpd.aa.ad.epa.gov/adservice/api/users/PacsUsersNames";
            var feedName = "PACS";

            _obj.genericFetchInfo(url, _obj.postFetch_PACS, feedName);

            //we also must make the appropriate fields read only vs editable ad_read ad_edit
            //should be on chance of the system of record - temp moved to the on change of the filtering select
            //_obj.adjustReadEditFields("PACS");

        },

        buildClientFilteringSelect_MUL: function () {
            //retired
            //the admin is using Master User List as the source for names, build them a filtering select with MUL as the source
            var _obj = this;
            var url = "http://intranet.r02.epa.gov/RestService/rest/userinfo/javascript/abbr/all";
            var feedName = "Master User List";

            _obj.genericFetchInfo(url, _obj.postFetch_MUL, feedName);

            //we also must make the appropriate fields read only vs editable ad_read ad_edit
            //should be on chance of the system of record - temp moved to the on change of the filtering select
            //_obj.adjustReadEditFields("PACS");

        },

        insertDisclaimer: function (targetNode) {
            if (targetNode == null || targetNode == "") {
                targetNode = "disclaimer";
            }
            //going to retrieve the disclaimer, and stick it into the disclaimer div
            require(["dojo/request/xhr", "dojo/dom"], function (xhr, dom) {
                var url = dojoConfig.app.path + "Template/ByKeyAsJSON/Disclaimer";
                xhr(url, {
                    handleAs: "json"
                }).then(function (data) {
                    dom.byId(targetNode).innerHTML = data.Body;
                });
            });
        },

        resizeCanvas: function (canvas) {
            // Adjust canvas coordinate space taking into account pixel ratio,
            // to make it look crisp on mobile devices.
            // This also causes canvas to be cleared.
            var ratio = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
        },

        connectSignatureSection: function (targetNode) {
            var _obj = this;
            //add disclaimer
            _obj.insertDisclaimer("_Sign-disclaimer");

            require(["dojo/dom", "dojo/dom-attr", "dojo/on", "use!signature_pad"], function (dom, domAttr, on, SignaturePad) {       
                var wrapper = document.getElementById("signature-pad"),
                    clearButton = wrapper.querySelector("[data-action=clear]"),
                    saveButton = wrapper.querySelector("[data-action=save]"),
                    canvas = wrapper.querySelector("canvas");

                var signaturePad = new SignaturePad(canvas);

                /*
                clearButton.addEventListener("click", function (event) {
                    signaturePad.clear();
                });

                
                saveButton.addEventListener("click", function (event) {
                    if (signaturePad.isEmpty()) {
                        alert("Please provide signature first.");
                    } else {
                        window.open(signaturePad.toDataURL());
                    }
                });
                */
                var form = dom.byId("_Sign-form");
                on(form, "submit", function (event) {
                    var returnval;
                    if (signaturePad.isEmpty()) {
                        event.preventDefault();
                        app.createFlash("_Sign-flash", {
                            flashClass: "warning",
                            pos: "only",
                            title: "Warning!",
                            body: "Please provide a signature first"
                        });
                        returnval = false;
                    } else {
                        //Signature_Encoded
                        domAttr.set("Signature_Encoded", "value", signaturePad.toDataURL());
                        //alert(signaturePad.toDataURL());
                        returnval = true;
                    }
                    return returnval;
                });

                //hook up clear button
                var clearButton = dom.byId("_Sign_Modal_ClearButton");
                on(clearButton, "click", function (event) {
                    signaturePad.clear();
                });

                //as we are implementing this inside a modal, we want to trigger a canvas resize any time it is shown
                $('#signModal').on('shown.bs.modal', function (e) {
                    var wrapper = document.getElementById("signature-pad"),
                    canvas = wrapper.querySelector("canvas");

                    // Adjust canvas coordinate space taking into account pixel ratio,
                    // to make it look crisp on mobile devices.
                    // This also causes canvas to be cleared.
                    function resizeCanvas() {
                        var ratio = window.devicePixelRatio || 1;
                        canvas.width = canvas.offsetWidth * ratio;
                        canvas.height = canvas.offsetHeight * ratio;
                        canvas.getContext("2d").scale(ratio, ratio);
                    }

                    //window.onresize = resizeCanvas;
                    resizeCanvas();
                });

            });
        },

        mapSeverityToBootstrap: function(severity) {
            var bsClass = "";
            switch(severity) {
                case "Informational":
                    bsClass = "info";
                    break;
                default:
                    //bsClass = "";
                    bsClass = severity;
            }
            return bsClass;
        },

        buildLogList: function (targetnode, data) {
            //given the log information, will build a pretty log list
            var _obj = this;
            require(["dojo/dom-construct", "dojo/dom-class", "dojo/_base/array"], function (domConstruct, domClass, array) {
                var panel = domConstruct.create("div", null, targetnode, "last");
                domClass.add(panel, ["panel", "panel-default"]);

                var panelHeading = domConstruct.create("div", null, panel, "last");
                domClass.add(panelHeading, "panel-heading");

                var h4 = domConstruct.create("h4", null, panelHeading, "last");
                domClass.add(h4, "panel-title");

                var a = domConstruct.create("a", {innerHTML: "Log", "data-toggle": "collapse", href: "#logData"}, h4, "last");

                var contentWrap = domConstruct.create("div", {id: "logData"}, panel, "last");
                domClass.add(contentWrap, ["panel-collapse", "collapse"]);

                var panelBody = domConstruct.create("div", null, contentWrap, "last");
                domClass.add(panelBody, "panel-body");

                var table = domConstruct.create("table", null, panelBody, "last");
                domClass.add(table, ["table", "table-striped", "table-hover"]);

                var thead = domConstruct.create("thead", null, table, "first");

                var tr = domConstruct.create("tr", null, thead, "first");

                var th;
                th = domConstruct.create("th", { innerHTML: "#" }, tr, "last");
                th = domConstruct.create("th", { innerHTML: "Severity" }, tr, "last");
                th = domConstruct.create("th", { innerHTML: "Action" }, tr, "last");
                th = domConstruct.create("th", { innerHTML: "Created" }, tr, "last");
                th = domConstruct.create("th", { innerHTML: "By" }, tr, "last");
                th = domConstruct.create("th", { innerHTML: "Comment" }, tr, "last");

                var tbody = domConstruct.create("tbody", null, table, "last");

                var td;
                var d;
                var dtString;
                var bsClass;
                array.forEach(data, function (item, i) {
                    tr = domConstruct.create("tr", null, tbody, "first");
                    bsClass = _obj.mapSeverityToBootstrap(item.Severity);
                    if (bsClass != "") {
                        domClass.add(tr, bsClass);
                    }

                    td = domConstruct.create("td", { innerHTML: i }, tr, "last");
                    td = domConstruct.create("td", { innerHTML: item.Severity }, tr, "last");
                    td = domConstruct.create("td", { innerHTML: item.Action }, tr, "last");

                    dtString = _obj.strRight(item.Created, "(");
                    dtString = _obj.strLeft(dtString, ")");
                    d = new Date(parseInt(dtString));
                    dtString = d.toLocaleString();

                    td = domConstruct.create("td", { innerHTML: dtString }, tr, "last");
                    td = domConstruct.create("td", { innerHTML: item.CreatedBy }, tr, "last");
                    td = domConstruct.create("td", { innerHTML: item.Comment }, tr, "last");
                });
                
            });
        },

        fetchLogList: function (targetnode, id) {
            //given a ticket id, and a target node, will request the log information from the server
            var _obj = this;
            require(["dojo/request/xhr"], function (xhr) {
                var url = dojoConfig.app.path + "Log/JSON/" + id;
                xhr(url, {
                    handleAs: "json"
                }).then(function (data) {
                    //now go build the log stuff
                    _obj.buildLogList(targetnode, data);
                }), function (err) {
                    //what do we want to do when log fails
                    alert("unable to fetch log");
                };
            });
        },

        AssignTag_setFields: function () {
            //Expires - the name and id of the input where we put the expires date
            // EPA = two years from today 728
            //Intern = 6 months from today 132
            //everyone else, 1 year from today 364
            var adjustDays;
            var tagColor;
            require(["dojo/dom-attr"], function (domAttr) {
                var employeeType = domAttr.get("Client_PersonnelType", "innerHTML").trim();
                var expireDate = new Date();

                switch (employeeType) {
                    case "Employee":
                    case "EPA":
                        adjustDays = 728;
                        tagColor = "Blue";
                        break;
                    case "Intern":
                        adjustDays = 132;
                        tagColor = "Green";
                        break;
                    default:
                        adjustDays = 364;
                        tagColor = "Green";
                }

                expireDate.setDate(expireDate.getDate() + adjustDays);
                domAttr.set("Expires", "value", expireDate);

                //$('#Color').val(tagColor);
                domAttr.set("Color", "value", tagColor);
            });

        },

        details: function (isAdmin, signatureTargetNode, id) {
            var _obj = this;

            //this needs an additional condition - if RequestType != Self
            if (isAdmin) {
                _obj.connectSignatureSection(signatureTargetNode);

                //we need to set defaults for the fields on the AssignTag Modal
                _obj.AssignTag_setFields();
            }
            //hook up signature stuff 
            //_obj.connectSignatureSection("signature-pad");

            //hook up log display
            _obj.fetchLogList("logwrap", id);

            //or in modal
            _obj.fetchLogList("logGrid", id);
        }


    });
});