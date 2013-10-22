define(
  [
    "underscore",
    "backbone"
  ],
  function(_, Backbone) {
    "use strict";

    /**
    * Base class for views that provides common rendering, model presentation, DOM assignment,
    * subview tracking, and teardown.
    *
    * @class BaseView
    *
    * @constructor
    *
    * @param {Object} options configuration options passed along to Backbone.View
    */
    var BaseView = Backbone.View.extend({
      constructor: function(options) {
        this.subviews = [];

        Backbone.View.call(this, options);
      },

      /**
      * Basic object presenter using model's attributes. This should be overridden by subclasses
      * wishing to provide custom presentation.
      *
      * @property {Function} presenter
      */
      presenter: function(model) {
        return model ? model.attributes : null;
      },

      /**
      * Applies configured presenter to local model
      *
      * @method getPresentation
      * @return {Object} model presentation
      */
      getPresentation: function() {
        return new this.presenter(this.model);
      },

      /**
      * Renders by combining template and presentation and inserting into the associated element.
      *
      * @method render
      * @return {BaseView} this
      * @chainable
      */
      render: function() {
        this.destroySubviews();

        var presentation = this.getPresentation();

        this.$el.html(this.template(presentation));

        this.afterRender();

        return this;
      },

      /**
      * Called after render completes. Provides easy access to custom rendering for subclasses
      * without having to override render.
      *
      * @method afterRender
      */
      afterRender: function() {
        // Implement in subclasses
      },

      /**
      * Renders local collection using the provided view and inserts into the provided selector.
      *
      * @method renderCollection
      * @param {Backbone.View} itemView view for rendering each item in the collection
      * @param {String} selector jQuery selector to insert the collected elements
      */
      renderCollection: function(itemView, selector) {
        var els = this.collection.collect(function(item) {
          return this.trackSubview(new itemView({ model: item })).render().el;
        }.bind(this));

        this.$(selector).append(els);
      },

      /**
      * Assigns view to a selector.
      *
      * @method assign
      * @param {Backbone.View} view to assign
      * @param {String} selector jQuery selector for the element to be assigned
      * @return {BaseView} this
      * @chainable
      */
      assign: function(view, selector) {
        view.setElement(this.$(selector));
        view.render();

        return this;
      },

      /**
      * Destroys view by stop listening to Backbone events, destroying subviews, and disabling
      * jQuery events.
      *
      * @method destroy
      */
      destroy: function() {
        if (this.beforeDestroy) {
          this.beforeDestroy();
        }

        // Turn off adapter polling
        if (this.adapter && this.adapter.stopPollingForUpdates) {
          this.adapter.stopPollingForUpdates();
        }

        this.stopListening();
        this.destroySubviews();
        this.$el.off();
      },

      /**
      * Keeps track of a subview so that it can later be destroyed.
      *
      * @method trackSubview
      * @param {BaseView} view to track
      * @return {BaseView} tracked view
      */
      trackSubview: function(view) {
        if (!_.contains(this.subviews, view)) {
          this.subviews.push(view);
        }

        return view;
      },

      /**
      * Destroys all subviews.
      *
      * @method destroySubviews
      */
      destroySubviews: function() {
        _.invoke(this.subviews, "destroy");

        this.subviews = [];
      }
    });

    return BaseView;
  }
);
