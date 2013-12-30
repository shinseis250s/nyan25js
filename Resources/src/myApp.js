/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var nextNumber;
var gametime;

var MyLayer = cc.Layer.extend({
    ctor:function() {
        this._super();
        cc.associateWithNative(this, cc.Layer);
    },
    init:function() {
        this._super();
        // 変数初期化
        nextNumber = 1;
        gametime = 0.0;
        //タップイベントを取得する
        this.setTouchEnabled(true);
        this.setTouchMode(cc.TOUCH_ONE_BY_ONE);
        // 1～25のカードを配置する
        this.makeCards();
        // ゲーム時間を表示する
        this.showGametimeLabel();
        // ゲーム時間をカウントアップする関数を毎フレーム呼び出す
        this.schedule(this.measureGametime);
        // リトライボタンを作成する
        this.makeRetryButton();
        // ハイスコアを表示する
        this.showHighScoreLabel();
        return true;
    },
    // 1～25のカードを配置する
    makeCards:function() {
        // 数値配列を初期化する
        var numbers = new Array(25);
        for (var i = 1; i <= numbers.length; i++) {
            numbers[i - 1] = i;
        }
        for (var x = 0; x < 5; x++) {
            for (var y = 0; y < 5; y++) {
                // ランダムに1つの値を取得する
                var index = Math.floor(Math.random() * numbers.length);
                var number = numbers[index];
                // カードを生成する
                var fileName = "res/frontside" + number + ".png";
                var pCard = cc.Sprite.create(fileName);
                var cardSize = pCard.getTextureRect();
                pCard.setPosition(cc.p((x + 0.5) * 128 + 160, (y + 0.5) * 128));
                pCard.setTag(number);
                this.addChild(pCard, 0);
                // 数値配列から値を削除する
                numbers.splice(index, 1);
            }
        }
    },
    // タップが開始されたときの処理
    onTouchBegan:function(touch, event) {
        return true;
    },
    // タップが終了したときの処理
    onTouchEnded:function(touch, event) {
        // タップポイントを取得する
        var pos = touch.getLocation();
        var pCard = this.getChildByTag(nextNumber);
        if (!pCard) {
            return;
        }
        var cardRect = pCard.getBoundingBox();
        if (cc.rectContainsPoint(cardRect, pos)) {
            // 裏カードを作成する
            var pNewCard = cc.Sprite.create("res/backside.png");
            pNewCard.setPosition(pCard.getPosition());
            this.addChild(pNewCard);
            // 表カードを削除する
            pCard.removeFromParent(true);
            if (nextNumber >= 25) {
                // ゲーム時間の計測を停止する
                this.unschedule(this.measureGametime);
                // ハイスコアを表示する
                this.showHighScoreLabel();
                return;
            }
            nextNumber++;
        }
    },
    // ゲーム時間をカウントアップする
    measureGametime:function(dt) {
        gametime += dt;
        // ゲーム時間を表示する
        this.showGametimeLabel();
    },
    // ゲーム時間を作成する
    showGametimeLabel:function() {
        // ゲーム時間ラベル用タグ
        var tagGametimeLabel = 100;
        // ゲーム時間を文字列に変換する
        var timeString = gametime.toFixed(1) + "s";
        // ゲーム時間ラベルを取得する
        var timerLabel = this.getChildByTag(tagGametimeLabel);
        if (timerLabel) {
            // ゲーム時間を更新する
            timerLabel.setString(timeString);
        } else {
            // 画面サイズを取得する
            var winSize = cc.Director.getInstance().getWinSize();
            // ゲーム時間ラベルを生成する
            timerLabel = cc.LabelTTF.create(timeString, "Arial", 24);
            timerLabel.setPosition(cc.p(winSize.width * 0.9, winSize.height * 0.9));
            timerLabel.setTag(tagGametimeLabel);
            this.addChild(timerLabel);
        }
    },
    // リトライボタンを作成する
    makeRetryButton:function() {
        // 画面サイズを取得する
        var winSize = cc.Director.getInstance().getWinSize();
        var retryLabel = cc.LabelTTF.create("Retry", "Arial", 24.0);
        var retryItem = cc.MenuItemLabel.create(retryLabel, this.tapRetryButton, this);
        retryItem.setPosition(cc.p(winSize.width * 0.9, winSize.height * 0.2));
        var menu = cc.Menu.create(retryItem);
        menu.setPosition(cc.p(0, 0));
        this.addChild(menu);
    },
    // リトライボタンタップ時の処理
    tapRetryButton:function() {
        // ゲームのシーンを新しく用意する
        var myScene = new MyScene();
        cc.Director.getInstance().replaceScene(myScene);
    },
    // ハイスコアラベルの表示
    showHighScoreLabel:function() {
        // localStorageを取得する
        var ls = sys.localStorage;
        // ハイスコアのキーを取得する
        var highScoreKey = "highscore";
        // 以前のハイスコアを取得する
        var highScoreValue = ls.getItem(highScoreKey);
        var highScore;
        if (highScoreValue === "") {
            highScore = 99.9;
        } else {
            highScore = parseFloat(highScoreValue);
        }
        if (gametime !== 0) {
            if (gametime > highScore) {
                // ハイスコアが更新されていない場合は処理を抜ける
                return;
            } else {
                // ハイスコアを更新する
                highScore = gametime;
                // ハイスコアを記録する
                ls.setItem(highScoreKey, highScore);
            }
        }
        // ハイスコアラベル用タグ
        var tagHighScoreLabel = 200;
        // ハイスコアを表示する文字列を生成する
        var highScoreString = highScore.toFixed(1) + "s";
        // ハイスコアラベルを取得する
        var highScoreLabel = this.getChildByTag(tagHighScoreLabel);
        if (highScoreLabel) {
            // ハイスコアラベルを更新する
            highScoreLabel.setString(highScoreString);
        } else {
            // 画面サイズを取得する
            var winSize = cc.Director.getInstance().getWinSize();
            // ハイスコアラベルを生成する
            highScoreLabel = cc.LabelTTF.create(highScoreString, "Arial", 24);
            highScoreLabel.setPosition(cc.p(winSize.width * 0.9, winSize.height * 0.7));
            highScoreLabel.setTag(tagHighScoreLabel);
            this.addChild(highScoreLabel);
        }
    }
});

var MyScene = cc.Scene.extend({
    ctor:function() {
        this._super();
        cc.associateWithNative(this, cc.Scene);
    },
    onEnter:function() {
        this._super();
        var layer = new MyLayer();
        this.addChild(layer);
        layer.init();
    }
});
