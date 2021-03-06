EPT.Game = function(game) {};
EPT.Game.prototype = {
	create: function() {	

		

		this. _ballRate = 100;
		this. _ballTime = 0;
		this._score = 0;


		this.physics.startSystem(Phaser.Physics.ARCADE);
	    this.physics.arcade.checkCollision.down = false;

	    this.stage.backgroundColor = '#d5d4d6';
this.colors = ['#0000FF', '#008000', '#808080', '#FFA500', '#800080', '#FF0000'];
	    this.balls = this.add.group();
	    this.balls.enableBody = true;
	    this.balls.physicsBodyType = Phaser.Physics.ARCADE;

	    this.bricks = this.add.group();
	    this.bricks.enableBody = true;
	    this.bricks.physicsBodyType = Phaser.Physics.ARCADE;


	    for (var i = 0; i < 24; i++) {
        for (var j = 0; j < 10; j++) {
                var color = this.rnd.integerInRange(0, 30);
                var health = this.rnd.integerInRange(0, 5);
                if (color < 6) {
                    var br = this.bricks.create(i*40, j*40, 'bricks');
                    br.frame = color*6+health;
br.color = this.colors[color];
                    br.body.bounce.set(1);
                    br.body.immovable = true;
                    br.health = health +1;
                }

        }
    }

    for (var i = 0; i < 15; i++)
    {
        var b = this.balls.create(0, 0, 'balls');
        b.name = 'ball' + i;
        b.anchor.set(0.5);
        b.exists = false;
        b.visible = false;
        b.frame = this.rnd.integerInRange(0, 5);
        b.checkWorldBounds = true;
        this.physics.enable(b, Phaser.Physics.ARCADE);
        b.body.collideWorldBounds = true;
        b.body.bounce.set(1);
        b.events.onOutOfBounds.add(this.resetBall, this);
    }
    this.arrow = this.add.sprite(480, 620, 'arrow');
    this.arrow.anchor.set(0.5);
    this.physics.enable(this.arrow, Phaser.Physics.ARCADE);
    this.arrow.body.allowRotation = false;
this.initUI();
    this.camera.resetFX();
	this.camera.flash(0x000000, 500, false);
	},
	initUI: function() {

		var fontScore = { font: "32px Arial", fill: "#000" };

		var fontScoreWhite = { font: "32px Arial", fill: "#FFF" };

		this.textScore = this.add.text(30, this.world.height-20, 'Score: '+this._score, fontScore);

		this.textScore.anchor.set(0,1);
},
	update: function() {
		this.arrow.rotation = this.physics.arcade.angleToPointer(this.arrow);
        if (this.input.activePointer.isDown){
            this.fireBall();
        }
        this.physics.arcade.collide(this.balls, this.bricks, this.ballHitBrick, null, this);
	},
	
	
	
	fireBall: function() {

        if (this.time.now > this._ballTime){
            var ball = this.balls.getFirstExists(false);
            if (ball){
                ball.reset(this.arrow.x, this.arrow.y);
                ball.frame = this.rnd.integerInRange(0, 5);
                this._ballTime = this.time.now + this._ballRate;
                this.physics.arcade.moveToPointer(ball, 300);
            }
        }
    },

    resetBall: function(ball) {

        ball.kill();
    },

    ballHitBrick: function(_ball, _brick) {

        _brick.damage(1);
        _brick.frame = _brick.frame - 1;
this._score += 10;

		this.textScore.setText('Score: '+this._score);


var randX = _brick.x;

		var randY = _brick.y;

		var pointsAdded = this.add.text(randX, randY, '+10',

			{ font: "40px Arial", fill: _brick.color, stroke: "#FFF", strokeThickness: 10 });

		pointsAdded.anchor.set(0.5, 0.5);

		this.add.tween(pointsAdded).to({ alpha: 0, y: randY-50 }, 1000, Phaser.Easing.Linear.None, true);



        this.camera.shake(0.01, 100, true, Phaser.Camera.SHAKE_BOTH, true);
    }
};
