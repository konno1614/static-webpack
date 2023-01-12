import '../scss/style.scss';

import $ from 'jquery';
import './lib/sample';
import './lib/spNav';

$(function() {
    console.log('Script!');

    $('body').hide();
    $(window).on('load', function() {
        $('body').fadeIn(500);
    });
});

window.onload = function () {
    console.log('Script after!');
};
