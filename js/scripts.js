var hamburger = document.querySelector(".js-hamburger");
var menuMobile = document.querySelector(".js-main-menu");

if(menuMobile) {
    menuMobile.classList.add("hidden");
    hamburger.addEventListener("click", function (evt) {
        evt.preventDefault();
        hamburger.classList.toggle("open");
        menuMobile.classList.toggle("open");
    });
}

$(document).ready(function() {

    frontend.isMobile = $('body').outerWidth() < 481;
    frontend.isTablet = $('body').outerWidth() < 1201;

    frontend.tabs.init();
    frontend.tinySlider.init();
    frontend.dropdown.init();

    let lazyLoadInstance = new LazyLoad({
        // Your custom settings go here
    });

    $(window).resize(function() {
        frontend.isMobile = $('body').outerWidth() < 481;
        frontend.isTablet = $('body').outerWidth() < 1201;
    });

    // автолоад новостей
    $('#load_news').on('click', function(){
        frontend.loadNews(this);
        if (frontend.params.load_counter >= 3) {
            frontend.params.infinite_load = true;
        }
    });

    $(window).scroll(function(){
        if (
            $('#load_news').length > 0 &&
            $('#load_news').offset().top - $(window).scrollTop() < 1000 &&
            !frontend.params.loading &&
            (frontend.params.load_counter < 3 || frontend.params.infinite_load)
        ) {
            $('#load_news').trigger('click');
            frontend.params.loading = true;
            frontend.params.load_counter++;
        }

        /*подгрузчик детальной новости*/
        /*if (
            $('#news_detail').length > 0 &&
            $('#time_to_load').offset().top - $(window).scrollTop() < 1500 &&
            !frontend.params.loading
        ) {
            frontend.params.loading = true;
            frontend.loadDetail();
        }*/
    });

    //авторизация
    document.querySelector('#login-form').addEventListener('submit', frontend.authorize());
    //регистрация
    document.querySelector('#register-form').addEventListener('submit', frontend.register());
    //восстановление пароля
    document.querySelector('#request-form').addEventListener('submit', frontend.passRequest());

    frontend.HideSticker1();
});

var frontend = new function() {
    var self = this;

    this.params = {
        'bodyContainer': $('body'),
        'loading': false,
        'load_counter': 0,
        'infinite_load': false
    };

    this.tabs = new function() {
        var that = this;

        this.init = function() {
            $('.js-tabs:not(.js-already-init)').each(function() {
                that.build(this);
            });

            $('.js-anchor').click(function(){
                var offset = ss.isMobile ? $(this).data('mobileOffset') : $(this).data('offset'),
                    position = $($(this).data('anchor')).offset().top;
                $(document).scrollTop(position - offset);
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
            if (!$(ul).data('contId') && !$($(ul).data('contSelector')).length) {
                that.buildLinks(ul);
            } else {
                that.buildTabs(ul);
            }

            $(ul).addClass('js-already-init');
        };

        this.buildTabs = function(ul) {
            var tabsCont;
            if ($(ul).data('cont-id')) {
                tabsCont = $('#' + $(ul).data('cont-id'));
            } else {
                tabsCont = $($(ul).data('cont-selector'));
            }

            $(ul).find('li a').click(function() {
                that.changeLinks(ul, this);

                var li = $(this).parents('li');
                var tabContSelector;
                if ($(li).data('tab-id')) {
                    tabContSelector = '>.js-tab-cont#' + $(li).data('tab-id');
                } else if ($(ul).data('tab-selector')) {
                    tabContSelector = '>.js-tab-cont' + $(li).data('tab-selector');
                }

                var tab = $(tabsCont).find(tabContSelector);
                $(tabsCont).find('>.js-tab-cont.js-show').removeClass('js-show').hide();
                $(tab).addClass('js-show').show();
                $.each($(tabsCont).find('>.js-tab-cont'), function() {
                    that.customize.tab(this);
                });

                var tabsCallback = $(ul).data('callback');
                if (tabsCallback && that.callbacks[tabsCallback]) {
                    that.callbacks[tabsCallback](ul);
                }

            });
        };

        this.buildLinks = function(ul) {
            var containers = [];

            $(ul).find('li a').each(function() {
                var anchor = $(this).data('anchor');
                if (anchor && $(anchor).length) {
                    var top = $(anchor).offset().top;
                    var offset = ss.isMobile ? $(this).data('mobileOffset') : $(this).data('offset');
                    if (offset) {
                        top -= parseInt(offset, 10);
                    }
                    containers.push({'top': --top, 'el': $(this)});
                }
            });

            if (containers.length) {
                $(window).scroll(function() {
                    var top = $(this).scrollTop(), need;
                    $.each(containers, function(i, el) {
                        if (top >= el.top) {
                            need = el;
                        }
                    });
                    if (need) {
                        that.changeLinks(ul, need.el);
                    }
                });

                $(window).scroll();
            }
        };

        this.changeLinks = function(ul, a) {
            var li = $(a).parents('li');
            $(ul).find('li.js-active').removeClass('js-active');
            $(li).addClass('js-active');
            $(ul).find('li').each(function() {
                that.customize.li(this);
            });
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
                let slider = this, data = $(this).data,
                    initialWidth = data['initialWidth'], bodyWidth = $('body').outerWidth(), sliderName = data['sliderName'] ? data['sliderName'] : k;
                if (initialWidth) {
                    if (initialWidth >= bodyWidth) {
                        that.build(this, k);
                    }

                    $(window).resize(function() {
                        if (that.timers[sliderName]) {
                            clearTimeout(that.timers[sliderName]);
                            delete that.timers[sliderName];
                        }
                        that.timers[sliderName] = setTimeout(function() {
                            let bodyWidth = $('body').outerWidth();
                            if (initialWidth >= bodyWidth) {
                                that.build(slider, sliderName);
                            } else if (that.sliders[sliderName]) {
                                that.destroy(slider, sliderName);
                            }
                        }, 100);
                    });
                } else {
                    that.build(this, sliderName);
                }
            });
        };

        this.build = function(slider, k) {
            if (!$(slider).hasClass('js-already-init')) {
                let sliderClass = 'js-tiny-slider-' + k,
                    sliderSelector = '.' + sliderClass;
                $(slider).addClass(sliderClass).data('sliderIndex', k);
                let data = $(slider).data();
                let params = {
                    //Контейнеры
                    container        : data['container']         ? data['container']         : sliderSelector, //селектор контейнера для слайдера
                    controlsContainer: data['controlsContainer'] ? data['controlsContainer'] : false, //селектор контейнера для стрелок
                    navContainer     : data['navContainer']      ? data['navContainer']      : false, //селектор контейнера для точек
                    //Стрелки и точки
                    controls       : data['controls']        ? data['controls']              : false, //кнопки
                    prevButton     : data['prevButton']      ? $(data['prevButton']).get(0)  : false, //селектор кнопки пред. слайда
                    nextButton     : data['nextButton']      ? $(data['nextButton']).get(0)  : false, //селектор кнопки след. слайда
                    nav            : data['nav']             ? data['nav']                   : false, //точки [dots]
                    navPosition    : data['navPosition']     ? data['navPosition']           : 'top', //расположение точек [dots]
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
                    responsive: data['responsive'] ? data['responsive'] : false //{breakpoint: {key: value, [...]}}}
                };

                let tnsSlider = tns(params);
                this.sliders[data['sliderName'] ? data['sliderName'] : k] = tnsSlider;
                $(slider).removeClass(sliderClass);

                if ($(slider).data('transitionStart') && that.callbacks[$(slider).data('transitionStart')]) {
                    tnsSlider.events.on('transitionStart', that.callbacks[$(slider).data('transitionStart')]);
                }

                if ($(slider).data('transitionEnd') && that.callbacks[$(slider).data('transitionEnd')]) {
                    tnsSlider.events.on('transitionEnd', that.callbacks[$(slider).data('transitionEnd')]);
                }
                $(slider).removeClass(sliderClass);
                $(slider).addClass('js-already-init');
            }
        };

        this.destroy = function(slider, k) {
            $(slider).removeClass('js-already-init');
            that.sliders[k].destroy();
            delete that.sliders[k];
        };

        this.callbacks = {};
    };

    this.loadNews = function(button) {
        let exclude = $(button).find('#load_exclude').val();
        let type = $(button).find('#load_type').val();
        let rand = Math.floor(Math.random() * 1000);
        let tag = 0;
        if ($(button).find('#load_tag').length > 0) {
            tag = $(button).find('#load_tag').val();
        }

        $(button).addClass('button--load');
        $.post('/local/ajax/load_news.php', {exclude:exclude, type:type, rand:rand, tag:tag}, function(data){
            if (data) {
                $('#news_list_index').append(data);
                let new_exclude = $('#load_' + rand).val();

                $(button).find('#load_exclude').val(new_exclude);
                if (type == 3) {
                    $(button).find('#load_type').val(4);
                } else {
                    $(button).find('#load_type').val(3);
                }
                $(button).removeClass('button--load');
                frontend.params.loading = false;
                let lazyLoadInstanceU = new LazyLoad();
            } else {
                frontend.params.infinite_load = false;
                $(button).hide();
            }
        });
    };

    this.authorize = function(){
        return function(e) {
            e.preventDefault();

            let userField = $('#user-name');
            let passField = $('#user-pass');
            let user = userField.val();
            let pass = passField.val();
            let form = $(this);

            if (user.length < 3) {
                userField.parent().find('.form__help').css('opacity', '1');
                return;
            }

            if (pass.length == 0) {
                passField.parent().find('.form__help').css('opacity', '1');
                return;
            }

            BX.showWait();
            $.post('/local/ajax/auth.php', {user:user, pass:pass, 'type':'auth'}, function(data) {
                let dataJS = JSON.parse(data);
                if (dataJS.result == 'error') {
                    form.find('.form__error').html(dataJS.message).css('opacity', '1');
                    BX.closeWait();
                } else {
                    document.location.reload();
                }
            });
        }
    };

    this.register = function(){
        return function(e) {
            e.preventDefault();

            let userField = $('#user-name-reg');
            let emailField = $('#user-email');
            let passField = $('#user-pass-reg');
            let passRepeatField = $('#user-pass-repeat');
            let user = userField.val();
            let email = emailField.val();
            let pass = passField.val();
            let pass_repeat = passRepeatField.val();
            let form = $(this);
            let check = $('#user-agree').is(':checked');

            if (user.length < 3) {
                userField.parent().find('.form__help').css('opacity', '1');
                return;
            }

            if (pass.length < 8) {
                passField.parent().find('.form__help').css('opacity', '1');
                return;
            }

            if (pass != pass_repeat) {
                passRepeatField.parent().find('.form__help').css('opacity', '1');
                return;
            }

            BX.showWait();
            $.post(
                '/local/ajax/auth.php',
                {user:user, pass:pass, email:email, pass_repeat:pass_repeat, type:'register'},
                function(data) {
                    let dataJS = JSON.parse(data);
                    if (dataJS.result == 'error') {
                        form.find('.form__error').html(dataJS.message).css('opacity', '1');
                        BX.closeWait();
                    } else {
                        pushUpRegistration.classList.toggle("show");
                        message.querySelector('.login__heading').innerHTML = 'Регистрация на сайте';
                        message.querySelector('.login__link-text').innerHTML = 'На ваш почтовый ящик будет отправлено подтверждающее письмо. Перейдите по ссылке из письма для завершения регистрации.';
                        message.classList.toggle("show");
                        BX.closeWait();
                    }
                }
            );
        }
    };

    this.passRequest = function(){
        return function(e) {
            e.preventDefault();

            let userEmail = $('#user-email-request');
            let email = userEmail.val();
            let form = $(this);

            if (email.length == 0) {
                userEmail.parent().find('.form__help').css('opacity', '1');
                return;
            }

            BX.showWait();
            $.post('/local/ajax/auth.php', {email:email, 'type':'request'}, function(data) {
                let dataJS = JSON.parse(data);
                if (dataJS.result == 'error') {
                    form.find('.form__error').html(dataJS.message).css('opacity', '1');
                    BX.closeWait();
                } else {
                    pushUpPassRequest.classList.toggle("show");
                    message.querySelector('.login__heading').innerHTML = 'Восстановление пароля';
                    message.querySelector('.login__link-text').innerHTML = 'Сообщение отправлено на ваш email адрес.';
                    message.classList.toggle("show");
                    BX.closeWait();
                }
            });
        }
    };

    this.dropdown = new function() {
        let that = this;

        this.init = function (selector = '.js-dropdown') {
            $(selector).each(function () {
                that.build(this);
            });
        };

        this.toggleUl = function (title, ul) {
            if ($(title).parent().hasClass('js-open')) {
                $(title).parent().removeClass('js-open');
                $(ul).removeClass('select-item__options--active').hide();
                $('body').off('click');
            } else {
                $(title).parent().addClass('js-open');
                $(ul).addClass('select-item__options--active').show();

                let dropdownId = $(title).parent().attr('id');
                $('body').click(function (event) {
                    event = event || window.event;
                    that.closeDropdowns(event, dropdownId);
                });
            }
        };

        this.closeDropdowns = function (event, dropdownId) {
            let hide = true;
            if ($(event.target).parents('.js-div-dropdown').length) {
                let div = $(event.target).parents('.js-div-dropdown');
                if ($(div).attr('id') == dropdownId) {
                    hide = false;
                }
            }
            if (hide) {
                $('.js-div-dropdown.js-open').each(function () {
                    let title = $(this).find('.js-div-dropdown-title'),
                        ul = $(this).find('.js-div-dropdown-ul');

                    that.toggleUl(title, ul);
                });
            }
        };

        this.change = function (li, loadState = false) {
            let div = $(li).parents('.js-div-dropdown'),
                title = $(div).find('.js-div-dropdown-title'),
                ul = $(div).find('.js-div-dropdown-ul');

            $(ul).find('li.js-active').removeClass('js-active');
            $(li).addClass('js-active');

            if ($(ul).data('customize')) {
                customizeStyle = $(ul).data('customize');
            }

            title = that.customize.title(title, ul);

            if (!loadState) {
                that.toggleUl(title, ul);
            }

            if ($(ul).data('reload') === 'Y' && !loadState) {
                let itemId = $(li).find('a').data('id');
                let itemKey = $(li).find('a').data('key') + '=';

                /* перезагружаем выбранный ИД */
                /* для матчцентра и блогов аякс */
                let ajaxClass = $(ul).data('ajax-class');
                let ajaxDropdown  = $(ul).data('ajax-dropdown') ? $(ul).data('ajax-dropdown') : 'js-dropdown';
                if ($(ul).data('ajax') === 'Y' && ajaxClass) {
                    BX.showWait();
                    $.get(that.parseHref(itemKey, itemId), {}, function(res){
                        let updBlock = $(res).find('.' + ajaxClass).html();
                        $('.' + ajaxClass).html(updBlock);
                        that.init('.' + ajaxDropdown);
                        frontend.tabs.init();
                        BX.closeWait();
                    });
                } else {
                    location.href = that.parseHref(itemKey, itemId);
                }
            }
        };

        this.parseHref = function (key, val) {
            /* парсим урл, заменяем или добавляем значение параметра */
            let urlParams = key + val;
            let href = location.href;
            let paramsPos = href.indexOf('?');
            if (paramsPos < 0) {
                href += '?' + urlParams;
            } else {
                if (href.indexOf(key) > 0) {
                    let arHref = href.split('?');
                    let arQuery = arHref[1].split('&');
                    let newArQuery = arQuery.filter(function(value){
                        if (value.indexOf(key) < 0) {
                            return value;
                        }
                    });

                    if (val != '0') {
                        if (newArQuery.length > 0) {
                            let newQuery = newArQuery.join('&');
                            href = arHref[0] + '?' + newQuery + '&' + urlParams;
                        } else {
                            href = arHref[0] + '?' + urlParams;
                        }
                    } else {
                        if (newArQuery.length > 0) {
                            let newQuery = newArQuery.join('&');
                            href = arHref[0] + '?' + newQuery;
                        } else {
                            href = arHref[0];
                        }
                    }
                } else {
                    if (val != '0') {
                        href += '&' + urlParams;
                    }
                }
            }
            return href;
        };

        this.getId = function (step) {
            if (!step) {
                step = 0;
            }
            let rand = Date.now();
            if ($('#js-div-dropdown-' + rand).length) {
                return that.getId(++step);
            }

            return rand;
        };

        this.getDefaultScroll = function () {
            return {
                'autohidemode': false,
                'cursorwidth': '4px',
                'cursorborder': 'none',
                'cursorborderradius': '3px',
                'zindex': '998',
                'scrollspeed': '0',
                'mousescrollstep': 42,
                'touchbehavior': sam.isMobile,
                'railpadding': {top: 4, right: 2, left: 0, bottom: 4}
            };
        };

        this.customize = {
            div: function (div, ul) {
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
            title: function (title, dropdown) {
                let html = '';
                if ($(dropdown).find('li.js-active').length) {
                    html = $(dropdown).find('li.js-active').html();
                } else {
                    html = $(dropdown).find('li:first-child').html();
                }
                $(title).addClass('dropdown__title');
                if ($(dropdown).data('icon') == 'Y') {
                    let iconPath = $(dropdown).data('icon-path');
                    let iconWidth = $(dropdown).data('icon-width');
                    let iconHeight = $(dropdown).data('icon-height');
                    let iconClass = $(dropdown).data('icon-class');
                    html += '<svg class="' + iconClass + '" width="' + iconWidth + '" height="' + iconHeight + '">\n' +
                        '<use xlink:href="' + iconPath + '"></use>\n' +
                        '</svg>';
                }

                $(title).html(html);
                return $(title);
            },
            ul: function (ul) {
                $(ul).addClass('dropdown__options');
                return ul;
            },
            li: function (li) {
                $(li).addClass('dropdown__option');
                return li;
            },
            a: function (a) {
                $(a).addClass('dropdown__link dropdown__link--dropdown');
            },
            scroll: function () {
                return {
                    'autohidemode': false,
                    'cursorwidth': '4px',
                    'cursorborder': 'none',
                    'cursorborderradius': '3px',
                    'zindex': '998',
                    'scrollspeed': '0',
                    'mousescrollstep': 42,
                    'cursorcolor': 'rgba(42, 42, 42, 1)',
                    'cursoropacitymax': 0.75,
                    'cursoropacitymin': 0.75,
                    'railpadding': {
                        top: 4,
                        right: 2,
                        left: 0,
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

            /* подгружаем текущее состояние селекта в зависимости от параметра в урл */
            $(ul).find('li').each(function() {
                let link = $(this).find('a');
                let key = link.data('key');
                let id = link.data('id');
                let queryStr = key + '=' + id;
                let href = decodeURI(location.href);
                if (href.indexOf(queryStr) > 0 || $(this).data('active') === 'Y') {
                    that.change(this, true);
                }
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
                $('body').append(clone);
                let liHeight = that.getLiHeight($(clone.find('li')[0]), true);
                clone.remove();

                $(ul).css({
                    'maxHeight'   : liHeight * 8 + 16,
                    'paddingRight': '12px'
                });
                $(ul).niceScroll(that.customize.scroll());
            }
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
                    return that.getLiHeight($(el).parent(), false);
                } else {
                    $(el).show().find('.js-calc-height').removeClass('js-calc-height');
                    $(el).hide();
                }
            }

            return height;
        };
    };

    this.share = new function() {
        let share = this;
        this.vkontakte = function(purl, ptitle, pimg, text) {
            url  = 'http://vkontakte.ru/share.php?';
            url += 'url='          + encodeURIComponent(purl);
            url += '&title='       + encodeURIComponent(ptitle);
            url += '&description=' + encodeURIComponent(text);
            url += '&image='       + encodeURIComponent(pimg);
            url += '&noparse=true';
            share.popup(url);
        };
        this.odnoklassniki = function(purl, text, pimg) {
            url  = 'https://connect.ok.ru/offer?';
            url += 'title=' + encodeURIComponent(text);
            url += '&url='  + encodeURIComponent(purl);
            url += '&imageUrl='  + encodeURIComponent(pimg);
            share.popup(url);
        };
        this.facebook = function(purl, ptitle, pimg, text) {
            url  = 'http://www.facebook.com/sharer.php?';
            url += 'title='     + encodeURIComponent(ptitle);
            url += '&summary='   + encodeURIComponent(text);
            url += '&u='       + encodeURIComponent(purl);
            url += '&picture=' + encodeURIComponent(pimg);
            share.popup(url);
        };
        this.twitter = function(purl, ptitle) {
            url  = 'http://twitter.com/share?';
            url += 'text='      + encodeURIComponent(ptitle);
            url += '&url='      + encodeURIComponent(purl);
            url += '&counturl=' + encodeURIComponent(purl);
            share.popup(url);
        };
        this.mailru = function(purl, ptitle, pimg, text) {
            url  = 'http://connect.mail.ru/share?';
            url += 'url='          + encodeURIComponent(purl);
            url += '&title='       + encodeURIComponent(ptitle);
            url += '&description=' + encodeURIComponent(text);
            url += '&imageurl='    + encodeURIComponent(pimg);
            share.popup(url)
        };
        this.me = function(el){
            share.popup(el.href);
            return false;
        };
        this.popup = function(url) {
            window.open(url,'','toolbar=0,status=0,width=626,height=436');
        };
    };

    this.addReaction = function(newsId, type, button) {
        let curReactions = $(button).find('.activity__count').text() ? parseInt($(button).find('.activity__count').text()) : 0;

        $.post(
            '/local/ajax/reaction.php',
            {"newsId": newsId, "reaction_type": type},
            function (data) {
                let jsData = JSON.parse(data);
                if (jsData.result == 'success') {
                    $(button).find('.activity__count').text(curReactions + 1);
                } else {
                    $(button).find('.activity__count').append('<span class="activity__message">' + jsData.message + '</span>');
                    setTimeout(function(){
                        $(button).find('.activity__message').remove();
                    },2000);
                }
            }
        );
    };

    this.loadDetail = function() {
        let tag = $('#detail_tag').val();
        let itemCode = $('#detail_code').val();
        $.post('/local/ajax/load_news_detail.php', {itemCode:itemCode, tag:tag}, function(data){
            if (data) {
                let loadedCode = $(data).find('#detail_code').val();
                let newsContent = $(data).find('#news_detail').html();
                $('#detail_code').val(loadedCode);
                $('#news_detail').append(newsContent);
                frontend.params.loading = false;
            }
        });
    };

    this.HideSticker = function() {
        self.ElementHideById2('GiftLayer');
    };

    this.HideSticker1 = function() {
        self.ElementHideById2('GiftLayer');
        setTimeout(self.ShowSticker1, 10000);
    };

    this.ShowSticker1 = function() {
        self.ElementShowById2('GiftLayer');
        setTimeout(self.HideSticker, 5000);
    };

    this.ElementHideById2 = function(iden) {
        document.getElementById(iden).style.display = "none";
    };

    this.ElementShowById2 = function(iden) {
        document.getElementById(iden).style.display = "block";
    };

};