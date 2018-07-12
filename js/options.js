$(function(){
    /*$('#myTabs a').click(function (e) {
        e.preventDefault()
        $(this).tab('show');
    });*/

    var defaultData = {
        SecretId: '',
        SecretKey: '',
        Bucket: '',
        Region: ''
    };

    chrome.storage.sync.get(defaultData, function(items) {
        for (var i in items) {
            document.getElementById(i).value = items[i];
        }
    });

    $('#option').on('submit', function(){
        var data = {
                SecretId: $('#SecretId').val(),
                SecretKey: $('#SecretKey').val(),
                Bucket: $('#Bucket').val(),
                Region: $('#Region').val()
            },
            inputs = $("input").filter(function() {
                return this.value.length !== 0;
            });

        if (inputs.length!=4) {
            tips.error('请填写完整信息');
        } else {
            chrome.storage.sync.set(data, function() {
                tips.success('保存成功！');
            });
        }

        return false;
    })
});

/**
 * 提示框
 * window.tips
 *
 * @author Lis <z@lisz.vip>
 */

(function ($) {
    "use strict";

    function success(message, url, time) {
        show('success', message, url, time);
    }

    function error(message, url, time) {
        show('danger', message, url, time);
    }

    function show(type, message, url, time) {
        var shopTips = $('#showTips'),
            url = url || false,
            time = time || 3000,
            div, tip;
        if (shopTips.length < 1) {
            $('body').append('<div id="showTips"></div>');
            shopTips = $('#showTips');
        }
        div = '<div class="alert alert-' + type + ' alert-dismissible" role="alert" style="margin-top:-30px;">';
        div += '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span>';
        div += '<span class="sr-only">Close</span></button>';
        div += message;
        div += '</div>';
        shopTips.css('left', Math.ceil(($(window).width() - 600) / 2));
        tip = $(div);
        shopTips.append(tip);
        // tip.slideDown();
        tip.show().animate({'margin-top': '0'}, 'fast');
        setTimeout(function () {
            tip.animate({'margin-top': -tip.outerHeight()}, 'fast', 'swing', function () {
                tip.remove();
                if (url !== false)
                    window.location.href = url;
            });
        }, time);
    }

    function confirm(str) {
        return window.confirm(str);
    }

    window.tips = {
        success: success,
        error: error,
        show: show,
        confirm: confirm
    };
})(jQuery);