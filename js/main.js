/*
tut: http://www.emanueleferonato.com/2014/11/21/html5-phaser-tutorial-how-to-create-a-level-selection-screen-with-locked-levels-and-stars/
Selector de niveles
HTML5 Game + Phaser.io
Feb'15
*/

// carga objeto Phaser
var game = new Phaser.Game(320, 480, Phaser.AUTO, 'phaser-game', 'game');
// iniciamos los estados al final de este archivo.

//  The Google WebFont Loader will look for this object, so create it before loading the script.
WebFontConfig = {

    google: {
      families: ['Dosis', 'Sigmar One', 'Handlee']
    }

};

// GameObject es el objeto principal:
var GameObject = {};

/*
	Boot:
*/
GameObject.Boot = function(game){

	// el LANG tira de jQuery para coger el lang del browser:
	GameObject.LANG = ( $('html').attr('lang') == 'es' ) ? 'es' : 'en' ;

	GameObject.GAME_PATH = "";

};

GameObject.Boot.prototype = {
	init: function() {


		this.input.maxPointers = 1;
		this.stage.disableVisibilityChange = true;

		if (this.game.device.desktop) {
			// scale.scaleMode pone los controles para escalar, las opciones son: EXACT_FIT (100% escala alto y ancho), NO_SCALE (sin escalar) and SHOW_ALL (escala asegurándose q se muestra todo y se preserva el radio)
			this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
			// alinea horizontal y vertical por lo que siempre se alinea el canvas en la pantalla (una especia de margin: 0 auto)
			this.scale.forceOrientation(true); //forceOrientation(forceLandscape, forcePortrait)
			this.scale.pageAlignHorizontally = true;
			this.scale.pageAlignVertically = true;
			this.scale.setScreenSize(true); // scale.setScreenSize(true) activa el escalado
		} else {
			this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
			//this.scale.setMinMax(480, 260, 871, 635);
			this.scale.pageAlignHorizontally = true;
			this.scale.pageAlignVertically = true;
			this.scale.forceOrientation(false, true);
			this.scale.setResizeCallback(this.forceExactFit, this);
			this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
			this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
		}



	},
	preload: function() {

		game.load.image('preloaderbar', GameObject.GAME_PATH + 'assets/images/loading-bar.png');

	},
	create: function() {

		game.state.start('Preloader');

	},
	gameResized: function (width, height) {
		// This could be handy if you need to do any extra processing if the game resizes.
		// A resize could happen if for example swapping orientation on a device or resizing the browser window.
		// Note that this callback is only really useful if you use a ScaleMode of RESIZE and place it inside your main game state.
		var h = window.innerHeight;
		var w = window.innerWidth;
		/*
		w1/h1 = w2/h2
		formula alto conocido: w2 = (w1*h2) / h1
		*/
		var calculateWidth = (game.width * h) / game.height;
		game.scale.setMinMax(calculateWidth,  h, calculateWidth, h);

	},
	forceExactFit: function (width, height) {

		var h = window.innerHeight;
		var w = window.innerWidth;
		game.scale.setMinMax(w,  h, w, h);

	},
	enterIncorrectOrientation: function () {

		GameObject.orientated = false;
		document.getElementById('incorrect-orientation').style.display = 'block';

	},
	leaveIncorrectOrientation: function () {

		GameObject.orientated = true;
		document.getElementById('incorrect-orientation').style.display = 'none';

	}

};

/*
	Preloader
*/

GameObject.Preloader = function(game) {};

GameObject.Preloader.prototype = {
	preload: function() {

		// barra de carga: loading...
		this.preloadBar = this.add.sprite( game.width/2, game.height/2, 'preloaderbar' );
		this.preloadBar.anchor.setTo(0.5, 0.5);
		this.load.setPreloadSprite(this.preloadBar);

		game.load.spritesheet('levels', GameObject.GAME_PATH + 'assets/images/levels.png', 64, 64);
		game.load.spritesheet('level-arrows', GameObject.GAME_PATH + 'assets/images/level_arrows.png', 48, 48);


	},
	create: function() {

		game.state.start('Menu');

	}
};

/*
	Menu
*/

GameObject.Menu = function(game) {

	// number of thumbnail rows
	this.thumbRows = 5;
	// number of thumbnail cololumns
	this.thumbCols = 4;
	// width of a thumbnail, in pixels
	this.thumbWidth = 64;
	// height of a thumbnail, in pixels
	this.thumbHeight = 64;
	// space among thumbnails, in pixels
	this.thumbSpacing = 8;
	/*
		array with finished levels and stars collected.
		0 = playable yet unfinished level
		1, 2, 3 = level finished with 1, 2, 3 stars
		4 = locked
	*/
	this.starsArray = [1,2,1,2,3,3,3,2,2,1,3,1,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4];
	/*
		how pages are needed to show all levels?
		CAUTION!! EACH PAGE SHOULD HAVE THE SAME AMOUNT OF LEVELS, THAT IS
		THE NUMBER OF LEVELS *MUST* BE DIVISIBLE BY THUMBCOLS*THUMBROWS
	*/
	GameObject.pages = this.starsArray.length / (this.thumbRows * this.thumbCols);
	// group where to place all level thumbnails
	GameObject.levelThumbsGroup;
	// current page
	GameObject.currentPage = 0;
	// arrows to navigate through pages
	GameObject.leftArrow;
	GameObject.rightArrow;

};

GameObject.Menu.prototype = {
	create: function() {

		// placing left and right arrow buttons, will call arrowClicked function when clicked
		GameObject.leftArrow = game.add.button(50,420,"level-arrows", this.arrowClicked);
		GameObject.leftArrow.anchor.setTo(0.5);
		GameObject.leftArrow.frame = 0;
		GameObject.leftArrow.alpha = 0.3;

		GameObject.rightArrow = game.add.button(270,420,"level-arrows", this.arrowClicked);
		GameObject.rightArrow.anchor.setTo(0.5);
		GameObject.rightArrow.frame = 1;

		// creation of the thumbails group
		GameObject.levelThumbsGroup = game.add.group();

		// determining level thumbnails width and height for each page
		var levelLength = this.thumbWidth * this.thumbCols + this.thumbSpacing * (this.thumbCols-1);
		var levelHeight = this.thumbWidth * this.thumbRows + this.thumbSpacing * (this.thumbRows-1);

		// looping through each page
		for(var l = 0; l < GameObject.pages; l++){
			// horizontal offset to have level thumbnails horizontally centered in the page
			var offsetX = (game.width-levelLength)/2+game.width*l;
			// I am not interested in having level thumbnails vertically centered in the page, but
			// if you are, simple replace my "20" with
			// (game.height-levelHeight)/2
			var offsetY = 20;
			// looping through each level thumbnails
			for(var i = 0; i < this.thumbRows; i ++) {
				for(var j = 0; j < this.thumbCols; j ++){
					// which level does the thumbnail refer?
					var levelNumber = i * this.thumbCols + j + l * (this.thumbRows * this.thumbCols);
					// adding the thumbnail, as a button which will call thumbClicked function if clicked
					var levelThumb = game.add.button(offsetX + j * (this.thumbWidth + this.thumbSpacing), offsetY+i*(this.thumbHeight + this.thumbSpacing), "levels", this.thumbClicked, this);
					// shwoing proper frame
					levelThumb.frame = this.starsArray[levelNumber];
					// custom attribute
					levelThumb.levelNumber = levelNumber+1;
					// adding the level thumb to the group
					GameObject.levelThumbsGroup.add(levelThumb);
					// if the level is playable, also write level number
					if(this.starsArray[levelNumber]<4){
						var style = {
							font: "18px Arial",
							fill: "#ffffff"
						};
						var levelText = game.add.text(levelThumb.x+5,levelThumb.y+5,levelNumber+1,style);
						levelText.setShadow(2, 2, 'rgba(0,0,0,0.5)', 1);
						GameObject.levelThumbsGroup.add(levelText);
					}
				}
			}
		}

	},
	thumbClicked: function(button) {

		// the level is playable, then play the level!!
		if(button.frame < 4){
			alert("playing level " + button.levelNumber);
		}
		// else, let's shake the locked levels
		else {
			var buttonTween = game.add.tween(button)
			buttonTween.to({
				x: button.x + this.thumbWidth/15
			}, 20, Phaser.Easing.Cubic.None);
			buttonTween.to({
				x: button.x - this.thumbWidth/15
			}, 20, Phaser.Easing.Cubic.None);
			buttonTween.to({
				x: button.x + this.thumbWidth/15
			}, 20, Phaser.Easing.Cubic.None);
			buttonTween.to({
				x: button.x - this.thumbWidth/15
			}, 20, Phaser.Easing.Cubic.None);
			buttonTween.to({
				x: button.x
			}, 20, Phaser.Easing.Cubic.None);
			buttonTween.start();
		}

	},
	arrowClicked: function(button) {

		// touching right arrow and still not reached last page
		if(button.frame==1 && GameObject.currentPage<GameObject.pages-1){
			GameObject.leftArrow.alpha = 1;
			GameObject.currentPage++;
			// fade out the button if we reached last page
			if(GameObject.currentPage == GameObject.pages-1){
				button.alpha = 0.3;
			}
			// scrolling level GameObject.pages
			var buttonsTween = game.add.tween(GameObject.levelThumbsGroup);
			buttonsTween.to({
				x: GameObject.currentPage * game.width * -1
			}, 500, Phaser.Easing.Cubic.None);
			buttonsTween.start();
		}
		// touching left arrow and still not reached first page
		if(button.frame==0 && GameObject.currentPage>0){
			GameObject.rightArrow.alpha = 1;
			GameObject.currentPage--;
			// fade out the button if we reached first page
			if(GameObject.currentPage == 0){
				button.alpha = 0.3;
			}
			// scrolling level GameObject.pages
			var buttonsTween = game.add.tween(GameObject.levelThumbsGroup);
			buttonsTween.to({
				x: GameObject.currentPage * game.width * -1
			}, 400, Phaser.Easing.Cubic.None);
			buttonsTween.start();
		}

	}


};

/*
	iniciamos los estados:
*/
game.state.add('Boot', GameObject.Boot);
game.state.add('Preloader', GameObject.Preloader);
game.state.add('Menu', GameObject.Menu);

game.state.start('Boot');

