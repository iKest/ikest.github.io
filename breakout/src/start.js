var game = new Phaser.Game(960, 640, Phaser.AUTO);
var states = {
	'Boot': EPT.Boot,
	'Preloader': EPT.Preloader,
	'Game': EPT.Game
};
for(var state in states)
	game.state.add(state, states[state]);
game.state.start('Boot');