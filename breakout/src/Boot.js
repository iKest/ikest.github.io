
var EPT = {};
EPT.Boot = function(game){};
EPT.Boot.prototype = {
	preload: function(){
		this.stage.backgroundColor = '#DECCCC';
		this.load.image('loading-background', 'img/loading-background.png');
		this.load.image('loading-progress', 'img/loading-progress.png');
	},
	create: function(){
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		this.state.start('Preloader');
	}
};