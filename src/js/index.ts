import "../scss/style.scss";
import $ from 'jquery'

$(function() {
    console.log("Script");

    $('h1').css('background', 'green')
})

// 完全読み込み後に実行する処理
window.onload = function() {
    console.log("Script after");
}
