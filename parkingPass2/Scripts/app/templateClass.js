/*
 * Tom Murphy
 *
 * 07/29/2014 - created - based on templateControllerClass from teh print reduction database
 *
 *
 *  a dojo object defined to represent the template
 *
 *
 *
 */
define(["dojo/_base/declare"], function (declare) {
    return declare(null, {

        constructor: function () {
            //any constructor?
        },

        read: function () {
            var _obj = this;

        },

        create: function () {
            var _obj = this;

            _obj._createEdit();
        },

        edit: function () {
            var _obj = this;
            _obj._createEdit();
        },

        _createEdit: function () {
            //the functions common to both create and edit

            //attach editor to body
            require(["use!tinymce", "dojo/domReady!"], function (tinymce) {
                tinymce.init({
                    selector: 'textarea',
                    plugins: [
                            "advlist autolink lists link image charmap print preview anchor",
                            "searchreplace visualblocks code fullscreen",
                            "insertdatetime media table contextmenu paste"
                    ],
                    toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
                    autosave_ask_before_unload: false,
                    max_height: 200,
                    min_height: 160,
                    height: 180
                });
            });
        },

        index: function () {
        }

    });
});