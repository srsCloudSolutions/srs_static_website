;(function($) {
   "use strict"

   /* ===================================================================== *
    * Utility Functions
    * ===================================================================== */

   function CVSanitize( setting, allowed, standard ) {

      if ( setting === false || setting === true ) {
         return setting;
      }

      var response = false;

      if ( allowed ) {

         $.each( allowed, function( index, value ) {
            if ( setting === value ) {
               response = setting;
            }
         });

         if ( ! response && standard ) {
            response = standard;
         }
         else if ( ! response ) {
            response = allowed[0];
         }

      }
      else {
         response = setting;
      }

      switch ( response ) {
         case 'true':
            response = true;
            break;
         case 'false':
            response = false;
            break;
      }

      return response;

   }

   function CVMakeBool( value ) {
      if ( 'true' === value ) {
         return true;
      }
      return false;
   }

   /* ===================================================================== *
    * Content Sections
    * ===================================================================== */

   var CVContentSection = function( element ) {
      this.$element = $(element);
      this.$innerContainer = this.$element.find('.cv-wrap-wrapper');
      this.init();
      return this;
   };

   CVContentSection.prototype = {

      init: function() {

         var self = this;

         // Check if a background image was supplied
         if ( self.$element.hasClass('is-loading-bg-image') ) {
            var src = self.$element.css('background-image'),
                url = src.match(/\((.*?)\)/)[1].replace(/('|")/g,''),
                img = new Image();
            img.onload = function() { self.$element.removeClass('is-loading-bg-image'); }
            img.src = url;
            if (img.complete) img.onload();
         }

         // Check if section has a scrolling background
         if ( self.$element.attr('data-bg-scrolling') ) {

            // Set initial position
            self.$element.css( 'backgroundPosition', '0px 0px' );

            // Start Background Scrolling
            setTimeout( function() {
               self.$element.addClass('is-animating-background');
               self.startScrollingBG();
            });

         }

         // Do not continue if page sliding is active
         if ( $('html').hasClass('full-page-slider-active') ) {
           self.$element.css('opacity', 1); return;
         }

         // Check if section has min-height attribute
         if ( self.$innerContainer.data('min-height') ) {

            // Set the height initially
            self.setSize();

            // Update height when screen resizes
            $(window).resize( $.proxy( self.setSize, self ) );

         }

         // Check if top padding potentially needs to be adjusted
         if ( document.getElementById('header')
         && $('#header').hasClass('transparency-active') ) {

            // Set the top padding initially
            self.setTopPadding();

            // Update top padding when screen resizes
            $(window).resize( $.proxy( self.setTopPadding, self ) );

         }

         // Check if section has a video background
         if ( self.$element.hasClass('has-video-bg') ) {

            // Mobile check
            if ( navigator.userAgent.match(/(Android|iPod|iPhone|iPad|IEMobile|Opera Mini)/) ) {

               // Reveal image fallback
               if ( self.$element.find('.bg-video-image-fallback').length ) {
                  self.$element.addClass('bg-video-disabled');
                  self.$element.find('.bg-video-image-fallback').css('display','block');
               }

               // Remove the video
               self.$element.find('.bg-video-wrapper').remove();

            }

            // Good to go
            else {

               // Activate the video background
               self.activateVideoBG();

            }

         }

         // Reveal element after loaded
         self.$element.css( 'opacity', 1 );

      },

      setSize: function() {

         var self = this;

         var appliedHeight = $(window).height() * ( parseInt( self.$innerContainer.attr('data-min-height') ) / 100 ),
             headerSize = document.getElementById('header') ? parseInt( $('#header').outerHeight() ) + parseInt( $('#header').offset().top ) : 0,
             elementOffset = self.$element.offset().top;

         if ( elementOffset < ( headerSize + 10 ) ) {
            appliedHeight -= elementOffset;
         }

         // Apply the height
         self.$innerContainer.css( 'height', appliedHeight + 'px' );

      },

      setTopPadding: function() {
         var self = this, headerSize = parseInt( $('#header').outerHeight() );
         self.$innerContainer.css( 'padding-top', '' );
         if ( self.$innerContainer.offset().top < headerSize-5 ) {
            var originalPadding = parseInt( self.$innerContainer.css('padding-top') ),
                headerHeight = parseInt( $('#header').outerHeight() ),
                appliedPadding = originalPadding + headerHeight + 'px';
            self.$innerContainer.css( 'padding-top', appliedPadding );
         }
      },

      activateVideoBG: function() {

         var self = this,
             videoID = self.$element.attr('id')+'-video_bg',
             videoBG = document.getElementById(videoID);

         if ( videoBG.readyState >= videoBG.HAVE_FUTURE_DATA ) {
            self.videoBGLoaded();
         }
         else {
            $(videoBG).on( 'canplay', function() {
               self.videoBGLoaded();
               $(videoBG).off('canplay');
            });
         }

      },

      videoBGLoaded: function() {

         var self = this;

         // Center video initially
         self.scaleVideoBG();

         // Recenter video when screen resizes
         $(window).resize( $.proxy( self.scaleVideoBG, self ) );

         // Fade in the video
         self.$element.addClass('bg-video-loaded');

      },

      scaleVideoBG: function() {

         var self = this,
             $video = self.$element.find('.bg-video'),
             boxWidth = self.$element.outerWidth(),
             boxHeight = self.$element.outerHeight(),
             videoWidth = $video.width(),
             videoHeight = $video.height();

         // Calculate new height and width
         var initW = videoWidth;
         var initH = videoHeight;
         var ratio = initH / initW;

         videoWidth = boxWidth;
         videoHeight = boxWidth * ratio;

         if ( videoHeight < boxHeight ) {
            videoHeight = boxHeight;
            videoWidth = videoHeight / ratio;
         }

         $video.css( 'width', videoWidth+'px' );

      },

      startScrollingBG: function() {

         var self = this, interval,
             direction = self.$element.attr('data-bg-scrolling'),
             speed = self.$element.attr('data-bg-scrolling-speed'),
             x = parseInt( self.$element.css('backgroundPosition').split(' ')[0] ),
             y = parseInt( self.$element.css('backgroundPosition').split(' ')[1] );

         /* Calculate the speed */
         switch (speed) {
            case 'slow': interval = 100; break;
            case 'fast': interval = 500; break;
            case 'very-fast': interval = 1000; break;
            default: interval = 250;
         }

         /* Calculate new position */
         switch (direction) {

            case 'left': x-= interval; break;
            case 'right': x+= interval; break;

            case 'up': y-= interval; break;
            case 'up-left': x-= interval; y-= interval; break;
            case 'up-right': x+= interval; y-= interval; break;

            case 'down': y+= interval; break;
            case 'down-left': x-= interval; y+= interval; break;
            case 'down-right': x+= interval; y+= interval; break;

         }

         self.$element.css( 'background-position', x+'px '+y+'px' );
         setTimeout( $.proxy( self.startScrollingBG, self ), 7500 );

      },

   };

   /* ===================================================================== *
    * Fullwidth Maps
    * ===================================================================== */

   var CVFullwidthMap = function( element ) {
      this.$element = $(element);
      this.init();
      return this;
   };

   CVFullwidthMap.prototype = {

      init: function() {

         var self = this;

         // Do not continue if page sliding is active
         if ( $('html').hasClass('full-page-slider-active') ) { return; }

         // Make sure section has min-height attribute
         if ( ! self.$element.data('height') ) { return; }

         // Set the height initially
         self.setSize();

         // Update height when screen resizes
         $(window).resize( $.proxy( self.setSize, self ) );

         // Reveal the map
         self.$element.css('opacity', 1);

      },

      setSize: function() {

         var self = this;

         var appliedHeight = $(window).height() * parseInt( self.$element.data('height') ) / 100,
             headerSize = document.getElementById('header') ? parseInt( $('#header').outerHeight() + $('#header').offset().top ) : 0,
             elementOffset = self.$element.offset().top;

         if ( elementOffset < headerSize + 10 ) {
            appliedHeight -= elementOffset;
         }

         // Apply the height
         self.$element.css( 'height', appliedHeight + 'px' );

      },

   };

   /* ===================================================================== *
    * Scaling Typography
    * ===================================================================== */

   var CVScalingTypography = function( element ) {
      this.$element = $(element);
      this.init();
      return this;
   };

   CVScalingTypography.prototype = {

      init: function() {

         var self = this;

         // Set the max font size
         self.max        = self.$element.data('max') ? self.$element.data('max') : 40;
         self.min        = self.$element.data('min') ? self.$element.data('min') : 20;
         self.multiplier = self.$element.data('multiplier') ? self.$element.data('multiplier') : 18;

         // Set the font size initially
         self.setSize();

         // Update font size when screen resizes
         self.$element.resize( $.proxy( self.setSize, self ) );

         // Reveal the text
         self.$element.css( 'opacity', 1 );

      },

      setSize: function() {

         var self = this;

         // Apply the font size
         self.$element.css( 'font-size', Math.max( Math.min( self.$element.width() / self.multiplier, parseFloat( self.max ) ), parseFloat( self.min ) ) + 'px' );

      },

   };

   /* ===================================================================== *
    * Media Flags
    * ===================================================================== */

   var CVMediaFlag = function( element ) {
      this.$element = $(element);
      this.init();
      return this;
   };

   CVMediaFlag.prototype = {

      init: function() {

         var self = this;

         self.$columns = self.$element.children();
         self.$innerColumns = self.$element.find('.flag-content-inner, .flag-media-inner');

         if ( ! self.$columns.length ) return;

         // Set the font size initially
         self.setSize();

         // Resize again if content resizes
         self.$innerColumns.resize( $.proxy( self.setSize, self ) );

         // Update font size when screen resizes
         self.$element.resize( $.proxy( self.setSize, self ) );

      },

      setSize: function() {

         var self = this;

         self.$columns.css( 'height', '' );

         if ( 'none' === self.$columns.eq(0).css('float') ) {
            self.$element.css( 'opacity', 1 );
            return;
         }

         var captionHeights = self.$columns.map( function() {
            return $(this).height();
         }).get();

         var maxHeight = Math.max.apply( null, captionHeights );

         self.$columns.css( 'height', maxHeight );

         // Reveal the content
         self.$element.css( 'opacity', 1 );

      },

   };

   /* ===================================================================== *
    * Testimonial Groups
    * ===================================================================== */

   var CVTestimonialGroup = function( element ) {
      this.$element = $(element);
      this.init();
      return this;
   };

   CVTestimonialGroup.prototype = {

      init: function() {

         var self = this;

         if ( self.$element.hasClass('cv-slider') ) {

            // Set the font size initially
            self.matchHeights();

            // Update font size when screen resizes
            $(window).resize( $.proxy( self.matchHeights, self ) );

         }

      },

      matchHeights: function() {

         var self = this,
             $testimonials = self.$element.find('.testimonial-quote');

         // Make sure testimonials are all the same size
         if ( $testimonials.length ) {

            $testimonials.css( 'height', '' );

            var testimonialHeights = $testimonials.map( function() {
               return $(this).height();
            }).get();

            var maxHeight = Math.max.apply( null, testimonialHeights );

            $testimonials.css( 'height', maxHeight );

         }

      },

   };

   /* ===================================================================== *
    * Change Logs
    * ===================================================================== */

   var CVChangeLog = function( element ) {
      this.$element = $(element);
      this.init();
      return this;
   };

   CVChangeLog.prototype = {

      init: function() {

         var self = this;

         if ( self.$element.hasClass('has-update-notes') ) {

            // Attach events
            self.attachEvents();

         }

      },

      attachEvents: function() {

         var self = this,
             $toggle = self.$element.find('.update-notes-toggle'),
             $notes = self.$element.find('.update-notes-wrap');

         $toggle.on( 'click', function() {
            if ( $notes.hasClass('is-open') ) {
               $notes.css( 'height', '0px' );
            }
            else {
               $notes.css( 'height', parseInt( $notes.children().eq(0).outerHeight() ) + 1 );
            }
            $notes.toggleClass('is-open');
         });

      },

   };

   /* ===================================================================== *
    * Promo Boxes
    * ===================================================================== */

   var CVPromoBox = function( element ) {
      this.$element = $(element);
      this.init();
      return this;
   };

   CVPromoBox.prototype = {

      init: function() {

         var self = this;

         // Check if a background image was supplied
         if ( self.$element.hasClass('is-loading-bg-image') ) {
            var src = self.$element.css('background-image'),
                url = src.match(/\((.*?)\)/)[1].replace(/('|")/g,''),
                img = new Image();
            img.onload = function() { self.$element.removeClass('is-loading-bg-image'); }
            img.src = url;
            if (img.complete) img.onload();
         }

         // Set the top padding initially
         self.setTopPadding();

         // Update top padding when screen resizes
         $(window).resize( $.proxy( self.setTopPadding, self ) );

      },

      setTopPadding: function() {
         var self = this;
         self.$element.css( 'padding-top', '' );
         if ( self.$element.hasClass('is-fullwidth')
         &&   document.getElementById('header')
         && $('#header').hasClass('transparency-active')
         && self.$element.offset().top < $('#header').outerHeight() + $('#header').offset().top ) {
            var originalPadding = parseInt( self.$element.css('padding-top') ),
                headerHeight = parseInt( $('#header').outerHeight() ),
                appliedPadding = originalPadding + headerHeight + 'px';
            self.$element.css( 'padding-top', appliedPadding );
         }
      },

   };

   /* ===================================================================== *
    * Toggle Groups
    * ===================================================================== */

   var CVToggleGroup = function( element ) {
      this.$element = $(element);
      this.init();
      return this;
   };

   CVToggleGroup.prototype = {

      init: function() {

         // Create configuration object
         this.config = this.$element.data('config');
         this.config.firstOpen = CVMakeBool( this.config.firstOpen );
         this.config.allowMulti = CVMakeBool( this.config.allowMulti );
         this.config.filtered = this.$element.children('.toggle-filters').length,

         // Toggles object
         this.$toggles = this.$element.children('.toggle');

         // Attach all events
         this.attachEvents();

         var self = this;

         // Open the first toggle
         if ( self.config.firstOpen ) {
            self.$toggles.first().trigger('open-toggle');
         }

      },

      attachEvents: function() {

         var self = this;

         // Closing all toggles
         self.$element.on( 'close-all', function() {
            self.$toggles.trigger('close-toggle');
         });

         // Opening all toggles
         self.$element.on( 'open-all', function() {
            self.$toggles.trigger('open-toggle');
         });

         // Click event
         self.$toggles.children('h3').on( 'click', function() {
            var $this = $(this), $toggle = $this.parent();

            // Make sure the toggle is active
            if ( $toggle.hasClass('is-disabled') ) { return; }

            // Determine what to do
            if ( $toggle.hasClass('is-open') ) {
               $toggle.trigger('close-toggle');
            }
            else {
               $toggle.trigger('open-toggle');
               if ( ! self.config.allowMulti ) {
                  $toggle.siblings().trigger('close-toggle');
               }
            }
         });

         // Opening a toggle
         self.$toggles.on( 'open-toggle', function() {
            self.openToggle( $(this) );
         });

         // Closing a toggle
         self.$toggles.on( 'close-toggle', function() {
            self.closeToggle( $(this) );
         });

         // Filtering toggles
         if ( self.config.filtered ) {
            self.$element.children('.toggle-filters').find('a').on( 'click', function(e) {
               e.preventDefault();
               var $this = $(this), filter = $this.data('filter');
               if ( $this.parent().hasClass('is-active') ) { return; }
               $this.parent().addClass('is-active').siblings().removeClass('is-active');
               self.filterToggles( filter );
            });
         }

      },

      openToggle: function( $toggle ) {
         $toggle.addClass('is-open').children('div').css('height', $toggle.find('.toggle-content').outerHeight() );
      },

      closeToggle: function( $toggle ) {
         $toggle.removeClass('is-open').children('div').removeAttr('style');
      },

      filterToggles: function( filter ) {

         var self = this;

         // Close all toggles
         self.$element.trigger('close-all');

         // Filter the toggles
         setTimeout( function() {
            self.$toggles.each( function() {
               var $toggle = $(this), tags = $toggle.data('tags'), visible = false;
               if ( 'all' === filter ) { $toggle.removeClass('is-disabled'); return; }
               if ( tags ) {
                  tags = tags.split(',');
                  for ( var i=0; i<_.size( tags ); i++ ) {
                     if ( filter === tags[i] ) {
                        visible = true;
                     }
                  }
               }
               if ( visible ) {
                  $toggle.removeClass('is-disabled');
               }
               else {
                  $toggle.addClass('is-disabled');
               }
            });
         }, 250 );

      },

   };

   /* ===================================================================== *
    * Tab Groups
    * ===================================================================== */

   var CVTabGroup = function( element ) {
      this.$element = $(element);
      this.init();
      return this;
   };

   CVTabGroup.prototype = {

      init: function() {
         var self = this;
         self.$tabs = self.$element.children('.tabs').children();
         self.$panes = self.$element.children('.panes').children();
         self.attachEvents();
      },

      attachEvents: function() {
         var self = this;
         self.$tabs.children('a').on( 'click', function() {
            var $this = $(this), $tab = $this.parent(), index = $tab.index();
            if ( $tab.hasClass('is-active') ) { return; }
            self.changeTab( index );
         });
         self.$panes.children('.inner-pane-title').on( 'click', function() {
            var $this = $(this), $tab = $this.parent(), index = $tab.index();
            if ( $tab.hasClass('is-active') ) { return; }
            self.changeTab( index );
         });
      },

      changeTab: function( index ) {
         var self = this;
         self.$tabs.removeClass('is-active').eq(index).addClass('is-active');
         self.$panes.removeClass('is-active').eq(index).addClass('is-active');
      },

   };

   /* ===================================================================== *
    * Contact Forms
    * ===================================================================== */

   var CVContactForm = function( element ) {
      this.$element = $(element);
      this.init();
      return this;
   };

   CVContactForm.prototype = {

      init: function() {
         var self = this;

         // Find all required fields
         self.$fields = self.$element.find('[required]');

         // Attach events
         self.attachEvents();

         // Prevent standard browser validation
         self.$element.attr('novalidate', '');

      },

      attachEvents: function() {

         var self = this, $field;

         // Handle form submissions
         self.$element.on( 'submit', function(e) {

            var hasError = false;

            // Apply the submitted class
            self.$element.addClass( 'was-submitted' );

            self.$fields.each( function() {

               $field = $(this);

               if ( self.hasError( $field ) ) {
                  self.addErrorClass( $field );
                  hasError = true;
               }

            });

            if ( hasError ) {

               // Prevent default submission
               e.preventDefault();

               // Scroll to the form
               $('html, body').stop().animate({
                  scrollTop: (self.$element.offset().top-50)+'px'
               }, 500, 'easeInOutExpo' );

               // Prevent submission via AJAX
               return false;
            }

         });

         // Validate fields as they are edited
         self.$fields.on( 'keyup blur change', function() {

            // Make sure form has been submitted before
            if ( ! self.$element.hasClass('was-submitted') ) { return; }

            var $field = $(this);

            if ( self.hasError( $field ) ) {
               self.addErrorClass( $field );
            }
            else {
               self.removeErrorClass( $field );
            }

         });

         // Clearing the form
         self.$element.find('.clear-form').on( 'click', $.proxy( self.clearForm, self ) );

      },

      hasError: function( $field ) {

         var error = false,
             value = $field.val(),
             pattern;

         switch ( $field.attr('type') ) {

            case 'checkbox':
               if ( ! $field.prop('checked') ) { error = true; }
               break;

            case 'email':
               if ( ! value ) { error = true; }
               else {
                  var pattern = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/; // "
                  if ( ! pattern.test( value ) ) { error = true; }
               }
               break;

            case 'number':
               if ( ! value || ! $.isNumeric( value ) ) { error = true; }
               break;

            default:
               if ( ! value ) { error = true; }
               break;

         }

         return error;

      },

      clearForm: function() {

         var self = this;

         self.$element.removeClass('was-submitted').find('.has-error').removeClass('has-error');

         // Clear text inputs
         self.$element.find('input:not([type="checkbox"]), textarea').val('').trigger('change');

         // Set select boxes to firs option
         self.$element.find('select').each( function() {
            var $this = $(this);
            $this.val( $this.find('option').first().val() ).trigger('change');
         });

         // Return checkboxes to defaults
         self.$element.find('input[type="checkbox"]').each( function() {
            var $this = $(this), checked = 'checked' == $this.data('default') ? true : false;
            $this.prop( 'checked', checked ).trigger('change');
         });

      },

      addErrorClass: function( $field ) {
         $field.closest('.cv-field').addClass('has-error');
      },

      removeErrorClass: function( $field ) {
         $field.closest('.cv-field').removeClass('has-error');
      },

   };

   /* ===================================================================== *
    * Animated Numbers
    * ===================================================================== */

   var CVAnimatedNumber = function( element ) {
      var $element = $(element),
          number = $element.data('number');
      $element.find('.number-container').on( 'entrance', function() {
         $element.find('.odometer').html(number);
      });
   };

   /* ===================================================================== *
    * Progress Bars
    * ===================================================================== */

   var CVProgressBars = function( element ) {
      var $element = $(element);
      if ( ! $element.hasClass('has-animation') ) { return; }
      $element.find('.task-progress').on( 'entrance', function() {
         $(this).addClass('is-visible');
      });
   };

   /* ===================================================================== *
    * Buttons
    * ===================================================================== */

   var CVButton = function( element ) {
      this.$element = $(element);
      this.init();
      return this;
   };

   CVButton.prototype = {

      init: function() {
         var self = this;
         self.$element.addClass('js-color');
         self.color = self.$element.data('color');
         self.setStyles();
      },

      setStyles: function() {
         var self = this;

         /* Ghost Style */
         if ( self.$element.hasClass('is-ghost') ) {
            self.$element.on({
               mouseleave: function() {
                  self.$element.css({
                     backgroundColor: 'rgba(' + self.hexToRGB( self.color ) + ',0.1)',
                     color: self.color,
                  });
               },
               mouseenter: function() {
                  self.$element.css({
                     backgroundColor: 'rgba(' + self.hexToRGB( self.color ) + ',0.15)',
                     color: self.color,
                  });
               },
            }).trigger('mouseleave');
         }

         /* Glassy Style */
         else if ( self.$element.hasClass('is-glassy') ) {
            self.$element.on({
               mouseleave: function() {
                  self.$element.css({
                     backgroundColor: 'transparent',
                     color: self.color,
                  });
               },
               mouseenter: function() {
                  self.$element.css({
                     backgroundColor: 'rgba(' + self.hexToRGB( self.color ) + ',0.15)',
                     color: self.color,
                  });
               },
            }).trigger('mouseleave');
         }

         /* Filled Style */
         else {
            self.$element.on({
               mouseleave: function() {
                  self.$element.css({
                     backgroundColor: self.color,
                  });
               },
               mouseenter: function() {
                  self.$element.css({
                     backgroundColor: 'rgba(' + self.hexToRGB( self.color ) + ',0.75)',
                  });
               },
            }).trigger('mouseleave');
         }
      },

      hexToRGB: function( hex ) {
         var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
         hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
         });
         var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
         return result ? parseInt(result[1], 16)+','+parseInt(result[2], 16)+','+parseInt(result[3], 16) : null;
      },

   };

   /* ===================================================================== *
    * Sliders
    * ===================================================================== */

   var CVSlider = function( element ) {
      this.$element = $(element);
      this.init();
      return this;
   };

   CVSlider.prototype = {

      init: function() {
         var self = this;

         if ( self.$element.hasClass( 'cv-fullwidth-slider') ) {

            // Set the height initially
            self.setupFullWidthSlider();

            // Update height when screen resizes
            $(window).resize( $.proxy( self.setupFullWidthSlider, self ) );

            // vertically center content
            if ( self.$element.attr('data-min-height') ) {
               self.$element.find('.cv-wrap-wrapper').addClass('v-align-middle');
            }

         }

         // Activate the slider
         self.activateSlider();

      },

      setOptions: function() {
         var self = this,
             config = self.$element.data('slider');

         var options = {
            arrows: self.$element.attr('data-controls') ? CVMakeBool( self.$element.attr('data-controls') ) : true,
            dots: self.$element.attr('data-pager') ? CVMakeBool( self.$element.attr('data-pager') ) : true,
            autoplay: self.$element.attr('data-auto') ? CVMakeBool( self.$element.attr('data-auto') ) : false,
            autoplaySpeed: self.$element.attr('data-delay') ? self.$element.attr('data-delay') : 4000,
            slide: self.$element.attr('data-slide-tag') ? self.$element.attr('data-slide-tag') : 'div',
            rtl: $('html').is('[dir="rtl"]'),
         }

         var mode = self.$element.attr('data-mode') ? self.$element.attr('data-mode') : 'fade';

         switch ( mode ) {
            case 'vertical': options.vertical = true; break;
            case 'fade': options.fade = true; break;
         }

         if ( self.$element.hasClass( 'cv-fullwidth-slider') ) {
            options.onAfterChange = function() {

               var $slide = self.$element.find('.slick-slide.slick-active');

               // Reset complete entrances
               $slide.siblings().find('[data-completed-entrance]').trigger('reset-entrance');

               // Trigger active animations
               $slide.find('[data-manual-trigger]').trigger('entrance');

            };
            options.onInit = function() {
               setTimeout( function() {
                  self.$element.find('[data-manual-trigger]').trigger('entrance');
               }, 250 );
            };
         }

         return options;
      },

      activateSlider: function() {
         var self = this;
         self.$element.slick( self.setOptions() );
      },

      setupFullWidthSlider: function() {

         var self = this,
             options = self.setOptions(),
             $captions = self.$element.find('.caption-wrap');

         // Set height of each slide
         if ( self.$element.attr('data-min-height') ) { self.setSlidesSize(); }

         // Make sure captions are all the same size
         if ( $captions.length ) {

            $captions.css( 'min-height', '' );

            var captionHeights = $captions.map( function() {
               return $(this).height();
            }).get();

            var maxHeight = Math.max.apply( null, captionHeights );

            $captions.css( 'min-height', maxHeight );

         }

         // Make sure all slides have equal top padding
         var topPaddings = self.$element.children().map( function() {
            return parseInt( $(this).css('padding-top') );
         }).get();

         var maxTopPadding = Math.max.apply( null, topPaddings );

         self.$element.children().css( 'padding-top', maxTopPadding + 'px' );

         // Check if next/prev nav needs to be repositioned
         if ( self.$element.closest('.slick-slider').find('.slick-next, .slick-prev').length ) {
            var $controls = self.$element.closest('.slick-slider').find('.slick-next, .slick-prev');
            if ( document.getElementById('header')
            && $('#header').hasClass('transparency-active')
            && self.$element.offset().top < ( $('#header').outerHeight() + $('#header').offset().top ) ) {
               var headerHeight = parseInt( $('#header').outerHeight() ) / 2;
               $controls.css({ y: headerHeight+'px' });
            }
            else {
               $controls.children().css({ y: '0px' });
            }
         }

      },

      setSlidesSize: function() {

         var self = this;

         var appliedHeight = $(window).height() * ( parseInt( self.$element.attr('data-min-height') ) / 100 ),
             headerSize = document.getElementById('header') ? parseInt( $('#header').outerHeight() ) + parseInt( $('#header').offset().top ) : 0,
             elementOffset = self.$element.offset().top;

         if ( elementOffset < ( headerSize + 10 ) ) {
            appliedHeight -= elementOffset;
         }

         // Apply the height
         self.$element.find('.cv-wrap-wrapper').css( 'height', appliedHeight + 'px' );

      },

   };

   /* ===================================================================== *
    * Carousel Elements
    * ===================================================================== */

   var CVCarousel = function( element ) {
      this.$element = $(element);
      this.init();
      return this;
   };

   CVCarousel.prototype = {

      init: function() {
         var self = this;

         // Activate the slider
         self.activateSlider();

      },

      setOptions: function() {

         var self = this;

         // Determine how many items per slide to show
         var numItems = self.$element.attr('data-columns') ? parseInt( self.$element.attr('data-columns') ) : 4;
         var scrollNumber = self.$element.attr('data-scroll') ? parseInt( self.$element.attr('data-scroll') ) : 1;
         var scrollAll = 1 === scrollNumber ? false : true;

         // Set up the initial options
         var options = {
            slidesToShow: numItems,
            slidesToScroll: scrollNumber,
            infinite: false,
            arrows: self.$element.attr('data-arrows') ? CVMakeBool( self.$element.attr('data-arrows') ) : true,
            dots: self.$element.attr('data-dots') ? CVMakeBool( self.$element.attr('data-dots') ) : true,
            autoplay: self.$element.attr('data-auto') ? CVMakeBool( self.$element.attr('data-auto') ) : false,
            autoplaySpeed: self.$element.attr('data-delay') ? self.$element.attr('data-delay') : 3000,
            slide: self.$element.attr('data-slide-tag') ? self.$element.attr('data-slide-tag') : 'div',
            rtl: $('html').is('[dir="rtl"]'),
         };

         // Set up the responsive settings
         switch (numItems) {
            case 8:
            case 7:
            case 6:
            case 5:
               options.responsive = [
                  {
                     breakpoint: 900,
                     settings: {
                        slidesToShow: 4,
                        slidesToScroll: scrollAll ? 5 : 1,
                     }
                  },
                  {
                     breakpoint: 700,
                     settings: {
                        slidesToShow: 3,
                        slidesToScroll: scrollAll ? 3 : 1,
                     }
                  },
                  {
                     breakpoint: 500,
                     settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                     }
                  }
               ];
               break;

            case 4:
               options.responsive = [
                  {
                     breakpoint: 900,
                     settings: {
                        slidesToShow: 3,
                        slidesToScroll: scrollAll ? 3 : 1,
                     }
                  },
                  {
                     breakpoint: 700,
                     settings: {
                        slidesToShow: 2,
                        slidesToScroll: scrollAll ? 2 : 1,
                     }
                  },
                  {
                     breakpoint: 500,
                     settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                     }
                  }
               ];
               break;

            case 3:
               options.responsive = [
                  {
                     breakpoint: 700,
                     settings: {
                        slidesToShow: 2,
                        slidesToScroll: scrollAll ? 2 : 1,
                     }
                  },
                  {
                     breakpoint: 500,
                     settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                     }
                  }
               ];
               break;

            case 2:
               options.responsive = [
                  {
                     breakpoint: 500,
                     settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                     }
                  }
               ];
               break;

         }

         return options;

      },

      activateSlider: function() {
         var self = this;
         self.$element.slick( self.setOptions() );
      }

   };

   /* ===================================================================== *
    * Masonry Layouts
    * ===================================================================== */

   var CVMasonryLayout = function( element ) {
      this.$element = $(element);
      this.init();
      return this;
   };

   CVMasonryLayout.prototype = {

      init: function() {

         var self = this;

         // Activate isotope initially
         self.activateIsotope();

         // Insert the filters list
         self.addFilters();

      },

      activateIsotope: function() {
         var self = this;
         self.$element.imagesLoaded( function() {
            self.$element.isotope();
         });
      },

      getTags: function() {
         var self = this, allTags = [];
         self.$element.children().each( function() {
            var $this = $(this), thisTags = $this.data('tags');
            if ( thisTags ) {
               thisTags = thisTags.split(',');
               for ( var i=0; i<_.size( thisTags ); i++ ) {
                  allTags.push(thisTags[i]);
               }
            }
         });
         return _.uniq( allTags );
      },

      addFilters: function() {

         var self = this,
             allTags = self.getTags();

         // Make sure there is at least one tag
         if ( ! _.size( allTags ) ) { return; }

         // Filters container
         var $filters = $( '<ul>', { class: 'masonry-filters filter-list' } );

         // Add the filters label
         if ( self.$element.data('filter-label') ) {
            $filters.append( '<li class="filter-label"><span>'+self.$element.data('filter-label')+'</span></li>' );
         }

         // Add the `All` filter
         $filters.append( '<li class="is-active"><a data-filter="*">All</a></li>' );

         // Add the other filters
         for ( var i=0; i<_.size( allTags ); i++ ) {
            $filters.append( '<li><a data-filter="'+allTags[i]+'">'+allTags[i]+'</a></li>' );
         }

         // Insert the filters
         self.$element.before( $filters );

         // Apply the click event
         $filters.find('a').on( 'click', function() {
            var $this = $(this), filter = $this.data('filter');
            $this.parent().addClass('is-active').siblings().removeClass('is-active');
            self.$element.isotope({
               filter: function() {
                  var $this = $(this);
                  if ( '*' === filter || $this.hasClass('no-filter') ) { return true; }
                  var tags = $this.data('tags');
                  if ( tags ) {
                     tags = tags.split(',');
                     for ( var i=0; i<_.size( tags ); i++ ) {
                        if ( filter === tags[i]) { return true; }
                     }
                  }
                  return false;
               }
            });
         });

      },

   };

   /* ===================================================================== *
    * Tooltips
    * ===================================================================== */

   var CVTooltip = function( element ) {
      var $element = $(element),
          position = $element.data('position') ? $element.data('position') : 'top';
      $element.tooltipster({
         position: position,
         animation: 'fade',
      });
   };

   /* ===================================================================== *
    * Activate all plugins
    * ===================================================================== */

   $(document).on( 'dom-change', function() {

      // Activate min height sections
      $('#body .cv-content-section').each( function() {
         var $this = $(this);
         if ( $this.data( 'CVContentSection' ) ) { return; }
         $this.data( 'CVContentSection', true );
         new CVContentSection( this );
      });

      // Activate min height sections
      $('.cv-fullwidth-map').each( function() {
         var $this = $(this);
         if ( $this.data( 'CVFullwidthMap' ) ) { return; }
         $this.data( 'CVFullwidthMap', true );
         new CVFullwidthMap( this );
      });

      // Activate scaling typography
      $('.cv-media-flag').each( function() {
         var $this = $(this);
         if ( $this.data( 'CVMediaFlag' ) ) { return; }
         $this.data( 'CVMediaFlag', true );
         new CVMediaFlag( this );
      });

      // Activate scaling typography
      $('.cv-scaling-typography').each( function() {
         var $this = $(this);
         if ( $this.data( 'CVScalingTypography' ) ) { return; }
         $this.data( 'CVScalingTypography', true );
         new CVScalingTypography( this );
      });

      // Activate testimonial groups
      $('.cv-testimonial-group').each( function() {
         var $this = $(this);
         if ( $this.data( 'CVTestimonialGroup' ) ) { return; }
         $this.data( 'CVTestimonialGroup', true );
         new CVTestimonialGroup( this );
      });

      // Activate Change Logs
      $('.cv-change-log').each( function() {
         var $this = $(this);
         if ( $this.data( 'CVChangeLog' ) ) { return; }
         $this.data( 'CVChangeLog', true );
         new CVChangeLog( this );
      });

      // Activate promo boxes
      $('.cv-promo-box').each( function() {
         var $this = $(this);
         if ( $this.data( 'CVPromoBox' ) ) { return; }
         $this.data( 'CVPromoBox', true );
         new CVPromoBox( this );
      });

      // Activate toggle groups
      $('.cv-toggle-group').each( function() {
         var $this = $(this);
         if ( $this.data( 'CVToggleGroup' ) ) { return; }
         $this.data( 'CVToggleGroup', true );
         new CVToggleGroup( this );
      });

      // Activate tab groups
      $('.cv-tab-group').each( function() {
         var $this = $(this);
         if ( $this.data( 'CVTabGroup' ) ) { return; }
         $this.data( 'CVTabGroup', true );
         new CVTabGroup( this );
      });

      // Activate contact forms
      $('.cv-form').each( function() {
         var $this = $(this);
         if ( $this.data( 'CVContactForm' ) ) { return; }
         $this.data( 'CVContactForm', true );
         new CVContactForm( this );
      });

      // Activate animated numbers
      $('.cv-animated-number').each( function() {
         var $this = $(this);
         if ( $this.data( 'CVAnimatedNumber' ) ) { return; }
         $this.data( 'CVAnimatedNumber', true );
         new CVAnimatedNumber( this );
      });

      // Activate progress bars
      $('.cv-progress-bars').each( function() {
         var $this = $(this);
         if ( $this.data( 'CVProgressBars' ) ) { return; }
         $this.data( 'CVProgressBars', true );
         new CVProgressBars( this );
      });

      // Activate buttons
      $('.cv-button[data-color]').each( function() {
         var $this = $(this);
         if ( $this.data( 'CVButton' ) ) { return; }
         $this.data( 'CVButton', true );
         new CVButton( this );
      });

      // Activate sliders
      $('.cv-slider').each( function() {
         var $this = $(this);
         if ( $this.data( 'CVSlider' ) ) { return; }
         $this.data( 'CVSlider', true );
         new CVSlider( this );
      });

      // Activate carousels
      $('.cv-carousel').each( function() {
         var $this = $(this);
         if ( $this.data( 'CVCarousel' ) ) { return; }
         $this.data( 'CVCarousel', true );
         new CVCarousel( this );
      });

      // Activate masonry layouts
      $('.masonry-layout').each( function() {
         var $this = $(this);
         if ( $this.data( 'CVMasonryLayout' ) ) { return; }
         $this.data( 'CVMasonryLayout', true );
         new CVMasonryLayout( this );
      });

      // Activate tooltips
      $('.tooltip, [data-tooltip], [rel="tooltip"]').each( function() {
         var $this = $(this);
         if ( $this.data( 'CVTooltip' ) ) { return; }
         $this.data( 'CVTooltip', true );
         new CVTooltip( this );
      });

   }).ready( function() {
      $(document).trigger('dom-change');
   });


   /* ===================================================================== *
    * Responsive Sidebars
    * ===================================================================== */

   var CVResponsiveSidebar = function( element ) {
      this.$element = $(element);
      this.init();
      return this;
   };

   CVResponsiveSidebar.prototype = {

      init: function() {

         var self = this;

         // Make sure responsiveness has been enabled
         if ( ! ( $('body').hasClass('responsive') && $('body').hasClass('sidebar-behavior-normal') ) ) { return; }

         // All widgets in the sidebar
         self.$widgets = self.$element.find('.widget');

         // Split widgets into two columns
         self.splitWidgets();

      },

      splitWidgets: function() {
         var self = this,
             total = self.$widgets.length,
             half = ( total % 2 ) ? (total + 1) / 2 : total / 2;
         self.$widgets.slice(0,half).wrapAll('<div class="responsive-column">');
         self.$widgets.slice(half,total).wrapAll('<div class="responsive-column">');
      },

   };

   /* ===================================================================== *
    * Dropdown Menu with Mega Menu support
    * ===================================================================== */

   var CVDropMenu = function() {
      this.init();
   };

   CVDropMenu.prototype = {

      init: function() {

         var self = this;

         // Set some variables
         self.$header  = $('#header');
         self.$menu    = self.$header.find('.dropdown-menu');
         self.$targets = self.locateTargets();

         if ( ! self.$targets.length ) {
            return;
         }

         // Attach events
         self.attachEvents();

         // Reset mega menus when screen resizes
         $(window).resize( function() {
            self.$menu.find('.width-perfected').removeClass('width-perfected');
            self.$menu.find('.margin-perfected').removeClass('margin-perfected');
         });

      },

      attachEvents: function() {
         var self = this;
         this.$targets.on({
            mouseenter: function() {
               self.openSubMenu( $(this ) );
            },
            mouseleave: function() {
               self.closeSubMenu( $(this ) );
            },
         });
      },

      locateTargets: function() {
         return this.$menu.find('ul').parent();
      },

      openSubMenu: function( $target ) {

         var self = this;

         // prepare for fade in
         $target.addClass('is-active').children('ul').css('opacity', 0);

         // Fade in sub menu
         $target.children('ul').stop().animate({
            opacity: 1
         }, 250, 'swing' );

         // Check if this is a mega menu
         if ( $target.hasClass('mega-menu') ) {
            self.openMegaMenu( $target );
         }

      },

      closeSubMenu: function( $target ) {
         $target.children('ul').stop().animate({
            opacity: 0
         }, 250, 'swing', function() {
            $target.removeClass('is-active');
         } );
      },

      openMegaMenu: function( $target ) {

         var self = this;

         var $megaMenu = $target.children('.sub-menu');

         // Check if width needs to be adjusted
         if ( $target.hasClass('full-width') && ! $target.hasClass('width-perfected') ) {
            $target.children('.sub-menu').css('width', self.$header.find('.cv-user-font').outerWidth() );
            $target.addClass('width-perfected');
         }

         // make sure menu is not off canvas
         if ( ! $target.hasClass('margin-perfected') ) {
            $target.addClass('margin-perfected');
            var megaMenuMarginLeft = parseInt( $megaMenu.css('marginLeft') ),
                megaMenuOffsetLeft = $megaMenu.offset().left,
                megaMenuOffsetRight = megaMenuOffsetLeft + $megaMenu.outerWidth(),
                $container = self.$header.find('.cv-user-font'),
                containerOffsetLeft = $container.offset().left,
                containerOffsetRight = containerOffsetLeft + $container.outerWidth(),
                difference;

            /* Apply correct position */
            if ( megaMenuOffsetRight > containerOffsetRight ) {
               difference = megaMenuOffsetRight - containerOffsetRight;
               $megaMenu.css( 'marginLeft', ( megaMenuMarginLeft - difference ) + 'px' );
            }
            else if ( megaMenuOffsetLeft < containerOffsetLeft ) {
               difference = containerOffsetLeft - megaMenuOffsetLeft;
               $megaMenu.css( 'marginLeft', ( megaMenuMarginLeft + difference ) + 'px' );
            }

         }

         /* Even out height of each column */
         var $columns = $megaMenu.children().css( 'height', false );
         var columnHeights = $columns.map( function() {
            return $(this).height();
         }).get();
         $columns.css( 'height', Math.max.apply( null, columnHeights ) );

      },

   };

   /* ===================================================================== *
    * Modern inline menu
    * ===================================================================== */

   var CVInlineMenu = function() {
      this.init();
   };

   CVInlineMenu.prototype = {

      init: function() {

         var self = this;

         // Set some variables
         self.$header    = $('#header');
         self.$container = self.$header.find('.navigation-container');
         self.$subMenu   = self.locateSubMenu();

         // Align the sub menu initially
         self.alignSubMenu();

         // Update sub menu alignment when screen resizes
         $(window).resize( $.proxy( self.alignSubMenu, self ) );

         // Fade in the sub menu
         self.$subMenu.css( 'opacity', 1 );

      },

      locateSubMenu: function() {
         var self = this,
             query = '.modern-menu > li.current-menu-ancestor > ul,'
                   + '.modern-menu > li.current_page_ancestor > ul,'
                   + '.modern-menu > li.menu-item-has-children.current-menu-item > ul,'
                   + '.modern-menu > li.page_item_has_children.current_page_item > ul';
         return self.$header.find(query).eq(0);
      },

      alignSubMenu: function() {

         var self = this,
             containerWidth = self.$container.width(),
             containerOffsetLeft = self.$container.offset().left,
             subMenuWidth = 10;

         // Determine width of the container
         self.$subMenu.children().each( function() {
            subMenuWidth += $(this).outerWidth();
         });

         // Make sure the correct width is being used
         if ( subMenuWidth > containerWidth ) {
            subMenuWidth = containerWidth;
         }

         // Align the sub menu initially
         self.$subMenu.css({
            width: subMenuWidth,
            marginLeft: -subMenuWidth/2,
         });

         // Modify the submenu margins accordingly
         var subMenuOffsetLeft = self.$subMenu.offset().left,
             subMenuOffsetRight = subMenuOffsetLeft + subMenuWidth,
             containerOffsetRight = containerOffsetLeft + containerWidth,
             difference;

         if ( containerOffsetLeft > subMenuOffsetLeft ) {
            difference = ( containerOffsetLeft - subMenuOffsetLeft ) -5;
            self.$subMenu.css({
               marginLeft: (-subMenuWidth/2)+difference,
            });
         }

         else if ( containerOffsetRight < subMenuOffsetRight ) {
            difference = ( containerOffsetRight - subMenuOffsetRight ) + 5;
            self.$subMenu.css({
               marginLeft: (-subMenuWidth/2)+difference,
            });
         }

      }

   };

   /* ===================================================================== *
    * Overlay menu
    * ===================================================================== */

   var CVOverlayMenu = function() {
      this.init();
   };

   CVOverlayMenu.prototype = {

      init: function() {

         var self = this;

         self.$overlayMenu = $('#cv-overlay-menu');

         // Add the sub menu indicators
         var query = '.menu-item-has-children > a, .page_item_has_children > a';
         self.$overlayMenu.find(query).append('<span class="toggle"></span>');

         // Set sub menu heights
         self.setSubMenuHeights();

         // Attach events
         self.attachEvents();

      },

      setSubMenuHeights: function() {
         var self = this,
             query = '.menu-item-has-children > ul, .page_item_has_children > ul';
         self.$overlayMenu.find(query).each( function() {
            var $this = $(this), height = $this.find('a').length * 40;
            $this.css( 'height', height+'px' );
         });
      },

      attachEvents: function() {
         var self = this,
             query = '.menu-item-has-children > a > .toggle, .page_item_has_children > a > .toggle';
         self.$overlayMenu.find(query).click( function(e) {
            e.preventDefault();
            var $this = $(this).parent(), $li = $this.parent(), $ul = $li.parent();
            if ( $li.hasClass('is-active') ) {
               $li.removeClass('is-active');
               $ul.removeClass('submenu-open');
            }
            else {
               $li.addClass('is-active');
               $ul.addClass('submenu-open');
               $li.siblings('.is-active').each( function() {
                  $(this).removeClass('is-active');
               });
            }
            return false;
         });
      },

   };

   /* ===================================================================== *
    * Scrolling functionality variables
    * ===================================================================== */

   var $document = $(document),
       $window = $(window),
       $headerMarker = document.getElementById('header-marker') ? $('#header-marker') : false,
       $header = document.getElementById('header') ? $('#header') : false,
       $logo = $header ? $header.find('#header-logo') : false;

   /* ===================================================================== *
    * Utility Functions
    * ===================================================================== */

   function CVScrollingEnabled() {
      if ( $('body').hasClass('not-responsive') ) return true;
      return $window.width() >= 640;
   }

   function CVHeaderHeight() {
      var headerHeight = -1;
      if ( CVScrollingEnabled() && $headerMarker ) {
         if ( $headerMarker.hasClass('is-collapsing') ) {
            headerHeight = 57;
         }
         else {
            headerHeight = 85;
         }
      }
      return headerHeight;
   }

   /* ===================================================================== *
    * Sticky Header
    * ===================================================================== */

   var CVStickyHeader = function() {
      this.init();
      return this;
   };

   CVStickyHeader.prototype = {

      init: function() {

         // Make sure sticky header has been enabled
         if ( ! $headerMarker || ! $header ) { return; }

         var self = this;
         self.toggle();
         $window.resize( $.proxy( self.toggle, self ) );

      },

      toggle: function() {
         if ( CVScrollingEnabled() ) {
            if ( ! $document.data( 'CVStickyHeader' ) ) {
               $document.data( 'CVStickyHeader', true );
               this.create();
            }
         }
         else if ( $document.data( 'CVStickyHeader' ) ) {
            $document.data( 'CVStickyHeader', false );
            this.destroy();
         }
      },

      create: function() {
         $headerMarker.waypoint( function( direction ) {
            switch ( direction ) {
               case 'down':
                  $header.addClass('is-stuck');
                  $headerMarker.css( 'height', $header.outerHeight() );
                  if ( $headerMarker.hasClass('transparency-active') ) {
                     $headerMarker.css( 'margin-bottom', -$header.outerHeight() );
                  }
                  break;
               case 'up':
                  $header.removeClass('is-stuck');
                  $headerMarker.css( 'height', '0px' );
                  if ( $headerMarker.hasClass('transparency-active') ) {
                     $headerMarker.css( 'margin-bottom', '0px' );
                  }
                  break;
            }
         });
      },

      destroy: function() {
         $headerMarker.waypoint('destroy');
         $header.removeClass('is-stuck');
         $headerMarker.css( 'height', '0px' );
         $headerMarker.css( 'margin-bottom', '0px' );
      },

   };

   /* ===================================================================== *
    * Collapsing Header
    * ===================================================================== */

   var CVCollapsingHeader = function() {
      this.init();
      return this;
   };

   CVCollapsingHeader.prototype = {

      init: function() {

         // Make sure collapsing header has been enabled
         if ( ! $headerMarker || ! $headerMarker.hasClass('is-collapsing') ) { return; }

         var self = this;
         self.toggle();
         $window.resize( $.proxy( self.toggle, self ) );

      },

      toggle: function() {
         if ( CVScrollingEnabled() ) {
            if ( ! $document.data( 'CVCollapsingHeader' ) ) {
               $document.data( 'CVCollapsingHeader', true );
               this.create();
            }
         }
         else if ( $document.data( 'CVCollapsingHeader' ) ) {
            $document.data( 'CVCollapsingHeader', false );
            this.destroy();
         }
      },

      create: function() {
         var self = this;
         $window.on( 'scroll', $.proxy( self.calculateHeight, self ) );
      },

      destroy: function() {
         var self = this;
         $window.off( 'scroll', $.proxy( self.calculateHeight, self ) );
      },

      calculateHeight: function() {
         var self = this,
             scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
             topOffset = $headerMarker.offset().top,
             originalHeight = 85;

         // Make sure scroll position is not negative
         if ( 0 > scrollTop ) { return; }

         // Check if we`re above the header marker
         if ( scrollTop < topOffset ) {
            if ( originalHeight !== $header.css('height') ) {
               self.setHeight( originalHeight );
            }
            return;
         }

         var headerMarkerHeight = $headerMarker.outerHeight(),
             distance = scrollTop > (topOffset+(headerMarkerHeight/3)) ? headerMarkerHeight/3 : scrollTop - topOffset,
             percent = 1 - ( distance / headerMarkerHeight );

         // Apply the height
         self.setHeight( originalHeight*percent );

      },

      setHeight: function( height ) {
         $header.css({
            height: height+'px',
            lineHeight: height+'px',
         });
         $logo.css({
            height: height+'px',
         });
      }

   };

   /* ===================================================================== *
    * Transparent Header
    * ===================================================================== */

   var CVTransparentHeader = function() {
      this.init();
      return this;
   };

   CVTransparentHeader.prototype = {

      init: function() {

         // Make sure header transparency has been enabled
         if ( ! $headerMarker || ! $headerMarker.hasClass('transparency-active') ) { return; }

         var self = this;
         self.toggle();
         $window.resize( $.proxy( self.toggle, self ) );
      },

      toggle: function() {
         if ( CVScrollingEnabled() ) {
            if ( ! $document.data( 'CVTransparentHeader' ) ) {
               $document.data( 'CVTransparentHeader', true );
               this.create();
            }
         }
         else if ( $document.data( 'CVTransparentHeader' ) ) {
            $document.data( 'CVTransparentHeader', false );
            this.destroy();
         }
      },

      create: function() {
         $headerMarker.waypoint( function( direction ) {
            switch ( direction ) {
               case 'down':
                  $header.removeClass('is-transparent');
                  break;
               case 'up':
                  $header.addClass('is-transparent');
                  break;
            }
         }, { offset: -5 });
      },

      destroy: function() {
         $headerMarker.waypoint('destroy');
         $header.addClass('is-transparent');
      },

   };

   /* ===================================================================== *
    * Parallax Scrolling
    * ===================================================================== */

   var CVParallaxScrolling = function() {
      $window.resize( function() {
         if ( CVScrollingEnabled() && $window.width() >= 1100 ) {
            $('.cv-parallax-content').each( function() {
               var $this = $(this), $content = $this.children().eq(0),
                   offset = 70 > $this.offset().top ? 0 : CVHeaderHeight();
               $window.on( 'scroll', this, function() {
                  var scrollTop = ( document.documentElement.scrollTop || document.body.scrollTop ) + offset,
                      thisHeight = $this.outerHeight(),
                      topOffset = $this.offset().top,
                      bottomOffset = topOffset + thisHeight;
                  if ( ! ( scrollTop > topOffset && scrollTop < bottomOffset ) ) {
                     if ( 1 !== $content.css('opacity') ) {
                        $content.css({ opacity: 1, y: '0px' });
                     }
                     return;
                  }
                  var distance = scrollTop - topOffset,
                      opacity = 1 - ( distance / thisHeight ),
                      translateY = distance / 2 + 'px';
                  $content.css({ opacity: opacity, y: translateY });
               });
            });
         }
      }).trigger('resize');
   };

   /* ===================================================================== *
    * Sticky Menu
    * ===================================================================== */

   var CVStickyMenu = function() {
      this.init();
      return this;
   };

   CVStickyMenu.prototype = {

      init: function() {

         // Make sure there is a sticky menu on the page
         if ( ! document.getElementById('cv-sticky-nav-marker') ) { return; }

         var self = this;
         self.toggle();
         $window.resize( $.proxy( self.toggle, self ) );

         // Make sure sticky menu width does not exceed layout
         if ( ! $('body').hasClass('container-layout-free') ) {
            $window.resize( function() {
               var width = $('.wrap-all').width();
               $('#cv-sticky-nav').css( 'width', width );
            }).trigger('resize');
         }

      },

      toggle: function() {
         if ( CVScrollingEnabled() ) {
            if ( ! $document.data( 'CVStickyMenu' ) ) {
               $document.data( 'CVStickyMenu', true );
               this.create();
            }
         }
         else if ( $document.data( 'CVStickyMenu' ) ) {
            $document.data( 'CVStickyMenu', false );
            this.destroy();
         }
      },

      create: function() {

         var self = this,
             $stickyMarker = $('#cv-sticky-nav-marker'),
             $stickyNav = $('#cv-sticky-nav');

         // Activate sticky menu waypoint
         $stickyMarker.waypoint( function( direction ) {
            switch ( direction ) {
               case 'down':
                  if ( $header && $header.hasClass('is-stuck') ) {
                     $header.addClass('sticky-menu-active');
                  }
                  $stickyNav.addClass('is-stuck').css('margin-top', CVHeaderHeight()+1 );
                  $stickyMarker.css( 'height', $stickyNav.outerHeight() );
                  break;
               case 'up':
                  if ( $header ) {
                     $header.removeClass('sticky-menu-active');
                  }
                  $stickyNav.removeClass('is-stuck').css('margin-top', '0px' );
                  $stickyMarker.css( 'height', '0px' );
                  break;
            }
         }, { offset: CVHeaderHeight() } );

         // Activate scrollspy
         var menuHeight = $stickyNav.outerHeight() + CVHeaderHeight();
         $('#body').children().waypoint( function( direction ) {
            if ( 'down' === direction ) {
               self.scrollSpy( $(this) );
            }
         }, {
            offset: menuHeight,
         });
         $('#body').children().waypoint( function( direction ) {
            if ( 'up' === direction ) {
               self.scrollSpy( $(this) );
            }
         }, {
            offset: function() {
               return - ( $(this).height() - menuHeight );
            },
         });
         $('body').waypoint( function() {
            self.scrollSpy( $(this) );
         }, {
            offset: $header ? -10 : 0,
         });

      },

      destroy: function() {

         // Remove sticky menu waypoint
         var $stickyMarker = $('#cv-sticky-nav-marker'), $stickyNav = $('#cv-sticky-nav');
         $stickyMarker.waypoint('destroy');
         $header.removeClass('sticky-menu-active');
         $stickyNav.removeClass('is-stuck').css('margin-top', '0px' );
         $stickyMarker.css( 'height', '0px' );

         // Remove scrollspy
         $('#body').children().waypoint('destroy');
         $('body').waypoint('destroy');

      },

      scrollSpy: function( $section ) {
         var id = $section.attr('id') ? '#'+$section.attr('id') : null, $stickyNav = $('#cv-sticky-nav');
         if ( id && $stickyNav.find('[href="'+id+'"]').length ) {
            $stickyNav.find('[href="'+id+'"]').addClass('is-active').siblings().removeClass('is-active');
         }
         else {
            $stickyNav.find('a').removeClass('is-active');
         }
      },

   };

   /* ===================================================================== *
    * After document has loaded
    * ===================================================================== */

   $(document).ready( function() {

      // Activate the sticky header
      new CVStickyHeader();

      // Activate the collapsing header
      new CVCollapsingHeader();

      // Activate header transparency
      new CVTransparentHeader();

      // Activate parallax scrolling
      new CVParallaxScrolling();

      // Activate sticky menus
      new CVStickyMenu();

      // Apply button class to comment forms
      $('#respond #submit').addClass('button');

      // Activate Fit Vids
      $('body').fitVids({ ignore: '.no-fitvids' });

      // Disable fixed backgrounds on mobile devices
      if ( navigator.userAgent.match(/(Android|iPod|iPhone|iPad|IEMobile|Opera Mini)/) ) {
         $('body').addClass('dixable-fixed-backgrounds');
      }

      // Refresh waypoints as container changes size
      $('#container').resize( function() { $.waypoints('refresh'); } );

      // Activate lightbox
      var lightboxInstances = 0;
      function getLightboxKey() {
         lightboxInstances++;
         return 'cv-lightbox-'+lightboxInstances;
      }

      $('a[rel^="lightbox"], a[href$=".jpg"], a[href$=".png"], a[href$=".gif"], a[href$=".jpeg"]').filter(':not(.no-lightbox)').filter(':not(.cv-lightbox-gallery-item)').each( function() {
         $(this).magnificPopup( {
            key:  getLightboxKey(),
            midClick:        true,
            closeBtnInside:  true,
            fixedContentPos: false,
            type: 'image',
            closeOnContentClick: true,
         });
      });

      $('.cv-lightbox-gallery, body.single-product .single-product-columns .images').each( function() {
         $(this).magnificPopup( {
            key:  getLightboxKey(),
            midClick:        true,
            closeBtnInside:  true,
            fixedContentPos: false,
            type: 'image',
            delegate: 'a.cv-lightbox-gallery-item',
            gallery: {
               enabled: true,
               tCounter: '<span class="mfp-counter">%curr% / %total%</span>',
            },
         });
      });

      $('a[href*="youtube.com/watch"], a[href*="vimeo.com/"]').filter(':not(.no-lightbox)').filter(':not(.cv-lightbox-gallery-item)').each( function() {
         $(this).magnificPopup( {
            key:  getLightboxKey(),
            midClick:        true,
            closeBtnInside:  true,
            fixedContentPos: false,
            type: 'iframe',
         });
      });

      // Add arrows element after select boxes
      var $selects = $('.cv-form select:not([multiple]):not([size])');
      $selects.wrap('<div class="cv-select-box"></div>');

      // Apply the correct header scripting
      if ( document.getElementById('header') && document.getElementById('primary-navigation') ) {

         // Activate inline menu
         if ( $('#header').hasClass('has-menu-tree') ) { new CVInlineMenu(); }

         // Activate dropdown menu
         if ( $('#header').find('.dropdown-menu').length ) { new CVDropMenu(); }

      }

      // Set up blank page styling
      if ( $('body').hasClass('page-template-template-blank-php') && ! $('html').hasClass('full-page-slider-active') ) {
         var $wrapAll = $('#container > .wrap-all').addClass('v-align-middle');
         $(window).resize( function() { $wrapAll.css( 'min-height', $(window).height() ); });
         $wrapAll.css( 'min-height', $(window).height() );
         $('#body').addClass('v-align-content');
         $('#container').css('opacity', 1);
      }

      // Fade in the banner when it is loaded
      if ( document.getElementById('top-banner') ) {
         var $banner = $('#top-banner');
         if ( $banner.hasClass('is-loading') ) {
            var src = $banner.css('background-image'),
                url = src.match(/\((.*?)\)/)[1].replace(/('|")/g,''),
                img = new Image();
            img.onload = function() { $banner.removeClass('is-loading'); }
            img.src = url;
            if (img.complete) img.onload();
         }
      }

      // Activate floating back to top link
      if ( document.getElementById('cv-floating-anchor') && 800 < $(window).height() ) {

         var $anchor = $('#cv-floating-anchor');

         $(window).scroll( function() {
            var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            if ( 300 < scrollTop ) {
               $anchor.addClass('is-visible');
            }
            else {
               $anchor.removeClass('is-visible');
            }
         });

      }

      // Superlinks
      $(document).on('click', '.cv-superlink', function(event) {
         if ( 'a' === event.target.nodeName.toLowerCase() || $(event.target).parents('a').length ) {
            return;
         }
         var $links = $('a', $(this));
         if ( ! $links.length ) {
            return;
         }

         // [0] gets the JavaScript object to make use of the native
         // click method, which simulates an authentic click event.
         $links.first()[0].click();
      });

      // Animated scrolling
      $('.animate-scroll[href^="#"], .cv-button[href^="#"], #header a[href^="#"]').on( 'click', function(e) {

         var id = '#' === $(this).attr('href') ? '#top' : $(this).attr('href'),
             offset = 0;

         // Make sure target exists
         if ( ! document.getElementById(id.replace('#','')) ) { return; }

         e.preventDefault();

         var $target = $(id), offset = $target.offset().top;

         // Check if sticky header is active
         if ( document.getElementById('header-marker') ) {
            offset -= 58;
         }

         // Check if sticky menu is active
         if ( document.getElementById('cv-sticky-nav') && $target.prevAll('#cv-sticky-nav').length ) {
            offset -= 56;
         }

         // Make sure waypoints are triggered
         offset += 2;

         // Scroll to element
         $('html, body').stop().animate({
            scrollTop: offset+'px'
         }, 1000, 'easeInOutExpo' );

      });

      // Resize the header width to match layout
      if ( document.getElementById('header') && ! $('body').hasClass('container-layout-free') ) {
         $(window).resize( function() {
            var width = $('.wrap-all').width();
            $('#header').css( 'max-width', width );
            if ( document.getElementById('primary-tools') ) {
               $('#primary-tools').css( 'width', width );
            }
         }).trigger('resize');
      }

      // Animated Entrances
      $('[data-entrance]').on( 'entrance', function() {
         var $this = $(this), entrance = $this.data('entrance'),
             delay = $this.data('delay') ? $this.data('delay') : 0;
         if ( entrance ) {
            setTimeout( function() {
               $this.addClass(entrance + ' is-visible');
               setTimeout( function() {
                  $this.removeClass(entrance + ' is-visible').removeAttr('data-entrance');
                  $this.attr('data-completed-entrance', entrance);
               }, 1000 );
            }, parseInt( delay ) );
         }
      });

      // Reset Manually Triggered Entrances
      $('[data-manual-trigger]').on( 'reset-entrance', function() {
         var $this = $(this), entrance = $this.data('completed-entrance');
         if ( entrance ) {
            $this.removeAttr('data-completed-entrance').attr('data-entrance', entrance);
         }
      });

      // Attach entrance waypoints
      $('[data-entrance]:not([data-chained]):not([data-manual-trigger])').waypoint( function() {
         var $this = $(this);
         setTimeout( function() {
            $this.trigger('entrance');
         }, 150 );
      }, { offset: '100%' });

      // Chained animated entrances
      $('[data-trigger-entrances]').waypoint( function() {
         var $this = $(this);
         setTimeout( function() {
            $this.find('[data-entrance][data-chained]').each( function() {
               $(this).trigger('entrance');
            });
         }, 150 );
      }, { offset: '100%' });

      // Launching fullscreen overlays
      $('.launch-fullscreen-overlay[data-overlay]').on( 'click', function() {
         var overlayData = $(this).data('overlay'),
             $target = $('#'+overlayData),
             triggerEvent = 'cv-launch-overlay-'+overlayData;
         $('body').addClass('cv-overlay-open no-scroll').trigger(triggerEvent);

         if ( ! $('body').hasClass('container-layout-free') ) {
            var $wrapAll = $('#container .wrap-all').eq(0),
                width = $wrapAll.outerWidth(),
                left = $wrapAll.offset().left,
                css = { width: width, left: left, };
            $target.css(css);
            $target.find('.close-button').css(css);
         }

         $target.addClass('is-active');
         setTimeout( function() {
            $target.addClass('is-open');
         }, 10 );
      });

      // When search overlay is launched
      $('body').on( 'cv-launch-overlay-cv-overlay-search', function() {
         setTimeout( function() {
            $('#cv-overlay-search').find('input[type="text"]').focus().val('');
         }, 250 );
      });

      // Closing Fullscreen Overlays
      $('.cv-fullscreen-overlay .close-button').on( 'click', function() {
         var $overlay = $(this).parent().trigger('close');
         $overlay.removeClass('is-open');
         setTimeout( function() {
            $overlay.removeClass('is-active');
            $('body').removeClass('no-scroll cv-overlay-open');
         }, 500);
      });

      $(document).on( 'keyup', function(e) {

         if ( e.keyCode !== 27 || ! $('body').hasClass('cv-overlay-open') ) {
            return;
         }

         $('.cv-fullscreen-overlay .close-button').trigger('click');

      });

      // Activate the overlay menu
      if ( document.getElementById('cv-overlay-menu') ) {

         // Activate the overlay menu
         new CVOverlayMenu();

      }

      // Activate responsive sidebars
      $('.content-section-sidebar').each( function() {
         var $this = $(this);
         if ( $this.data( 'CVResponsiveSidebar' ) ) { return; }
         $this.data( 'CVResponsiveSidebar', true );
         new CVResponsiveSidebar( this );
      });

   });

})(jQuery);

/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 *
 * Open source under the BSD License.
 *
 * Copyright Â© 2008 George McGinley Smith
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
*/

jQuery.easing.jswing=jQuery.easing.swing;jQuery.extend(jQuery.easing,{def:"easeOutQuad",swing:function(e,a,c,b,d){return jQuery.easing[jQuery.easing.def](e,a,c,b,d)},easeInQuad:function(e,a,c,b,d){return b*(a/=d)*a+c},easeOutQuad:function(e,a,c,b,d){return-b*(a/=d)*(a-2)+c},easeInOutQuad:function(e,a,c,b,d){if((a/=d/2)<1)return b/2*a*a+c;return-b/2*(--a*(a-2)-1)+c},easeInCubic:function(e,a,c,b,d){return b*(a/=d)*a*a+c},easeOutCubic:function(e,a,c,b,d){return b*((a=a/d-1)*a*a+1)+c},easeInOutCubic:function(e,a,c,b,d){if((a/=d/2)<1)return b/2*a*a*a+c;return b/2*((a-=2)*a*a+2)+c},easeInQuart:function(e,a,c,b,d){return b*(a/=d)*a*a*a+c},easeOutQuart:function(e,a,c,b,d){return-b*((a=a/d-1)*a*a*a-1)+c},easeInOutQuart:function(e,a,c,b,d){if((a/=d/2)<1)return b/2*a*a*a*a+c;return-b/2*((a-=2)*a*a*a-2)+c},easeInQuint:function(e,a,c,b,d){return b*(a/=d)*a*a*a*a+c},easeOutQuint:function(e,a,c,b,d){return b*((a=a/d-1)*a*a*a*a+1)+c},easeInOutQuint:function(e,a,c,b,d){if((a/=d/2)<1)return b/2*a*a*a*a*a+c;return b/2*((a-=2)*a*a*a*a+2)+c},easeInSine:function(e,a,c,b,d){return-b*Math.cos(a/d*(Math.PI/2))+b+c},easeOutSine:function(e,a,c,b,d){return b*Math.sin(a/d*(Math.PI/2))+c},easeInOutSine:function(e,a,c,b,d){return-b/2*(Math.cos(Math.PI*a/d)-1)+c},easeInExpo:function(e,a,c,b,d){return a==0?c:b*Math.pow(2,10*(a/d-1))+c},easeOutExpo:function(e,a,c,b,d){return a==d?c+b:b*(-Math.pow(2,-10*a/d)+1)+c},easeInOutExpo:function(e,a,c,b,d){if(a==0)return c;if(a==d)return c+b;if((a/=d/2)<1)return b/2*Math.pow(2,10*(a-1))+c;return b/2*(-Math.pow(2,-10*--a)+2)+c},easeInCirc:function(e,a,c,b,d){return-b*(Math.sqrt(1-(a/=d)*a)-1)+c},easeOutCirc:function(e,a,c,b,d){return b*Math.sqrt(1-(a=a/d-1)*a)+c},easeInOutCirc:function(e,a,c,b,d){if((a/=d/2)<1)return-b/2*(Math.sqrt(1-a*a)-1)+c;return b/2*(Math.sqrt(1-(a-=2)*a)+1)+c},easeInElastic:function(e,a,c,b,d){e=1.70158;var f=0,g=b;if(a==0)return c;if((a/=d)==1)return c+b;f||(f=d*0.3);if(g<Math.abs(b)){g=b;e=f/4}else e=f/(2*Math.PI)*Math.asin(b/g);return-(g*Math.pow(2,10*(a-=1))*Math.sin((a*d-e)*2*Math.PI/f))+c},easeOutElastic:function(e,a,c,b,d){e=1.70158;var f=0,g=b;if(a==0)return c;if((a/=d)==1)return c+b;f||(f=d*0.3);if(g<Math.abs(b)){g=b;e=f/4}else e=f/(2*Math.PI)*Math.asin(b/g);return g*Math.pow(2,-10*a)*Math.sin((a*d-e)*2*Math.PI/f)+b+c},easeInOutElastic:function(e,a,c,b,d){e=1.70158;var f=0,g=b;if(a==0)return c;if((a/=d/2)==2)return c+b;f||(f=d*0.3*1.5);if(g<Math.abs(b)){g=b;e=f/4}else e=f/(2*Math.PI)*Math.asin(b/g);if(a<1)return-0.5*g*Math.pow(2,10*(a-=1))*Math.sin((a*d-e)*2*Math.PI/f)+c;return g*Math.pow(2,-10*(a-=1))*Math.sin((a*d-e)*2*Math.PI/f)*0.5+b+c},easeInBack:function(e,a,c,b,d,f){if(f==undefined)f=1.70158;return b*(a/=d)*a*((f+1)*a-f)+c},easeOutBack:function(e,a,c,b,d,f){if(f==undefined)f=1.70158;return b*((a=a/d-1)*a*((f+1)*a+f)+1)+c},easeInOutBack:function(e,a,c,b,d,f){if(f==undefined)f=1.70158;if((a/=d/2)<1)return b/2*a*a*(((f*=1.525)+1)*a-f)+c;return b/2*((a-=2)*a*(((f*=1.525)+1)*a+f)+2)+c},easeInBounce:function(e,a,c,b,d){return b-jQuery.easing.easeOutBounce(e,d-a,0,b,d)+c},easeOutBounce:function(e,a,c,b,d){return(a/=d)<1/2.75?b*7.5625*a*a+c:a<2/2.75?b*(7.5625*(a-=1.5/2.75)*a+0.75)+c:a<2.5/2.75?b*(7.5625*(a-=2.25/2.75)*a+0.9375)+c:b*(7.5625*(a-=2.625/2.75)*a+0.984375)+c},easeInOutBounce:function(e,a,c,b,d){if(a<d/2)return jQuery.easing.easeInBounce(e,a*2,0,b,d)*0.5+c;return jQuery.easing.easeOutBounce(e,a*2-d,0,b,d)*0.5+b*0.5+c}});

/*!
 * jQuery resize event - v1.1 - 3/14/2010
 * http://benalman.com/projects/jquery-resize-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery resize event
//
// *Version: 1.1, Last updated: 3/14/2010*
//
// Project Home - http://benalman.com/projects/jquery-resize-plugin/
// GitHub       - http://github.com/cowboy/jquery-resize/
// Source       - http://github.com/cowboy/jquery-resize/raw/master/jquery.ba-resize.js
// (Minified)   - http://github.com/cowboy/jquery-resize/raw/master/jquery.ba-resize.min.js (1.0kb)
//
// About: License
//
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
//
// About: Examples
//
// This working example, complete with fully commented code, illustrates a few
// ways in which this plugin can be used.
//
// resize event - http://benalman.com/code/projects/jquery-resize/examples/resize/
//
// About: Support and Testing
//
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
//
// jQuery Versions - 1.3.2, 1.4.1, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.6, Safari 3-4, Chrome, Opera 9.6-10.1.
// Unit Tests      - http://benalman.com/code/projects/jquery-resize/unit/
//
// About: Release History
//
// 1.1 - (3/14/2010) Fixed a minor bug that was causing the event to trigger
//       immediately after bind in some circumstances. Also changed $.fn.data
//       to $.data to improve performance.
// 1.0 - (2/10/2010) Initial release
;(function(b,s,k){function l(){m=s[h](function(){c.each(function(){var a=b(this),f=a.width(),d=a.height(),g=b.data(this,i);if(f!==g.w||d!==g.h)a.trigger(j,[g.w=f,g.h=d])});l()},e[n])}var c=b([]),e=b.resize=b.extend(b.resize,{}),m,h="setTimeout",j="resize",i=j+"-special-event",n="delay";e[n]=250;e.throttleWindow=true;b.event.special[j]={setup:function(){if(!e.throttleWindow&&this[h])return false;var a=b(this);c=c.add(a);b.data(this,i,{w:a.width(),h:a.height()});c.length===1&&l()},teardown:function(){if(!e.throttleWindow&&this[h])return false;var a=b(this);c=c.not(a);a.removeData(i);c.length||clearTimeout(m)},add:function(a){function f(g,o,p){var q=b(this),r=b.data(this,i);r.w=o!==k?o:q.width();r.h=p!==k?p:q.height();d.apply(this,arguments)}if(!e.throttleWindow&&this[h])return false;var d;if(b.isFunction(a)){d=a;return f}else{d=a.handler;a.handler=f}}}})(jQuery,this);

/*! Tooltipster v3.2.6 */;
;(function(e,t,n){function s(t,n){this.bodyOverflowX;this.callbacks={hide:[],show:[]};this.checkInterval=null;this.Content;this.$el=e(t);this.$elProxy;this.elProxyPosition;this.enabled=true;this.options=e.extend({},i,n);this.mouseIsOverProxy=false;this.namespace="tooltipster-"+Math.round(Math.random()*1e5);this.Status="hidden";this.timerHide=null;this.timerShow=null;this.$tooltip;this.options.iconTheme=this.options.iconTheme.replace(".","");this.options.theme=this.options.theme.replace(".","");this._init()}function o(t,n){var r=true;e.each(t,function(e,i){if(typeof n[e]==="undefined"||t[e]!==n[e]){r=false;return false}});return r}function f(){return!a&&u}function l(){var e=n.body||n.documentElement,t=e.style,r="transition";if(typeof t[r]=="string"){return true}v=["Moz","Webkit","Khtml","O","ms"],r=r.charAt(0).toUpperCase()+r.substr(1);for(var i=0;i<v.length;i++){if(typeof t[v[i]+r]=="string"){return true}}return false}var r="tooltipster",i={animation:"fade",arrow:true,arrowColor:"",autoClose:true,content:null,contentAsHTML:false,contentCloning:true,debug:true,delay:200,minWidth:0,maxWidth:null,functionInit:function(e,t){},functionBefore:function(e,t){t()},functionReady:function(e,t){},functionAfter:function(e){},icon:"(?)",iconCloning:true,iconDesktop:false,iconTouch:false,iconTheme:"tooltipster-icon",interactive:false,interactiveTolerance:350,multiple:false,offsetX:0,offsetY:0,onlyOne:false,position:"top",positionTracker:false,speed:350,timer:0,theme:"tooltipster-default",touchDevices:true,trigger:"hover",updateAnimation:true};s.prototype={_init:function(){var t=this;if(n.querySelector){if(t.options.content!==null){t._content_set(t.options.content)}else{var r=t.$el.attr("title");if(typeof r==="undefined")r=null;t._content_set(r)}var i=t.options.functionInit.call(t.$el,t.$el,t.Content);if(typeof i!=="undefined")t._content_set(i);t.$el.removeAttr("title").addClass("tooltipstered");if(!u&&t.options.iconDesktop||u&&t.options.iconTouch){if(typeof t.options.icon==="string"){t.$elProxy=e('<span class="'+t.options.iconTheme+'"></span>');t.$elProxy.text(t.options.icon)}else{if(t.options.iconCloning)t.$elProxy=t.options.icon.clone(true);else t.$elProxy=t.options.icon}t.$elProxy.insertAfter(t.$el)}else{t.$elProxy=t.$el}if(t.options.trigger=="hover"){t.$elProxy.on("mouseenter."+t.namespace,function(){if(!f()||t.options.touchDevices){t.mouseIsOverProxy=true;t._show()}}).on("mouseleave."+t.namespace,function(){if(!f()||t.options.touchDevices){t.mouseIsOverProxy=false}});if(u&&t.options.touchDevices){t.$elProxy.on("touchstart."+t.namespace,function(){t._showNow()})}}else if(t.options.trigger=="click"){t.$elProxy.on("click."+t.namespace,function(){if(!f()||t.options.touchDevices){t._show()}})}}},_show:function(){var e=this;if(e.Status!="shown"&&e.Status!="appearing"){if(e.options.delay){e.timerShow=setTimeout(function(){if(e.options.trigger=="click"||e.options.trigger=="hover"&&e.mouseIsOverProxy){e._showNow()}},e.options.delay)}else e._showNow()}},_showNow:function(n){var r=this;r.options.functionBefore.call(r.$el,r.$el,function(){if(r.enabled&&r.Content!==null){if(n)r.callbacks.show.push(n);r.callbacks.hide=[];clearTimeout(r.timerShow);r.timerShow=null;clearTimeout(r.timerHide);r.timerHide=null;if(r.options.onlyOne){e(".tooltipstered").not(r.$el).each(function(t,n){var r=e(n),i=r.data("tooltipster-ns");e.each(i,function(e,t){var n=r.data(t),i=n.status(),s=n.option("autoClose");if(i!=="hidden"&&i!=="disappearing"&&s){n.hide()}})})}var i=function(){r.Status="shown";e.each(r.callbacks.show,function(e,t){t.call(r.$el)});r.callbacks.show=[]};if(r.Status!=="hidden"){var s=0;if(r.Status==="disappearing"){r.Status="appearing";if(l()){r.$tooltip.clearQueue().removeClass("tooltipster-dying").addClass("tooltipster-"+r.options.animation+"-show");if(r.options.speed>0)r.$tooltip.delay(r.options.speed);r.$tooltip.queue(i)}else{r.$tooltip.stop().fadeIn(i)}}else if(r.Status==="shown"){i()}}else{r.Status="appearing";var s=r.options.speed;r.bodyOverflowX=e("body").css("overflow-x");e("body").css("overflow-x","hidden");var o="tooltipster-"+r.options.animation,a="-webkit-transition-duration: "+r.options.speed+"ms; -webkit-animation-duration: "+r.options.speed+"ms; -moz-transition-duration: "+r.options.speed+"ms; -moz-animation-duration: "+r.options.speed+"ms; -o-transition-duration: "+r.options.speed+"ms; -o-animation-duration: "+r.options.speed+"ms; -ms-transition-duration: "+r.options.speed+"ms; -ms-animation-duration: "+r.options.speed+"ms; transition-duration: "+r.options.speed+"ms; animation-duration: "+r.options.speed+"ms;",f=r.options.minWidth?"min-width:"+Math.round(r.options.minWidth)+"px;":"",c=r.options.maxWidth?"max-width:"+Math.round(r.options.maxWidth)+"px;":"",h=r.options.interactive?"pointer-events: auto;":"";r.$tooltip=e('<div class="tooltipster-base '+r.options.theme+'" style="'+f+" "+c+" "+h+" "+a+'"><div class="tooltipster-content"></div></div>');if(l())r.$tooltip.addClass(o);r._content_insert();r.$tooltip.appendTo("body");r.reposition();r.options.functionReady.call(r.$el,r.$el,r.$tooltip);if(l()){r.$tooltip.addClass(o+"-show");if(r.options.speed>0)r.$tooltip.delay(r.options.speed);r.$tooltip.queue(i)}else{r.$tooltip.css("display","none").fadeIn(r.options.speed,i)}r._interval_set();e(t).on("scroll."+r.namespace+" resize."+r.namespace,function(){r.reposition()});if(r.options.autoClose){e("body").off("."+r.namespace);if(r.options.trigger=="hover"){if(u){setTimeout(function(){e("body").on("touchstart."+r.namespace,function(){r.hide()})},0)}if(r.options.interactive){if(u){r.$tooltip.on("touchstart."+r.namespace,function(e){e.stopPropagation()})}var p=null;r.$elProxy.add(r.$tooltip).on("mouseleave."+r.namespace+"-autoClose",function(){clearTimeout(p);p=setTimeout(function(){r.hide()},r.options.interactiveTolerance)}).on("mouseenter."+r.namespace+"-autoClose",function(){clearTimeout(p)})}else{r.$elProxy.on("mouseleave."+r.namespace+"-autoClose",function(){r.hide()})}}else if(r.options.trigger=="click"){setTimeout(function(){e("body").on("click."+r.namespace+" touchstart."+r.namespace,function(){r.hide()})},0);if(r.options.interactive){r.$tooltip.on("click."+r.namespace+" touchstart."+r.namespace,function(e){e.stopPropagation()})}}}}if(r.options.timer>0){r.timerHide=setTimeout(function(){r.timerHide=null;r.hide()},r.options.timer+s)}}})},_interval_set:function(){var t=this;t.checkInterval=setInterval(function(){if(e("body").find(t.$el).length===0||e("body").find(t.$elProxy).length===0||t.Status=="hidden"||e("body").find(t.$tooltip).length===0){if(t.Status=="shown"||t.Status=="appearing")t.hide();t._interval_cancel()}else{if(t.options.positionTracker){var n=t._repositionInfo(t.$elProxy),r=false;if(o(n.dimension,t.elProxyPosition.dimension)){if(t.$elProxy.css("position")==="fixed"){if(o(n.position,t.elProxyPosition.position))r=true}else{if(o(n.offset,t.elProxyPosition.offset))r=true}}if(!r){t.reposition()}}}},200)},_interval_cancel:function(){clearInterval(this.checkInterval);this.checkInterval=null},_content_set:function(e){if(typeof e==="object"&&e!==null&&this.options.contentCloning){e=e.clone(true)}this.Content=e},_content_insert:function(){var e=this,t=this.$tooltip.find(".tooltipster-content");if(typeof e.Content==="string"&&!e.options.contentAsHTML){t.text(e.Content)}else{t.empty().append(e.Content)}},_update:function(e){var t=this;t._content_set(e);if(t.Content!==null){if(t.Status!=="hidden"){t._content_insert();t.reposition();if(t.options.updateAnimation){if(l()){t.$tooltip.css({width:"","-webkit-transition":"all "+t.options.speed+"ms, width 0ms, height 0ms, left 0ms, top 0ms","-moz-transition":"all "+t.options.speed+"ms, width 0ms, height 0ms, left 0ms, top 0ms","-o-transition":"all "+t.options.speed+"ms, width 0ms, height 0ms, left 0ms, top 0ms","-ms-transition":"all "+t.options.speed+"ms, width 0ms, height 0ms, left 0ms, top 0ms",transition:"all "+t.options.speed+"ms, width 0ms, height 0ms, left 0ms, top 0ms"}).addClass("tooltipster-content-changing");setTimeout(function(){if(t.Status!="hidden"){t.$tooltip.removeClass("tooltipster-content-changing");setTimeout(function(){if(t.Status!=="hidden"){t.$tooltip.css({"-webkit-transition":t.options.speed+"ms","-moz-transition":t.options.speed+"ms","-o-transition":t.options.speed+"ms","-ms-transition":t.options.speed+"ms",transition:t.options.speed+"ms"})}},t.options.speed)}},t.options.speed)}else{t.$tooltip.fadeTo(t.options.speed,.5,function(){if(t.Status!="hidden"){t.$tooltip.fadeTo(t.options.speed,1)}})}}}}else{t.hide()}},_repositionInfo:function(e){return{dimension:{height:e.outerHeight(false),width:e.outerWidth(false)},offset:e.offset(),position:{left:parseInt(e.css("left")),top:parseInt(e.css("top"))}}},hide:function(n){var r=this;if(n)r.callbacks.hide.push(n);r.callbacks.show=[];clearTimeout(r.timerShow);r.timerShow=null;clearTimeout(r.timerHide);r.timerHide=null;var i=function(){e.each(r.callbacks.hide,function(e,t){t.call(r.$el)});r.callbacks.hide=[]};if(r.Status=="shown"||r.Status=="appearing"){r.Status="disappearing";var s=function(){r.Status="hidden";if(typeof r.Content=="object"&&r.Content!==null){r.Content.detach()}r.$tooltip.remove();r.$tooltip=null;e(t).off("."+r.namespace);e("body").off("."+r.namespace).css("overflow-x",r.bodyOverflowX);e("body").off("."+r.namespace);r.$elProxy.off("."+r.namespace+"-autoClose");r.options.functionAfter.call(r.$el,r.$el);i()};if(l()){r.$tooltip.clearQueue().removeClass("tooltipster-"+r.options.animation+"-show").addClass("tooltipster-dying");if(r.options.speed>0)r.$tooltip.delay(r.options.speed);r.$tooltip.queue(s)}else{r.$tooltip.stop().fadeOut(r.options.speed,s)}}else if(r.Status=="hidden"){i()}return r},show:function(e){this._showNow(e);return this},update:function(e){return this.content(e)},content:function(e){if(typeof e==="undefined"){return this.Content}else{this._update(e);return this}},reposition:function(){var n=this;if(e("body").find(n.$tooltip).length!==0){n.$tooltip.css("width","");n.elProxyPosition=n._repositionInfo(n.$elProxy);var r=null,i=e(t).width(),s=n.elProxyPosition,o=n.$tooltip.outerWidth(false),u=n.$tooltip.innerWidth()+1,a=n.$tooltip.outerHeight(false);if(n.$elProxy.is("area")){var f=n.$elProxy.attr("shape"),l=n.$elProxy.parent().attr("name"),c=e('img[usemap="#'+l+'"]'),h=c.offset().left,p=c.offset().top,d=n.$elProxy.attr("coords")!==undefined?n.$elProxy.attr("coords").split(","):undefined;if(f=="circle"){var v=parseInt(d[0]),m=parseInt(d[1]),g=parseInt(d[2]);s.dimension.height=g*2;s.dimension.width=g*2;s.offset.top=p+m-g;s.offset.left=h+v-g}else if(f=="rect"){var v=parseInt(d[0]),m=parseInt(d[1]),y=parseInt(d[2]),b=parseInt(d[3]);s.dimension.height=b-m;s.dimension.width=y-v;s.offset.top=p+m;s.offset.left=h+v}else if(f=="poly"){var w=[],E=[],S=0,x=0,T=0,N=0,C="even";for(var k=0;k<d.length;k++){var L=parseInt(d[k]);if(C=="even"){if(L>T){T=L;if(k===0){S=T}}if(L<S){S=L}C="odd"}else{if(L>N){N=L;if(k==1){x=N}}if(L<x){x=L}C="even"}}s.dimension.height=N-x;s.dimension.width=T-S;s.offset.top=p+x;s.offset.left=h+S}else{s.dimension.height=c.outerHeight(false);s.dimension.width=c.outerWidth(false);s.offset.top=p;s.offset.left=h}}var A=0,O=0,M=0,_=parseInt(n.options.offsetY),D=parseInt(n.options.offsetX),P=n.options.position;function H(){var n=e(t).scrollLeft();if(A-n<0){r=A-n;A=n}if(A+o-n>i){r=A-(i+n-o);A=i+n-o}}function B(n,r){if(s.offset.top-e(t).scrollTop()-a-_-12<0&&r.indexOf("top")>-1){P=n}if(s.offset.top+s.dimension.height+a+12+_>e(t).scrollTop()+e(t).height()&&r.indexOf("bottom")>-1){P=n;M=s.offset.top-a-_-12}}if(P=="top"){var j=s.offset.left+o-(s.offset.left+s.dimension.width);A=s.offset.left+D-j/2;M=s.offset.top-a-_-12;H();B("bottom","top")}if(P=="top-left"){A=s.offset.left+D;M=s.offset.top-a-_-12;H();B("bottom-left","top-left")}if(P=="top-right"){A=s.offset.left+s.dimension.width+D-o;M=s.offset.top-a-_-12;H();B("bottom-right","top-right")}if(P=="bottom"){var j=s.offset.left+o-(s.offset.left+s.dimension.width);A=s.offset.left-j/2+D;M=s.offset.top+s.dimension.height+_+12;H();B("top","bottom")}if(P=="bottom-left"){A=s.offset.left+D;M=s.offset.top+s.dimension.height+_+12;H();B("top-left","bottom-left")}if(P=="bottom-right"){A=s.offset.left+s.dimension.width+D-o;M=s.offset.top+s.dimension.height+_+12;H();B("top-right","bottom-right")}if(P=="left"){A=s.offset.left-D-o-12;O=s.offset.left+D+s.dimension.width+12;var F=s.offset.top+a-(s.offset.top+s.dimension.height);M=s.offset.top-F/2-_;if(A<0&&O+o>i){var I=parseFloat(n.$tooltip.css("border-width"))*2,q=o+A-I;n.$tooltip.css("width",q+"px");a=n.$tooltip.outerHeight(false);A=s.offset.left-D-q-12-I;F=s.offset.top+a-(s.offset.top+s.dimension.height);M=s.offset.top-F/2-_}else if(A<0){A=s.offset.left+D+s.dimension.width+12;r="left"}}if(P=="right"){A=s.offset.left+D+s.dimension.width+12;O=s.offset.left-D-o-12;var F=s.offset.top+a-(s.offset.top+s.dimension.height);M=s.offset.top-F/2-_;if(A+o>i&&O<0){var I=parseFloat(n.$tooltip.css("border-width"))*2,q=i-A-I;n.$tooltip.css("width",q+"px");a=n.$tooltip.outerHeight(false);F=s.offset.top+a-(s.offset.top+s.dimension.height);M=s.offset.top-F/2-_}else if(A+o>i){A=s.offset.left-D-o-12;r="right"}}if(n.options.arrow){var R="tooltipster-arrow-"+P;if(n.options.arrowColor.length<1){var U=n.$tooltip.css("background-color")}else{var U=n.options.arrowColor}if(!r){r=""}else if(r=="left"){R="tooltipster-arrow-right";r=""}else if(r=="right"){R="tooltipster-arrow-left";r=""}else{r="left:"+Math.round(r)+"px;"}if(P=="top"||P=="top-left"||P=="top-right"){var z=parseFloat(n.$tooltip.css("border-bottom-width")),W=n.$tooltip.css("border-bottom-color")}else if(P=="bottom"||P=="bottom-left"||P=="bottom-right"){var z=parseFloat(n.$tooltip.css("border-top-width")),W=n.$tooltip.css("border-top-color")}else if(P=="left"){var z=parseFloat(n.$tooltip.css("border-right-width")),W=n.$tooltip.css("border-right-color")}else if(P=="right"){var z=parseFloat(n.$tooltip.css("border-left-width")),W=n.$tooltip.css("border-left-color")}else{var z=parseFloat(n.$tooltip.css("border-bottom-width")),W=n.$tooltip.css("border-bottom-color")}if(z>1){z++}var X="";if(z!==0){var V="",J="border-color: "+W+";";if(R.indexOf("bottom")!==-1){V="margin-top: -"+Math.round(z)+"px;"}else if(R.indexOf("top")!==-1){V="margin-bottom: -"+Math.round(z)+"px;"}else if(R.indexOf("left")!==-1){V="margin-right: -"+Math.round(z)+"px;"}else if(R.indexOf("right")!==-1){V="margin-left: -"+Math.round(z)+"px;"}X='<span class="tooltipster-arrow-border" style="'+V+" "+J+';"></span>'}n.$tooltip.find(".tooltipster-arrow").remove();var K='<div class="'+R+' tooltipster-arrow" style="'+r+'">'+X+'<span style="border-color:'+U+';"></span></div>';n.$tooltip.append(K)}n.$tooltip.css({top:Math.round(M)+"px",left:Math.round(A)+"px"})}return n},enable:function(){this.enabled=true;return this},disable:function(){this.hide();this.enabled=false;return this},destroy:function(){var t=this;t.hide();if(t.$el[0]!==t.$elProxy[0])t.$elProxy.remove();t.$el.removeData(t.namespace).off("."+t.namespace);var n=t.$el.data("tooltipster-ns");if(n.length===1){var r=typeof t.Content==="string"?t.Content:e("<div></div>").append(t.Content).html();t.$el.removeClass("tooltipstered").attr("title",r).removeData(t.namespace).removeData("tooltipster-ns").off("."+t.namespace)}else{n=e.grep(n,function(e,n){return e!==t.namespace});t.$el.data("tooltipster-ns",n)}return t},elementIcon:function(){return this.$el[0]!==this.$elProxy[0]?this.$elProxy[0]:undefined},elementTooltip:function(){return this.$tooltip?this.$tooltip[0]:undefined},option:function(e,t){if(typeof t=="undefined")return this.options[e];else{this.options[e]=t;return this}},status:function(){return this.Status}};e.fn[r]=function(){var t=arguments;if(this.length===0){if(typeof t[0]==="string"){var n=true;switch(t[0]){case"setDefaults":e.extend(i,t[1]);break;default:n=false;break}if(n)return true;else return this}else{return this}}else{if(typeof t[0]==="string"){var r="#*$~&";this.each(function(){var n=e(this).data("tooltipster-ns"),i=n?e(this).data(n[0]):null;if(i){if(typeof i[t[0]]==="function"){var s=i[t[0]](t[1],t[2])}else{throw new Error('Unknown method .tooltipster("'+t[0]+'")')}if(s!==i){r=s;return false}}else{throw new Error("You called Tooltipster's \""+t[0]+'" method on an uninitialized element')}});return r!=="#*$~&"?r:this}else{var o=[],u=t[0]&&typeof t[0].multiple!=="undefined",a=u&&t[0].multiple||!u&&i.multiple,f=t[0]&&typeof t[0].debug!=="undefined",l=f&&t[0].debug||!f&&i.debug;this.each(function(){var n=false,r=e(this).data("tooltipster-ns"),i=null;if(!r){n=true}else if(a){n=true}else if(l){console.log('Tooltipster: one or more tooltips are already attached to this element: ignoring. Use the "multiple" option to attach more tooltips.')}if(n){i=new s(this,t[0]);if(!r)r=[];r.push(i.namespace);e(this).data("tooltipster-ns",r);e(this).data(i.namespace,i)}o.push(i)});if(a)return o;else return this}}};var u=!!("ontouchstart"in t);var a=false;e("body").one("mousemove",function(){a=true})})(jQuery,window,document);

/*global jQuery */
/*jshint multistr:true browser:true */
/*!
* FitVids 1.0
*
* Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
* Date: Thu Sept 01 18:00:00 2011 -0500
*/
!function($){"use strict";$.fn.fitVids=function(t){var e={customSelector:null,ignore:null};if(!document.getElementById("fit-vids-style")){var i=document.head||document.getElementsByTagName("head")[0],r=".fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}",a=document.createElement("div");a.innerHTML='<p>x</p><style id="fit-vids-style">'+r+"</style>",i.appendChild(a.childNodes[1])}return t&&$.extend(e,t),this.each(function(){var t=["iframe[src*='player.vimeo.com']","iframe[src*='youtube.com']","iframe[src*='youtube-nocookie.com']","iframe[src*='kickstarter.com'][src*='video.html']","object","embed"];e.customSelector&&t.push(e.customSelector);var i=".fitvidsignore";e.ignore&&(i=i+", "+e.ignore);var r=$(this).find(t.join(","));r=r.not("object object"),r=r.not(i),r.each(function(){var t=$(this);if(!(t.parents(i).length>0||"embed"===this.tagName.toLowerCase()&&t.parent("object").length||t.parent(".fluid-width-video-wrapper").length)){t.css("height")||t.css("width")||!isNaN(t.attr("height"))&&!isNaN(t.attr("width"))||(t.attr("height",9),t.attr("width",16));var e="object"===this.tagName.toLowerCase()||t.attr("height")&&!isNaN(parseInt(t.attr("height"),10))?parseInt(t.attr("height"),10):t.height(),r=isNaN(parseInt(t.attr("width"),10))?t.width():parseInt(t.attr("width"),10),a=e/r;if(!t.attr("id")){var d="fitvid"+Math.floor(999999*Math.random());t.attr("id",d)}t.wrap('<div class="fluid-width-video-wrapper"></div>').parent(".fluid-width-video-wrapper").css("padding-top",100*a+"%"),t.removeAttr("height").removeAttr("width")}})})}}(window.jQuery||window.Zepto);

/*
jQuery Waypoints - v2.0.3
Copyright (c) 2011-2013 Caleb Troughton
Dual licensed under the MIT license and GPL license.
https://github.com/imakewebthings/jquery-waypoints/blob/master/licenses.txt
*/
;(function(){var G=[].indexOf||function(c){for(var i=0,r=this.length;i<r;i++)if(i in this&&this[i]===c)return i;return-1},B=[].slice;(function(c,i){return typeof define==="function"&&define.amd?define("waypoints",["jquery"],function(r){return i(r,c)}):i(c.jQuery,c)})(this,function(c,i){var r,C,x,q,D,t,s,y,l,n,z,A,E,w,u,o;r=c(i);y=G.call(i,"ontouchstart")>=0;q={horizontal:{},vertical:{}};D=1;s={};t="waypoints-context-id";z="resize.waypoints";A="scroll.waypoints";E=1;w="waypoints-waypoint-ids";u="waypoint";o="waypoints";C=function(){function b(a){var d=this;this.$element=a;this.element=a[0];this.didScroll=this.didResize=false;this.id="context"+D++;this.oldScroll={x:a.scrollLeft(),y:a.scrollTop()};this.waypoints={horizontal:{},vertical:{}};a.data(t,this.id);s[this.id]=this;a.bind(A,function(){var e;if(!(d.didScroll||y)){d.didScroll=true;e=function(){d.doScroll();return d.didScroll=false};return i.setTimeout(e,c[o].settings.scrollThrottle)}});a.bind(z,function(){var e;if(!d.didResize){d.didResize=true;e=function(){c[o]("refresh");return d.didResize=false};return i.setTimeout(e,c[o].settings.resizeThrottle)}})}b.prototype.doScroll=function(){var a,d=this;a={horizontal:{newScroll:this.$element.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.$element.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};if(y&&(!a.vertical.oldScroll||!a.vertical.newScroll))c[o]("refresh");c.each(a,function(e,f){var g,k,h;h=[];g=(k=f.newScroll>f.oldScroll)?f.forward:f.backward;c.each(d.waypoints[e],function(j,m){var p,v;if(f.oldScroll<(p=m.offset)&&p<=f.newScroll)return h.push(m);else if(f.newScroll<(v=m.offset)&&v<=f.oldScroll)return h.push(m)});h.sort(function(j,m){return j.offset-m.offset});k||h.reverse();return c.each(h,function(j,m){if(m.options.continuous||j===h.length-1)return m.trigger([g])})});return this.oldScroll={x:a.horizontal.newScroll,y:a.vertical.newScroll}};b.prototype.refresh=function(){var a,d,e=this;d=c.isWindow(this.element);a=this.$element.offset();this.doScroll();a={horizontal:{contextOffset:d?0:a.left,contextScroll:d?0:this.oldScroll.x,contextDimension:this.$element.width(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:d?0:a.top,contextScroll:d?0:this.oldScroll.y,contextDimension:d?c[o]("viewportHeight"):this.$element.height(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};return c.each(a,function(f,g){return c.each(e.waypoints[f],function(k,h){var j,m,p,v,F;j=h.options.offset;p=h.offset;m=c.isWindow(h.element)?0:h.$element.offset()[g.offsetProp];if(c.isFunction(j))j=j.apply(h.element);else if(typeof j==="string"){j=parseFloat(j);if(h.options.offset.indexOf("%")>-1)j=Math.ceil(g.contextDimension*j/100)}h.offset=m-g.contextOffset+g.contextScroll-j;if(!(h.options.onlyOnScroll&&p!=null||!h.enabled))if(p!==null&&p<(v=g.oldScroll)&&v<=h.offset)return h.trigger([g.backward]);else if(p!==null&&p>(F=g.oldScroll)&&F>=h.offset)return h.trigger([g.forward]);else if(p===null&&g.oldScroll>=h.offset)return h.trigger([g.forward])})})};b.prototype.checkEmpty=function(){if(c.isEmptyObject(this.waypoints.horizontal)&&c.isEmptyObject(this.waypoints.vertical)){this.$element.unbind([z,A].join(" "));return delete s[this.id]}};return b}();x=function(){function b(a,d,e){var f;e=c.extend({},c.fn[u].defaults,e);if(e.offset==="bottom-in-view")e.offset=function(){var g;g=c[o]("viewportHeight");c.isWindow(d.element)||(g=d.$element.height());return g-c(this).outerHeight()};this.$element=a;this.element=a[0];this.axis=e.horizontal?"horizontal":"vertical";this.callback=e.handler;this.context=d;this.enabled=e.enabled;this.id="waypoints"+E++;this.offset=null;this.options=e;d.waypoints[this.axis][this.id]=this;q[this.axis][this.id]=this;e=(f=a.data(w))!=null?f:[];e.push(this.id);a.data(w,e)}b.prototype.trigger=function(a){if(this.enabled){this.callback!=null&&this.callback.apply(this.element,a);if(this.options.triggerOnce)return this.destroy()}};b.prototype.disable=function(){return this.enabled=false};b.prototype.enable=function(){this.context.refresh();return this.enabled=true};b.prototype.destroy=function(){delete q[this.axis][this.id];delete this.context.waypoints[this.axis][this.id];return this.context.checkEmpty()};b.getWaypointsByElement=function(a){var d;a=c(a).data(w);if(!a)return[];d=c.extend({},q.horizontal,q.vertical);return c.map(a,function(e){return d[e]})};return b}();n={init:function(b,a){if(a==null)a={};if(a.handler==null)a.handler=b;this.each(function(){var d,e,f;d=c(this);f=(e=a.context)!=null?e:c.fn[u].defaults.context;c.isWindow(f)||(f=d.closest(f));f=c(f);(e=s[f.data(t)])||(e=new C(f));return new x(d,e,a)});c[o]("refresh");return this},disable:function(){return n._invoke(this,"disable")},enable:function(){return n._invoke(this,"enable")},destroy:function(){return n._invoke(this,"destroy")},prev:function(b,a){return n._traverse.call(this,b,a,function(d,e,f){if(e>0)return d.push(f[e-1])})},next:function(b,a){return n._traverse.call(this,b,a,function(d,e,f){if(e<f.length-1)return d.push(f[e+1])})},_traverse:function(b,a,d){var e,f;if(b==null)b="vertical";if(a==null)a=i;f=l.aggregate(a);e=[];this.each(function(){var g;g=c.inArray(this,f[b]);return d(e,g,f[b])});return this.pushStack(e)},_invoke:function(b,a){b.each(function(){var d;d=x.getWaypointsByElement(this);return c.each(d,function(e,f){f[a]();return true})});return this}};c.fn[u]=function(){var b,a;a=arguments[0];b=2<=arguments.length?B.call(arguments,1):[];return n[a]?n[a].apply(this,b):c.isFunction(a)?n.init.apply(this,arguments):c.isPlainObject(a)?n.init.apply(this,[null,a]):a?c.error("The "+a+" method does not exist in jQuery Waypoints."):c.error("jQuery Waypoints needs a callback function or handler option.")};c.fn[u].defaults={context:i,continuous:true,enabled:true,horizontal:false,offset:0,triggerOnce:false};l={refresh:function(){return c.each(s,function(b,a){return a.refresh()})},viewportHeight:function(){var b;return(b=i.innerHeight)!=null?b:r.height()},aggregate:function(b){var a,d,e;a=q;if(b)a=(e=s[c(b).data(t)])!=null?e.waypoints:void 0;if(!a)return[];d={horizontal:[],vertical:[]};c.each(d,function(f,g){c.each(a[f],function(k,h){return g.push(h)});g.sort(function(k,h){return k.offset-h.offset});d[f]=c.map(g,function(k){return k.element});return d[f]=c.unique(d[f])});return d},above:function(b){if(b==null)b=i;return l._filter(b,"vertical",function(a,d){return d.offset<=a.oldScroll.y})},below:function(b){if(b==null)b=i;return l._filter(b,"vertical",function(a,d){return d.offset>a.oldScroll.y})},left:function(b){if(b==null)b=i;return l._filter(b,"horizontal",function(a,d){return d.offset<=a.oldScroll.x})},right:function(b){if(b==null)b=i;return l._filter(b,"horizontal",function(a,d){return d.offset>a.oldScroll.x})},enable:function(){return l._invoke("enable")},disable:function(){return l._invoke("disable")},destroy:function(){return l._invoke("destroy")},extendFn:function(b,a){return n[b]=a},_invoke:function(b){var a;a=c.extend({},q.vertical,q.horizontal);return c.each(a,function(d,e){e[b]();return true})},_filter:function(b,a,d){var e,f;e=s[c(b).data(t)];if(!e)return[];f=[];c.each(e.waypoints[a],function(g,k){if(d(e,k))return f.push(k)});f.sort(function(g,k){return g.offset-k.offset});return c.map(f,function(g){return g.element})}};c[o]=function(){var b,a;a=arguments[0];b=2<=arguments.length?B.call(arguments,1):[];return l[a]?l[a].apply(null,b):l.aggregate.call(null,a)};c[o].settings={resizeThrottle:100,scrollThrottle:30};return r.load(function(){return c[o]("refresh")})})}).call(this);

// fgnass.github.com/spin.js#v1.3.2
/**
 * Copyright (c) 2011-2013 Felix Gnass
 * Licensed under the MIT license
 */
;(function(f,i){if(typeof exports=="object")module.exports=i();else if(typeof define=="function"&&define.amd)define(i);else f.Spinner=i()})(this,function(){function f(c,a){var b=document.createElement(c||"div"),d;for(d in a)b[d]=a[d];return b}function i(c){for(var a=1,b=arguments.length;a<b;a++)c.appendChild(arguments[a]);return c}function l(c,a,b,d){var e=["opacity",a,~~(c*100),b,d].join("-");b=0.01+b/d*100;d=Math.max(1-(1-c)/a*(100-b),c);var g=o.substring(0,o.indexOf("Animation")).toLowerCase();g=g&&"-"+g+"-"||"";if(!x[e]){v.insertRule("@"+g+"keyframes "+e+"{0%{opacity:"+d+"}"+b+"%{opacity:"+c+"}"+(b+0.01)+"%{opacity:1}"+(b+a)%100+"%{opacity:"+c+"}100%{opacity:"+d+"}}",v.cssRules.length);x[e]=1}return e}function p(c,a){var b=c.style,d,e;a=a.charAt(0).toUpperCase()+a.slice(1);for(e=0;e<y.length;e++){d=y[e]+a;if(b[d]!==undefined)return d}if(b[a]!==undefined)return a}function j(c,a){for(var b in a)c.style[p(c,b)||b]=a[b];return c}function m(c){for(var a=1;a<arguments.length;a++){var b=arguments[a],d;for(d in b)if(c[d]===undefined)c[d]=b[d]}return c}function z(c){for(var a={x:c.offsetLeft,y:c.offsetTop};c=c.offsetParent;){a.x+=c.offsetLeft;a.y+=c.offsetTop}return a}function n(c){if(typeof this=="undefined")return new n(c);this.opts=m(c||{},n.defaults,A)}function B(){function c(a,b){return f("<"+a+' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">',b)}v.addRule(".spin-vml","behavior:url(#default#VML)");n.prototype.lines=function(a,b){function d(){return j(c("group",{coordsize:k+" "+k,coordorigin:-g+" "+-g}),{width:k,height:k})}function e(q,s,r){i(t,i(j(d(),{rotation:360/b.lines*q+"deg",left:~~s}),i(j(c("roundrect",{arcsize:b.corners}),{width:g,height:b.width,left:b.radius,top:-b.width>>1,filter:r}),c("fill",{color:typeof b.color=="string"?b.color:b.color[q%b.color.length],opacity:b.opacity}),c("stroke",{opacity:0}))))}var g=b.length+b.width,k=2*g,h=-(b.width+b.length)*2+"px",t=j(d(),{position:"absolute",top:h,left:h});if(b.shadow)for(h=1;h<=b.lines;h++)e(h,-2,"progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");for(h=1;h<=b.lines;h++)e(h);return i(a,t)};n.prototype.opacity=function(a,b,d,e){a=a.firstChild;e=e.shadow&&e.lines||0;if(a&&b+e<a.childNodes.length)if(a=(a=(a=a.childNodes[b+e])&&a.firstChild)&&a.firstChild)a.opacity=d}}var y=["webkit","Moz","ms","O"],x={},o,v=function(){var c=f("style",{type:"text/css"});i(document.getElementsByTagName("head")[0],c);return c.sheet||c.styleSheet}(),A={lines:12,length:7,width:5,radius:10,rotate:0,corners:1,color:"#000",direction:1,speed:1,trail:100,opacity:0.25,fps:20,zIndex:2E9,className:"spinner",top:"auto",left:"auto",position:"relative"};n.defaults={};m(n.prototype,{spin:function(c){this.stop();var a=this,b=a.opts,d=a.el=j(f(0,{className:b.className}),{position:b.position,width:0,zIndex:b.zIndex}),e=b.radius+b.length+b.width,g,k;if(c){c.insertBefore(d,c.firstChild||null);k=z(c);g=z(d);j(d,{left:(b.left=="auto"?k.x-g.x+(c.offsetWidth>>1):parseInt(b.left,10)+e)+"px",top:(b.top=="auto"?k.y-g.y+(c.offsetHeight>>1):parseInt(b.top,10)+e)+"px"})}d.setAttribute("role","progressbar");a.lines(d,a.opts);if(!o){var h=0,t=(b.lines-1)*(1-b.direction)/2,q,s=b.fps,r=s/b.speed,C=(1-b.opacity)/(r*b.trail/100),D=r/b.lines;(function E(){h++;for(var u=0;u<b.lines;u++){q=Math.max(1-(h+(b.lines-u)*D)%r*C,b.opacity);a.opacity(d,u*b.direction+t,q,b)}a.timeout=a.el&&setTimeout(E,~~(1E3/s))})()}return a},stop:function(){var c=this.el;if(c){clearTimeout(this.timeout);c.parentNode&&c.parentNode.removeChild(c);this.el=undefined}return this},lines:function(c,a){function b(k,h){return j(f(),{position:"absolute",width:a.length+a.width+"px",height:a.width+"px",background:k,boxShadow:h,transformOrigin:"left",transform:"rotate("+~~(360/a.lines*d+a.rotate)+"deg) translate("+a.radius+"px,0)",borderRadius:(a.corners*a.width>>1)+"px"})}for(var d=0,e=(a.lines-1)*(1-a.direction)/2,g;d<a.lines;d++){g=j(f(),{position:"absolute",top:1+~(a.width/2)+"px",transform:a.hwaccel?"translate3d(0,0,0)":"",opacity:a.opacity,animation:o&&l(a.opacity,a.trail,e+d*a.direction,a.lines)+" "+1/a.speed+"s linear infinite"});a.shadow&&i(g,j(b("#000","0 0 4px #000"),{top:"2px"}));i(c,i(g,b(typeof a.color=="string"?a.color:a.color[d%a.color.length],"0 0 1px rgba(0,0,0,.1)")))}return c},opacity:function(c,a,b){if(a<c.childNodes.length)c.childNodes[a].style.opacity=b}});var w=j(f("group"),{behavior:"url(#default#VML)"});if(!p(w,"transform")&&w.adj)B();else o=p(w,"animation");return n});(function(f){if(typeof exports=="object")f(require("jquery"),require("spin"));else if(typeof define=="function"&&define.amd)define(["jquery","spin"],f);else{if(!window.Spinner)throw Error("Spin.js not present");f(window.jQuery,window.Spinner)}})(function(f,i){f.fn.spin=function(l,p){return this.each(function(){var j=f(this),m=j.data();if(m.spinner){m.spinner.stop();delete m.spinner}if(l!==false){l=f.extend({color:p||j.css("color")},f.fn.spin.presets[l]||l);m.spinner=(new i(l)).spin(this)}})};f.fn.spin.presets={tiny:{lines:8,length:2,width:2,radius:3},small:{lines:8,length:4,width:3,radius:5},large:{lines:10,length:8,width:4,radius:8}}});

/*!
 * imagesLoaded PACKAGED v3.1.7
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */
;(function(){function e(){}function t(e,t){for(var n=e.length;n--;)if(e[n].listener===t)return n;return-1}function n(e){return function(){return this[e].apply(this,arguments)}}var i=e.prototype,r=this,o=r.EventEmitter;i.getListeners=function(e){var t,n,i=this._getEvents();if("object"==typeof e){t={};for(n in i)i.hasOwnProperty(n)&&e.test(n)&&(t[n]=i[n])}else t=i[e]||(i[e]=[]);return t},i.flattenListeners=function(e){var t,n=[];for(t=0;e.length>t;t+=1)n.push(e[t].listener);return n},i.getListenersAsObject=function(e){var t,n=this.getListeners(e);return n instanceof Array&&(t={},t[e]=n),t||n},i.addListener=function(e,n){var i,r=this.getListenersAsObject(e),o="object"==typeof n;for(i in r)r.hasOwnProperty(i)&&-1===t(r[i],n)&&r[i].push(o?n:{listener:n,once:!1});return this},i.on=n("addListener"),i.addOnceListener=function(e,t){return this.addListener(e,{listener:t,once:!0})},i.once=n("addOnceListener"),i.defineEvent=function(e){return this.getListeners(e),this},i.defineEvents=function(e){for(var t=0;e.length>t;t+=1)this.defineEvent(e[t]);return this},i.removeListener=function(e,n){var i,r,o=this.getListenersAsObject(e);for(r in o)o.hasOwnProperty(r)&&(i=t(o[r],n),-1!==i&&o[r].splice(i,1));return this},i.off=n("removeListener"),i.addListeners=function(e,t){return this.manipulateListeners(!1,e,t)},i.removeListeners=function(e,t){return this.manipulateListeners(!0,e,t)},i.manipulateListeners=function(e,t,n){var i,r,o=e?this.removeListener:this.addListener,s=e?this.removeListeners:this.addListeners;if("object"!=typeof t||t instanceof RegExp)for(i=n.length;i--;)o.call(this,t,n[i]);else for(i in t)t.hasOwnProperty(i)&&(r=t[i])&&("function"==typeof r?o.call(this,i,r):s.call(this,i,r));return this},i.removeEvent=function(e){var t,n=typeof e,i=this._getEvents();if("string"===n)delete i[e];else if("object"===n)for(t in i)i.hasOwnProperty(t)&&e.test(t)&&delete i[t];else delete this._events;return this},i.removeAllListeners=n("removeEvent"),i.emitEvent=function(e,t){var n,i,r,o,s=this.getListenersAsObject(e);for(r in s)if(s.hasOwnProperty(r))for(i=s[r].length;i--;)n=s[r][i],n.once===!0&&this.removeListener(e,n.listener),o=n.listener.apply(this,t||[]),o===this._getOnceReturnValue()&&this.removeListener(e,n.listener);return this},i.trigger=n("emitEvent"),i.emit=function(e){var t=Array.prototype.slice.call(arguments,1);return this.emitEvent(e,t)},i.setOnceReturnValue=function(e){return this._onceReturnValue=e,this},i._getOnceReturnValue=function(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},i._getEvents=function(){return this._events||(this._events={})},e.noConflict=function(){return r.EventEmitter=o,e},"function"==typeof define&&define.amd?define("eventEmitter/EventEmitter",[],function(){return e}):"object"==typeof module&&module.exports?module.exports=e:this.EventEmitter=e}).call(this),function(e){function t(t){var n=e.event;return n.target=n.target||n.srcElement||t,n}var n=document.documentElement,i=function(){};n.addEventListener?i=function(e,t,n){e.addEventListener(t,n,!1)}:n.attachEvent&&(i=function(e,n,i){e[n+i]=i.handleEvent?function(){var n=t(e);i.handleEvent.call(i,n)}:function(){var n=t(e);i.call(e,n)},e.attachEvent("on"+n,e[n+i])});var r=function(){};n.removeEventListener?r=function(e,t,n){e.removeEventListener(t,n,!1)}:n.detachEvent&&(r=function(e,t,n){e.detachEvent("on"+t,e[t+n]);try{delete e[t+n]}catch(i){e[t+n]=void 0}});var o={bind:i,unbind:r};"function"==typeof define&&define.amd?define("eventie/eventie",o):e.eventie=o}(this),function(e,t){"function"==typeof define&&define.amd?define(["eventEmitter/EventEmitter","eventie/eventie"],function(n,i){return t(e,n,i)}):"object"==typeof exports?module.exports=t(e,require("eventEmitter"),require("eventie")):e.imagesLoaded=t(e,e.EventEmitter,e.eventie)}(window,function(e,t,n){function i(e,t){for(var n in t)e[n]=t[n];return e}function r(e){return"[object Array]"===d.call(e)}function o(e){var t=[];if(r(e))t=e;else if("number"==typeof e.length)for(var n=0,i=e.length;i>n;n++)t.push(e[n]);else t.push(e);return t}function s(e,t,n){if(!(this instanceof s))return new s(e,t);"string"==typeof e&&(e=document.querySelectorAll(e)),this.elements=o(e),this.options=i({},this.options),"function"==typeof t?n=t:i(this.options,t),n&&this.on("always",n),this.getImages(),a&&(this.jqDeferred=new a.Deferred);var r=this;setTimeout(function(){r.check()})}function c(e){this.img=e}function f(e){this.src=e,v[e]=this}var a=e.jQuery,u=e.console,h=u!==void 0,d=Object.prototype.toString;s.prototype=new t,s.prototype.options={},s.prototype.getImages=function(){this.images=[];for(var e=0,t=this.elements.length;t>e;e++){var n=this.elements[e];"IMG"===n.nodeName&&this.addImage(n);var i=n.nodeType;if(i&&(1===i||9===i||11===i))for(var r=n.querySelectorAll("img"),o=0,s=r.length;s>o;o++){var c=r[o];this.addImage(c)}}},s.prototype.addImage=function(e){var t=new c(e);this.images.push(t)},s.prototype.check=function(){function e(e,r){return t.options.debug&&h&&u.log("confirm",e,r),t.progress(e),n++,n===i&&t.complete(),!0}var t=this,n=0,i=this.images.length;if(this.hasAnyBroken=!1,!i)return this.complete(),void 0;for(var r=0;i>r;r++){var o=this.images[r];o.on("confirm",e),o.check()}},s.prototype.progress=function(e){this.hasAnyBroken=this.hasAnyBroken||!e.isLoaded;var t=this;setTimeout(function(){t.emit("progress",t,e),t.jqDeferred&&t.jqDeferred.notify&&t.jqDeferred.notify(t,e)})},s.prototype.complete=function(){var e=this.hasAnyBroken?"fail":"done";this.isComplete=!0;var t=this;setTimeout(function(){if(t.emit(e,t),t.emit("always",t),t.jqDeferred){var n=t.hasAnyBroken?"reject":"resolve";t.jqDeferred[n](t)}})},a&&(a.fn.imagesLoaded=function(e,t){var n=new s(this,e,t);return n.jqDeferred.promise(a(this))}),c.prototype=new t,c.prototype.check=function(){var e=v[this.img.src]||new f(this.img.src);if(e.isConfirmed)return this.confirm(e.isLoaded,"cached was confirmed"),void 0;if(this.img.complete&&void 0!==this.img.naturalWidth)return this.confirm(0!==this.img.naturalWidth,"naturalWidth"),void 0;var t=this;e.on("confirm",function(e,n){return t.confirm(e.isLoaded,n),!0}),e.check()},c.prototype.confirm=function(e,t){this.isLoaded=e,this.emit("confirm",this,t)};var v={};return f.prototype=new t,f.prototype.check=function(){if(!this.isChecked){var e=new Image;n.bind(e,"load",this),n.bind(e,"error",this),e.src=this.src,this.isChecked=!0}},f.prototype.handleEvent=function(e){var t="on"+e.type;this[t]&&this[t](e)},f.prototype.onload=function(e){this.confirm(!0,"onload"),this.unbindProxyEvents(e)},f.prototype.onerror=function(e){this.confirm(!1,"onerror"),this.unbindProxyEvents(e)},f.prototype.confirm=function(e,t){this.isConfirmed=!0,this.isLoaded=e,this.emit("confirm",this,t)},f.prototype.unbindProxyEvents=function(e){n.unbind(e.target,"load",this),n.unbind(e.target,"error",this)},s});

/*! odometer 0.4.7 */
;(function(){var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G=[].slice;q='<span class="odometer-value"></span>',n='<span class="odometer-ribbon"><span class="odometer-ribbon-inner">'+q+"</span></span>",d='<span class="odometer-digit"><span class="odometer-digit-spacer">8</span><span class="odometer-digit-inner">'+n+"</span></span>",g='<span class="odometer-formatting-mark"></span>',c="(,ddd).dd",h=/^\(?([^)]*)\)?(?:(.)(d+))?$/,i=30,f=2e3,a=20,j=2,e=.5,k=1e3/i,b=1e3/a,o="transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd",y=document.createElement("div").style,p=null!=y.transition||null!=y.webkitTransition||null!=y.mozTransition||null!=y.oTransition,w=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame,l=window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver,s=function(a){var b;return b=document.createElement("div"),b.innerHTML=a,b.children[0]},v=function(a,b){return a.className=a.className.replace(new RegExp("(^| )"+b.split(" ").join("|")+"( |$)","gi")," ")},r=function(a,b){return v(a,b),a.className+=" "+b},z=function(a,b){var c;return null!=document.createEvent?(c=document.createEvent("HTMLEvents"),c.initEvent(b,!0,!0),a.dispatchEvent(c)):void 0},u=function(){var a,b;return null!=(a=null!=(b=window.performance)&&"function"==typeof b.now?b.now():void 0)?a:+new Date},x=function(a,b){return null==b&&(b=0),b?(a*=Math.pow(10,b),a+=.5,a=Math.floor(a),a/=Math.pow(10,b)):Math.round(a)},A=function(a){return 0>a?Math.ceil(a):Math.floor(a)},t=function(a){return a-x(a)},C=!1,(B=function(){var a,b,c,d,e;if(!C&&null!=window.jQuery){for(C=!0,d=["html","text"],e=[],b=0,c=d.length;c>b;b++)a=d[b],e.push(function(a){var b;return b=window.jQuery.fn[a],window.jQuery.fn[a]=function(a){var c;return null==a||null==(null!=(c=this[0])?c.odometer:void 0)?b.apply(this,arguments):this[0].odometer.update(a)}}(a));return e}})(),setTimeout(B,0),m=function(){function a(b){var c,d,e,g,h,i,l,m,n,o,p=this;if(this.options=b,this.el=this.options.el,null!=this.el.odometer)return this.el.odometer;this.el.odometer=this,m=a.options;for(d in m)g=m[d],null==this.options[d]&&(this.options[d]=g);null==(h=this.options).duration&&(h.duration=f),this.MAX_VALUES=this.options.duration/k/j|0,this.resetFormat(),this.value=this.cleanValue(null!=(n=this.options.value)?n:""),this.renderInside(),this.render();try{for(o=["innerHTML","innerText","textContent"],i=0,l=o.length;l>i;i++)e=o[i],null!=this.el[e]&&!function(a){return Object.defineProperty(p.el,a,{get:function(){var b;return"innerHTML"===a?p.inside.outerHTML:null!=(b=p.inside.innerText)?b:p.inside.textContent},set:function(a){return p.update(a)}})}(e)}catch(q){c=q,this.watchForMutations()}}return a.prototype.renderInside=function(){return this.inside=document.createElement("div"),this.inside.className="odometer-inside",this.el.innerHTML="",this.el.appendChild(this.inside)},a.prototype.watchForMutations=function(){var a,b=this;if(null!=l)try{return null==this.observer&&(this.observer=new l(function(){var a;return a=b.el.innerText,b.renderInside(),b.render(b.value),b.update(a)})),this.watchMutations=!0,this.startWatchingMutations()}catch(c){a=c}},a.prototype.startWatchingMutations=function(){return this.watchMutations?this.observer.observe(this.el,{childList:!0}):void 0},a.prototype.stopWatchingMutations=function(){var a;return null!=(a=this.observer)?a.disconnect():void 0},a.prototype.cleanValue=function(a){var b;return"string"==typeof a&&(a=a.replace(null!=(b=this.format.radix)?b:".","<radix>"),a=a.replace(/[.,]/g,""),a=a.replace("<radix>","."),a=parseFloat(a,10)||0),x(a,this.format.precision)},a.prototype.bindTransitionEnd=function(){var a,b,c,d,e,f,g=this;if(!this.transitionEndBound){for(this.transitionEndBound=!0,b=!1,e=o.split(" "),f=[],c=0,d=e.length;d>c;c++)a=e[c],f.push(this.el.addEventListener(a,function(){return b?!0:(b=!0,setTimeout(function(){return g.render(),b=!1,z(g.el,"odometerdone")},0),!0)},!1));return f}},a.prototype.resetFormat=function(){var a,b,d,e,f,g,i,j;if(a=null!=(i=this.options.format)?i:c,a||(a="d"),d=h.exec(a),!d)throw new Error("Odometer: Unparsable digit format");return j=d.slice(1,4),g=j[0],f=j[1],b=j[2],e=(null!=b?b.length:void 0)||0,this.format={repeating:g,radix:f,precision:e}},a.prototype.render=function(a){var b,c,d,e,f,g,h;for(null==a&&(a=this.value),this.stopWatchingMutations(),this.resetFormat(),this.inside.innerHTML="",f=this.options.theme,b=this.el.className.split(" "),e=[],g=0,h=b.length;h>g;g++)c=b[g],c.length&&((d=/^odometer-theme-(.+)$/.exec(c))?f=d[1]:/^odometer(-|$)/.test(c)||e.push(c));return e.push("odometer"),p||e.push("odometer-no-transitions"),e.push(f?"odometer-theme-"+f:"odometer-auto-theme"),this.el.className=e.join(" "),this.ribbons={},this.formatDigits(a),this.startWatchingMutations()},a.prototype.formatDigits=function(a){var b,c,d,e,f,g,h,i,j,k;if(this.digits=[],this.options.formatFunction)for(d=this.options.formatFunction(a),j=d.split("").reverse(),f=0,h=j.length;h>f;f++)c=j[f],c.match(/0-9/)?(b=this.renderDigit(),b.querySelector(".odometer-value").innerHTML=c,this.digits.push(b),this.insertDigit(b)):this.addSpacer(c);else for(e=!this.format.precision||!t(a)||!1,k=a.toString().split("").reverse(),g=0,i=k.length;i>g;g++)b=k[g],"."===b&&(e=!0),this.addDigit(b,e)},a.prototype.update=function(a){var b,c=this;return a=this.cleanValue(a),(b=a-this.value)?(v(this.el,"odometer-animating-up odometer-animating-down odometer-animating"),b>0?r(this.el,"odometer-animating-up"):r(this.el,"odometer-animating-down"),this.stopWatchingMutations(),this.animate(a),this.startWatchingMutations(),setTimeout(function(){return c.el.offsetHeight,r(c.el,"odometer-animating")},0),this.value=a):void 0},a.prototype.renderDigit=function(){return s(d)},a.prototype.insertDigit=function(a,b){return null!=b?this.inside.insertBefore(a,b):this.inside.children.length?this.inside.insertBefore(a,this.inside.children[0]):this.inside.appendChild(a)},a.prototype.addSpacer=function(a,b,c){var d;return d=s(g),d.innerHTML=a,c&&r(d,c),this.insertDigit(d,b)},a.prototype.addDigit=function(a,b){var c,d,e,f;if(null==b&&(b=!0),"-"===a)return this.addSpacer(a,null,"odometer-negation-mark");if("."===a)return this.addSpacer(null!=(f=this.format.radix)?f:".",null,"odometer-radix-mark");if(b)for(e=!1;;){if(!this.format.repeating.length){if(e)throw new Error("Bad odometer format without digits");this.resetFormat(),e=!0}if(c=this.format.repeating[this.format.repeating.length-1],this.format.repeating=this.format.repeating.substring(0,this.format.repeating.length-1),"d"===c)break;this.addSpacer(c)}return d=this.renderDigit(),d.querySelector(".odometer-value").innerHTML=a,this.digits.push(d),this.insertDigit(d)},a.prototype.animate=function(a){return p&&"count"!==this.options.animation?this.animateSlide(a):this.animateCount(a)},a.prototype.animateCount=function(a){var c,d,e,f,g,h=this;if(d=+a-this.value)return f=e=u(),c=this.value,(g=function(){var i,j,k;return u()-f>h.options.duration?(h.value=a,h.render(),void z(h.el,"odometerdone")):(i=u()-e,i>b&&(e=u(),k=i/h.options.duration,j=d*k,c+=j,h.render(Math.round(c))),null!=w?w(g):setTimeout(g,b))})()},a.prototype.getDigitCount=function(){var a,b,c,d,e,f;for(d=1<=arguments.length?G.call(arguments,0):[],a=e=0,f=d.length;f>e;a=++e)c=d[a],d[a]=Math.abs(c);return b=Math.max.apply(Math,d),Math.ceil(Math.log(b+1)/Math.log(10))},a.prototype.getFractionalDigitCount=function(){var a,b,c,d,e,f,g;for(e=1<=arguments.length?G.call(arguments,0):[],b=/^\-?\d*\.(\d*?)0*$/,a=f=0,g=e.length;g>f;a=++f)d=e[a],e[a]=d.toString(),c=b.exec(e[a]),e[a]=null==c?0:c[1].length;return Math.max.apply(Math,e)},a.prototype.resetDigits=function(){return this.digits=[],this.ribbons=[],this.inside.innerHTML="",this.resetFormat()},a.prototype.animateSlide=function(a){var b,c,d,f,g,h,i,j,k,l,m,n,o,p,q,s,t,u,v,w,x,y,z,B,C,D,E;if(s=this.value,j=this.getFractionalDigitCount(s,a),j&&(a*=Math.pow(10,j),s*=Math.pow(10,j)),d=a-s){for(this.bindTransitionEnd(),f=this.getDigitCount(s,a),g=[],b=0,m=v=0;f>=0?f>v:v>f;m=f>=0?++v:--v){if(t=A(s/Math.pow(10,f-m-1)),i=A(a/Math.pow(10,f-m-1)),h=i-t,Math.abs(h)>this.MAX_VALUES){for(l=[],n=h/(this.MAX_VALUES+this.MAX_VALUES*b*e),c=t;h>0&&i>c||0>h&&c>i;)l.push(Math.round(c)),c+=n;l[l.length-1]!==i&&l.push(i),b++}else l=function(){E=[];for(var a=t;i>=t?i>=a:a>=i;i>=t?a++:a--)E.push(a);return E}.apply(this);for(m=w=0,y=l.length;y>w;m=++w)k=l[m],l[m]=Math.abs(k%10);g.push(l)}for(this.resetDigits(),D=g.reverse(),m=x=0,z=D.length;z>x;m=++x)for(l=D[m],this.digits[m]||this.addDigit(" ",m>=j),null==(u=this.ribbons)[m]&&(u[m]=this.digits[m].querySelector(".odometer-ribbon-inner")),this.ribbons[m].innerHTML="",0>d&&(l=l.reverse()),o=C=0,B=l.length;B>C;o=++C)k=l[o],q=document.createElement("div"),q.className="odometer-value",q.innerHTML=k,this.ribbons[m].appendChild(q),o===l.length-1&&r(q,"odometer-last-value"),0===o&&r(q,"odometer-first-value");return 0>t&&this.addDigit("-"),p=this.inside.querySelector(".odometer-radix-mark"),null!=p&&p.parent.removeChild(p),j?this.addSpacer(this.format.radix,this.digits[j-1],"odometer-radix-mark"):void 0}},a}(),m.options=null!=(E=window.odometerOptions)?E:{},setTimeout(function(){var a,b,c,d,e;if(window.odometerOptions){d=window.odometerOptions,e=[];for(a in d)b=d[a],e.push(null!=(c=m.options)[a]?(c=m.options)[a]:c[a]=b);return e}},0),m.init=function(){var a,b,c,d,e,f;if(null!=document.querySelectorAll){for(b=document.querySelectorAll(m.options.selector||".odometer"),f=[],c=0,d=b.length;d>c;c++)a=b[c],f.push(a.odometer=new m({el:a,value:null!=(e=a.innerText)?e:a.textContent}));return f}},null!=(null!=(F=document.documentElement)?F.doScroll:void 0)&&null!=document.createEventObject?(D=document.onreadystatechange,document.onreadystatechange=function(){return"complete"===document.readyState&&m.options.auto!==!1&&m.init(),null!=D?D.apply(this,arguments):void 0}):document.addEventListener("DOMContentLoaded",function(){return m.options.auto!==!1?m.init():void 0},!1),"function"==typeof define&&define.amd?define(["jquery"],function(){return m}):typeof exports===!1?module.exports=m:window.Odometer=m}).call(this);

/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.3.7
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */

/* global window, document, define, jQuery, setInterval, clearInterval */
!function(a){"use strict";"function"==typeof define&&define.amd?define(["jquery"],a):a(jQuery)}(function(a){"use strict";var b=window.Slick||{};b=function(){function c(c,d){var f,g,e=this;if(e.defaults={accessibility:!0,appendArrows:a(c),arrows:!0,asNavFor:null,prevArrow:'<button type="button" data-role="none" class="slick-prev">Previous</button>',nextArrow:'<button type="button" data-role="none" class="slick-next">Next</button>',autoplay:!1,autoplaySpeed:3e3,centerMode:!1,centerPadding:"50px",cssEase:"ease",customPaging:function(a,b){return'<button type="button" data-role="none">'+(b+1)+"</button>"},dots:!1,dotsClass:"slick-dots",draggable:!0,easing:"linear",fade:!1,focusOnSelect:!1,infinite:!0,lazyLoad:"ondemand",onBeforeChange:null,onAfterChange:null,onInit:null,onReInit:null,pauseOnHover:!0,pauseOnDotsHover:!1,responsive:null,rtl:!1,slide:"div",slidesToShow:1,slidesToScroll:1,speed:300,swipe:!0,touchMove:!0,touchThreshold:5,useCSS:!0,vertical:!1},e.initials={animating:!1,dragging:!1,autoPlayTimer:null,currentSlide:0,currentLeft:null,direction:1,$dots:null,listWidth:null,listHeight:null,loadIndex:0,$nextArrow:null,$prevArrow:null,slideCount:null,slideWidth:null,$slideTrack:null,$slides:null,sliding:!1,slideOffset:0,swipeLeft:null,$list:null,touchObject:{},transformsEnabled:!1},a.extend(e,e.initials),e.activeBreakpoint=null,e.animType=null,e.animProp=null,e.breakpoints=[],e.breakpointSettings=[],e.cssTransitions=!1,e.paused=!1,e.positionProp=null,e.$slider=a(c),e.$slidesCache=null,e.transformType=null,e.transitionType=null,e.windowWidth=0,e.windowTimer=null,e.options=a.extend({},e.defaults,d),e.originalSettings=e.options,f=e.options.responsive||null,f&&f.length>-1){for(g in f)f.hasOwnProperty(g)&&(e.breakpoints.push(f[g].breakpoint),e.breakpointSettings[f[g].breakpoint]=f[g].settings);e.breakpoints.sort(function(a,b){return b-a})}e.autoPlay=a.proxy(e.autoPlay,e),e.autoPlayClear=a.proxy(e.autoPlayClear,e),e.changeSlide=a.proxy(e.changeSlide,e),e.selectHandler=a.proxy(e.selectHandler,e),e.setPosition=a.proxy(e.setPosition,e),e.swipeHandler=a.proxy(e.swipeHandler,e),e.dragHandler=a.proxy(e.dragHandler,e),e.keyHandler=a.proxy(e.keyHandler,e),e.autoPlayIterator=a.proxy(e.autoPlayIterator,e),e.instanceUid=b++,e.htmlExpr=/^(?:\s*(<[\w\W]+>)[^>]*)$/,e.init()}var b=0;return c}(),b.prototype.addSlide=function(b,c,d){var e=this;if("boolean"==typeof c)d=c,c=null;else if(0>c||c>=e.slideCount)return!1;e.unload(),"number"==typeof c?0===c&&0===e.$slides.length?a(b).appendTo(e.$slideTrack):d?a(b).insertBefore(e.$slides.eq(c)):a(b).insertAfter(e.$slides.eq(c)):d===!0?a(b).prependTo(e.$slideTrack):a(b).appendTo(e.$slideTrack),e.$slides=e.$slideTrack.children(this.options.slide),e.$slideTrack.children(this.options.slide).detach(),e.$slideTrack.append(e.$slides),e.$slides.each(function(b,c){a(c).attr("index",b)}),e.$slidesCache=e.$slides,e.reinit()},b.prototype.animateSlide=function(b,c){var d={},e=this;e.options.rtl===!0&&e.options.vertical===!1&&(b=-b),e.transformsEnabled===!1?e.options.vertical===!1?e.$slideTrack.animate({left:b},e.options.speed,e.options.easing,c):e.$slideTrack.animate({top:b},e.options.speed,e.options.easing,c):e.cssTransitions===!1?a({animStart:e.currentLeft}).animate({animStart:b},{duration:e.options.speed,easing:e.options.easing,step:function(a){e.options.vertical===!1?(d[e.animType]="translate("+a+"px, 0px)",e.$slideTrack.css(d)):(d[e.animType]="translate(0px,"+a+"px)",e.$slideTrack.css(d))},complete:function(){c&&c.call()}}):(e.applyTransition(),d[e.animType]=e.options.vertical===!1?"translate3d("+b+"px, 0px, 0px)":"translate3d(0px,"+b+"px, 0px)",e.$slideTrack.css(d),c&&setTimeout(function(){e.disableTransition(),c.call()},e.options.speed))},b.prototype.applyTransition=function(a){var b=this,c={};c[b.transitionType]=b.options.fade===!1?b.transformType+" "+b.options.speed+"ms "+b.options.cssEase:"opacity "+b.options.speed+"ms "+b.options.cssEase,b.options.fade===!1?b.$slideTrack.css(c):b.$slides.eq(a).css(c)},b.prototype.autoPlay=function(){var a=this;a.autoPlayTimer&&clearInterval(a.autoPlayTimer),a.slideCount>a.options.slidesToShow&&a.paused!==!0&&(a.autoPlayTimer=setInterval(a.autoPlayIterator,a.options.autoplaySpeed))},b.prototype.autoPlayClear=function(){var a=this;a.autoPlayTimer&&clearInterval(a.autoPlayTimer)},b.prototype.autoPlayIterator=function(){var b=this,c=null!=b.options.asNavFor?a(b.options.asNavFor).getSlick():null;b.options.infinite===!1?1===b.direction?(b.currentSlide+1===b.slideCount-1&&(b.direction=0),b.slideHandler(b.currentSlide+b.options.slidesToScroll),null!=c&&c.slideHandler(c.currentSlide+c.options.slidesToScroll)):(0===b.currentSlide-1&&(b.direction=1),b.slideHandler(b.currentSlide-b.options.slidesToScroll),null!=c&&c.slideHandler(c.currentSlide-c.options.slidesToScroll)):(b.slideHandler(b.currentSlide+b.options.slidesToScroll),null!=c&&c.slideHandler(c.currentSlide+c.options.slidesToScroll))},b.prototype.buildArrows=function(){var b=this;b.options.arrows===!0&&b.slideCount>b.options.slidesToShow&&(b.$prevArrow=a(b.options.prevArrow),b.$nextArrow=a(b.options.nextArrow),b.htmlExpr.test(b.options.prevArrow)&&b.$prevArrow.appendTo(b.options.appendArrows),b.htmlExpr.test(b.options.nextArrow)&&b.$nextArrow.appendTo(b.options.appendArrows),b.options.infinite!==!0&&b.$prevArrow.addClass("slick-disabled"))},b.prototype.buildDots=function(){var c,d,b=this;if(b.options.dots===!0&&b.slideCount>b.options.slidesToShow){for(d='<ul class="'+b.options.dotsClass+'">',c=0;c<=b.getDotCount();c+=1)d+="<li>"+b.options.customPaging.call(this,b,c)+"</li>";d+="</ul>",b.$dots=a(d).appendTo(b.$slider),b.$dots.find("li").first().addClass("slick-active")}},b.prototype.buildOut=function(){var b=this;b.$slides=b.$slider.children(b.options.slide+":not(.slick-cloned)").addClass("slick-slide"),b.slideCount=b.$slides.length,b.$slides.each(function(b,c){a(c).attr("index",b)}),b.$slidesCache=b.$slides,b.$slider.addClass("slick-slider"),b.$slideTrack=0===b.slideCount?a('<div class="slick-track"/>').appendTo(b.$slider):b.$slides.wrapAll('<div class="slick-track"/>').parent(),b.$list=b.$slideTrack.wrap('<div class="slick-list"/>').parent(),b.$slideTrack.css("opacity",0),b.options.centerMode===!0&&(b.options.slidesToScroll=1,0===b.options.slidesToShow%2&&(b.options.slidesToShow=3)),a("img[data-lazy]",b.$slider).not("[src]").addClass("slick-loading"),b.setupInfinite(),b.buildArrows(),b.buildDots(),b.updateDots(),b.options.accessibility===!0&&b.$list.prop("tabIndex",0),b.setSlideClasses("number"==typeof this.currentSlide?this.currentSlide:0),b.options.draggable===!0&&b.$list.addClass("draggable")},b.prototype.checkResponsive=function(){var c,d,b=this;if(b.originalSettings.responsive&&b.originalSettings.responsive.length>-1&&null!==b.originalSettings.responsive){d=null;for(c in b.breakpoints)b.breakpoints.hasOwnProperty(c)&&a(window).width()<b.breakpoints[c]&&(d=b.breakpoints[c]);null!==d?null!==b.activeBreakpoint?d!==b.activeBreakpoint&&(b.activeBreakpoint=d,b.options=a.extend({},b.options,b.breakpointSettings[d]),b.refresh()):(b.activeBreakpoint=d,b.options=a.extend({},b.options,b.breakpointSettings[d]),b.refresh()):null!==b.activeBreakpoint&&(b.activeBreakpoint=null,b.options=a.extend({},b.options,b.originalSettings),b.refresh())}},b.prototype.changeSlide=function(b){var c=this,d=a(b.target),e=null!=c.options.asNavFor?a(c.options.asNavFor).getSlick():null;switch(d.is("a")&&b.preventDefault(),b.data.message){case"previous":c.slideCount>c.options.slidesToShow&&(c.slideHandler(c.currentSlide-c.options.slidesToScroll),null!=e&&e.slideHandler(e.currentSlide-e.options.slidesToScroll));break;case"next":c.slideCount>c.options.slidesToShow&&(c.slideHandler(c.currentSlide+c.options.slidesToScroll),null!=e&&e.slideHandler(e.currentSlide+e.options.slidesToScroll));break;case"index":var f=a(b.target).parent().index()*c.options.slidesToScroll;c.slideHandler(f),null!=e&&e.slideHandler(f);break;default:return!1}},b.prototype.destroy=function(){var b=this;b.autoPlayClear(),b.touchObject={},a(".slick-cloned",b.$slider).remove(),b.$dots&&b.$dots.remove(),b.$prevArrow&&(b.$prevArrow.remove(),b.$nextArrow.remove()),b.$slides.parent().hasClass("slick-track")&&b.$slides.unwrap().unwrap(),b.$slides.removeClass("slick-slide slick-active slick-visible").removeAttr("style"),b.$slider.removeClass("slick-slider"),b.$slider.removeClass("slick-initialized"),b.$list.off(".slick"),a(window).off(".slick-"+b.instanceUid),a(document).off(".slick-"+b.instanceUid)},b.prototype.disableTransition=function(a){var b=this,c={};c[b.transitionType]="",b.options.fade===!1?b.$slideTrack.css(c):b.$slides.eq(a).css(c)},b.prototype.fadeSlide=function(a,b){var c=this;c.cssTransitions===!1?(c.$slides.eq(a).css({zIndex:1e3}),c.$slides.eq(a).animate({opacity:1},c.options.speed,c.options.easing,b)):(c.applyTransition(a),c.$slides.eq(a).css({opacity:1,zIndex:1e3}),b&&setTimeout(function(){c.disableTransition(a),b.call()},c.options.speed))},b.prototype.filterSlides=function(a){var b=this;null!==a&&(b.unload(),b.$slideTrack.children(this.options.slide).detach(),b.$slidesCache.filter(a).appendTo(b.$slideTrack),b.reinit())},b.prototype.getCurrent=function(){var a=this;return a.currentSlide},b.prototype.getDotCount=function(){var e,a=this,b=0,c=0,d=0;for(e=a.options.infinite===!0?a.slideCount+a.options.slidesToShow-a.options.slidesToScroll:a.slideCount;e>b;)d++,c+=a.options.slidesToScroll,b=c+a.options.slidesToShow;return d},b.prototype.getLeft=function(a){var c,d,b=this,e=0;return b.slideOffset=0,d=b.$slides.first().outerHeight(),b.options.infinite===!0?(b.slideCount>b.options.slidesToShow&&(b.slideOffset=-1*b.slideWidth*b.options.slidesToShow,e=-1*d*b.options.slidesToShow),0!==b.slideCount%b.options.slidesToScroll&&a+b.options.slidesToScroll>b.slideCount&&b.slideCount>b.options.slidesToShow&&(b.slideOffset=-1*b.slideCount%b.options.slidesToShow*b.slideWidth,e=-1*b.slideCount%b.options.slidesToShow*d)):0!==b.slideCount%b.options.slidesToShow&&a+b.options.slidesToScroll>b.slideCount&&b.slideCount>b.options.slidesToShow&&(b.slideOffset=b.options.slidesToShow*b.slideWidth-b.slideCount%b.options.slidesToShow*b.slideWidth,e=b.slideCount%b.options.slidesToShow*d),b.options.centerMode===!0&&b.options.infinite===!0?b.slideOffset+=b.slideWidth*Math.floor(b.options.slidesToShow/2)-b.slideWidth:b.options.centerMode===!0&&(b.slideOffset+=b.slideWidth*Math.floor(b.options.slidesToShow/2)),c=b.options.vertical===!1?-1*a*b.slideWidth+b.slideOffset:-1*a*d+e},b.prototype.init=function(){var b=this;a(b.$slider).hasClass("slick-initialized")||(a(b.$slider).addClass("slick-initialized"),b.buildOut(),b.setProps(),b.startLoad(),b.loadSlider(),b.initializeEvents(),b.checkResponsive()),null!==b.options.onInit&&b.options.onInit.call(this,b)},b.prototype.initArrowEvents=function(){var a=this;a.options.arrows===!0&&a.slideCount>a.options.slidesToShow&&(a.$prevArrow.on("click.slick",{message:"previous"},a.changeSlide),a.$nextArrow.on("click.slick",{message:"next"},a.changeSlide))},b.prototype.initDotEvents=function(){var b=this;b.options.dots===!0&&b.slideCount>b.options.slidesToShow&&a("li",b.$dots).on("click.slick",{message:"index"},b.changeSlide),b.options.dots===!0&&b.options.pauseOnDotsHover===!0&&b.options.autoplay===!0&&a("li",b.$dots).on("mouseenter.slick",b.autoPlayClear).on("mouseleave.slick",b.autoPlay)},b.prototype.initializeEvents=function(){var b=this;b.initArrowEvents(),b.initDotEvents(),b.$list.on("touchstart.slick mousedown.slick",{action:"start"},b.swipeHandler),b.$list.on("touchmove.slick mousemove.slick",{action:"move"},b.swipeHandler),b.$list.on("touchend.slick mouseup.slick",{action:"end"},b.swipeHandler),b.$list.on("touchcancel.slick mouseleave.slick",{action:"end"},b.swipeHandler),b.options.pauseOnHover===!0&&b.options.autoplay===!0&&(b.$list.on("mouseenter.slick",b.autoPlayClear),b.$list.on("mouseleave.slick",b.autoPlay)),b.options.accessibility===!0&&b.$list.on("keydown.slick",b.keyHandler),b.options.focusOnSelect===!0&&a(b.options.slide,b.$slideTrack).on("click.slick",b.selectHandler),a(window).on("orientationchange.slick.slick-"+b.instanceUid,function(){b.checkResponsive(),b.setPosition()}),a(window).on("resize.slick.slick-"+b.instanceUid,function(){a(window).width()!==b.windowWidth&&(clearTimeout(b.windowDelay),b.windowDelay=window.setTimeout(function(){b.windowWidth=a(window).width(),b.checkResponsive(),b.setPosition()},50))}),a(window).on("load.slick.slick-"+b.instanceUid,b.setPosition),a(document).on("ready.slick.slick-"+b.instanceUid,b.setPosition)},b.prototype.initUI=function(){var a=this;a.options.arrows===!0&&a.slideCount>a.options.slidesToShow&&(a.$prevArrow.show(),a.$nextArrow.show()),a.options.dots===!0&&a.slideCount>a.options.slidesToShow&&a.$dots.show(),a.options.autoplay===!0&&a.autoPlay()},b.prototype.keyHandler=function(a){var b=this;37===a.keyCode?b.changeSlide({data:{message:"previous"}}):39===a.keyCode&&b.changeSlide({data:{message:"next"}})},b.prototype.lazyLoad=function(){function g(b){a("img[data-lazy]",b).each(function(){var b=a(this),c=a(this).attr("data-lazy")+"?"+(new Date).getTime();b.load(function(){b.animate({opacity:1},200)}).css({opacity:0}).attr("src",c).removeAttr("data-lazy").removeClass("slick-loading")})}var c,d,e,f,b=this;b.options.centerMode===!0||b.options.fade===!0?(e=b.options.slidesToShow+b.currentSlide-1,f=e+b.options.slidesToShow+2):(e=b.options.infinite?b.options.slidesToShow+b.currentSlide:b.currentSlide,f=e+b.options.slidesToShow),c=b.$slider.find(".slick-slide").slice(e,f),g(c),1==b.slideCount?(d=b.$slider.find(".slick-slide"),g(d)):b.currentSlide>=b.slideCount-b.options.slidesToShow?(d=b.$slider.find(".slick-cloned").slice(0,b.options.slidesToShow),g(d)):0===b.currentSlide&&(d=b.$slider.find(".slick-cloned").slice(-1*b.options.slidesToShow),g(d))},b.prototype.loadSlider=function(){var a=this;a.setPosition(),a.$slideTrack.css({opacity:1}),a.$slider.removeClass("slick-loading"),a.initUI(),"progressive"===a.options.lazyLoad&&a.progressiveLazyLoad()},b.prototype.postSlide=function(a){var b=this;null!==b.options.onAfterChange&&b.options.onAfterChange.call(this,b,a),b.animating=!1,b.setPosition(),b.swipeLeft=null,b.options.autoplay===!0&&b.paused===!1&&b.autoPlay()},b.prototype.progressiveLazyLoad=function(){var c,d,b=this;c=a("img[data-lazy]").length,c>0&&(d=a("img[data-lazy]",b.$slider).first(),d.attr("src",d.attr("data-lazy")).removeClass("slick-loading").load(function(){d.removeAttr("data-lazy"),b.progressiveLazyLoad()}))},b.prototype.refresh=function(){var b=this,c=b.currentSlide;b.destroy(),a.extend(b,b.initials),b.currentSlide=c,b.init()},b.prototype.reinit=function(){var b=this;b.$slides=b.$slideTrack.children(b.options.slide).addClass("slick-slide"),b.slideCount=b.$slides.length,b.currentSlide>=b.slideCount&&0!==b.currentSlide&&(b.currentSlide=b.currentSlide-b.options.slidesToScroll),b.setProps(),b.setupInfinite(),b.buildArrows(),b.updateArrows(),b.initArrowEvents(),b.buildDots(),b.updateDots(),b.initDotEvents(),b.options.focusOnSelect===!0&&a(b.options.slide,b.$slideTrack).on("click.slick",b.selectHandler),b.setSlideClasses(0),b.setPosition(),null!==b.options.onReInit&&b.options.onReInit.call(this,b)},b.prototype.removeSlide=function(a,b){var c=this;return"boolean"==typeof a?(b=a,a=b===!0?0:c.slideCount-1):a=b===!0?--a:a,c.slideCount<1||0>a||a>c.slideCount-1?!1:(c.unload(),c.$slideTrack.children(this.options.slide).eq(a).remove(),c.$slides=c.$slideTrack.children(this.options.slide),c.$slideTrack.children(this.options.slide).detach(),c.$slideTrack.append(c.$slides),c.$slidesCache=c.$slides,c.reinit(),void 0)},b.prototype.setCSS=function(a){var d,e,b=this,c={};b.options.rtl===!0&&(a=-a),d="left"==b.positionProp?a+"px":"0px",e="top"==b.positionProp?a+"px":"0px",c[b.positionProp]=a,b.transformsEnabled===!1?b.$slideTrack.css(c):(c={},b.cssTransitions===!1?(c[b.animType]="translate("+d+", "+e+")",b.$slideTrack.css(c)):(c[b.animType]="translate3d("+d+", "+e+", 0px)",b.$slideTrack.css(c)))},b.prototype.setDimensions=function(){var a=this;a.options.vertical===!1?a.options.centerMode===!0&&a.$list.css({padding:"0px "+a.options.centerPadding}):(a.$list.height(a.$slides.first().outerHeight(!0)*a.options.slidesToShow),a.options.centerMode===!0&&a.$list.css({padding:a.options.centerPadding+" 0px"})),a.listWidth=a.$list.width(),a.listHeight=a.$list.height(),a.options.vertical===!1?(a.slideWidth=Math.ceil(a.listWidth/a.options.slidesToShow),a.$slideTrack.width(Math.ceil(a.slideWidth*a.$slideTrack.children(".slick-slide").length))):(a.slideWidth=Math.ceil(a.listWidth),a.$slideTrack.height(Math.ceil(a.$slides.first().outerHeight(!0)*a.$slideTrack.children(".slick-slide").length)));var b=a.$slides.first().outerWidth(!0)-a.$slides.first().width();a.$slideTrack.children(".slick-slide").width(a.slideWidth-b)},b.prototype.setFade=function(){var c,b=this;b.$slides.each(function(d,e){c=-1*b.slideWidth*d,a(e).css({position:"relative",left:c,top:0,zIndex:800,opacity:0})}),b.$slides.eq(b.currentSlide).css({zIndex:900,opacity:1})},b.prototype.setPosition=function(){var a=this;a.setDimensions(),a.options.fade===!1?a.setCSS(a.getLeft(a.currentSlide)):a.setFade()},b.prototype.setProps=function(){var a=this;a.positionProp=a.options.vertical===!0?"top":"left","top"===a.positionProp?a.$slider.addClass("slick-vertical"):a.$slider.removeClass("slick-vertical"),(void 0!==document.body.style.WebkitTransition||void 0!==document.body.style.MozTransition||void 0!==document.body.style.msTransition)&&a.options.useCSS===!0&&(a.cssTransitions=!0),void 0!==document.body.style.MozTransform&&(a.animType="MozTransform",a.transformType="-moz-transform",a.transitionType="MozTransition"),void 0!==document.body.style.webkitTransform&&(a.animType="webkitTransform",a.transformType="-webkit-transform",a.transitionType="webkitTransition"),void 0!==document.body.style.msTransform&&(a.animType="msTransform",a.transformType="-ms-transform",a.transitionType="msTransition"),void 0!==document.body.style.transform&&(a.animType="transform",a.transformType="transform",a.transitionType="transition"),a.transformsEnabled=null!==a.animType},b.prototype.setSlideClasses=function(a){var c,d,e,f,b=this;b.$slider.find(".slick-slide").removeClass("slick-active").removeClass("slick-center"),d=b.$slider.find(".slick-slide"),b.options.centerMode===!0?(c=Math.floor(b.options.slidesToShow/2),b.options.infinite===!0&&(a>=c&&a<=b.slideCount-1-c?b.$slides.slice(a-c,a+c+1).addClass("slick-active"):(e=b.options.slidesToShow+a,d.slice(e-c+1,e+c+2).addClass("slick-active")),0===a?d.eq(d.length-1-b.options.slidesToShow).addClass("slick-center"):a===b.slideCount-1&&d.eq(b.options.slidesToShow).addClass("slick-center")),b.$slides.eq(a).addClass("slick-center")):a>=0&&a<=b.slideCount-b.options.slidesToShow?b.$slides.slice(a,a+b.options.slidesToShow).addClass("slick-active"):d.length<=b.options.slidesToShow?d.addClass("slick-active"):(f=b.slideCount%b.options.slidesToShow,e=b.options.infinite===!0?b.options.slidesToShow+a:a,b.options.slidesToShow==b.options.slidesToScroll&&b.slideCount-a<b.options.slidesToShow?d.slice(e-(b.options.slidesToShow-f),e+f).addClass("slick-active"):d.slice(e,e+b.options.slidesToShow).addClass("slick-active")),"ondemand"===b.options.lazyLoad&&b.lazyLoad()},b.prototype.setupInfinite=function(){var c,d,e,b=this;if((b.options.fade===!0||b.options.vertical===!0)&&(b.options.centerMode=!1),b.options.infinite===!0&&b.options.fade===!1&&(d=null,b.slideCount>b.options.slidesToShow)){for(e=b.options.centerMode===!0?b.options.slidesToShow+1:b.options.slidesToShow,c=b.slideCount;c>b.slideCount-e;c-=1)d=c-1,a(b.$slides[d]).clone(!0).attr("id","").prependTo(b.$slideTrack).addClass("slick-cloned");for(c=0;e>c;c+=1)d=c,a(b.$slides[d]).clone(!0).attr("id","").appendTo(b.$slideTrack).addClass("slick-cloned");b.$slideTrack.find(".slick-cloned").find("[id]").each(function(){a(this).attr("id","")})}},b.prototype.selectHandler=function(b){var c=this,d=null!=c.options.asNavFor?a(c.options.asNavFor).getSlick():null,e=parseInt(a(b.target).parent().attr("index"));if(e||(e=0),!(c.slideCount<=c.options.slidesToShow)&&(c.slideHandler(e),null!=d)){if(d.slideCount<=d.options.slidesToShow)return;d.slideHandler(e)}},b.prototype.slideHandler=function(a){var b,c,d,e,f=null,g=this;return g.animating===!0?!1:(b=a,f=g.getLeft(b),d=g.getLeft(g.currentSlide),e=0!==g.slideCount%g.options.slidesToScroll?g.options.slidesToScroll:0,g.currentLeft=null===g.swipeLeft?d:g.swipeLeft,g.options.infinite===!1&&g.options.centerMode===!1&&(0>a||a>g.slideCount-g.options.slidesToShow+e)?(g.options.fade===!1&&(b=g.currentSlide,g.animateSlide(d,function(){g.postSlide(b)})),!1):g.options.infinite===!1&&g.options.centerMode===!0&&(0>a||a>g.slideCount-g.options.slidesToScroll)?(g.options.fade===!1&&(b=g.currentSlide,g.animateSlide(d,function(){g.postSlide(b)})),!1):(g.options.autoplay===!0&&clearInterval(g.autoPlayTimer),c=0>b?0!==g.slideCount%g.options.slidesToScroll?g.slideCount-g.slideCount%g.options.slidesToScroll:g.slideCount-g.options.slidesToScroll:b>g.slideCount-1?0:b,g.animating=!0,null!==g.options.onBeforeChange&&a!==g.currentSlide&&g.options.onBeforeChange.call(this,g,g.currentSlide,c),g.currentSlide=c,g.setSlideClasses(g.currentSlide),g.updateDots(),g.updateArrows(),g.options.fade===!0?(g.fadeSlide(c,function(){g.postSlide(c)}),!1):(g.animateSlide(f,function(){g.postSlide(c)}),void 0)))},b.prototype.startLoad=function(){var a=this;a.options.arrows===!0&&a.slideCount>a.options.slidesToShow&&(a.$prevArrow.hide(),a.$nextArrow.hide()),a.options.dots===!0&&a.slideCount>a.options.slidesToShow&&a.$dots.hide(),a.$slider.addClass("slick-loading")},b.prototype.swipeDirection=function(){var a,b,c,d,e=this;return a=e.touchObject.startX-e.touchObject.curX,b=e.touchObject.startY-e.touchObject.curY,c=Math.atan2(b,a),d=Math.round(180*c/Math.PI),0>d&&(d=360-Math.abs(d)),45>=d&&d>=0?"left":360>=d&&d>=315?"left":d>=135&&225>=d?"right":"vertical"},b.prototype.swipeEnd=function(b){var c=this,d=null!=c.options.asNavFor?a(c.options.asNavFor).getSlick():null;if(c.dragging=!1,void 0===c.touchObject.curX)return!1;if(c.touchObject.swipeLength>=c.touchObject.minSwipe)switch(a(b.target).on("click.slick",function(b){b.stopImmediatePropagation(),b.stopPropagation(),b.preventDefault(),a(b.target).off("click.slick")}),c.swipeDirection()){case"left":c.slideHandler(c.currentSlide+c.options.slidesToScroll),null!=d&&d.slideHandler(d.currentSlide+d.options.slidesToScroll),c.touchObject={};break;case"right":c.slideHandler(c.currentSlide-c.options.slidesToScroll),null!=d&&d.slideHandler(d.currentSlide-d.options.slidesToScroll),c.touchObject={}}else c.touchObject.startX!==c.touchObject.curX&&(c.slideHandler(c.currentSlide),null!=d&&d.slideHandler(d.currentSlide),c.touchObject={})},b.prototype.swipeHandler=function(a){var b=this;if(!(b.options.swipe===!1||"ontouchend"in document&&b.options.swipe===!1||b.options.draggable===!1||b.options.draggable===!1&&!a.originalEvent.touches))switch(b.touchObject.fingerCount=a.originalEvent&&void 0!==a.originalEvent.touches?a.originalEvent.touches.length:1,b.touchObject.minSwipe=b.listWidth/b.options.touchThreshold,a.data.action){case"start":b.swipeStart(a);break;case"move":b.swipeMove(a);break;case"end":b.swipeEnd(a)}},b.prototype.swipeMove=function(a){var c,d,e,f,b=this;return f=void 0!==a.originalEvent?a.originalEvent.touches:null,c=b.getLeft(b.currentSlide),!b.dragging||f&&1!==f.length?!1:(b.touchObject.curX=void 0!==f?f[0].pageX:a.clientX,b.touchObject.curY=void 0!==f?f[0].pageY:a.clientY,b.touchObject.swipeLength=Math.round(Math.sqrt(Math.pow(b.touchObject.curX-b.touchObject.startX,2))),d=b.swipeDirection(),"vertical"!==d?(void 0!==a.originalEvent&&b.touchObject.swipeLength>4&&a.preventDefault(),e=b.touchObject.curX>b.touchObject.startX?1:-1,b.swipeLeft=b.options.vertical===!1?c+b.touchObject.swipeLength*e:c+b.touchObject.swipeLength*(b.$list.height()/b.listWidth)*e,b.options.fade===!0||b.options.touchMove===!1?!1:b.animating===!0?(b.swipeLeft=null,!1):(b.setCSS(b.swipeLeft),void 0)):void 0)},b.prototype.swipeStart=function(a){var c,b=this;return 1!==b.touchObject.fingerCount||b.slideCount<=b.options.slidesToShow?(b.touchObject={},!1):(void 0!==a.originalEvent&&void 0!==a.originalEvent.touches&&(c=a.originalEvent.touches[0]),b.touchObject.startX=b.touchObject.curX=void 0!==c?c.pageX:a.clientX,b.touchObject.startY=b.touchObject.curY=void 0!==c?c.pageY:a.clientY,b.dragging=!0,void 0)},b.prototype.unfilterSlides=function(){var a=this;null!==a.$slidesCache&&(a.unload(),a.$slideTrack.children(this.options.slide).detach(),a.$slidesCache.appendTo(a.$slideTrack),a.reinit())},b.prototype.unload=function(){var b=this;a(".slick-cloned",b.$slider).remove(),b.$dots&&b.$dots.remove(),b.$prevArrow&&(b.$prevArrow.remove(),b.$nextArrow.remove()),b.$slides.removeClass("slick-slide slick-active slick-visible").removeAttr("style")},b.prototype.updateArrows=function(){var a=this;a.options.arrows===!0&&a.options.infinite!==!0&&a.slideCount>a.options.slidesToShow&&(a.$prevArrow.removeClass("slick-disabled"),a.$nextArrow.removeClass("slick-disabled"),0===a.currentSlide?(a.$prevArrow.addClass("slick-disabled"),a.$nextArrow.removeClass("slick-disabled")):a.currentSlide>=a.slideCount-a.options.slidesToShow&&(a.$nextArrow.addClass("slick-disabled"),a.$prevArrow.removeClass("slick-disabled")))},b.prototype.updateDots=function(){var a=this;null!==a.$dots&&(a.$dots.find("li").removeClass("slick-active"),a.$dots.find("li").eq(Math.floor(a.currentSlide/a.options.slidesToScroll)).addClass("slick-active"))},a.fn.slick=function(a){var c=this;return c.each(function(c,d){d.slick=new b(d,a)})},a.fn.slickAdd=function(a,b,c){var d=this;return d.each(function(d,e){e.slick.addSlide(a,b,c)})},a.fn.slickCurrentSlide=function(){var a=this;return a.get(0).slick.getCurrent()},a.fn.slickFilter=function(a){var b=this;return b.each(function(b,c){c.slick.filterSlides(a)})},a.fn.slickGoTo=function(b){var c=this;return c.each(function(c,d){var e=null!=d.slick.options.asNavFor?a(d.slick.options.asNavFor):null;null!=e&&e.slickGoTo(b),d.slick.slideHandler(b)})},a.fn.slickNext=function(){var a=this;return a.each(function(a,b){b.slick.changeSlide({data:{message:"next"}})})},a.fn.slickPause=function(){var a=this;return a.each(function(a,b){b.slick.autoPlayClear(),b.slick.paused=!0})},a.fn.slickPlay=function(){var a=this;return a.each(function(a,b){b.slick.paused=!1,b.slick.autoPlay()})},a.fn.slickPrev=function(){var a=this;return a.each(function(a,b){b.slick.changeSlide({data:{message:"previous"}})})},a.fn.slickRemove=function(a,b){var c=this;return c.each(function(c,d){d.slick.removeSlide(a,b)})},a.fn.slickGetOption=function(a){var b=this;return b.get(0).slick.options[a]},a.fn.slickSetOption=function(a,b,c){var d=this;return d.each(function(d,e){e.slick.options[a]=b,c===!0&&(e.slick.unload(),e.slick.reinit())})},a.fn.slickUnfilter=function(){var a=this;return a.each(function(a,b){b.slick.unfilterSlides()})},a.fn.unslick=function(){var a=this;return a.each(function(a,b){b.slick&&b.slick.destroy()})},a.fn.getSlick=function(){var a=null,b=this;return b.each(function(b,c){a=c.slick}),a}});

/*!
 * jQuery Transit - CSS3 transitions and transformations
 * (c) 2011-2012 Rico Sta. Cruz <rico@ricostacruz.com>
 * MIT Licensed.
 *
 * http://ricostacruz.com/jquery.transit
 * http://github.com/rstacruz/jquery.transit
 */
;(function(k){k.transit={version:"0.9.9",propertyMap:{marginLeft:"margin",marginRight:"margin",marginBottom:"margin",marginTop:"margin",paddingLeft:"padding",paddingRight:"padding",paddingBottom:"padding",paddingTop:"padding"},enabled:true,useTransitionEnd:false};var d=document.createElement("div");var q={};function b(v){if(v in d.style){return v}var u=["Moz","Webkit","O","ms"];var r=v.charAt(0).toUpperCase()+v.substr(1);if(v in d.style){return v}for(var t=0;t<u.length;++t){var s=u[t]+r;if(s in d.style){return s}}}function e(){d.style[q.transform]="";d.style[q.transform]="rotateY(90deg)";return d.style[q.transform]!==""}var a=navigator.userAgent.toLowerCase().indexOf("chrome")>-1;q.transition=b("transition");q.transitionDelay=b("transitionDelay");q.transform=b("transform");q.transformOrigin=b("transformOrigin");q.transform3d=e();var i={transition:"transitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd",WebkitTransition:"webkitTransitionEnd",msTransition:"MSTransitionEnd"};var f=q.transitionEnd=i[q.transition]||null;for(var p in q){if(q.hasOwnProperty(p)&&typeof k.support[p]==="undefined"){k.support[p]=q[p]}}d=null;k.cssEase={_default:"ease","in":"ease-in",out:"ease-out","in-out":"ease-in-out",snap:"cubic-bezier(0,1,.5,1)",easeOutCubic:"cubic-bezier(.215,.61,.355,1)",easeInOutCubic:"cubic-bezier(.645,.045,.355,1)",easeInCirc:"cubic-bezier(.6,.04,.98,.335)",easeOutCirc:"cubic-bezier(.075,.82,.165,1)",easeInOutCirc:"cubic-bezier(.785,.135,.15,.86)",easeInExpo:"cubic-bezier(.95,.05,.795,.035)",easeOutExpo:"cubic-bezier(.19,1,.22,1)",easeInOutExpo:"cubic-bezier(1,0,0,1)",easeInQuad:"cubic-bezier(.55,.085,.68,.53)",easeOutQuad:"cubic-bezier(.25,.46,.45,.94)",easeInOutQuad:"cubic-bezier(.455,.03,.515,.955)",easeInQuart:"cubic-bezier(.895,.03,.685,.22)",easeOutQuart:"cubic-bezier(.165,.84,.44,1)",easeInOutQuart:"cubic-bezier(.77,0,.175,1)",easeInQuint:"cubic-bezier(.755,.05,.855,.06)",easeOutQuint:"cubic-bezier(.23,1,.32,1)",easeInOutQuint:"cubic-bezier(.86,0,.07,1)",easeInSine:"cubic-bezier(.47,0,.745,.715)",easeOutSine:"cubic-bezier(.39,.575,.565,1)",easeInOutSine:"cubic-bezier(.445,.05,.55,.95)",easeInBack:"cubic-bezier(.6,-.28,.735,.045)",easeOutBack:"cubic-bezier(.175, .885,.32,1.275)",easeInOutBack:"cubic-bezier(.68,-.55,.265,1.55)"};k.cssHooks["transit:transform"]={get:function(r){return k(r).data("transform")||new j()},set:function(s,r){var t=r;if(!(t instanceof j)){t=new j(t)}if(q.transform==="WebkitTransform"&&!a){s.style[q.transform]=t.toString(true)}else{s.style[q.transform]=t.toString()}k(s).data("transform",t)}};k.cssHooks.transform={set:k.cssHooks["transit:transform"].set};if(k.fn.jquery<"1.8"){k.cssHooks.transformOrigin={get:function(r){return r.style[q.transformOrigin]},set:function(r,s){r.style[q.transformOrigin]=s}};k.cssHooks.transition={get:function(r){return r.style[q.transition]},set:function(r,s){r.style[q.transition]=s}}}n("scale");n("translate");n("rotate");n("rotateX");n("rotateY");n("rotate3d");n("perspective");n("skewX");n("skewY");n("x",true);n("y",true);function j(r){if(typeof r==="string"){this.parse(r)}return this}j.prototype={setFromString:function(t,s){var r=(typeof s==="string")?s.split(","):(s.constructor===Array)?s:[s];r.unshift(t);j.prototype.set.apply(this,r)},set:function(s){var r=Array.prototype.slice.apply(arguments,[1]);if(this.setter[s]){this.setter[s].apply(this,r)}else{this[s]=r.join(",")}},get:function(r){if(this.getter[r]){return this.getter[r].apply(this)}else{return this[r]||0}},setter:{rotate:function(r){this.rotate=o(r,"deg")},rotateX:function(r){this.rotateX=o(r,"deg")},rotateY:function(r){this.rotateY=o(r,"deg")},scale:function(r,s){if(s===undefined){s=r}this.scale=r+","+s},skewX:function(r){this.skewX=o(r,"deg")},skewY:function(r){this.skewY=o(r,"deg")},perspective:function(r){this.perspective=o(r,"px")},x:function(r){this.set("translate",r,null)},y:function(r){this.set("translate",null,r)},translate:function(r,s){if(this._translateX===undefined){this._translateX=0}if(this._translateY===undefined){this._translateY=0}if(r!==null&&r!==undefined){this._translateX=o(r,"px")}if(s!==null&&s!==undefined){this._translateY=o(s,"px")}this.translate=this._translateX+","+this._translateY}},getter:{x:function(){return this._translateX||0},y:function(){return this._translateY||0},scale:function(){var r=(this.scale||"1,1").split(",");if(r[0]){r[0]=parseFloat(r[0])}if(r[1]){r[1]=parseFloat(r[1])}return(r[0]===r[1])?r[0]:r},rotate3d:function(){var t=(this.rotate3d||"0,0,0,0deg").split(",");for(var r=0;r<=3;++r){if(t[r]){t[r]=parseFloat(t[r])}}if(t[3]){t[3]=o(t[3],"deg")}return t}},parse:function(s){var r=this;s.replace(/([a-zA-Z0-9]+)\((.*?)\)/g,function(t,v,u){r.setFromString(v,u)})},toString:function(t){var s=[];for(var r in this){if(this.hasOwnProperty(r)){if((!q.transform3d)&&((r==="rotateX")||(r==="rotateY")||(r==="perspective")||(r==="transformOrigin"))){continue}if(r[0]!=="_"){if(t&&(r==="scale")){s.push(r+"3d("+this[r]+",1)")}else{if(t&&(r==="translate")){s.push(r+"3d("+this[r]+",0)")}else{s.push(r+"("+this[r]+")")}}}}}return s.join(" ")}};function m(s,r,t){if(r===true){s.queue(t)}else{if(r){s.queue(r,t)}else{t()}}}function h(s){var r=[];k.each(s,function(t){t=k.camelCase(t);t=k.transit.propertyMap[t]||k.cssProps[t]||t;t=c(t);if(k.inArray(t,r)===-1){r.push(t)}});return r}function g(s,v,x,r){var t=h(s);if(k.cssEase[x]){x=k.cssEase[x]}var w=""+l(v)+" "+x;if(parseInt(r,10)>0){w+=" "+l(r)}var u=[];k.each(t,function(z,y){u.push(y+" "+w)});return u.join(", ")}k.fn.transition=k.fn.transit=function(z,s,y,C){var D=this;var u=0;var w=true;if(typeof s==="function"){C=s;s=undefined}if(typeof y==="function"){C=y;y=undefined}if(typeof z.easing!=="undefined"){y=z.easing;delete z.easing}if(typeof z.duration!=="undefined"){s=z.duration;delete z.duration}if(typeof z.complete!=="undefined"){C=z.complete;delete z.complete}if(typeof z.queue!=="undefined"){w=z.queue;delete z.queue}if(typeof z.delay!=="undefined"){u=z.delay;delete z.delay}if(typeof s==="undefined"){s=k.fx.speeds._default}if(typeof y==="undefined"){y=k.cssEase._default}s=l(s);var E=g(z,s,y,u);var B=k.transit.enabled&&q.transition;var t=B?(parseInt(s,10)+parseInt(u,10)):0;if(t===0){var A=function(F){D.css(z);if(C){C.apply(D)}if(F){F()}};m(D,w,A);return D}var x={};var r=function(H){var G=false;var F=function(){if(G){D.unbind(f,F)}if(t>0){D.each(function(){this.style[q.transition]=(x[this]||null)})}if(typeof C==="function"){C.apply(D)}if(typeof H==="function"){H()}};if((t>0)&&(f)&&(k.transit.useTransitionEnd)){G=true;D.bind(f,F)}else{window.setTimeout(F,t)}D.each(function(){if(t>0){this.style[q.transition]=E}k(this).css(z)})};var v=function(F){this.offsetWidth;r(F)};m(D,w,v);return this};function n(s,r){if(!r){k.cssNumber[s]=true}k.transit.propertyMap[s]=q.transform;k.cssHooks[s]={get:function(v){var u=k(v).css("transit:transform");return u.get(s)},set:function(v,w){var u=k(v).css("transit:transform");u.setFromString(s,w);k(v).css({"transit:transform":u})}}}function c(r){return r.replace(/([A-Z])/g,function(s){return"-"+s.toLowerCase()})}function o(s,r){if((typeof s==="string")&&(!s.match(/^[\-0-9\.]+$/))){return s}else{return""+s+r}}function l(s){var r=s;if(k.fx.speeds[r]){r=k.fx.speeds[r]}return o(r,"ms")}k.transit.getTransitionValue=g})(jQuery);

/*!
 * Isotope PACKAGED v2.0.0
 * Filter & sort magical layouts
 * http://isotope.metafizzy.co
 */
;(function(t){function e(){}function i(t){function i(e){e.prototype.option||(e.prototype.option=function(e){t.isPlainObject(e)&&(this.options=t.extend(!0,this.options,e))})}function n(e,i){t.fn[e]=function(n){if("string"==typeof n){for(var s=o.call(arguments,1),a=0,u=this.length;u>a;a++){var p=this[a],h=t.data(p,e);if(h)if(t.isFunction(h[n])&&"_"!==n.charAt(0)){var f=h[n].apply(h,s);if(void 0!==f)return f}else r("no such method '"+n+"' for "+e+" instance");else r("cannot call methods on "+e+" prior to initialization; "+"attempted to call '"+n+"'")}return this}return this.each(function(){var o=t.data(this,e);o?(o.option(n),o._init()):(o=new i(this,n),t.data(this,e,o))})}}if(t){var r="undefined"==typeof console?e:function(t){console.error(t)};return t.bridget=function(t,e){i(e),n(t,e)},t.bridget}}var o=Array.prototype.slice;"function"==typeof define&&define.amd?define("jquery-bridget/jquery.bridget",["jquery"],i):i(t.jQuery)})(window),function(t){function e(e){var i=t.event;return i.target=i.target||i.srcElement||e,i}var i=document.documentElement,o=function(){};i.addEventListener?o=function(t,e,i){t.addEventListener(e,i,!1)}:i.attachEvent&&(o=function(t,i,o){t[i+o]=o.handleEvent?function(){var i=e(t);o.handleEvent.call(o,i)}:function(){var i=e(t);o.call(t,i)},t.attachEvent("on"+i,t[i+o])});var n=function(){};i.removeEventListener?n=function(t,e,i){t.removeEventListener(e,i,!1)}:i.detachEvent&&(n=function(t,e,i){t.detachEvent("on"+e,t[e+i]);try{delete t[e+i]}catch(o){t[e+i]=void 0}});var r={bind:o,unbind:n};"function"==typeof define&&define.amd?define("eventie/eventie",r):"object"==typeof exports?module.exports=r:t.eventie=r}(this),function(t){function e(t){"function"==typeof t&&(e.isReady?t():r.push(t))}function i(t){var i="readystatechange"===t.type&&"complete"!==n.readyState;if(!e.isReady&&!i){e.isReady=!0;for(var o=0,s=r.length;s>o;o++){var a=r[o];a()}}}function o(o){return o.bind(n,"DOMContentLoaded",i),o.bind(n,"readystatechange",i),o.bind(t,"load",i),e}var n=t.document,r=[];e.isReady=!1,"function"==typeof define&&define.amd?(e.isReady="function"==typeof requirejs,define("doc-ready/doc-ready",["eventie/eventie"],o)):t.docReady=o(t.eventie)}(this),function(){function t(){}function e(t,e){for(var i=t.length;i--;)if(t[i].listener===e)return i;return-1}function i(t){return function(){return this[t].apply(this,arguments)}}var o=t.prototype,n=this,r=n.EventEmitter;o.getListeners=function(t){var e,i,o=this._getEvents();if(t instanceof RegExp){e={};for(i in o)o.hasOwnProperty(i)&&t.test(i)&&(e[i]=o[i])}else e=o[t]||(o[t]=[]);return e},o.flattenListeners=function(t){var e,i=[];for(e=0;t.length>e;e+=1)i.push(t[e].listener);return i},o.getListenersAsObject=function(t){var e,i=this.getListeners(t);return i instanceof Array&&(e={},e[t]=i),e||i},o.addListener=function(t,i){var o,n=this.getListenersAsObject(t),r="object"==typeof i;for(o in n)n.hasOwnProperty(o)&&-1===e(n[o],i)&&n[o].push(r?i:{listener:i,once:!1});return this},o.on=i("addListener"),o.addOnceListener=function(t,e){return this.addListener(t,{listener:e,once:!0})},o.once=i("addOnceListener"),o.defineEvent=function(t){return this.getListeners(t),this},o.defineEvents=function(t){for(var e=0;t.length>e;e+=1)this.defineEvent(t[e]);return this},o.removeListener=function(t,i){var o,n,r=this.getListenersAsObject(t);for(n in r)r.hasOwnProperty(n)&&(o=e(r[n],i),-1!==o&&r[n].splice(o,1));return this},o.off=i("removeListener"),o.addListeners=function(t,e){return this.manipulateListeners(!1,t,e)},o.removeListeners=function(t,e){return this.manipulateListeners(!0,t,e)},o.manipulateListeners=function(t,e,i){var o,n,r=t?this.removeListener:this.addListener,s=t?this.removeListeners:this.addListeners;if("object"!=typeof e||e instanceof RegExp)for(o=i.length;o--;)r.call(this,e,i[o]);else for(o in e)e.hasOwnProperty(o)&&(n=e[o])&&("function"==typeof n?r.call(this,o,n):s.call(this,o,n));return this},o.removeEvent=function(t){var e,i=typeof t,o=this._getEvents();if("string"===i)delete o[t];else if(t instanceof RegExp)for(e in o)o.hasOwnProperty(e)&&t.test(e)&&delete o[e];else delete this._events;return this},o.removeAllListeners=i("removeEvent"),o.emitEvent=function(t,e){var i,o,n,r,s=this.getListenersAsObject(t);for(n in s)if(s.hasOwnProperty(n))for(o=s[n].length;o--;)i=s[n][o],i.once===!0&&this.removeListener(t,i.listener),r=i.listener.apply(this,e||[]),r===this._getOnceReturnValue()&&this.removeListener(t,i.listener);return this},o.trigger=i("emitEvent"),o.emit=function(t){var e=Array.prototype.slice.call(arguments,1);return this.emitEvent(t,e)},o.setOnceReturnValue=function(t){return this._onceReturnValue=t,this},o._getOnceReturnValue=function(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},o._getEvents=function(){return this._events||(this._events={})},t.noConflict=function(){return n.EventEmitter=r,t},"function"==typeof define&&define.amd?define("eventEmitter/EventEmitter",[],function(){return t}):"object"==typeof module&&module.exports?module.exports=t:this.EventEmitter=t}.call(this),function(t){function e(t){if(t){if("string"==typeof o[t])return t;t=t.charAt(0).toUpperCase()+t.slice(1);for(var e,n=0,r=i.length;r>n;n++)if(e=i[n]+t,"string"==typeof o[e])return e}}var i="Webkit Moz ms Ms O".split(" "),o=document.documentElement.style;"function"==typeof define&&define.amd?define("get-style-property/get-style-property",[],function(){return e}):"object"==typeof exports?module.exports=e:t.getStyleProperty=e}(window),function(t){function e(t){var e=parseFloat(t),i=-1===t.indexOf("%")&&!isNaN(e);return i&&e}function i(){for(var t={width:0,height:0,innerWidth:0,innerHeight:0,outerWidth:0,outerHeight:0},e=0,i=s.length;i>e;e++){var o=s[e];t[o]=0}return t}function o(t){function o(t){if("string"==typeof t&&(t=document.querySelector(t)),t&&"object"==typeof t&&t.nodeType){var o=r(t);if("none"===o.display)return i();var n={};n.width=t.offsetWidth,n.height=t.offsetHeight;for(var h=n.isBorderBox=!(!p||!o[p]||"border-box"!==o[p]),f=0,c=s.length;c>f;f++){var d=s[f],l=o[d];l=a(t,l);var y=parseFloat(l);n[d]=isNaN(y)?0:y}var m=n.paddingLeft+n.paddingRight,g=n.paddingTop+n.paddingBottom,v=n.marginLeft+n.marginRight,_=n.marginTop+n.marginBottom,I=n.borderLeftWidth+n.borderRightWidth,L=n.borderTopWidth+n.borderBottomWidth,z=h&&u,S=e(o.width);S!==!1&&(n.width=S+(z?0:m+I));var b=e(o.height);return b!==!1&&(n.height=b+(z?0:g+L)),n.innerWidth=n.width-(m+I),n.innerHeight=n.height-(g+L),n.outerWidth=n.width+v,n.outerHeight=n.height+_,n}}function a(t,e){if(n||-1===e.indexOf("%"))return e;var i=t.style,o=i.left,r=t.runtimeStyle,s=r&&r.left;return s&&(r.left=t.currentStyle.left),i.left=e,e=i.pixelLeft,i.left=o,s&&(r.left=s),e}var u,p=t("boxSizing");return function(){if(p){var t=document.createElement("div");t.style.width="200px",t.style.padding="1px 2px 3px 4px",t.style.borderStyle="solid",t.style.borderWidth="1px 2px 3px 4px",t.style[p]="border-box";var i=document.body||document.documentElement;i.appendChild(t);var o=r(t);u=200===e(o.width),i.removeChild(t)}}(),o}var n=t.getComputedStyle,r=n?function(t){return n(t,null)}:function(t){return t.currentStyle},s=["paddingLeft","paddingRight","paddingTop","paddingBottom","marginLeft","marginRight","marginTop","marginBottom","borderLeftWidth","borderRightWidth","borderTopWidth","borderBottomWidth"];"function"==typeof define&&define.amd?define("get-size/get-size",["get-style-property/get-style-property"],o):"object"==typeof exports?module.exports=o(require("get-style-property")):t.getSize=o(t.getStyleProperty)}(window),function(t,e){function i(t,e){return t[a](e)}function o(t){if(!t.parentNode){var e=document.createDocumentFragment();e.appendChild(t)}}function n(t,e){o(t);for(var i=t.parentNode.querySelectorAll(e),n=0,r=i.length;r>n;n++)if(i[n]===t)return!0;return!1}function r(t,e){return o(t),i(t,e)}var s,a=function(){if(e.matchesSelector)return"matchesSelector";for(var t=["webkit","moz","ms","o"],i=0,o=t.length;o>i;i++){var n=t[i],r=n+"MatchesSelector";if(e[r])return r}}();if(a){var u=document.createElement("div"),p=i(u,"div");s=p?i:r}else s=n;"function"==typeof define&&define.amd?define("matches-selector/matches-selector",[],function(){return s}):window.matchesSelector=s}(this,Element.prototype),function(t){function e(t,e){for(var i in e)t[i]=e[i];return t}function i(t){for(var e in t)return!1;return e=null,!0}function o(t){return t.replace(/([A-Z])/g,function(t){return"-"+t.toLowerCase()})}function n(t,n,r){function a(t,e){t&&(this.element=t,this.layout=e,this.position={x:0,y:0},this._create())}var u=r("transition"),p=r("transform"),h=u&&p,f=!!r("perspective"),c={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"otransitionend",transition:"transitionend"}[u],d=["transform","transition","transitionDuration","transitionProperty"],l=function(){for(var t={},e=0,i=d.length;i>e;e++){var o=d[e],n=r(o);n&&n!==o&&(t[o]=n)}return t}();e(a.prototype,t.prototype),a.prototype._create=function(){this._transn={ingProperties:{},clean:{},onEnd:{}},this.css({position:"absolute"})},a.prototype.handleEvent=function(t){var e="on"+t.type;this[e]&&this[e](t)},a.prototype.getSize=function(){this.size=n(this.element)},a.prototype.css=function(t){var e=this.element.style;for(var i in t){var o=l[i]||i;e[o]=t[i]}},a.prototype.getPosition=function(){var t=s(this.element),e=this.layout.options,i=e.isOriginLeft,o=e.isOriginTop,n=parseInt(t[i?"left":"right"],10),r=parseInt(t[o?"top":"bottom"],10);n=isNaN(n)?0:n,r=isNaN(r)?0:r;var a=this.layout.size;n-=i?a.paddingLeft:a.paddingRight,r-=o?a.paddingTop:a.paddingBottom,this.position.x=n,this.position.y=r},a.prototype.layoutPosition=function(){var t=this.layout.size,e=this.layout.options,i={};e.isOriginLeft?(i.left=this.position.x+t.paddingLeft+"px",i.right=""):(i.right=this.position.x+t.paddingRight+"px",i.left=""),e.isOriginTop?(i.top=this.position.y+t.paddingTop+"px",i.bottom=""):(i.bottom=this.position.y+t.paddingBottom+"px",i.top=""),this.css(i),this.emitEvent("layout",[this])};var y=f?function(t,e){return"translate3d("+t+"px, "+e+"px, 0)"}:function(t,e){return"translate("+t+"px, "+e+"px)"};a.prototype._transitionTo=function(t,e){this.getPosition();var i=this.position.x,o=this.position.y,n=parseInt(t,10),r=parseInt(e,10),s=n===this.position.x&&r===this.position.y;if(this.setPosition(t,e),s&&!this.isTransitioning)return this.layoutPosition(),void 0;var a=t-i,u=e-o,p={},h=this.layout.options;a=h.isOriginLeft?a:-a,u=h.isOriginTop?u:-u,p.transform=y(a,u),this.transition({to:p,onTransitionEnd:{transform:this.layoutPosition},isCleaning:!0})},a.prototype.goTo=function(t,e){this.setPosition(t,e),this.layoutPosition()},a.prototype.moveTo=h?a.prototype._transitionTo:a.prototype.goTo,a.prototype.setPosition=function(t,e){this.position.x=parseInt(t,10),this.position.y=parseInt(e,10)},a.prototype._nonTransition=function(t){this.css(t.to),t.isCleaning&&this._removeStyles(t.to);for(var e in t.onTransitionEnd)t.onTransitionEnd[e].call(this)},a.prototype._transition=function(t){if(!parseFloat(this.layout.options.transitionDuration))return this._nonTransition(t),void 0;var e=this._transn;for(var i in t.onTransitionEnd)e.onEnd[i]=t.onTransitionEnd[i];for(i in t.to)e.ingProperties[i]=!0,t.isCleaning&&(e.clean[i]=!0);if(t.from){this.css(t.from);var o=this.element.offsetHeight;o=null}this.enableTransition(t.to),this.css(t.to),this.isTransitioning=!0};var m=p&&o(p)+",opacity";a.prototype.enableTransition=function(){this.isTransitioning||(this.css({transitionProperty:m,transitionDuration:this.layout.options.transitionDuration}),this.element.addEventListener(c,this,!1))},a.prototype.transition=a.prototype[u?"_transition":"_nonTransition"],a.prototype.onwebkitTransitionEnd=function(t){this.ontransitionend(t)},a.prototype.onotransitionend=function(t){this.ontransitionend(t)};var g={"-webkit-transform":"transform","-moz-transform":"transform","-o-transform":"transform"};a.prototype.ontransitionend=function(t){if(t.target===this.element){var e=this._transn,o=g[t.propertyName]||t.propertyName;if(delete e.ingProperties[o],i(e.ingProperties)&&this.disableTransition(),o in e.clean&&(this.element.style[t.propertyName]="",delete e.clean[o]),o in e.onEnd){var n=e.onEnd[o];n.call(this),delete e.onEnd[o]}this.emitEvent("transitionEnd",[this])}},a.prototype.disableTransition=function(){this.removeTransitionStyles(),this.element.removeEventListener(c,this,!1),this.isTransitioning=!1},a.prototype._removeStyles=function(t){var e={};for(var i in t)e[i]="";this.css(e)};var v={transitionProperty:"",transitionDuration:""};return a.prototype.removeTransitionStyles=function(){this.css(v)},a.prototype.removeElem=function(){this.element.parentNode.removeChild(this.element),this.emitEvent("remove",[this])},a.prototype.remove=function(){if(!u||!parseFloat(this.layout.options.transitionDuration))return this.removeElem(),void 0;var t=this;this.on("transitionEnd",function(){return t.removeElem(),!0}),this.hide()},a.prototype.reveal=function(){delete this.isHidden,this.css({display:""});var t=this.layout.options;this.transition({from:t.hiddenStyle,to:t.visibleStyle,isCleaning:!0})},a.prototype.hide=function(){this.isHidden=!0,this.css({display:""});var t=this.layout.options;this.transition({from:t.visibleStyle,to:t.hiddenStyle,isCleaning:!0,onTransitionEnd:{opacity:function(){this.isHidden&&this.css({display:"none"})}}})},a.prototype.destroy=function(){this.css({position:"",left:"",right:"",top:"",bottom:"",transition:"",transform:""})},a}var r=t.getComputedStyle,s=r?function(t){return r(t,null)}:function(t){return t.currentStyle};"function"==typeof define&&define.amd?define("outlayer/item",["eventEmitter/EventEmitter","get-size/get-size","get-style-property/get-style-property"],n):(t.Outlayer={},t.Outlayer.Item=n(t.EventEmitter,t.getSize,t.getStyleProperty))}(window),function(t){function e(t,e){for(var i in e)t[i]=e[i];return t}function i(t){return"[object Array]"===f.call(t)}function o(t){var e=[];if(i(t))e=t;else if(t&&"number"==typeof t.length)for(var o=0,n=t.length;n>o;o++)e.push(t[o]);else e.push(t);return e}function n(t,e){var i=d(e,t);-1!==i&&e.splice(i,1)}function r(t){return t.replace(/(.)([A-Z])/g,function(t,e,i){return e+"-"+i}).toLowerCase()}function s(i,s,f,d,l,y){function m(t,i){if("string"==typeof t&&(t=a.querySelector(t)),!t||!c(t))return u&&u.error("Bad "+this.constructor.namespace+" element: "+t),void 0;this.element=t,this.options=e({},this.constructor.defaults),this.option(i);var o=++g;this.element.outlayerGUID=o,v[o]=this,this._create(),this.options.isInitLayout&&this.layout()}var g=0,v={};return m.namespace="outlayer",m.Item=y,m.defaults={containerStyle:{position:"relative"},isInitLayout:!0,isOriginLeft:!0,isOriginTop:!0,isResizeBound:!0,isResizingContainer:!0,transitionDuration:"0.4s",hiddenStyle:{opacity:0,transform:"scale(0.001)"},visibleStyle:{opacity:1,transform:"scale(1)"}},e(m.prototype,f.prototype),m.prototype.option=function(t){e(this.options,t)},m.prototype._create=function(){this.reloadItems(),this.stamps=[],this.stamp(this.options.stamp),e(this.element.style,this.options.containerStyle),this.options.isResizeBound&&this.bindResize()},m.prototype.reloadItems=function(){this.items=this._itemize(this.element.children)},m.prototype._itemize=function(t){for(var e=this._filterFindItemElements(t),i=this.constructor.Item,o=[],n=0,r=e.length;r>n;n++){var s=e[n],a=new i(s,this);o.push(a)}return o},m.prototype._filterFindItemElements=function(t){t=o(t);for(var e=this.options.itemSelector,i=[],n=0,r=t.length;r>n;n++){var s=t[n];if(c(s))if(e){l(s,e)&&i.push(s);for(var a=s.querySelectorAll(e),u=0,p=a.length;p>u;u++)i.push(a[u])}else i.push(s)}return i},m.prototype.getItemElements=function(){for(var t=[],e=0,i=this.items.length;i>e;e++)t.push(this.items[e].element);return t},m.prototype.layout=function(){this._resetLayout(),this._manageStamps();var t=void 0!==this.options.isLayoutInstant?this.options.isLayoutInstant:!this._isLayoutInited;this.layoutItems(this.items,t),this._isLayoutInited=!0},m.prototype._init=m.prototype.layout,m.prototype._resetLayout=function(){this.getSize()},m.prototype.getSize=function(){this.size=d(this.element)},m.prototype._getMeasurement=function(t,e){var i,o=this.options[t];o?("string"==typeof o?i=this.element.querySelector(o):c(o)&&(i=o),this[t]=i?d(i)[e]:o):this[t]=0},m.prototype.layoutItems=function(t,e){t=this._getItemsForLayout(t),this._layoutItems(t,e),this._postLayout()},m.prototype._getItemsForLayout=function(t){for(var e=[],i=0,o=t.length;o>i;i++){var n=t[i];n.isIgnored||e.push(n)}return e},m.prototype._layoutItems=function(t,e){function i(){o.emitEvent("layoutComplete",[o,t])}var o=this;if(!t||!t.length)return i(),void 0;this._itemsOn(t,"layout",i);for(var n=[],r=0,s=t.length;s>r;r++){var a=t[r],u=this._getItemLayoutPosition(a);u.item=a,u.isInstant=e||a.isLayoutInstant,n.push(u)}this._processLayoutQueue(n)},m.prototype._getItemLayoutPosition=function(){return{x:0,y:0}},m.prototype._processLayoutQueue=function(t){for(var e=0,i=t.length;i>e;e++){var o=t[e];this._positionItem(o.item,o.x,o.y,o.isInstant)}},m.prototype._positionItem=function(t,e,i,o){o?t.goTo(e,i):t.moveTo(e,i)},m.prototype._postLayout=function(){this.resizeContainer()},m.prototype.resizeContainer=function(){if(this.options.isResizingContainer){var t=this._getContainerSize();t&&(this._setContainerMeasure(t.width,!0),this._setContainerMeasure(t.height,!1))}},m.prototype._getContainerSize=h,m.prototype._setContainerMeasure=function(t,e){if(void 0!==t){var i=this.size;i.isBorderBox&&(t+=e?i.paddingLeft+i.paddingRight+i.borderLeftWidth+i.borderRightWidth:i.paddingBottom+i.paddingTop+i.borderTopWidth+i.borderBottomWidth),t=Math.max(t,0),this.element.style[e?"width":"height"]=t+"px"}},m.prototype._itemsOn=function(t,e,i){function o(){return n++,n===r&&i.call(s),!0}for(var n=0,r=t.length,s=this,a=0,u=t.length;u>a;a++){var p=t[a];p.on(e,o)}},m.prototype.ignore=function(t){var e=this.getItem(t);e&&(e.isIgnored=!0)},m.prototype.unignore=function(t){var e=this.getItem(t);e&&delete e.isIgnored},m.prototype.stamp=function(t){if(t=this._find(t)){this.stamps=this.stamps.concat(t);for(var e=0,i=t.length;i>e;e++){var o=t[e];this.ignore(o)}}},m.prototype.unstamp=function(t){if(t=this._find(t))for(var e=0,i=t.length;i>e;e++){var o=t[e];n(o,this.stamps),this.unignore(o)}},m.prototype._find=function(t){return t?("string"==typeof t&&(t=this.element.querySelectorAll(t)),t=o(t)):void 0},m.prototype._manageStamps=function(){if(this.stamps&&this.stamps.length){this._getBoundingRect();for(var t=0,e=this.stamps.length;e>t;t++){var i=this.stamps[t];this._manageStamp(i)}}},m.prototype._getBoundingRect=function(){var t=this.element.getBoundingClientRect(),e=this.size;this._boundingRect={left:t.left+e.paddingLeft+e.borderLeftWidth,top:t.top+e.paddingTop+e.borderTopWidth,right:t.right-(e.paddingRight+e.borderRightWidth),bottom:t.bottom-(e.paddingBottom+e.borderBottomWidth)}},m.prototype._manageStamp=h,m.prototype._getElementOffset=function(t){var e=t.getBoundingClientRect(),i=this._boundingRect,o=d(t),n={left:e.left-i.left-o.marginLeft,top:e.top-i.top-o.marginTop,right:i.right-e.right-o.marginRight,bottom:i.bottom-e.bottom-o.marginBottom};return n},m.prototype.handleEvent=function(t){var e="on"+t.type;this[e]&&this[e](t)},m.prototype.bindResize=function(){this.isResizeBound||(i.bind(t,"resize",this),this.isResizeBound=!0)},m.prototype.unbindResize=function(){this.isResizeBound&&i.unbind(t,"resize",this),this.isResizeBound=!1},m.prototype.onresize=function(){function t(){e.resize(),delete e.resizeTimeout}this.resizeTimeout&&clearTimeout(this.resizeTimeout);var e=this;this.resizeTimeout=setTimeout(t,100)},m.prototype.resize=function(){this.isResizeBound&&this.needsResizeLayout()&&this.layout()},m.prototype.needsResizeLayout=function(){var t=d(this.element),e=this.size&&t;return e&&t.innerWidth!==this.size.innerWidth},m.prototype.addItems=function(t){var e=this._itemize(t);return e.length&&(this.items=this.items.concat(e)),e},m.prototype.appended=function(t){var e=this.addItems(t);e.length&&(this.layoutItems(e,!0),this.reveal(e))},m.prototype.prepended=function(t){var e=this._itemize(t);if(e.length){var i=this.items.slice(0);this.items=e.concat(i),this._resetLayout(),this._manageStamps(),this.layoutItems(e,!0),this.reveal(e),this.layoutItems(i)}},m.prototype.reveal=function(t){var e=t&&t.length;if(e)for(var i=0;e>i;i++){var o=t[i];o.reveal()}},m.prototype.hide=function(t){var e=t&&t.length;if(e)for(var i=0;e>i;i++){var o=t[i];o.hide()}},m.prototype.getItem=function(t){for(var e=0,i=this.items.length;i>e;e++){var o=this.items[e];if(o.element===t)return o}},m.prototype.getItems=function(t){if(t&&t.length){for(var e=[],i=0,o=t.length;o>i;i++){var n=t[i],r=this.getItem(n);r&&e.push(r)}return e}},m.prototype.remove=function(t){t=o(t);var e=this.getItems(t);if(e&&e.length){this._itemsOn(e,"remove",function(){this.emitEvent("removeComplete",[this,e])});for(var i=0,r=e.length;r>i;i++){var s=e[i];s.remove(),n(s,this.items)}}},m.prototype.destroy=function(){var t=this.element.style;t.height="",t.position="",t.width="";for(var e=0,i=this.items.length;i>e;e++){var o=this.items[e];o.destroy()}this.unbindResize(),delete this.element.outlayerGUID,p&&p.removeData(this.element,this.constructor.namespace)},m.data=function(t){var e=t&&t.outlayerGUID;return e&&v[e]},m.create=function(t,i){function o(){m.apply(this,arguments)}return Object.create?o.prototype=Object.create(m.prototype):e(o.prototype,m.prototype),o.prototype.constructor=o,o.defaults=e({},m.defaults),e(o.defaults,i),o.prototype.settings={},o.namespace=t,o.data=m.data,o.Item=function(){y.apply(this,arguments)},o.Item.prototype=new y,s(function(){for(var e=r(t),i=a.querySelectorAll(".js-"+e),n="data-"+e+"-options",s=0,h=i.length;h>s;s++){var f,c=i[s],d=c.getAttribute(n);try{f=d&&JSON.parse(d)}catch(l){u&&u.error("Error parsing "+n+" on "+c.nodeName.toLowerCase()+(c.id?"#"+c.id:"")+": "+l);continue}var y=new o(c,f);p&&p.data(c,t,y)}}),p&&p.bridget&&p.bridget(t,o),o},m.Item=y,m}var a=t.document,u=t.console,p=t.jQuery,h=function(){},f=Object.prototype.toString,c="object"==typeof HTMLElement?function(t){return t instanceof HTMLElement}:function(t){return t&&"object"==typeof t&&1===t.nodeType&&"string"==typeof t.nodeName},d=Array.prototype.indexOf?function(t,e){return t.indexOf(e)}:function(t,e){for(var i=0,o=t.length;o>i;i++)if(t[i]===e)return i;return-1};"function"==typeof define&&define.amd?define("outlayer/outlayer",["eventie/eventie","doc-ready/doc-ready","eventEmitter/EventEmitter","get-size/get-size","matches-selector/matches-selector","./item"],s):t.Outlayer=s(t.eventie,t.docReady,t.EventEmitter,t.getSize,t.matchesSelector,t.Outlayer.Item)}(window),function(t){function e(t){function e(){t.Item.apply(this,arguments)}return e.prototype=new t.Item,e.prototype._create=function(){this.id=this.layout.itemGUID++,t.Item.prototype._create.call(this),this.sortData={}},e.prototype.updateSortData=function(){if(!this.isIgnored){this.sortData.id=this.id,this.sortData["original-order"]=this.id,this.sortData.random=Math.random();var t=this.layout.options.getSortData,e=this.layout._sorters;for(var i in t){var o=e[i];this.sortData[i]=o(this.element,this)}}},e}"function"==typeof define&&define.amd?define("isotope/js/item",["outlayer/outlayer"],e):(t.Isotope=t.Isotope||{},t.Isotope.Item=e(t.Outlayer))}(window),function(t){function e(t,e){function i(t){this.isotope=t,t&&(this.options=t.options[this.namespace],this.element=t.element,this.items=t.filteredItems,this.size=t.size)}return function(){function t(t){return function(){return e.prototype[t].apply(this.isotope,arguments)}}for(var o=["_resetLayout","_getItemLayoutPosition","_manageStamp","_getContainerSize","_getElementOffset","needsResizeLayout"],n=0,r=o.length;r>n;n++){var s=o[n];i.prototype[s]=t(s)}}(),i.prototype.needsVerticalResizeLayout=function(){var e=t(this.isotope.element),i=this.isotope.size&&e;return i&&e.innerHeight!==this.isotope.size.innerHeight},i.prototype._getMeasurement=function(){this.isotope._getMeasurement.apply(this,arguments)},i.prototype.getColumnWidth=function(){this.getSegmentSize("column","Width")},i.prototype.getRowHeight=function(){this.getSegmentSize("row","Height")},i.prototype.getSegmentSize=function(t,e){var i=t+e,o="outer"+e;if(this._getMeasurement(i,o),!this[i]){var n=this.getFirstItemSize();this[i]=n&&n[o]||this.isotope.size["inner"+e]}},i.prototype.getFirstItemSize=function(){var e=this.isotope.filteredItems[0];return e&&e.element&&t(e.element)},i.prototype.layout=function(){this.isotope.layout.apply(this.isotope,arguments)},i.prototype.getSize=function(){this.isotope.getSize(),this.size=this.isotope.size},i.modes={},i.create=function(t,e){function o(){i.apply(this,arguments)}return o.prototype=new i,e&&(o.options=e),o.prototype.namespace=t,i.modes[t]=o,o},i}"function"==typeof define&&define.amd?define("isotope/js/layout-mode",["get-size/get-size","outlayer/outlayer"],e):(t.Isotope=t.Isotope||{},t.Isotope.LayoutMode=e(t.getSize,t.Outlayer))}(window),function(t){function e(t,e){var o=t.create("masonry");return o.prototype._resetLayout=function(){this.getSize(),this._getMeasurement("columnWidth","outerWidth"),this._getMeasurement("gutter","outerWidth"),this.measureColumns();var t=this.cols;for(this.colYs=[];t--;)this.colYs.push(0);this.maxY=0},o.prototype.measureColumns=function(){if(this.getContainerWidth(),!this.columnWidth){var t=this.items[0],i=t&&t.element;this.columnWidth=i&&e(i).outerWidth||this.containerWidth}this.columnWidth+=this.gutter,this.cols=Math.floor((this.containerWidth+this.gutter)/this.columnWidth),this.cols=Math.max(this.cols,1)},o.prototype.getContainerWidth=function(){var t=this.options.isFitWidth?this.element.parentNode:this.element,i=e(t);this.containerWidth=i&&i.innerWidth},o.prototype._getItemLayoutPosition=function(t){t.getSize();var e=t.size.outerWidth%this.columnWidth,o=e&&1>e?"round":"ceil",n=Math[o](t.size.outerWidth/this.columnWidth);n=Math.min(n,this.cols);for(var r=this._getColGroup(n),s=Math.min.apply(Math,r),a=i(r,s),u={x:this.columnWidth*a,y:s},p=s+t.size.outerHeight,h=this.cols+1-r.length,f=0;h>f;f++)this.colYs[a+f]=p;return u},o.prototype._getColGroup=function(t){if(2>t)return this.colYs;for(var e=[],i=this.cols+1-t,o=0;i>o;o++){var n=this.colYs.slice(o,o+t);e[o]=Math.max.apply(Math,n)}return e},o.prototype._manageStamp=function(t){var i=e(t),o=this._getElementOffset(t),n=this.options.isOriginLeft?o.left:o.right,r=n+i.outerWidth,s=Math.floor(n/this.columnWidth);s=Math.max(0,s);var a=Math.floor(r/this.columnWidth);a-=r%this.columnWidth?0:1,a=Math.min(this.cols-1,a);for(var u=(this.options.isOriginTop?o.top:o.bottom)+i.outerHeight,p=s;a>=p;p++)this.colYs[p]=Math.max(u,this.colYs[p])},o.prototype._getContainerSize=function(){this.maxY=Math.max.apply(Math,this.colYs);var t={height:this.maxY};return this.options.isFitWidth&&(t.width=this._getContainerFitWidth()),t},o.prototype._getContainerFitWidth=function(){for(var t=0,e=this.cols;--e&&0===this.colYs[e];)t++;return(this.cols-t)*this.columnWidth-this.gutter},o.prototype.needsResizeLayout=function(){var t=this.containerWidth;return this.getContainerWidth(),t!==this.containerWidth},o}var i=Array.prototype.indexOf?function(t,e){return t.indexOf(e)}:function(t,e){for(var i=0,o=t.length;o>i;i++){var n=t[i];if(n===e)return i}return-1};"function"==typeof define&&define.amd?define("masonry/masonry",["outlayer/outlayer","get-size/get-size"],e):t.Masonry=e(t.Outlayer,t.getSize)}(window),function(t){function e(t,e){for(var i in e)t[i]=e[i];return t}function i(t,i){var o=t.create("masonry"),n=o.prototype._getElementOffset,r=o.prototype.layout,s=o.prototype._getMeasurement;e(o.prototype,i.prototype),o.prototype._getElementOffset=n,o.prototype.layout=r,o.prototype._getMeasurement=s;var a=o.prototype.measureColumns;o.prototype.measureColumns=function(){this.items=this.isotope.filteredItems,a.call(this)};var u=o.prototype._manageStamp;return o.prototype._manageStamp=function(){this.options.isOriginLeft=this.isotope.options.isOriginLeft,this.options.isOriginTop=this.isotope.options.isOriginTop,u.apply(this,arguments)},o}"function"==typeof define&&define.amd?define("isotope/js/layout-modes/masonry",["../layout-mode","masonry/masonry"],i):i(t.Isotope.LayoutMode,t.Masonry)}(window),function(t){function e(t){var e=t.create("fitRows");return e.prototype._resetLayout=function(){this.x=0,this.y=0,this.maxY=0},e.prototype._getItemLayoutPosition=function(t){t.getSize(),0!==this.x&&t.size.outerWidth+this.x>this.isotope.size.innerWidth&&(this.x=0,this.y=this.maxY);var e={x:this.x,y:this.y};return this.maxY=Math.max(this.maxY,this.y+t.size.outerHeight),this.x+=t.size.outerWidth,e},e.prototype._getContainerSize=function(){return{height:this.maxY}},e}"function"==typeof define&&define.amd?define("isotope/js/layout-modes/fit-rows",["../layout-mode"],e):e(t.Isotope.LayoutMode)}(window),function(t){function e(t){var e=t.create("vertical",{horizontalAlignment:0});return e.prototype._resetLayout=function(){this.y=0},e.prototype._getItemLayoutPosition=function(t){t.getSize();var e=(this.isotope.size.innerWidth-t.size.outerWidth)*this.options.horizontalAlignment,i=this.y;return this.y+=t.size.outerHeight,{x:e,y:i}},e.prototype._getContainerSize=function(){return{height:this.y}},e}"function"==typeof define&&define.amd?define("isotope/js/layout-modes/vertical",["../layout-mode"],e):e(t.Isotope.LayoutMode)}(window),function(t){function e(t,e){for(var i in e)t[i]=e[i];return t}function i(t){return"[object Array]"===h.call(t)}function o(t){var e=[];if(i(t))e=t;else if(t&&"number"==typeof t.length)for(var o=0,n=t.length;n>o;o++)e.push(t[o]);else e.push(t);return e}function n(t,e){var i=f(e,t);-1!==i&&e.splice(i,1)}function r(t,i,r,u,h){function f(t,e){return function(i,o){for(var n=0,r=t.length;r>n;n++){var s=t[n],a=i.sortData[s],u=o.sortData[s];if(a>u||u>a){var p=void 0!==e[s]?e[s]:e,h=p?1:-1;return(a>u?1:-1)*h}}return 0}}var c=t.create("isotope",{layoutMode:"masonry",isJQueryFiltering:!0,sortAscending:!0});c.Item=u,c.LayoutMode=h,c.prototype._create=function(){this.itemGUID=0,this._sorters={},this._getSorters(),t.prototype._create.call(this),this.modes={},this.filteredItems=this.items,this.sortHistory=["original-order"];for(var e in h.modes)this._initLayoutMode(e)},c.prototype.reloadItems=function(){this.itemGUID=0,t.prototype.reloadItems.call(this)},c.prototype._itemize=function(){for(var e=t.prototype._itemize.apply(this,arguments),i=0,o=e.length;o>i;i++){var n=e[i];n.id=this.itemGUID++}return this._updateItemsSortData(e),e},c.prototype._initLayoutMode=function(t){var i=h.modes[t],o=this.options[t]||{};this.options[t]=i.options?e(i.options,o):o,this.modes[t]=new i(this)},c.prototype.layout=function(){return!this._isLayoutInited&&this.options.isInitLayout?(this.arrange(),void 0):(this._layout(),void 0)},c.prototype._layout=function(){var t=this._getIsInstant();this._resetLayout(),this._manageStamps(),this.layoutItems(this.filteredItems,t),this._isLayoutInited=!0},c.prototype.arrange=function(t){this.option(t),this._getIsInstant(),this.filteredItems=this._filter(this.items),this._sort(),this._layout()},c.prototype._init=c.prototype.arrange,c.prototype._getIsInstant=function(){var t=void 0!==this.options.isLayoutInstant?this.options.isLayoutInstant:!this._isLayoutInited;return this._isInstant=t,t},c.prototype._filter=function(t){function e(){f.reveal(n),f.hide(r)}var i=this.options.filter;i=i||"*";for(var o=[],n=[],r=[],s=this._getFilterTest(i),a=0,u=t.length;u>a;a++){var p=t[a];if(!p.isIgnored){var h=s(p);h&&o.push(p),h&&p.isHidden?n.push(p):h||p.isHidden||r.push(p)}}var f=this;return this._isInstant?this._noTransition(e):e(),o},c.prototype._getFilterTest=function(t){return s&&this.options.isJQueryFiltering?function(e){return s(e.element).is(t)}:"function"==typeof t?function(e){return t(e.element)}:function(e){return r(e.element,t)}},c.prototype.updateSortData=function(t){this._getSorters(),t=o(t);var e=this.getItems(t);e=e.length?e:this.items,this._updateItemsSortData(e)
},c.prototype._getSorters=function(){var t=this.options.getSortData;for(var e in t){var i=t[e];this._sorters[e]=d(i)}},c.prototype._updateItemsSortData=function(t){for(var e=0,i=t.length;i>e;e++){var o=t[e];o.updateSortData()}};var d=function(){function t(t){if("string"!=typeof t)return t;var i=a(t).split(" "),o=i[0],n=o.match(/^\[(.+)\]$/),r=n&&n[1],s=e(r,o),u=c.sortDataParsers[i[1]];return t=u?function(t){return t&&u(s(t))}:function(t){return t&&s(t)}}function e(t,e){var i;return i=t?function(e){return e.getAttribute(t)}:function(t){var i=t.querySelector(e);return i&&p(i)}}return t}();c.sortDataParsers={parseInt:function(t){return parseInt(t,10)},parseFloat:function(t){return parseFloat(t)}},c.prototype._sort=function(){var t=this.options.sortBy;if(t){var e=[].concat.apply(t,this.sortHistory),i=f(e,this.options.sortAscending);this.filteredItems.sort(i),t!==this.sortHistory[0]&&this.sortHistory.unshift(t)}},c.prototype._mode=function(){var t=this.options.layoutMode,e=this.modes[t];if(!e)throw Error("No layout mode: "+t);return e.options=this.options[t],e},c.prototype._resetLayout=function(){t.prototype._resetLayout.call(this),this._mode()._resetLayout()},c.prototype._getItemLayoutPosition=function(t){return this._mode()._getItemLayoutPosition(t)},c.prototype._manageStamp=function(t){this._mode()._manageStamp(t)},c.prototype._getContainerSize=function(){return this._mode()._getContainerSize()},c.prototype.needsResizeLayout=function(){return this._mode().needsResizeLayout()},c.prototype.appended=function(t){var e=this.addItems(t);if(e.length){var i=this._filterRevealAdded(e);this.filteredItems=this.filteredItems.concat(i)}},c.prototype.prepended=function(t){var e=this._itemize(t);if(e.length){var i=this.items.slice(0);this.items=e.concat(i),this._resetLayout(),this._manageStamps();var o=this._filterRevealAdded(e);this.layoutItems(i),this.filteredItems=o.concat(this.filteredItems)}},c.prototype._filterRevealAdded=function(t){var e=this._noTransition(function(){return this._filter(t)});return this.layoutItems(e,!0),this.reveal(e),t},c.prototype.insert=function(t){var e=this.addItems(t);if(e.length){var i,o,n=e.length;for(i=0;n>i;i++)o=e[i],this.element.appendChild(o.element);var r=this._filter(e);for(this._noTransition(function(){this.hide(r)}),i=0;n>i;i++)e[i].isLayoutInstant=!0;for(this.arrange(),i=0;n>i;i++)delete e[i].isLayoutInstant;this.reveal(r)}};var l=c.prototype.remove;return c.prototype.remove=function(t){t=o(t);var e=this.getItems(t);if(l.call(this,t),e&&e.length)for(var i=0,r=e.length;r>i;i++){var s=e[i];n(s,this.filteredItems)}},c.prototype._noTransition=function(t){var e=this.options.transitionDuration;this.options.transitionDuration=0;var i=t.call(this);return this.options.transitionDuration=e,i},c}var s=t.jQuery,a=String.prototype.trim?function(t){return t.trim()}:function(t){return t.replace(/^\s+|\s+$/g,"")},u=document.documentElement,p=u.textContent?function(t){return t.textContent}:function(t){return t.innerText},h=Object.prototype.toString,f=Array.prototype.indexOf?function(t,e){return t.indexOf(e)}:function(t,e){for(var i=0,o=t.length;o>i;i++)if(t[i]===e)return i;return-1};"function"==typeof define&&define.amd?define(["outlayer/outlayer","get-size/get-size","matches-selector/matches-selector","isotope/js/item","isotope/js/layout-mode","isotope/js/layout-modes/masonry","isotope/js/layout-modes/fit-rows","isotope/js/layout-modes/vertical"],r):t.Isotope=r(t.Outlayer,t.getSize,t.matchesSelector,t.Isotope.Item,t.Isotope.LayoutMode)}(window);

// Magnific Popup v1.0.0 by Dmitry Semenov
// http://bit.ly/magnific-popup#build=inline+image+ajax+iframe+gallery+retina+imagezoom+fastclick
(function(a){typeof define=="function"&&define.amd?define(["jquery"],a):typeof exports=="object"?a(require("jquery")):a(window.jQuery||window.Zepto)})(function(a){var b="Close",c="BeforeClose",d="AfterClose",e="BeforeAppend",f="MarkupParse",g="Open",h="Change",i="mfp",j="."+i,k="mfp-ready",l="mfp-removing",m="mfp-prevent-close",n,o=function(){},p=!!window.jQuery,q,r=a(window),s,t,u,v,w=function(a,b){n.ev.on(i+a+j,b)},x=function(b,c,d,e){var f=document.createElement("div");return f.className="mfp-"+b,d&&(f.innerHTML=d),e?c&&c.appendChild(f):(f=a(f),c&&f.appendTo(c)),f},y=function(b,c){n.ev.triggerHandler(i+b,c),n.st.callbacks&&(b=b.charAt(0).toLowerCase()+b.slice(1),n.st.callbacks[b]&&n.st.callbacks[b].apply(n,a.isArray(c)?c:[c]))},z=function(b){if(b!==v||!n.currTemplate.closeBtn)n.currTemplate.closeBtn=a(n.st.closeMarkup.replace("%title%",n.st.tClose)),v=b;return n.currTemplate.closeBtn},A=function(){a.magnificPopup.instance||(n=new o,n.init(),a.magnificPopup.instance=n)},B=function(){var a=document.createElement("p").style,b=["ms","O","Moz","Webkit"];if(a.transition!==undefined)return!0;while(b.length)if(b.pop()+"Transition"in a)return!0;return!1};o.prototype={constructor:o,init:function(){var b=navigator.appVersion;n.isIE7=b.indexOf("MSIE 7.")!==-1,n.isIE8=b.indexOf("MSIE 8.")!==-1,n.isLowIE=n.isIE7||n.isIE8,n.isAndroid=/android/gi.test(b),n.isIOS=/iphone|ipad|ipod/gi.test(b),n.supportsTransition=B(),n.probablyMobile=n.isAndroid||n.isIOS||/(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent),s=a(document),n.popupsCache={}},open:function(b){var c;if(b.isObj===!1){n.items=b.items.toArray(),n.index=0;var d=b.items,e;for(c=0;c<d.length;c++){e=d[c],e.parsed&&(e=e.el[0]);if(e===b.el[0]){n.index=c;break}}}else n.items=a.isArray(b.items)?b.items:[b.items],n.index=b.index||0;if(n.isOpen){n.updateItemHTML();return}n.types=[],u="",b.mainEl&&b.mainEl.length?n.ev=b.mainEl.eq(0):n.ev=s,b.key?(n.popupsCache[b.key]||(n.popupsCache[b.key]={}),n.currTemplate=n.popupsCache[b.key]):n.currTemplate={},n.st=a.extend(!0,{},a.magnificPopup.defaults,b),n.fixedContentPos=n.st.fixedContentPos==="auto"?!n.probablyMobile:n.st.fixedContentPos,n.st.modal&&(n.st.closeOnContentClick=!1,n.st.closeOnBgClick=!1,n.st.showCloseBtn=!1,n.st.enableEscapeKey=!1),n.bgOverlay||(n.bgOverlay=x("bg").on("click"+j,function(){n.close()}),n.wrap=x("wrap").attr("tabindex",-1).on("click"+j,function(a){n._checkIfClose(a.target)&&n.close()}),n.container=x("container",n.wrap)),n.contentContainer=x("content"),n.st.preloader&&(n.preloader=x("preloader",n.container,n.st.tLoading));var h=a.magnificPopup.modules;for(c=0;c<h.length;c++){var i=h[c];i=i.charAt(0).toUpperCase()+i.slice(1),n["init"+i].call(n)}y("BeforeOpen"),n.st.showCloseBtn&&(n.st.closeBtnInside?(w(f,function(a,b,c,d){c.close_replaceWith=z(d.type)}),u+=" mfp-close-btn-in"):n.wrap.append(z())),n.st.alignTop&&(u+=" mfp-align-top"),n.fixedContentPos?n.wrap.css({overflow:n.st.overflowY,overflowX:"hidden",overflowY:n.st.overflowY}):n.wrap.css({top:r.scrollTop(),position:"absolute"}),(n.st.fixedBgPos===!1||n.st.fixedBgPos==="auto"&&!n.fixedContentPos)&&n.bgOverlay.css({height:s.height(),position:"absolute"}),n.st.enableEscapeKey&&s.on("keyup"+j,function(a){a.keyCode===27&&n.close()}),r.on("resize"+j,function(){n.updateSize()}),n.st.closeOnContentClick||(u+=" mfp-auto-cursor"),u&&n.wrap.addClass(u);var l=n.wH=r.height(),m={};if(n.fixedContentPos&&n._hasScrollBar(l)){var o=n._getScrollbarSize();o&&(m.marginRight=o)}n.fixedContentPos&&(n.isIE7?a("body, html").css("overflow","hidden"):m.overflow="hidden");var p=n.st.mainClass;return n.isIE7&&(p+=" mfp-ie7"),p&&n._addClassToMFP(p),n.updateItemHTML(),y("BuildControls"),a("html").css(m),n.bgOverlay.add(n.wrap).prependTo(n.st.prependTo||a(document.body)),n._lastFocusedEl=document.activeElement,setTimeout(function(){n.content?(n._addClassToMFP(k),n._setFocus()):n.bgOverlay.addClass(k),s.on("focusin"+j,n._onFocusIn)},16),n.isOpen=!0,n.updateSize(l),y(g),b},close:function(){if(!n.isOpen)return;y(c),n.isOpen=!1,n.st.removalDelay&&!n.isLowIE&&n.supportsTransition?(n._addClassToMFP(l),setTimeout(function(){n._close()},n.st.removalDelay)):n._close()},_close:function(){y(b);var c=l+" "+k+" ";n.bgOverlay.detach(),n.wrap.detach(),n.container.empty(),n.st.mainClass&&(c+=n.st.mainClass+" "),n._removeClassFromMFP(c);if(n.fixedContentPos){var e={marginRight:""};n.isIE7?a("body, html").css("overflow",""):e.overflow="",a("html").css(e)}s.off("keyup"+j+" focusin"+j),n.ev.off(j),n.wrap.attr("class","mfp-wrap").removeAttr("style"),n.bgOverlay.attr("class","mfp-bg"),n.container.attr("class","mfp-container"),n.st.showCloseBtn&&(!n.st.closeBtnInside||n.currTemplate[n.currItem.type]===!0)&&n.currTemplate.closeBtn&&n.currTemplate.closeBtn.detach(),n._lastFocusedEl&&a(n._lastFocusedEl).focus(),n.currItem=null,n.content=null,n.currTemplate=null,n.prevHeight=0,y(d)},updateSize:function(a){if(n.isIOS){var b=document.documentElement.clientWidth/window.innerWidth,c=window.innerHeight*b;n.wrap.css("height",c),n.wH=c}else n.wH=a||r.height();n.fixedContentPos||n.wrap.css("height",n.wH),y("Resize")},updateItemHTML:function(){var b=n.items[n.index];n.contentContainer.detach(),n.content&&n.content.detach(),b.parsed||(b=n.parseEl(n.index));var c=b.type;y("BeforeChange",[n.currItem?n.currItem.type:"",c]),n.currItem=b;if(!n.currTemplate[c]){var d=n.st[c]?n.st[c].markup:!1;y("FirstMarkupParse",d),d?n.currTemplate[c]=a(d):n.currTemplate[c]=!0}t&&t!==b.type&&n.container.removeClass("mfp-"+t+"-holder");var e=n["get"+c.charAt(0).toUpperCase()+c.slice(1)](b,n.currTemplate[c]);n.appendContent(e,c),b.preloaded=!0,y(h,b),t=b.type,n.container.prepend(n.contentContainer),y("AfterChange")},appendContent:function(a,b){n.content=a,a?n.st.showCloseBtn&&n.st.closeBtnInside&&n.currTemplate[b]===!0?n.content.find(".mfp-close").length||n.content.append(z()):n.content=a:n.content="",y(e),n.container.addClass("mfp-"+b+"-holder"),n.contentContainer.append(n.content)},parseEl:function(b){var c=n.items[b],d;c.tagName?c={el:a(c)}:(d=c.type,c={data:c,src:c.src});if(c.el){var e=n.types;for(var f=0;f<e.length;f++)if(c.el.hasClass("mfp-"+e[f])){d=e[f];break}c.src=c.el.attr("data-mfp-src"),c.src||(c.src=c.el.attr("href"))}return c.type=d||n.st.type||"inline",c.index=b,c.parsed=!0,n.items[b]=c,y("ElementParse",c),n.items[b]},addGroup:function(a,b){var c=function(c){c.mfpEl=this,n._openClick(c,a,b)};b||(b={});var d="click.magnificPopup";b.mainEl=a,b.items?(b.isObj=!0,a.off(d).on(d,c)):(b.isObj=!1,b.delegate?a.off(d).on(d,b.delegate,c):(b.items=a,a.off(d).on(d,c)))},_openClick:function(b,c,d){var e=d.midClick!==undefined?d.midClick:a.magnificPopup.defaults.midClick;if(!e&&(b.which===2||b.ctrlKey||b.metaKey||b.altKey||b.shiftKey))return;var f=d.disableOn!==undefined?d.disableOn:a.magnificPopup.defaults.disableOn;if(f)if(a.isFunction(f)){if(!f.call(n))return!0}else if(r.width()<f)return!0;b.type&&(b.preventDefault(),n.isOpen&&b.stopPropagation()),d.el=a(b.mfpEl),d.delegate&&(d.items=c.find(d.delegate)),n.open(d)},updateStatus:function(a,b){if(n.preloader){q!==a&&n.container.removeClass("mfp-s-"+q),!b&&a==="loading"&&(b=n.st.tLoading);var c={status:a,text:b};y("UpdateStatus",c),a=c.status,b=c.text,n.preloader.html(b),n.preloader.find("a").on("click",function(a){a.stopImmediatePropagation()}),n.container.addClass("mfp-s-"+a),q=a}},_checkIfClose:function(b){if(a(b).hasClass(m))return;var c=n.st.closeOnContentClick,d=n.st.closeOnBgClick;if(c&&d)return!0;if(!n.content||a(b).hasClass("mfp-close")||n.preloader&&b===n.preloader[0])return!0;if(b!==n.content[0]&&!a.contains(n.content[0],b)){if(d&&a.contains(document,b))return!0}else if(c)return!0;return!1},_addClassToMFP:function(a){n.bgOverlay.addClass(a),n.wrap.addClass(a)},_removeClassFromMFP:function(a){this.bgOverlay.removeClass(a),n.wrap.removeClass(a)},_hasScrollBar:function(a){return(n.isIE7?s.height():document.body.scrollHeight)>(a||r.height())},_setFocus:function(){(n.st.focus?n.content.find(n.st.focus).eq(0):n.wrap).focus()},_onFocusIn:function(b){if(b.target!==n.wrap[0]&&!a.contains(n.wrap[0],b.target))return n._setFocus(),!1},_parseMarkup:function(b,c,d){var e;d.data&&(c=a.extend(d.data,c)),y(f,[b,c,d]),a.each(c,function(a,c){if(c===undefined||c===!1)return!0;e=a.split("_");if(e.length>1){var d=b.find(j+"-"+e[0]);if(d.length>0){var f=e[1];f==="replaceWith"?d[0]!==c[0]&&d.replaceWith(c):f==="img"?d.is("img")?d.attr("src",c):d.replaceWith('<img src="'+c+'" class="'+d.attr("class")+'" />'):d.attr(e[1],c)}}else b.find(j+"-"+a).html(c)})},_getScrollbarSize:function(){if(n.scrollbarSize===undefined){var a=document.createElement("div");a.style.cssText="width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;",document.body.appendChild(a),n.scrollbarSize=a.offsetWidth-a.clientWidth,document.body.removeChild(a)}return n.scrollbarSize}},a.magnificPopup={instance:null,proto:o.prototype,modules:[],open:function(b,c){return A(),b?b=a.extend(!0,{},b):b={},b.isObj=!0,b.index=c||0,this.instance.open(b)},close:function(){return a.magnificPopup.instance&&a.magnificPopup.instance.close()},registerModule:function(b,c){c.options&&(a.magnificPopup.defaults[b]=c.options),a.extend(this.proto,c.proto),this.modules.push(b)},defaults:{disableOn:0,key:null,midClick:!1,mainClass:"",preloader:!0,focus:"",closeOnContentClick:!1,closeOnBgClick:!0,closeBtnInside:!0,showCloseBtn:!0,enableEscapeKey:!0,modal:!1,alignTop:!1,removalDelay:0,prependTo:null,fixedContentPos:"auto",fixedBgPos:"auto",overflowY:"auto",closeMarkup:'<button title="%title%" type="button" class="mfp-close">&#215;</button>',tClose:"Close (Esc)",tLoading:"Loading..."}},a.fn.magnificPopup=function(b){A();var c=a(this);if(typeof b=="string")if(b==="open"){var d,e=p?c.data("magnificPopup"):c[0].magnificPopup,f=parseInt(arguments[1],10)||0;e.items?d=e.items[f]:(d=c,e.delegate&&(d=d.find(e.delegate)),d=d.eq(f)),n._openClick({mfpEl:d},c,e)}else n.isOpen&&n[b].apply(n,Array.prototype.slice.call(arguments,1));else b=a.extend(!0,{},b),p?c.data("magnificPopup",b):c[0].magnificPopup=b,n.addGroup(c,b);return c};var C="inline",D,E,F,G=function(){F&&(E.after(F.addClass(D)).detach(),F=null)};a.magnificPopup.registerModule(C,{options:{hiddenClass:"hide",markup:"",tNotFound:"Content not found"},proto:{initInline:function(){n.types.push(C),w(b+"."+C,function(){G()})},getInline:function(b,c){G();if(b.src){var d=n.st.inline,e=a(b.src);if(e.length){var f=e[0].parentNode;f&&f.tagName&&(E||(D=d.hiddenClass,E=x(D),D="mfp-"+D),F=e.after(E).detach().removeClass(D)),n.updateStatus("ready")}else n.updateStatus("error",d.tNotFound),e=a("<div>");return b.inlineElement=e,e}return n.updateStatus("ready"),n._parseMarkup(c,{},b),c}}});var H="ajax",I,J=function(){I&&a(document.body).removeClass(I)},K=function(){J(),n.req&&n.req.abort()};a.magnificPopup.registerModule(H,{options:{settings:null,cursor:"mfp-ajax-cur",tError:'<a href="%url%">The content</a> could not be loaded.'},proto:{initAjax:function(){n.types.push(H),I=n.st.ajax.cursor,w(b+"."+H,K),w("BeforeChange."+H,K)},getAjax:function(b){I&&a(document.body).addClass(I),n.updateStatus("loading");var c=a.extend({url:b.src,success:function(c,d,e){var f={data:c,xhr:e};y("ParseAjax",f),n.appendContent(a(f.data),H),b.finished=!0,J(),n._setFocus(),setTimeout(function(){n.wrap.addClass(k)},16),n.updateStatus("ready"),y("AjaxContentAdded")},error:function(){J(),b.finished=b.loadError=!0,n.updateStatus("error",n.st.ajax.tError.replace("%url%",b.src))}},n.st.ajax.settings);return n.req=a.ajax(c),""}}});var L,M=function(b){if(b.data&&b.data.title!==undefined)return b.data.title;var c=n.st.image.titleSrc;if(c){if(a.isFunction(c))return c.call(n,b);if(b.el)return b.el.attr(c)||""}return""};a.magnificPopup.registerModule("image",{options:{markup:'<div class="mfp-figure"><div class="mfp-close"></div><figure><div class="mfp-img"></div><figcaption><div class="mfp-bottom-bar"><div class="mfp-title"></div><div class="mfp-counter"></div></div></figcaption></figure></div>',cursor:"mfp-zoom-out-cur",titleSrc:"title",verticalFit:!0,tError:'<a href="%url%">The image</a> could not be loaded.'},proto:{initImage:function(){var c=n.st.image,d=".image";n.types.push("image"),w(g+d,function(){n.currItem.type==="image"&&c.cursor&&a(document.body).addClass(c.cursor)}),w(b+d,function(){c.cursor&&a(document.body).removeClass(c.cursor),r.off("resize"+j)}),w("Resize"+d,n.resizeImage),n.isLowIE&&w("AfterChange",n.resizeImage)},resizeImage:function(){var a=n.currItem;if(!a||!a.img)return;if(n.st.image.verticalFit){var b=0;n.isLowIE&&(b=parseInt(a.img.css("padding-top"),10)+parseInt(a.img.css("padding-bottom"),10)),a.img.css("max-height",n.wH-b)}},_onImageHasSize:function(a){a.img&&(a.hasSize=!0,L&&clearInterval(L),a.isCheckingImgSize=!1,y("ImageHasSize",a),a.imgHidden&&(n.content&&n.content.removeClass("mfp-loading"),a.imgHidden=!1))},findImageSize:function(a){var b=0,c=a.img[0],d=function(e){L&&clearInterval(L),L=setInterval(function(){if(c.naturalWidth>0){n._onImageHasSize(a);return}b>200&&clearInterval(L),b++,b===3?d(10):b===40?d(50):b===100&&d(500)},e)};d(1)},getImage:function(b,c){var d=0,e=function(){b&&(b.img[0].complete?(b.img.off(".mfploader"),b===n.currItem&&(n._onImageHasSize(b),n.updateStatus("ready")),b.hasSize=!0,b.loaded=!0,y("ImageLoadComplete")):(d++,d<200?setTimeout(e,100):f()))},f=function(){b&&(b.img.off(".mfploader"),b===n.currItem&&(n._onImageHasSize(b),n.updateStatus("error",g.tError.replace("%url%",b.src))),b.hasSize=!0,b.loaded=!0,b.loadError=!0)},g=n.st.image,h=c.find(".mfp-img");if(h.length){var i=document.createElement("img");i.className="mfp-img",b.el&&b.el.find("img").length&&(i.alt=b.el.find("img").attr("alt")),b.img=a(i).on("load.mfploader",e).on("error.mfploader",f),i.src=b.src,h.is("img")&&(b.img=b.img.clone()),i=b.img[0],i.naturalWidth>0?b.hasSize=!0:i.width||(b.hasSize=!1)}return n._parseMarkup(c,{title:M(b),img_replaceWith:b.img},b),n.resizeImage(),b.hasSize?(L&&clearInterval(L),b.loadError?(c.addClass("mfp-loading"),n.updateStatus("error",g.tError.replace("%url%",b.src))):(c.removeClass("mfp-loading"),n.updateStatus("ready")),c):(n.updateStatus("loading"),b.loading=!0,b.hasSize||(b.imgHidden=!0,c.addClass("mfp-loading"),n.findImageSize(b)),c)}}});var N,O=function(){return N===undefined&&(N=document.createElement("p").style.MozTransform!==undefined),N};a.magnificPopup.registerModule("zoom",{options:{enabled:!1,easing:"ease-in-out",duration:300,opener:function(a){return a.is("img")?a:a.find("img")}},proto:{initZoom:function(){var a=n.st.zoom,d=".zoom",e;if(!a.enabled||!n.supportsTransition)return;var f=a.duration,g=function(b){var c=b.clone().removeAttr("style").removeAttr("class").addClass("mfp-animated-image"),d="all "+a.duration/1e3+"s "+a.easing,e={position:"fixed",zIndex:9999,left:0,top:0,"-webkit-backface-visibility":"hidden"},f="transition";return e["-webkit-"+f]=e["-moz-"+f]=e["-o-"+f]=e[f]=d,c.css(e),c},h=function(){n.content.css("visibility","visible")},i,j;w("BuildControls"+d,function(){if(n._allowZoom()){clearTimeout(i),n.content.css("visibility","hidden"),e=n._getItemToZoom();if(!e){h();return}j=g(e),j.css(n._getOffset()),n.wrap.append(j),i=setTimeout(function(){j.css(n._getOffset(!0)),i=setTimeout(function(){h(),setTimeout(function(){j.remove(),e=j=null,y("ZoomAnimationEnded")},16)},f)},16)}}),w(c+d,function(){if(n._allowZoom()){clearTimeout(i),n.st.removalDelay=f;if(!e){e=n._getItemToZoom();if(!e)return;j=g(e)}j.css(n._getOffset(!0)),n.wrap.append(j),n.content.css("visibility","hidden"),setTimeout(function(){j.css(n._getOffset())},16)}}),w(b+d,function(){n._allowZoom()&&(h(),j&&j.remove(),e=null)})},_allowZoom:function(){return n.currItem.type==="image"},_getItemToZoom:function(){return n.currItem.hasSize?n.currItem.img:!1},_getOffset:function(b){var c;b?c=n.currItem.img:c=n.st.zoom.opener(n.currItem.el||n.currItem);var d=c.offset(),e=parseInt(c.css("padding-top"),10),f=parseInt(c.css("padding-bottom"),10);d.top-=a(window).scrollTop()-e;var g={width:c.width(),height:(p?c.innerHeight():c[0].offsetHeight)-f-e};return O()?g["-moz-transform"]=g.transform="translate("+d.left+"px,"+d.top+"px)":(g.left=d.left,g.top=d.top),g}}});var P="iframe",Q="//about:blank",R=function(a){if(n.currTemplate[P]){var b=n.currTemplate[P].find("iframe");b.length&&(a||(b[0].src=Q),n.isIE8&&b.css("display",a?"block":"none"))}};a.magnificPopup.registerModule(P,{options:{markup:'<div class="mfp-iframe-scaler"><div class="mfp-close"></div><iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe></div>',srcAction:"iframe_src",patterns:{youtube:{index:"youtube.com",id:"v=",src:"//www.youtube.com/embed/%id%?autoplay=1"},vimeo:{index:"vimeo.com/",id:"/",src:"//player.vimeo.com/video/%id%?autoplay=1"},gmaps:{index:"//maps.google.",src:"%id%&output=embed"}}},proto:{initIframe:function(){n.types.push(P),w("BeforeChange",function(a,b,c){b!==c&&(b===P?R():c===P&&R(!0))}),w(b+"."+P,function(){R()})},getIframe:function(b,c){var d=b.src,e=n.st.iframe;a.each(e.patterns,function(){if(d.indexOf(this.index)>-1)return this.id&&(typeof this.id=="string"?d=d.substr(d.lastIndexOf(this.id)+this.id.length,d.length):d=this.id.call(this,d)),d=this.src.replace("%id%",d),!1});var f={};return e.srcAction&&(f[e.srcAction]=d),n._parseMarkup(c,f,b),n.updateStatus("ready"),c}}});var S=function(a){var b=n.items.length;return a>b-1?a-b:a<0?b+a:a},T=function(a,b,c){return a.replace(/%curr%/gi,b+1).replace(/%total%/gi,c)};a.magnificPopup.registerModule("gallery",{options:{enabled:!1,arrowMarkup:'<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',preload:[0,2],navigateByImgClick:!0,arrows:!0,tPrev:"Previous (Left arrow key)",tNext:"Next (Right arrow key)",tCounter:"%curr% of %total%"},proto:{initGallery:function(){var c=n.st.gallery,d=".mfp-gallery",e=Boolean(a.fn.mfpFastClick);n.direction=!0;if(!c||!c.enabled)return!1;u+=" mfp-gallery",w(g+d,function(){c.navigateByImgClick&&n.wrap.on("click"+d,".mfp-img",function(){if(n.items.length>1)return n.next(),!1}),s.on("keydown"+d,function(a){a.keyCode===37?n.prev():a.keyCode===39&&n.next()})}),w("UpdateStatus"+d,function(a,b){b.text&&(b.text=T(b.text,n.currItem.index,n.items.length))}),w(f+d,function(a,b,d,e){var f=n.items.length;d.counter=f>1?T(c.tCounter,e.index,f):""}),w("BuildControls"+d,function(){if(n.items.length>1&&c.arrows&&!n.arrowLeft){var b=c.arrowMarkup,d=n.arrowLeft=a(b.replace(/%title%/gi,c.tPrev).replace(/%dir%/gi,"left")).addClass(m),f=n.arrowRight=a(b.replace(/%title%/gi,c.tNext).replace(/%dir%/gi,"right")).addClass(m),g=e?"mfpFastClick":"click";d[g](function(){n.prev()}),f[g](function(){n.next()}),n.isIE7&&(x("b",d[0],!1,!0),x("a",d[0],!1,!0),x("b",f[0],!1,!0),x("a",f[0],!1,!0)),n.container.append(d.add(f))}}),w(h+d,function(){n._preloadTimeout&&clearTimeout(n._preloadTimeout),n._preloadTimeout=setTimeout(function(){n.preloadNearbyImages(),n._preloadTimeout=null},16)}),w(b+d,function(){s.off(d),n.wrap.off("click"+d),n.arrowLeft&&e&&n.arrowLeft.add(n.arrowRight).destroyMfpFastClick(),n.arrowRight=n.arrowLeft=null})},next:function(){n.direction=!0,n.index=S(n.index+1),n.updateItemHTML()},prev:function(){n.direction=!1,n.index=S(n.index-1),n.updateItemHTML()},goTo:function(a){n.direction=a>=n.index,n.index=a,n.updateItemHTML()},preloadNearbyImages:function(){var a=n.st.gallery.preload,b=Math.min(a[0],n.items.length),c=Math.min(a[1],n.items.length),d;for(d=1;d<=(n.direction?c:b);d++)n._preloadItem(n.index+d);for(d=1;d<=(n.direction?b:c);d++)n._preloadItem(n.index-d)},_preloadItem:function(b){b=S(b);if(n.items[b].preloaded)return;var c=n.items[b];c.parsed||(c=n.parseEl(b)),y("LazyLoad",c),c.type==="image"&&(c.img=a('<img class="mfp-img" />').on("load.mfploader",function(){c.hasSize=!0}).on("error.mfploader",function(){c.hasSize=!0,c.loadError=!0,y("LazyLoadError",c)}).attr("src",c.src)),c.preloaded=!0}}});var U="retina";a.magnificPopup.registerModule(U,{options:{replaceSrc:function(a){return a.src.replace(/\.\w+$/,function(a){return"@2x"+a})},ratio:1},proto:{initRetina:function(){if(window.devicePixelRatio>1){var a=n.st.retina,b=a.ratio;b=isNaN(b)?b():b,b>1&&(w("ImageHasSize."+U,function(a,c){c.img.css({"max-width":c.img[0].naturalWidth/b,width:"100%"})}),w("ElementParse."+U,function(c,d){d.src=a.replaceSrc(d,b)}))}}}}),function(){var b=1e3,c="ontouchstart"in window,d=function(){r.off("touchmove"+f+" touchend"+f)},e="mfpFastClick",f="."+e;a.fn.mfpFastClick=function(e){return a(this).each(function(){var g=a(this),h;if(c){var i,j,k,l,m,n;g.on("touchstart"+f,function(a){l=!1,n=1,m=a.originalEvent?a.originalEvent.touches[0]:a.touches[0],j=m.clientX,k=m.clientY,r.on("touchmove"+f,function(a){m=a.originalEvent?a.originalEvent.touches:a.touches,n=m.length,m=m[0];if(Math.abs(m.clientX-j)>10||Math.abs(m.clientY-k)>10)l=!0,d()}).on("touchend"+f,function(a){d();if(l||n>1)return;h=!0,a.preventDefault(),clearTimeout(i),i=setTimeout(function(){h=!1},b),e()})})}g.on("click"+f,function(){h||e()})})},a.fn.destroyMfpFastClick=function(){a(this).off("touchstart"+f+" click"+f),c&&r.off("touchmove"+f+" touchend"+f)}}(),A()})