// ==UserScript==
// @name         lavender*
// @version      10.0
// @description  hkgalden utilities script
// @include      http://*hkgalden.com/*
// @run-at       document-end
// @namespace    lavender*
// @copyright    ignite
// ==/UserScript==
(function(W, D, G, $) {
    'use strict';
    $ = W.$;
    $.fn.findAtDepth = function(selector, maxDepth) {
        var depths = [], i;
        if (maxDepth > 0) {
            for (i = 1; i <= maxDepth; i++) depths.push('> ' + new Array(i).join('* > ') + selector);
            selector = depths.join(', ');
        }
        return this.find(selector);
    };
    if (!G.GM_getValue || (G.GM_getValue.toString && G.GM_getValue.toString().indexOf("not supported") > -1)) {
        G.GM_getValue = function(key, def) {return localStorage[key] || def;};
        G.GM_setValue = function(key, value) {return localStorage[key] = value;};
        G.GM_deleteValue = function(key) {return delete localStorage[key];};
    }
    var CHKBX_OPTS = ['nextPageHideAuthor', 'lessQuote', 'clickToShowPics', 'adBlock', 'hidePanel', 'forceBlock'],
        CHKBX_OPTS_TITLE = {
            nextPageHideAuthor: '只在第一頁顯示 #0',
            lessQuote: '限制Quote數量',
            clickToShowPics: '不自動載入圖片',
            adBlock: '移除廣告',
            hidePanel: '隱藏GalSound及Polymer',
            forceBlock: '隱藏已封鎖會員'
        },
        CFG = {}, API = {}, _exec;
    /* Checkboxes */
    for (var i = 0, l = CHKBX_OPTS.length; i < l; i++) CFG[CHKBX_OPTS[i]] = !!+G.GM_getValue(CHKBX_OPTS[i], '0');
    /* API object */
    API.isLoggedIn = $('#gb .actp a[href="/my"]').length;
    // topics
    _exec = /\/[A-Za-z]{2}\/(\d+)/.exec(location.href);
    API.topics = {};
    API.topics.is = location.href.indexOf('topics/') > 0;
    API.topics.page = API.topics.is ? _exec ? +_exec[1] : 1 : 0;
    // view
    _exec = /\/page\/(\d+)/.exec(location.href);
    API.view = {};
    API.view.is = location.href.indexOf('view/') > 0;
    API.view.page = API.view.is ? _exec ? +_exec[1] : 1 : 0;
    API.view.author = API.view.is ? $('.gpt.author .dtl>.unm>.name').text() : null;
    W.API = API;
    // insert config panel
    var panel = $('<a/>', {
        href: '#',
        text: 'lavender*',
    }).on('click', function(e) {
        e.preventDefault();
        $('body').append('<div id="unity--panel" style="background:rgba(0,0,0,.5);height:100%;left:0;position:fixed;top:0;width:100%;z-index:999999">\
<div style="display:table;height:100%;width:100%">\
<div style="display:table-cell;height:100%;vertical-align: middle;width:100%">\
<div id="unity--config"></div>\
</div>\
</div>\
</div>').css({
            overflow: 'hidden'
        });
        var chkbxes = '<table class="nxtb" style="background:#ddd;width:540px">';
        for (var i = 0, l = CHKBX_OPTS.length; i < l; i++) {
            chkbxes += '<tr><td>' + CHKBX_OPTS_TITLE[CHKBX_OPTS[i]] + '</td><td><input id="' + CHKBX_OPTS[i] + '" type="checkbox"' + (CFG[CHKBX_OPTS[i]] ? ' checked' : '') + '></td>';
        }
        chkbxes += '</table>';
        $('#unity--config').append([
            $('<h2 style="background:#b9e;border-radius:50%;cursor:pointer;font-weight:700;line-height:64px;margin:0;position:absolute;right:24px;top:24px;width:64px;">×</h2>').on('click', function() {
                $(D).off('.unity');
                $('#unity--panel').remove();
                $('body').css({
                    overflow: 'auto'
                });
            }),
            chkbxes,
            '<br>',
            $('<button style="background:#edf;border-radius:50%;height:64px;margin:32px 0;width:64px">確認</button>').on('click', function() {
                location.reload();
                alert('已存');
            })
        ]);
        $(D).on('change.unity', '#unity--config :checkbox', function() {
            G.GM_setValue(this.getAttribute('id'), +this.checked+'');
        });
    });
    panel.insertBefore('#gb .actp :first-child');
    // mod
    var mAdBlock = function() {
            if (!CFG.adBlock) return;
            $('.adContainer,#ad1,#ad2,#adcontainer2').remove();
            if (API.topics.is) $('#cse-search-box').nextAll().add('#tpli script~tr:not([class])').remove();
            if (API.view.is) $('.gpt>.r .ad').prev('hr').andSelf().add('.gpt>.r .aderfly-ad').remove();
        },
        mHideQuotes,
        mHidePics,
        mForceBlock = function(){
            if (!CFG.forceBlock) return;
            if (API.topics.is) $('#tpli tr.blked').remove();
            if (API.view.is) $('#main .gpt.blked').remove();
        };
    mAdBlock();
    mForceBlock();
    if (API.topics.is) {
        if (CFG.hidePanel) $('.panel.col-md-4').remove();
    }
    if (API.view.is) {
        if (CFG.nextPageHideAuthor && API.view.page > 1) {
            var ctn = $('.gpt.author>.r>.ctn');
            ctn.hide().after($('<div class="ctn"><a href="#" style="color:#499">按此顯示 #0</a></div>').on('click', function(e) {
                e.preventDefault();
                $(this).remove() && ctn.show();
            }));
        }
        mHideQuotes = function() {
            if (!CFG.lessQuote) return;
            $.each($('.gpt>.r>.ctn'), function(i, e) {
                var d = $(e).findAtDepth('blockquote:not(.united)', 3),
                    b;
                if (d.length === 3) {
                    b = $(d[2]);
                    b.hide().addClass('united');
                    $('<blockquote class="united" style="background:#cea;color:#000;cursor:pointer;display:inline-block;margin-bottom:24px">顯示更多引用回覆</blockquote>').on('click', function() {
                        b.show();
                        $(this).remove();
                    }).insertAfter(b);
                }
            });
        };
        mHidePics = function() {
            if (!CFG.clickToShowPics) return;
            $('body').css({
                overflow: 'hidden'
            });
            $.each($('.gpt>.r>.ctn img[data-original]'), function(i, e) {
                var i = $('<img alt src="' + this.getAttribute('data-original') + '" style="display:none">');
                i.on('load', function() {
                    if (i[0].width > 72 && i[0].height > 72) {
                        i.parent().after($('<div class="ico" style="cursor:pointer;display:inline-block;font-size:48px;height:48px;line-height:48px;text-align:center;width:48px;"></div>').on('click', function(e) {
                            $(this).remove() && i.show();
                        }));
                    } else i.show();
                });
                $(this).replaceWith(i);
            });
            $('body').css({
                overflow: 'auto'
            });
        };
        mHideQuotes();
        mHidePics();
        $(D).on('DOMNodeInserted', '#main>article', function(e) {
            if (e.target.className.indexOf('replies') > 0) {
                mAdBlock();
                mForceBlock();
                mHideQuotes();
                mHidePics();
            }
        });
    }
})(unsafeWindow, document, this);