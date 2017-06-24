	
	//initialise elements
	window.onload = function() {
		canv = document.getElementById('canv');
		ctx = canv.getContext('2d');
		init();
		document.addEventListener("keydown",keyDown);
		document.addEventListener("keyup", keyUp);
	}
	
	function init() {
		game.init();
		game.start();
	}
	
	//keypress links
	var pressLeft = false;
	var pressRight = false;
	var pressUp = false;		//force drop
	var pressDown = false;		//increase drop speed temprarily
	var pressSpace = false;		//rotation
	
	
	//tetris shape class
	function Shape() {
		
		// keeping all of the shape profiles/templates as squares allows for easier parsing the arrays
		//
		// O 
		// [1][1]
		// [1][1]
		//
		// I
		// [0][1][0][0]
		// [0][1][0][0]
		// [0][1][0][0]
		// [0][1][0][0]
		//
		// L
		// [0][1][0]
		// [0][1][0]
		// [0][1][1]
		//
		// J
		// [0][1][0]
		// [0][1][0]
		// [1][1][0]
		//
		// S
		// [0][1][1]
		// [1][1][0]
		// [0][0][0]
		//
		// Z
		// [1][1][0]
		// [0][1][1]
		// [0][0][0]
		//
		// T
		// [0][1][0]
		// [1][1][1]
		// [0][0][0]
		//
		
		//when we rotate we don't want the move to be prevented in most cases, but to push the piece left or right as appropriate
		
		
		this.init = function(letter, c, r) {
			this.letter = letter;
			this.col = c;
			this.row = r;
			this.color = this.setColor(letter);
			this.setOrientation();
			this.setHeight();
		}
		
		this.setOrientation = function() {
			
			var obj;
			
			if ( this.letter === 'T' ) {
				
				obj =	[
						[0,1,0], 
						[1,1,1],
						[0,0,0],
						];
				
			}
			
			this.orientation = obj;
			
		}
		
		this.setColor = function(letter) {
			
			
			
		}
		
		this.setHeight = function() {
			
			var obj = 0;
			
			if (this.letter === 'T') {
				obj = 2;
			}
			
			this.height = obj;
			
		}
		
		
		//rotate updates the shape this.orientation
		this.rotate = function(direction) {
			
			if ( direction === 'clock' ) {
				
				//console.log('rotated clockwise');
				var matrix = this.orientation;
				var len = this.orientation.length;
				var newMatrix = [];
				
				matrix.reverse();
				
				for (var y=0; y<len; ++y) {
					newMatrix[y] = [];
					for (var x=0; x<len; ++x) {
						
						newMatrix[y][x] = matrix[x][y];
						
					}
				}
				
			}
			
			this.orientation = newMatrix;
			
		}
		
	}
	
	//grid class
	
	function Grid() {
		
		
		
		this.init = function(COLS, ROWS) {
			
			this.grid = [];
			
			//++x & ++y instead of COLS-1 & ROWS-1
			//array based on y so that rows can easily be removed in removeLines()
			for (var y=0; y<ROWS; ++y) {
				this.grid[y] = [];
				for (var x=0; x<COLS; ++x) {
					
					this.grid[y][x] = 0;
					this.grid[y][x].locked = false;	//default grid cells to be unlocked
					
				}
			}
			
		}
		
		
	}
	
	//cell class to allow multiple attributes to be stored within each grid cell
	//cell class
	function Cell(v) {
		
		this.value = v;
		this.locked = false;
		
	}
	
	
	//game class
	function Game() {
		
		this.targetFPS = 30;
		
		//grid size
		var COLS = 10;
		var ROWS = 15;
		
		//spawn points
		var startCol = 1;
		var startRow = 1;
		
		//game speed
		var dropRate = 30;			//smaller => faster
		var moveDownCounter = 0;	//based on frames
		
		
		
		this.start = function() {
			animate();
		}
		
		
		
		//initialise game components
		this.init = function() {
			this.shapes = ['O','I','L','J','S','Z','T'];
			
			this.newGrid(COLS, ROWS);
			this.spawnPiece();
			
			
		}
		
		//draw based on the current grid
		this.draw = function() {
			
			for (var y=0; y<ROWS; y++) {
			
				for (var x=0; x<COLS; x++) {
					
					if ( this.grid[y][x].value === 1 ) {
						
						ctx.fillStyle = 'red';
						ctx.fillRect(x*50, y*50, 50, 50);
						
					}
				}
			}
			
			//console.table(this.grid);
			
		}
		
		//spawn new (random) game piece
		this.spawnPiece = function() {
			
			var piece = new Shape;
			piece.init('T', startCol, startRow);
			this.currentPiece = piece;
			this.updateSpawnPieceToGrid();
		}
		
		this.updateSpawnPieceToGrid = function() {
			
			var p = this.currentPiece;
			var c = p.col;	//x
			var r = p.row;	//y
			var s = p.orientation.length	//array size (square for ease)
			
			for (var y=0; y<s; ++y) {
			
				for (var x=0; x<s; ++x) {
					
					if ( p.orientation[y][x] === 1 ) {
						//offset the pieces based on the current position of the shape
						this.grid[(y + r)][(x + c)].value = 1;
						
						
					}
					
				}
			}
			
		}
		
		
		
		this.nextPiece = function() {
			
		}
		
		this.randomPiece = function() {
			
		}
		
		//create new grid / clear grid
		this.newGrid = function(COLS, ROWS) {
			
			this.grid = [];
			//++x & ++y instead of COLS-1 & ROWS-1
			//array based on y so that rows can easily be removed in removeLines()
			for (var y=0; y<ROWS; ++y) {
				this.grid[y] = [];
				//this.grid[y].locked = false;
				for (var x=0; x<COLS; ++x) {
					
					this.grid[y][x] = new Cell(0);
					
					//this.grid[y][x] = 0;
					//this.grid[y][x]["locked"] = false;	//default grid cells to be unlocked
					//console.log('y: ' + y + ' x: ' + x + ' ' + this.grid[y][x].locked);
					
					//this.grid[y][x]['locked'] = false;
					/*
					this.grid[y].forEach(function(obj) {
						
							obj['locked'] = false;
						
					});
					*/
				}
			}
			//console.table(this.grid);
		}
		
		
		
		
		
		// left / right / down
		this.movePlayerPiece = function() {
			
			if (pressLeft) {
				//this.currentPiece.col -=1;
				this.move('left');
				pressLeft = false;
			} else if (pressRight) {
				//this.currentPiece.col +=1;
				this.move('right');
				pressRight = false;
			} else if (pressDown) {
				//this.currentPiece.row +=1;
				this.move('down');
				pressDown = false;
			} else if (pressUp) {
				this.move('up');
				pressUp = false;
			} else if (pressSpace) {
				this.rotatePiece('clock');
				pressSpace = false;
			}
			
		}
		
		//method to auto drop the currentPiece during game loop
		this.movePlayerDown = function() {
			
			moveDownCounter++;
			
			if ( moveDownCounter >= dropRate ) {
				
				this.move('down');
				
				moveDownCounter = 0;
			}
		}
		
		this.rotatePiece = function(direction) {
			
			var piece = this.currentPiece;
			
			//need to add validation check with piece nudge where appropriate
			
			this.updateGrid(piece, 0);	//clear current position
			piece.rotate(direction);
			this.updateGrid(piece, 1);	//update new position
			
			//if the move isn't valid then we need to either nudge up if below, right if left wall, left if right wall
			
		}
		
		//method to move the piece in a direction, check's valid
		this.move = function(direction) {
			
			piece = this.currentPiece;
			
			if ( this.isMoveValid(piece, direction) ) {
				
				console.log('move is valid');
				
				//update grid position (remove values for the current position)
				//console.log('Pre - col: ' + this.currentPiece.col + ' row: ' + this.currentPiece.row);
				this.updateGrid(piece, 0);
				
				//update the piece position
				this.moveCurrentPiece(piece, direction);
				
				//update the grid position (add values based on new position)
				//console.log('New - col: ' + this.currentPiece.col + ' row: ' + this.currentPiece.row);
				this.updateGrid(piece, 1);
				
				
			} else {
				
				console.log('move is NOT valid');
				if (direction === 'down') {
					//lock grid cells with current piece
					this.setGridCellShapeLock(piece, true);
					this.spawnPiece();
				}
				
			}
			
			
		}
		
		//method to update the currentPiece position attributes
		this.moveCurrentPiece = function(piece, direction) {
			
			if (direction === 'left') {
				piece.col -=1;
			} else if (direction === 'right') {
				piece.col +=1;
			} else if (direction === 'down') {
				piece.row +=1;
			} else if (direction === 'up') {
				piece.row -=1;
			}
			
		}
		
		//method to remove / place a piece in the grid
		this.updateGrid = function(piece, addRemove) {
			
			var matrix = piece.orientation;
			var len = matrix.length;						//square sets to make this parse easier 4x4
			var r = piece.row;
			var c = piece.col;
			
			for (var y=0; y<len; ++y) {
				for (var x=0; x<len; ++x) {
					
					if ( matrix[y][x] === 1 ) {
						this.grid[y + r][x + c].value = addRemove;		//change this to piece.color || addRemove (for empty, pass a zero to clear)
					}
					
				}
			}
			
			
		}
		
		//method to lock / unlock grid cells based on current shape
		this.setGridCellShapeLock = function(piece, locked) {
			
			var matrix = piece.orientation;
			var len = matrix.length;						//square sets to make this parse easier 4x4
			var r = piece.row;
			var c = piece.col;
			
			for (var y=0; y<len; ++y) {
				for (var x=0; x<len; ++x) {
					if ( matrix[y][x] === 1 ) {
						block = [y + r, x + c];
						this.setGridCellLock(block[0], block[1], locked);
					}
				}
			}
			
		}
		
		//method to lock / unlock grid cells
		this.setGridCellLock = function(y, x, locked) {
			
			this.grid[y][x].locked = locked;
			console.log('y: ' + y + ' x: ' + x + ' ' + this.grid[y][x].locked);
		}
		
		
		//method to check if a move will be valid
		this.isMoveValid = function(piece, direction) {
			
			var isValid = true;
			var matrix = piece.orientation;
			var len = matrix.length;						//square sets to make this parse easier 4x4
			var r = piece.row;
			var c = piece.col;
			var block = [];
			
			if (direction === 'left') {
				c -=1;
			} else if (direction === 'right') {
				c +=1;
			} else if (direction === 'down') {
				r +=1;
			} else if (direction === 'up') {
				r -=1;
			}
			
			//check if we are hitting the edges of the grid with any of the blocks
			//isValid = false;
			
			for (var y=0; y<len; ++y) {
				for (var x=0; x<len; ++x) {
					
					if ( matrix[y][x] === 1 ) {
						block = [y + r, x + c];
						
						console.log('block (' + block[0] + ', ' + block[1] + ')');
						
						//check for edges of the grid
						//need to also check against the grid for if block already exists
						if ( block[0]>=ROWS || block[0]<0 || block[1]>=COLS || block[1]<0 || this.grid[block[0]][block[1]].locked ) {
							isValid = false;
							break;
						}
						
					}
					
				}
			}
			
			
			return isValid;
			
		}
		
		this.removeLines = function() {
			
			
			
		}
		
	}
	
	var game = new Game();
	
	
	
	
	
	//game loop
	function animate() {
		
		requestAnimFrame ( animate );
		
		//clear screen
		ctx.clearRect(0, 0, canv.width, canv.height);
		
		//background
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, canv.width, canv.height);
		
		//game methods
		game.movePlayerPiece();
		//game.movePlayerDown();
		game.draw();
		
	}
	
	
	
	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame   ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame    ||
				window.oRequestAnimationFrame      ||
				window.msRequestAnimationFrame     ||
				function(/* function */ callback, /* DOMElement */ element){
					window.setTimeout(callback, 1000 / game.targetFPS);
				};
	})();
	
	
	//key press events
	function keyDown(evt) {
			
		switch(evt.keyCode) {
			
			case 37:
				pressLeft=true;
				break;
				
			case 38:
				pressUp=true;
				break;
				
			case 39:
				pressRight=true;
				break;
				
			case 40:
				pressDown=true;
				break;
			
			case 32:
				pressSpace=true;
				break;
		}
		
	}
	
	function keyUp(evt) {
		
		switch(evt.keyCode) {
			
			case 37:
				pressLeft=false;
				break;
				
			case 38:
				break;
				
			case 39:
				pressRight=false;
				break;
				
			case 40:
				pressUp=false;
				break;
			
			case 32:
				pressSpace=false;
				break;
			
		}
		
	}
	