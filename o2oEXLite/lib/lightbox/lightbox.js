(function() {
    var $ = jQuery;
    var LightboxOptions = (function() {
        function LightboxOptions() {
            this.fadeDuration = 500;
            this.fitImagesInViewport = true;
            this.resizeDuration = 700;
            this.positionFromTop = 50;
            this.showImageNumberLabel = true;
            this.alwaysShowNavOnTouchDevices = false;
            this.wrapAround = false;
        }
        LightboxOptions.prototype.albumLabel = function(curImageNum, albumSize) {
            return ("全" + albumSize + "件中、" + curImageNum + "件目");
        };
        return LightboxOptions;
    })();
    var Lightbox = (function() {
        function Lightbox(options) {
            this.options = options;
            this.album = [];
            this.currentImageIndex = void 0;
            this.init();
        }
        Lightbox.prototype.init = function() {
            this.enable();
            this.build();
        };
        Lightbox.prototype.enable = function() {
            var self = this;
            $('body').on('click', 'a[rel^=lightbox], area[rel^=lightbox], a[data-lightbox], area[data-lightbox]', function(event) {
                self.start($(event.currentTarget));
                return false;
            });
        };
        Lightbox.prototype.build = function() {
            var self = this;
            $("<div id='lightboxOverlay' class='lightboxOverlay'></div>" + "<div id='lightbox' class='lightbox'>" + "<div class='lb-outerContainer'>" + "<div class='lb-container'>" + "<img class='lb-image' src='' />" + "<div class='lb-nav'><a class='lb-prev' href='' ></a><a class='lb-next' href='' ></a></div>" + "<div class='lb-loader'><a class='lb-cancel'></a></div>" + "</div>" + "</div>" + "<div class='lb-dataContainer'>" + "<div class='lb-data'>" + "<div class='lb-details'>" + "<span class='lb-caption'></span>" + "<span class='lb-number'></span>" + "<span style='clear: left;display: block;' class='lb-save'></span>" + "<span class='lb-korabo'></span>" + "</div>" + "<div class='lb-closeContainer'><a class='lb-close'></a></div>" + "</div>" + "</div>" + "</div>").appendTo($('body'));
            this.$lightbox = $('#lightbox');
            this.$overlay = $('#lightboxOverlay');
            this.$outerContainer = this.$lightbox.find('.lb-outerContainer');
            this.$container = this.$lightbox.find('.lb-container');
            this.containerTopPadding = parseInt(this.$container.css('padding-top'), 10);
            this.containerRightPadding = parseInt(this.$container.css('padding-right'), 10);
            this.containerBottomPadding = parseInt(this.$container.css('padding-bottom'), 10);
            this.containerLeftPadding = parseInt(this.$container.css('padding-left'), 10);
            this.$overlay.hide().on('click', function() {
                self.end();
                return false;
            });
            this.$lightbox.hide().on('click', function(event) {
                if ($(event.target).attr('id') === 'lightbox') {
                    self.end();
                }
                return false;
            });
            this.$outerContainer.on('click', function(event) {
                if ($(event.target).attr('id') === 'lightbox') {
                    self.end();
                }
                return false;
            });
            this.$lightbox.find('.lb-prev').on('click', function() {
                if (self.currentImageIndex === 0) {
                    self.changeImage(self.album.length - 1);
                } else {
                    self.changeImage(self.currentImageIndex - 1);
                }
                return false;
            });
            this.$lightbox.find('.lb-next').on('click', function() {
                if (self.currentImageIndex === self.album.length - 1) {
                    self.changeImage(0);
                } else {
                    self.changeImage(self.currentImageIndex + 1);
                }
                return false;
            });
            this.$lightbox.find('.lb-loader, .lb-close').on('click', function() {
                self.end();
                return false;
            });
        };
        Lightbox.prototype.start = function($link) {
            var self = this;
            var $window = $(window);
            $window.on('resize', $.proxy(this.sizeOverlay, this));
            $('select, object, embed').css({visibility: "hidden"});
            this.sizeOverlay();
            this.album = [];
            var imageNumber = 0;
            function addToAlbum($link) {
                self.album.push({pid: ($link.attr('pid') ? $link.attr('pid') : ""),link: $link.attr('href'),title: $link.attr('data-title') || $link.attr('title'),resnum: $link.attr('resnum')});
            }
            var dataLightboxValue = $link.attr('data-lightbox');
            var $links;
            if (dataLightboxValue) {
                $links = $($link.prop("tagName") + '[data-lightbox="' + dataLightboxValue + '"]');
                for (var i = 0; i < $links.length; i = ++i) {
                    addToAlbum($($links[i]));
                    if ($links[i] === $link[0]) {
                        imageNumber = i;
                    }
                }
            } else {
                if ($link.attr('rel') === 'lightbox') {
                    addToAlbum($link);
                } else {
                    $links = $($link.prop("tagName") + '[rel="' + $link.attr('rel') + '"]');
                    for (var j = 0; j < $links.length; j = ++j) {
                        addToAlbum($($links[j]));
                        if ($links[j] === $link[0]) {
                            imageNumber = j;
                        }
                    }
                }
            }
            var top = $window.scrollTop() + this.options.positionFromTop;
            var left = $window.scrollLeft();
            this.$lightbox.css({top: top + 'px',left: left + 'px'}).fadeIn(this.options.fadeDuration);
            this.changeImage(imageNumber);
        };
        Lightbox.prototype.changeImage = function(imageNumber) {
            var self = this;
            this.disableKeyboardNav();
            var $image = this.$lightbox.find('.lb-image');
            this.$overlay.fadeIn(this.options.fadeDuration);
            $('.lb-loader').fadeIn('slow');
            this.$lightbox.find('.lb-image, .lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption').hide();
            this.$outerContainer.addClass('animating');
            var preloader = new Image();
            preloader.onload = function() {
                var $preloader, imageHeight, imageWidth, maxImageHeight, maxImageWidth, windowHeight, windowWidth;
                $image.attr('src', self.album[imageNumber].link);
                $preloader = $(preloader);
                self.$lightbox.preloader = preloader;
                $image.width(preloader.width);
                $image.height(preloader.height);
                if (self.options.fitImagesInViewport) {
                    windowWidth = $(window).width();
                    windowHeight = $(window).height();
                    maxImageWidth = windowWidth - self.containerLeftPadding - self.containerRightPadding - 20;
                    maxImageHeight = windowHeight - self.containerTopPadding - self.containerBottomPadding - 120;
                    if ((preloader.width > maxImageWidth) || (preloader.height > maxImageHeight)) {
                        if ((preloader.width / maxImageWidth) > (preloader.height / maxImageHeight)) {
                            imageWidth = maxImageWidth;
                            imageHeight = parseInt(preloader.height / (preloader.width / imageWidth), 10);
                            $image.width(imageWidth);
                            $image.height(imageHeight);
                        } else {
                            imageHeight = maxImageHeight;
                            imageWidth = parseInt(preloader.width / (preloader.height / imageHeight), 10);
                            $image.width(imageWidth);
                            $image.height(imageHeight);
                        }
                    }
                }
                self.sizeContainer($image.width(), $image.height());
            };
            preloader.src = this.album[imageNumber].link;
            this.currentImageIndex = imageNumber;
        };
        Lightbox.prototype.sizeOverlay = function() {
            this.$overlay.width($(window).width()).height($(document).height());
        };
        Lightbox.prototype.sizeContainer = function(imageWidth, imageHeight) {
            var self = this;
            var oldWidth = this.$outerContainer.outerWidth();
            var oldHeight = this.$outerContainer.outerHeight();
            var newWidth = imageWidth + this.containerLeftPadding + this.containerRightPadding;
            var newHeight = imageHeight + this.containerTopPadding + this.containerBottomPadding;
            function postResize() {
                self.$lightbox.find('.lb-dataContainer').width(newWidth);
                self.$lightbox.find('.lb-prevLink').height(newHeight);
                self.$lightbox.find('.lb-nextLink').height(newHeight);
                self.showImage();
            }
            if (oldWidth !== newWidth || oldHeight !== newHeight) {
                this.$outerContainer.animate({width: newWidth,height: newHeight}, this.options.resizeDuration, 'swing', function() {
                    postResize();
                });
            } else {
                postResize();
            }
        };
        Lightbox.prototype.showImage = function() {
            this.$lightbox.find('.lb-loader').hide();
            this.$lightbox.find('.lb-image').fadeIn('slow');
            this.updateNav();
            this.updateDetails();
            this.preloadNeighboringImages();
            this.enableKeyboardNav();
        };
        Lightbox.prototype.updateNav = function() {
            var alwaysShowNav = false;
            try {
                document.createEvent("TouchEvent");
                alwaysShowNav = (this.options.alwaysShowNavOnTouchDevices) ? true : false;
            } catch (e) {
            }
            this.$lightbox.find('.lb-nav').show();
            if (this.album.length > 1) {
                if (this.options.wrapAround) {
                    if (alwaysShowNav) {
                        this.$lightbox.find('.lb-prev, .lb-next').css('opacity', '1');
                    }
                    this.$lightbox.find('.lb-prev, .lb-next').show();
                } else {
                    if (this.currentImageIndex > 0) {
                        this.$lightbox.find('.lb-prev').show();
                        if (alwaysShowNav) {
                            this.$lightbox.find('.lb-prev').css('opacity', '1');
                        }
                    }
                    if (this.currentImageIndex < this.album.length - 1) {
                        this.$lightbox.find('.lb-next').show();
                        if (alwaysShowNav) {
                            this.$lightbox.find('.lb-next').css('opacity', '1');
                        }
                    }
                }
            }
        };
        Lightbox.prototype.updateDetails = function() {
            var self = this;
            if (typeof this.album[this.currentImageIndex].title !== 'undefined' && this.album[this.currentImageIndex].title !== "") {
                this.$lightbox.find('.lb-caption').html(this.album[this.currentImageIndex].title).fadeIn('fast').find('a').on('click', function(event) {
                    location.href = $(this).attr('href');
                });
            }
            if (typeof this.album[this.currentImageIndex].resnum !== 'undefined' && this.album[this.currentImageIndex].resnum !== "") {
                var resnum = this.album[this.currentImageIndex].resnum;
                this.$lightbox.find('.lb-caption').html("<u class=lb-ank resnum=" + resnum + " href=#>" + "&gt;&gt;" + resnum + "</u>").css("cursor", "pointer").fadeIn('fast').on('click', function(event) {
                    event.preventDefault();
                    self.$lightbox.find('.lb-close').trigger("click");
                    location.href = "#" + $(event.currentTarget).find("u").attr("resnum");
                });
            }
            var is_clome = (window.navigator.userAgent.toLowerCase().indexOf('chrome') != -1) ? 1 : 0;
            var url = this.$lightbox.find('.lb-image').attr("src");
            var pid = this.album[this.currentImageIndex].pid || "''";
            this.$lightbox.find('.lb-save').html((is_clome ? "<a download class='lb-save-link' href=" + url + "><font size=2 color=white>保存</font></a>　" : "") + "<a pid=" + pid + " class='lb-korabo-link' href=" + url + "><font size=2 color=white>お絵かきコラボ</font></a>　" + "<a class='lb-open-link' href=" + url + "><font size=2 color=white>別窓表示</font></a>");
            this.$lightbox.find('.lb-save-link').on('click', function(event) {
                var url = $(this).attr("href");
                var a = document.createElement('a');
                a.href = url;
                if (window.navigator.userAgent.toLowerCase().indexOf('chrome') != -1) {
                    a.setAttribute('download', 'noname');
                    a.dispatchEvent(new CustomEvent('click'));
                } else {
                    window.open($(this).attr("href"), "_blank");
                }
                return true;
            });
            this.$lightbox.find('.lb-open-link').on('click', function(event) {
                window.open($(this).attr("href"), "_blank");
                return true;
            });
            this.$lightbox.find('.lb-korabo-link').on('click', function(event) {
                if ($(this).attr("href").match(/imgur/)) {
                    image_url = $(this).attr("href").replace("http://imgur.com", "/ajax/load_imgur?url=http://i.imgur.com");
                } else {
                    image_url = $(this).attr("href").replace("http://open2ch.net", "");
                    $("#parent_pid").val($(this).attr("pid"));
                }
                if ($("#oekakiMode").is(':checked')) {
                    $('body').scrollTo('#sketch', {}, function() {
                        set_imgur_to_oekaki(image_url);
                    });
                } else {
                    $('body').scrollTo('#oekakiCanvas', {}, function() {
                        $("#oekakiMode").attr("checked", "true");
                        $("#oekakiCanvas").show();
                        set_imgur_to_oekaki(image_url);
                    });
                }
                if ($(this).attr("href").match(/open2ch.net/)) {
                    var preimg = self.$lightbox.preloader;
										var size = preimg.width + "x" + preimg.height;
										var result = false;
										$('#canvasSize').children().each(function() {
											if($(this).val() == size) result = true;
										});
										if(result) $("#canvasSize").val(size).trigger("change");
                }
                self.$lightbox.find('.lb-close').trigger("click");
            });
            if (this.album.length > 1 && this.options.showImageNumberLabel) {
                this.$lightbox.find('.lb-number').text(this.options.albumLabel(this.currentImageIndex + 1, this.album.length)).fadeIn('fast');
            } else {
                this.$lightbox.find('.lb-number').hide();
            }
            this.$outerContainer.removeClass('animating');
            this.$lightbox.find('.lb-dataContainer').fadeIn(this.options.resizeDuration, function() {
                return self.sizeOverlay();
            });
        };
        Lightbox.prototype.preloadNeighboringImages = function() {
            if (this.album.length > this.currentImageIndex + 1) {
                var preloadNext = new Image();
                preloadNext.src = this.album[this.currentImageIndex + 1].link;
            }
            if (this.currentImageIndex > 0) {
                var preloadPrev = new Image();
                preloadPrev.src = this.album[this.currentImageIndex - 1].link;
            }
        };
        Lightbox.prototype.enableKeyboardNav = function() {
            $(document).on('keyup.keyboard', $.proxy(this.keyboardAction, this));
        };
        Lightbox.prototype.disableKeyboardNav = function() {
            $(document).off('.keyboard');
        };
        Lightbox.prototype.keyboardAction = function(event) {
            var KEYCODE_ESC = 27;
            var KEYCODE_LEFTARROW = 37;
            var KEYCODE_RIGHTARROW = 39;
            var keycode = event.keyCode;
            var key = String.fromCharCode(keycode).toLowerCase();
            if (keycode === KEYCODE_ESC || key.match(/x|o|c/)) {
                this.end();
            } else if (key === 'p' || keycode === KEYCODE_LEFTARROW) {
                if (this.currentImageIndex !== 0) {
                    this.changeImage(this.currentImageIndex - 1);
                } else if (this.options.wrapAround && this.album.length > 1) {
                    this.changeImage(this.album.length - 1);
                }
            } else if (key === 'n' || keycode === KEYCODE_RIGHTARROW) {
                if (this.currentImageIndex !== this.album.length - 1) {
                    this.changeImage(this.currentImageIndex + 1);
                } else if (this.options.wrapAround && this.album.length > 1) {
                    this.changeImage(0);
                }
            }
        };
        Lightbox.prototype.end = function() {
            this.disableKeyboardNav();
            $(window).off("resize", this.sizeOverlay);
            this.$lightbox.fadeOut(this.options.fadeDuration);
            this.$overlay.fadeOut(this.options.fadeDuration);
            $('select, object, embed').css({visibility: "visible"});
        };
        return Lightbox;
    })();
    $(function() {
        var options = new LightboxOptions();
        var lightbox = new Lightbox(options);
    });
}).call(this);
/*
function set_imgur_to_oekaki(url) {
    var img = new Image();
    var ctx = $("#sketch").get(0).getContext('2d');
    $(img).attr('src', url);
    img.onload = function() {
        fitImage(ctx, img);
        $('#sketch').sketch().setBaseImageURL($("#sketch").get(0).toDataURL());
        isOekakiDone = 1;
    };
}
*/