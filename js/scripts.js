var hamburger = document.querySelector(".js-hamburger");
var menuMobile = document.querySelector(".js-main-menu");

if(menuMobile) {
    menuMobile.classList.add("hidden");
    hamburger.addEventListener("click", function (evt) {
        evt.preventDefault();
        hamburger.classList.toggle("open");
        menuMobile.classList.toggle("open");
    });
}{
    var self = this;

    this.body = $('body');
    $(window).resize(function() {
        self.isMobile = self.body.outerWidth() < 481;
        self.isTablet = self.body.outerWidth() < 1201;
    });

    self.init = function() {
        self.tabs.init();
        self.tinySlider.init();
        self.dropdown.init();
        self.share.init();
        self.promo.init();
        self.searchButton.init();
        self.includeMore.init();
    };

    this.params = {
        'bodyContainer': $('body')
    };

    this.hamburger = new function() {
        let that = this;

        this.init = function() {
            var hamburger = $('.js-hamburger'),
                menuMobile = $('.js-main-menu'),
                menuBody = $('.body');

            $(hamburger).click(function() {
                $(menuMobile).addClass('hidden');
                $(hamburger).toggleClass('open');
                $(menuMobile).toggleClass('open');
                $(menuBody).toggleClass('open');
            });
        }
    };

    this.tabs = new function() {
        let that = this;

        this.init = function() {
            $('.js-tabs:not(.js-already-init)').each(function() {
                that.build(this);
            });
        };

        this.customize = {
            li: function(li) {
                if ($(li).hasClass('js-active')) {
                    $(li).addClass('tabs__item--active');
                } else {
                    $(li).removeClass('tabs__item--active');
                }
            },
            tab: function(tab) {
                if ($(tab).hasClass('js-show')) {
                    $(tab).addClass('tabs__pane--active');
                } else {
                    $(tab).removeClass('tabs__pane--active');
                }
            }
        };

        this.build = function(ul) {
            if (!$(ul).data('cont-id') && !$($(ul).data('cont-selector'))) {
                return false;
            }

            let tabsCont;
            if ($(ul).data('cont-id')) {
                tabsCont = $('#' + $(ul).data('cont-id'));
            } else {
                tabsCont = $($(ul).data('cont-selector'));
            }

            $(ul).find('li a').click(function() {
                let li = $(this).parents('li');
                $(ul).find('li.js-active').removeClass('js-active');
                $(li).addClass('js-active');
                $(ul).find('li').each(function() {
                    that.customize.li(this);
                });

                let tabContSelector;

                if ($(li).data('tab-id')) {
                    tabContSelector = '>.js-tab-cont#' + $(li).data('tab-id');
                } else if ($(ul).data('tab-selector')) {
                    tabContSelector = '>.js-tab-cont' + $(li).data('tab-selector');
                }

                let tab = $(tabsCont).find(tabContSelector);
                $(tabsCont).find('>.js-tab-cont.js-show').removeClass('js-show').hide();
                $(tab).addClass('js-show').show();
                $.each($(tabsCont).find('>.js-tab-cont'), function() {
                    that.customize.tab(this);
                });

                let tabsCallback = $(ul).data('callback');
                if (tabsCallback && that.callbacks[tabsCallback]) {
                    that.callbacks[tabsCallback](ul);
                }

            });

            $(ul).addClass('js-already-init');
        };

        this.destroy = function(ul) {
            $(ul).find('li a').off('click');
        };

        this.callbacks = {};
    };

    this.tinySlider = new function() {
        let that = this;

        this.sliders = {};

        this.timers = {};

        this.init = function() {
            $('.js-tiny-slider').each(function(k) {
                asfl.tinySlider.build(this, k);
            });
        };

        this.build = function(slider, k) {
            var sliderClass = 'js-tiny-slider-' + k,
                sliderSelector = '.' + sliderClass;
            $(slider).addClass(sliderClass);

            var data = $(slider).data();
            var params = {
                //Контейнеры
                container        : data['container']         ? data['container']         : sliderSelector, //селектор контейнера для слайдера
                controlsContainer: data['controlsContainer'] ? data['controlsContainer'] : false, //селектор контейнера для стрелок
                navContainer     : data['navContainer']      ? data['navContainer']      : false, //селектор контейнера для точек

                //Стрелки и точки
                controls  : data['controls']   ? data['controls']   : false, //кнопки
                prevButton: data['prevButton'] ? data['prevButton'] : false, //кнопка пред. слайда
                nextButton: data['nextButton'] ? data['nextButton'] : false, //кнопка след. слайда
                nav       : data['nav']        ? data['nav']        : false, //точки [dots]
                navAsThumbnails: data['navAsThumbnails'] ? data['navAsThumbnails']       : false, //навигация в виде мини-картинок

                //Основные параметры
                mode      : data['mode']       ? data['mode']        : 'carousel',
                items     : data['items']      ? data['items']      : 1,            //количество видимых элементов слайдов
                slideBy   : data['slideBy']    ? data['slideBy']    : 1,            //на сколько слайдов сдвигать
                startIndex: data['startIndex'] ? data['startIndex'] : false,        //начальный слайд
                autoWidth : data['autoWidth']  ? data['autoWidth']  : false,        //автоматическое определение ширины слайда
                autoHeight: data['autoHeight'] ? data['autoHeight'] : false,        //автоматическое определение высоты слайда,
                fixedWidth: data['fixedWidth'] ? data['fixedWidth'] : false,        //фиксированная ширина слайда
                loop      : data['loop']       ? data['loop']       : false,        //бесконечность прокрутки
                speed     : data['speed']      ? data['speed']      : 300,          //скорость прокрутки
                lazyload  : data['lazyload']   ? data['lazyload']   : false,        //ленивая загрузка
                axis      : data['axis']       ? data['axis']       : 'horizontal', //['horizontal', 'vertical'] горизонтальная/вертикальная прокрутка
                mouseDrag : data['mouseDrag']  ? data['mouseDrag']  : false,        //перелистывание мышкой или свайпом
                gutter    : data['gutter']     ? data['gutter']     : 0,            //расстояние между слайдами, в px
                center    : data['center']     ? data['center']     : false,        //центрирование активного слайда

                //Автопрокрутка
                autoplay            : data['autoplay']             ? data['autoplay']             : false,     //автопрокрутка
                autoplayButtonOutput: data['autoplayButtonOutput'] ? data['autoplayButtonOutput'] : false,     //кнопки для автопрокрутки
                autoplayTimeout     : data['autoplayTimeout']      ? data['autoplayTimeout']      : 5000,      //задержка прокрутки
                autoplayDirection   : data['autoplayDirection']    ? data['autoplayDirection']    : 'forward', //['forward', 'backward'] направленность прокрутки
                autoplayText        : data['autoplayText']         ? data['autoplayText']         : false,     //['start', 'stop'] //текст кнопок прокрутки
                autoplayHoverPause  : data['autoplayHoverPause']   ? data['autoplayHoverPause']   : false,     //остановка при наведении мыши

                //Респонсив
                responsive: data['responsive'] ? data['responsive'] : false //{breakpoint: {key: value, [...]}}
            };

            //Колбек загрузки
            if (data['onInit'] && asfl.tinySlider.callbacks.initSlider) {
                params.onInit = asfl.tinySlider.callbacks.initSlider;
            }

            var entity = tns(params);
            $(slider).removeClass(sliderClass);

            if (data['callback']) {
                var callbacks = data['callback'];

                if (callbacks['transitionStart'] && asfl.tinySlider.callbacks[callbacks['transitionStart']]) {
                    entity.events.on('transitionStart', function() {
                        asfl.tinySlider.callbacks[callbacks['transitionStart']](entity);
                    });
                }
                if (callbacks['transitionEnd'] && asfl.tinySlider.callbacks[callbacks['transitionEnd']]) {
                    asfl.tinySlider.callbacks[callbacks['transitionEnd']](entity);
                    entity.events.on('transitionEnd', function() {
                        asfl.tinySlider.callbacks[callbacks['transitionEnd']](entity);
                    });
                }
            }
        };

        this.callbacks = {};
    };

    this.dropdown = new function() {
        let that = this;

        this.init = function() {
            $('.js-dropdown').each(function() {
                that.build(this);
            });
        };

        this.toggleUl = function(title, ul) {
            if ($(title).parent().hasClass('js-open')) {
                $(title).parent().removeClass('js-open');
                $(ul).removeClass('select-item__options--active').hide();

                self.body.off('click');
            } else {
                $(title).parent().addClass('js-open');
                $(ul).addClass('select-item__options--active').show();

                let dropdownId = $(title).parent().attr('id');
                self.body.click(function(event) {
                    event = event || window.event;
                    that.closeDropdowns(event, dropdownId);
                });
            }
        };

        this.closeDropdowns = function(event, dropdownId) {
            let hide = true;
            if ($(event.target).parents('.js-div-dropdown').length) {
                let div = $(event.target).parents('.js-div-dropdown');
                if ($(div).attr('id') == dropdownId) {
                    hide = false;
                }
            }
            if (hide) {
                $('.js-div-dropdown.js-open').each(function() {
                    let title = $(this).find('.js-div-dropdown-title'),
                        ul = $(this).find('.js-div-dropdown-ul');

                    that.toggleUl(title, ul);
                });
            }
        };

        this.change = function(li) {
            let div = $(li).parents('.js-div-dropdown'),
                title = $(div).find('.js-div-dropdown-title'),
                ul = $(div).find('.js-div-dropdown-ul');

            $(ul).find('li.js-active').removeClass('js-active');
            $(li).addClass('js-active');

            if ($(ul).data('customize')) {
                customizeStyle = $(ul).data('customize');
            }

            title = that.customize.title(title, ul);
            that.toggleUl(title, ul);
        };

        this.getId = function(step) {
            if (!step) {
                step = 0;
            }
            let rand = Date.now();
            if ($('#js-div-dropdown-' + rand).length) {
                return that.getId(++step);
            }

            return rand;
        };

        this.getDefaultScroll = function() {
            return {
                'autohidemode'      : false,
                'cursorwidth'       : '4px',
                'cursorborder'      : 'none',
                'cursorborderradius': '3px',
                'zindex'            : '998',
                'scrollspeed'       : '0',
                'mousescrollstep'   : 42,
                'touchbehavior'     : sam.isMobile,
                'railpadding'       : {top: 4, right: 2, left: 0, bottom: 4}
            };
        };

        this.customize = {
            div: function(div, ul) {
                $(div).addClass('dropdown');
                if ($(ul).data('width')) {
                    $(div).css('width', $(ul).data('width'));
                }
                if ($(ul).data('red')) {
                    div.addClass('dropdown--red');
                }
                if ($(ul).data('transparent')) {
                    div.addClass('dropdown--transparent');
                }
                if ($(ul).data('disabled')) {
                    div.addClass('dropdown--disabled');
                }
                return div;
            },
            title: function(title, dropdown) {
                let html = '';
                if ($(dropdown).find('li.js-active').length) {
                    html = $(dropdown).find('li.js-active').html();
                } else {
                    html = $(dropdown).find('li:first-child').html();
                }
                $(title).addClass('dropdown__title');
                $(title).html(html);
                return $(title);
            },
            ul: function(ul) {
                $(ul).addClass('dropdown__options');
                return ul;
            },
            li: function(li) {
                $(li).addClass('dropdown__option');
                return li;
            },
            a: function(a) {
                $(a).addClass('dropdown__link dropdown__link--dropdown');
            },
            scroll: function() {
                return {
                    'autohidemode'      : false,
                    'cursorwidth'       : '4px',
                    'cursorborder'      : 'none',
                    'cursorborderradius': '3px',
                    'zindex'            : '998',
                    'scrollspeed'       : '0',
                    'mousescrollstep'   : 42,
                    'cursorcolor'       : 'rgba(42, 42, 42, 1)',
                    'cursoropacitymax'  : 0.75,
                    'cursoropacitymin'  : 0.75,
                    'railpadding'       : {
                        top   : 4,
                        right : 2,
                        left  : 0,
                        bottom: 4
                    },
                };
            }
        };

        this.build = function(dropdown) {
            let id = that.getId(),
                div = $('<div>', {'id': 'js-div-dropdown-' + id, 'class': 'js-div-dropdown'}),
                title = $('<div>', {'class': 'js-div-dropdown-title'}),
                ul = $(dropdown).clone();

            $(ul).addClass('js-div-dropdown-ul');

            that.customize.title(title, ul);
            that.customize.ul(ul);
            $(ul).find('li').each(function() {
                that.customize.li(this);
                that.customize.a($(this).find('a'));
                $(this).click(function() {
                    that.change(this);
                });
            });

            that.customize.title(title, ul);
            that.customize.div(div, dropdown);

            $(div).append(title, ul);
            $(dropdown).replaceWith(div);

            if (!ul.data('disabled')) {
                $(title).click(function() {
                    that.toggleUl(this, ul);
                });
            }

            if ($(ul).find('li').length > 8) {
                let clone = $(ul).clone().css({
                    'position': 'static',
                    'top'     : -999999,
                    'left'    : -999999
                });
                self.body.append(clone);
                let liHeight = that.getLiHeight($(clone.find('li')[0]), true);
                clone.remove();

                $(ul).css({
                    'maxHeight'   : liHeight * 8 + 16,
                    'paddingRight': '12px'
                });
                $(ul).niceScroll(that.customize.scroll());
            }

            $(ul).parents('.js-dropdown-cont').addClass('js-already-init')
        };

        this.getLiHeight = function(el, isLi) {
            let height;
            if (isLi) {
                height = $(el).outerHeight();
                if (height === 0) {
                    $(el).addClass('js-calc-height');
                    return that.getLiHeight($(el).parent(), false);
                }
            } else {
                height = $(el).show().find('.js-calc-height').outerHeight();
                if (height === 0) {
                    return getLiHeight($(el).parent(), false);
                } else {
                    $(el).show().find('.js-calc-height').removeClass('js-calc-height');
                    $(el).hide();
                }
            }

            return height;
        };
    };

    this.share = new function() {
        let that = this;

        let shareText = $('.js-share-text'),
            shareButtons = $('.js-share-icons');

        this.init = function() {
            if (!$(shareText).hasClass('js-already-init')) {
                $(shareText).addClass('js-already-init');
                $(shareText).click(function() {
                    $(shareText).toggleClass('open');
                    $(shareButtons).toggleClass('open');
                });
            }
        };
    };

    this.promo = new function() {
        let that = this;
        let codeButton = $('.js-code-button');
        let code = $('.js-code');

        this.init = function() {
            code.addClass('hidden');
            $(codeButton).click(function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                $(code).toggleClass('show');
                $(codeButton).toggleClass('show');
                $(code).find('input').toggleClass('required');
            });
        };

    };

    this.searchButton = new function() {
        let searchButton = $('.js-search-button');
        let search = $('.js-search');
        let allCloser = $('.js-closer');

        this.init = function() {
            search.addClass('hidden');
            $(searchButton).click(function() {
                $(search).toggleClass('show');
                $('.js-blocks-search-result').hide();
            });

            $(allCloser).click(function() {
                $(this).closest('.js-search').toggleClass('show');
            });
        };

    };

    this.includeMore = new function() {

        var hideMore = $('.js-hide-more');
        var includes = $('.js-includes');

        this.init = function() {

            includes.addClass('hidden');
            $(hideMore).click(function(evt) {
                evt.preventDefault();
                $(hideMore).toggleClass('open');
                $(includes).toggleClass('open');
            });
        };
    };
};