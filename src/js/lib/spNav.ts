import $ from "jquery";

$(function() {
    $('.js-toggleNav').on('click', function () {
        $(this).toggleClass('navOpen');
        $('.o-spNav').toggleClass('navOpen');
        $('.o-spNavBg').toggleClass('navOpen');
        $('body').toggleClass('navOpen');
    });
    $('.o-spNav__item a').on('click', function () {
        $('.js-toggleNav').removeClass('navOpen');
        $('.o-spNav').removeClass('navOpen');
        $('.o-spNavBg').removeClass('navOpen');
        $('body').removeClass('navOpen');
    });
    $('.o-spNavBg').on('click', function () {
        $(this).removeClass('navOpen');
        $('.js-toggleNav').removeClass('navOpen');
        $('.o-spNav').removeClass('navOpen');
        $('body').removeClass('navOpen');
    });
    // リサイズされたらクラス削除
    $(window).on('resize', function() {
        $('.js-toggleNav').removeClass('navOpen');
        $('.o-spNav').removeClass('navOpen');
        $('.o-spNavBg').removeClass('navOpen');
        $('body').removeClass('navOpen');
    });
});
