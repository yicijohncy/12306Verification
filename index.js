/*global $, FileReader, alert, confirm, window*/
$(document).ready(function () {
    "use strict";

    function getQueryString(name) { 
        var reg = new RegExp("(^|&)"+name+"=([^&]*)(&|$)");
        var result = window.location.search.substr(1).match(reg);
        return result?decodeURIComponent(result[2]):null;
    }

    if (getQueryString('nickname')) {
        var nickname = getQueryString('nickname');
        $("#nickname").html(nickname);
    } else {
        var nickname = "我";
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
            window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx131b06b8cdbe4111&redirect_uri=http://sandbox-api.soundtooth.cn/game/redirect.php?game_id=7&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
        }
    }

    (function () {
        var imageAssets = [
            "assets/icon-choose.png",
            "assets/result-false.jpg",
            "assets/result-true.jpg",
            "assets/bg-map.jpg",
            "assets/ticket.png",
            "assets/tickets.png"
        ];
        // prefetch image assets  
        for (var i = 0; i < imageAssets.length; i++) {  
           new Image().src = imageAssets[i];
        }
    }());

    var dataArr = [];
    var fakeData = [
        {
            id: 1,
            question: "点击下图中所有的南方的冬天",
            correct: [1, 2]
        },
        {
            id: 2,
            question: "点击下图中所有的右手",
            correct: [4]
        }
    ];
    var resultArr = [
        ["全国50%的购票者都这水平", "你现在启程走回家过年也许还来得及", 50],
        ["击败全国50%的购票者", "真羡慕印度人可以坐在火车顶上", 50],
        ["击败全国60%的购票者", "买好小板凳，坐过道的春节才完整", 60],
        ["击败全国70%的购票者", "抢到了一张硬座你就知足了吧", 70],
        ["击败全国80%的购票者", "恭喜!这脑力已经可以抢到卧铺啦", 80],
        ["击败全国99%的购票者", "快去做黄牛党造福全国人民吧！", 99]
    ]; 
    var currentItem = {
        id: 1,
        question: "点击下图中所有的南方的冬天",
        correct: [1, 2]
    };
    var currentPoint = 0;
    var currentStage = 0;
    var totalCount = 5;

    (function () {
        var n = getQueryString('nickname');
        var p = getQueryString('lastp');
        if (n !== null && p !== null) {
            $("#nickname").html(n);
            $("#correct-count").html(p);
            $("div.result .subtitle").html(resultArr[p][0]);
            $("div.result .desc").html(resultArr[p][1]);
            if (p == (resultArr.length - 1)) {
                $("div.result .ticket").addClass('tickets');
            }
        }
    }());

    function loadQuestion(num) {
        currentItem = dataArr[num];
        $("div.question .title").html(currentItem.question);
        $("div.question .selections").html("");
        for (var i = 1; i <= 8; i++) {
            $("div.question .selections").append(
                '<span>' +
                '    <img class="item-img" src="http://7xp1cu.com2.z0.glb.qiniucdn.com/' + currentItem.id + '/' + i + '.jpg?imageView2/1/w/170/h/170' +'">' +
                '    <em></em>' +
                '</span>'
            );
        }
    }

    (function () {
        $.ajax({
            url: './questions.json',
            type: 'GET',
            dataType: 'text',
            success: function (data) {
                var tempArr = JSON.parse(data);
                for (var i = 0; i < 5; i += 1) {
                    if (tempArr.length) {
                        var arrIndex = Math.floor(Math.random() * tempArr.length);
                        dataArr.push(tempArr[arrIndex]);
                        tempArr.splice(arrIndex, 1);
                        loadQuestion(0);
                    }
                }
                console.log(dataArr);
            }
        });
    }());


    // 点击验证码
    $(".content").on("tap", ".item-img", function (e) {
        // console.log(e);
        $(this).parent().find("em").toggleClass("show");
    });

    // 提交
    $(".content").on("tap", "#submit-button", function () {
        var selected = [];
        var correct = true;
        $(".item-img").each(function(index, el) {
            if ($(this).parent().find("em").eq(0).hasClass('show')) {
                selected.push(index + 1); // start from 1
            }
        });
        console.log(selected);
        console.log(currentItem.correct)
        if (!selected.length) {
            alert("请选择!");
            return;
        }
        for (var i = selected.length - 1; i >= 0; i--) {
            if (currentItem.correct.indexOf(selected[i]) === -1) {
                correct = false;
            }
        };
        if (correct) {
            for (var i = currentItem.correct.length - 1; i >= 0; i--) {
                if (selected.indexOf(currentItem.correct[i]) === -1) {
                    correct = false;
                }
            };
        }
        currentStage++;
        $(".content").hide();
        if (correct) {
            currentPoint++;
            $(".trans-right").show();
        } else {
            $(".trans-wrong").show();
        }

        if (currentStage === totalCount) {
            // 游戏结束
            setTimeout(function () {
                $(".trans").hide();
                $("#correct-count").html(currentPoint);
                $("div.result .subtitle").html(resultArr[currentPoint][0]);
                $("div.result .desc").html(resultArr[currentPoint][1]);
                if (currentPoint === (resultArr.length - 1)) {
                    $("div.result .ticket").addClass('tickets');
                }
                $(".content").hide();
                $("div.result").show();
                // 显示广告
                $("div.result .title").addClass('ticket-in-end');
                $("div.result .desc").addClass('desc-in-end');
                $(".ticket, footer").hide();
                $("#adv").show();

            }, 500);
            wx.ready(function(){
                wx.onMenuShareTimeline({
                    title: nickname + '击败全国' + resultArr[currentPoint][2] + '%的购票者，快来挑战逆天验证码！',
                    link: 'fenxiao.soundtooth.cn/html5/12306/res.html?lastp=' + currentPoint + '&nickname=' + nickname,
                    imgUrl: 'http://7xp1cu.com2.z0.glb.qiniucdn.com/tickets.png' // 分享图标
                });
                wx.onMenuShareAppMessage({
                    title: nickname + '击败全国' + resultArr[currentPoint][2] + '%的购票者，快来挑战逆天验证码！',
                    link: 'fenxiao.soundtooth.cn/html5/12306/res.html?lastp=' + currentPoint + '&nickname=' + nickname,
                    desc: '以前抢票靠网速, 现在抢票靠智商! 擦亮双眼来战吧骚年!!', 
                    imgUrl: 'http://7xp1cu.com2.z0.glb.qiniucdn.com/tickets.png'
                });
            });
        } else {
            loadQuestion(currentStage);
            setTimeout(function () {
                $(".content").show();
                $(".trans").hide();
            }, 500);
        }
    });

    // 分享
    $("#share-button").on("tap", function () {
        $(".share-layer").show();
    });

    // 玩
    $("#play-button").on("tap", function () {
        window.location.replace('https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx131b06b8cdbe4111&redirect_uri=http://sandbox-api.soundtooth.cn/game/redirect.php?game_id=7&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect');
    });

    // 重玩
    $("#replay-button").on("tap", function () {
        window.location.reload();
    });

    $(".share-layer").on("tap", function () {
        $(this).hide();
    });
});








