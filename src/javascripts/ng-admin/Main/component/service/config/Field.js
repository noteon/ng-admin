/*global define*/

define(function (require) {
    'use strict';

    var angular = require('angular'),
        Configurable = require('ng-admin/Main/component/service/config/Configurable'),
        utils = require('ng-admin/lib/utils');

    function defaultValueTemplate(entry) {
        return '';
    }

    var config = {
        name: 'myField',
        type: 'string',
        label: 'My field',
        editable: true,
        order: null,
        identifier: false,
        format: 'yyyy-MM-dd',
        parse: function (date) {
            return date;
        },
        template: defaultValueTemplate,
        isDetailLink: false,
        detailLinkRoute: 'edit',
        list: true,
        dashboard: true,
        validation: {
            required: false,
            minlength: 0,
            maxlength: 99999 // We can't remove ng-maxlength directive
        },
        choices: [],
        defaultValue: null,
        attributes: {},
        cssClasses: '',
        uploadInformation: {
            url: '/upload',
            accept: '*'
        }
    };

    /**
     * @constructor
     *
     * @param {String } fieldName
     *
     */
    function Field(fieldName) {
        this.config = angular.copy(config);
        this.config.name = fieldName || Math.random().toString(36).substring(7);
        this.config.label = utils.camelCase(this.config.name);
        this.config.isDetailLink = fieldName === 'id';
        this.maps = [];
    }

    Configurable(Field.prototype, config);

    /**
     * Set or get the type
     *
     * @param {String} type
     * @returns string|Field
     */
    Field.prototype.type = function (type) {
        if (arguments.length === 0) {
            return this.config.type;
        }

        this.config.type = type;

        return this;
    };

    /**
     * Add a map function
     *
     * @param {Function} fn
     *
     * @returns {Field}
     */
    Field.prototype.map = function (fn) {
        this.maps.push(fn);

        return this;
    };

    Field.prototype.validation = function (obj) {
        if (!arguments.length) {
            // getter
            return this.config.validation;
        }
        // setter
        for (var property in obj) {
            if (!obj.hasOwnProperty(property)) continue;
            if (obj[property] === null) {
                delete this.config.validation[property];
            } else {
                this.config.validation[property] = obj[property];
            }
        }
        return this;
    };

    Field.prototype.hasMaps = function () {
        return this.maps.length > 0;
    };

    /**
     * Truncate the value based after applying all maps
     *
     * @param {*} value
     * @param {*} entry
     *
     * @returns {*}
     */
    Field.prototype.getMappedValue = function (value, entry) {
        for (var i in this.maps) {
            value = this.maps[i](value, entry);
        }

        return value;
    };

    /**
     * Get CSS classes list based on the `cssClasses` configuration
     *
     * @returns {string}
     */
    Field.prototype.getCssClasses = function (entry) {
        if (typeof this.config.cssClasses === 'function') {
            return this.config.cssClasses(entry);
        }
        if (typeof this.config.cssClasses.constructor === Array) {
            return this.config.cssClasses.join(' ');
        }
        return this.config.cssClasses;
    };

    /**
      * Return field value
      *
      * @returns mixed
      */
    Field.prototype.getTemplateValue = function (data) {
        return typeof (this.config.template) === 'function' ? this.config.template(data) : this.config.template;
    };

    /**
     * @deprecated use Field.isDetailLink() instead
     */
    Field.prototype.isEditLink = function(bool) {
        console.warn('Field.isEditLink() is deprecated - use Field.isDetailLink() instead');
        if (arguments.length === 0) {
            return this.isDetailLink();
        }
        return this.isDetailLink(bool);
    }

    /**
     * only for type choice
     */
    Field.prototype.getLabelForChoice = function(value) {
        var choice = this.choices().filter(function(choice) { return choice.value == value }).pop();
        return choice ? choice.label : null;
    };

    return Field;
});
