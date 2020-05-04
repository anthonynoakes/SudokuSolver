// Globals Variables
var board = new Array(9);
var timeStart = null;
var timeStop = null;

var updates = 0;


// Link HTML objects
$( document ).ready(function() {
	// link html table
	initTable();
	
	$('#set').click(function() {
		setTable();
		if(checkErrors(false) < 1)
			initTable();

		timeStart = new Date().getTime();
	})
	
	$('#solve').click(function () {
			
		fillpossible();
		var c_update = crossCheck();		
		
		fillpossible();
		var i_update = isolationCheck();

		// check column check

		// check N only in N squares. You can remove them from other 
		
		console.log("Updates: c->" + c_update + " i->" + i_update);
	});
	
	$('#check').click(function() {
		checkErrors(true);
	});
	
	$('#reset').click(function() {
		if(confirm("Are you sure you want to reset?"))
		{
			initTable();
		}
	});
	
	$('#test').click(function() {
		var input = prompt("Test Input");

		if(input && input.length == 81)
		{
			var normalizedInput = input;
			initTable(normalizedInput);
		}
		
	});
});


function crossCheck() {
	var updates = 0;
	
	//check if each number only shows up once in subgroup
	for(g=0; g<9; g++)
	{
		outerValueLoop:
		for(i=1; i<10; i++)
		{
			var x = -1;
			var y = -1;
			
			// check if # already lives in group
			var row = Math.floor(g/3)*3; // start at row -> 3
			var col = g%3*3; // start at col -> 3

			for(r=row; r<(row+3); r++)
			{
				for(c=col; c<(col+3); c++)
				{
					if(board[r][c].solved !== true)
					{		
						for(p=0; p<board[r][c].possible.length; p++)
						{
							if(board[r][c].possible[p] == i) 
							{
								if(x == -1 && y == -1)
								{
									x = r; y = c;
								}
								else 
									continue outerValueLoop;
							}
						}
					}
				}
			}	
			if(x != -1 && y != -1)
			{
				board[x][y].solve(i);
				updates++;
				
				$('#sudoku-table tr:eq('+x+') td:eq('+y+')')
					.text(board[x][y].value)
					.css('background-color', '#4900cf');
			}		
		}
	}
	
	return updates;
}

// check possiblies for each cell
function isolationCheck(){
	updates = 0;
	
	// loop through rows and columns
	for(r=0; r<board.length; r++)
	{
		for(c=0; c<board[r].length; c++)
		{
			if(board[r][c].solved !== true)
			{
				// no possiblies there is an error on the table, shoot
				if(board[r][c].possible.length < 1)
				{
					alert('0 possible failure...')
				}
				
				// one possiblity we know it fits
				if(board[r][c].possible.length == 1)
				{
					board[r][c].solve(board[r][c].possible[0]);
					updates++;
					
					$('#sudoku-table tr:eq('+r+') td:eq('+c+')')
						.text(board[r][c].value)
						.css('background-color', '#1FCF00');
				}
			}
		}
	}
	
	return updates;
}

// calculate each possible for non solved
function fillpossible(){
	//loop rows
	for(i=0; i<board.length; i++) 
	{
		//loop columns
		for(n=0; n<board.length; n++)
		{
			// check if # already lives in group
			var row = i - i%3; // start at row -> 3
			var col = n - n%3; // start at col -> 3
		
			if(board[i][n].solved === true)
				continue;
				
			// check possiblities for each of the cells
			outer:
			for(z=board[i][n].possible.length - 1; z>=0; z--)
			{
				var value = board[i][n].possible[z];
				
				for(r=row; r<(row+3); r++)
				{
					for(c=col; c<(col+3); c++)
					{
						 if(board[r][c].value == value){
							board[i][n].removePossibility(value);
							continue outer;
						 }
					}
				}				
				
				// check if # lives in row
				for(c=0; c<9; c++)
				{	 
					if(board[i][c].value == value){
						board[i][n].removePossibility(value);
						continue outer;
					 }
				}
				
				// check if # lives in column
				for(r=0; r<9; r++)
				{	 
					if(board[r][n].value == value){
						board[i][n].removePossibility(value);
						continue outer;
					 }
				}
				
				// Sweet still possible leave it
			}
		}
	}
	
	// check if number is ensured to be in 1 row/colum per subgroup
	// if so then remove them from the rows and columns
	var count = 0;
	for(g=0; g<9; g++)
	{
		outerValueLoop:
		for(i=1; i<10; i++)
		{
			var x = [];
			var y = [];
			
			// check if # already lives in group
			var row = Math.floor(g/3)*3; // start at row -> 3
			var col = g%3*3; // start at col -> 3

			for(r=row; r<(row+3); r++)
			{
				for(c=col; c<(col+3); c++)
				{
					if(board[r][c].solved !== true)
					{		
						for(p=0; p<board[r][c].possible.length; p++)
						{
							if(board[r][c].possible[p] == i) 
							{
								x.push(r);
								y.push(c);
							}
						}
					}
				}
			}
			
			if(x.length > 1) //**y.length > 1
			{
				var i_row = identical(x);
				var i_col = identical(y);
				
				// if all in same row remove from others 
				if(i_row){
					console.log("identical row " + g + "," + i_row);
					count++;
					
					for(cw=0; cw<9; cw++)
					{
						if(cw<row && cw>=(row+3))
						{
							var index = board[x][cw].removePossibility(i_row);
						}
					}
				}
				
				//
				if(i_col){
					console.log("identical col " + g + "," + i_col);
					count++;
					
					for(cw=0; cw<9; cw++)
					{
						if(cw<row && cw>=(row+3))
						{
							board[cw][y].removePossibility(i_col);
						}
					}
				}
			}
		}
	}
	console.log(count);
}

// helper fucntion for fillpossible
function identical(array) {
    var first = array[0];
    for(var i=1; i<array.length; i++)
	{
		if(array[i] != first) return 0;
	}
	return first;
}

function setTable(){
	for(r=0; r<9; r++)
	{
		for(c=0; c<9; c++)
		{
			value = $('#sudoku-table tr:eq('+r+') td:eq('+c+') input').val();
			$('#sudoku-table tr:eq('+r+') td:eq('+c+')').empty();
			if(value > 0 && value < 10)
			{
				board[r][c].solve(value);
				$('#sudoku-table tr:eq('+r+') td:eq('+c+')')
					.text(board[r][c].value)
					.css('background-color', '#CF8600');
			}
			else
			{
				$('#sudoku-table tr:eq('+r+') td:eq('+c+')')
					.text(board[r][c].value)
					.css('background-color', '#fff');
			}	
		}
	}
	
	console.log(board);
}

function initTable(puzzle_input){
	// Html
	$('#sudoku-table').empty();
	var content = '';
	for(i=0; i<9; i++){
		content += '<tr>';
		for(j=0; j<9; j++)
			content += '<td><input type="text"></td>';
		content += '</tr>';
	}
	$('#sudoku-table').append(content);
	
	
	{
		for(j=0; j<board.length; j++)
		{
			board[j]=new Array(9);
			for(k=0; k<board[j].length; k++){
				board[j][k]= new point();
				
				if(puzzle_input)
				{
					square_input = puzzle_input[j*9 + k%9];
					if(square_input != 0)
					{
						board[j][k].solve(square_input);
					}
				}
			}
		}
	}
	
	//awful coding standard
	//awfulTest();
	
	for(j=0; j<9; j++)
	{
		for(k=0; k<9; k++)
		{
			if(board[j][k].solved)
				$('#sudoku-table tr:eq('+j+') td:eq('+k+')')
					.text(board[j][k].value)
					.css('background-color', '#CF8600');
		}
	}
	
	console.log(board);
}

// Objects
class point{
	constructor()
	{
		this.value = null;
		this.solved = false;

		this.possible = new Array(9);

		// by default all are possible
		for(var i=0; i<this.possible.length; i++)
		{
			this.possible[i] = (i + 1);
		}
	}

	solve(val)
	{
		this.value = val;
		this.solved = true;
		this.possible = [val];
	}

	removePossibility(val)
	{
		var index = this.possible.indexOf(val);
		if (index > -1) {
			this.possible.splice(index, 1);
		}
	}
}

function checkErrors(verbose){

	var complete = 0;
	//loop rows
	for(r=0; r<board.length; r++) 
	{
		//loop columns
		for(c=0; c<board.length; c++)
		{
			// check if # already lives in group
			var row = r - r%3; // start at row -> 3
			var col = c - c%3; // start at col -> 3
		
			// only verify solved
			if(board[r][c].solved !== true)
				continue;
				
			complete++;
			
			// check if # lives in row
			for(i=0; i<9; i++)
			{	 
				if(board[r][i].value == board[r][c].value && i != c) 
				{
					alert("FAILURE at " + r + ", " + c + " row error");
					console.log(board[r][c]);
					return -1;
				}
			}
			
			// check if # lives in column
			for(i=0; i<9; i++)
			{	 
				if(board[i][c].value == board[r][c].value && i != r) 
				{
					alert("FAILURE at " + r + ", " + c + " column error");
					console.log(board[r][c]);
					return -1;
				}
			}
			
			// check to make sure max 1 in each subgroup
			for(n=row; n<(row+3); n++)
			{
				for(m=col; m<(col+3); m++)
				{
					 if(board[n][m].value == board[r][c].value && (r != n && c != m))
					 {
						alert("FAILURE at " + r + ", " + c + " group error");
						console.log(board[r][c]);
						return -1;
					 }
				}
			}				
		}
	}
	
	if(complete == 81)
	{	
		timeStop =  new Date().getTime();
		alert("Winner in "+(timeStop-timeStart)/1000+" seconds");	
		return 2;
	}
	else if(verbose)
	{
		alert("Test Passed");	
	}
	else
	{
		console.log("Test Passed");	
	}
	
	return 1;
}

function awfulTest(){
	board[0][1].value=1;   board[0][1].solved = true;
	board[0][4].value=6;   board[0][4].solved = true;
	board[0][7].value=4;   board[0][7].solved = true;
	board[0][8].value=5;   board[0][8].solved = true;
               
	board[1][2].value=9;   board[1][2].solved = true;
	board[1][7].value=7;   board[1][7].solved = true;
	board[1][8].value=8;   board[1][8].solved = true;
             
	board[2][2].value=5;   board[2][2].solved = true;
	board[2][4].value=1;   board[2][4].solved = true;
	board[2][6].value=2;   board[2][6].solved = true;
	board[2][8].value=9;   board[2][8].solved = true;
            
	board[3][2].value=1;   board[3][2].solved = true;
	board[3][3].value=2;   board[3][3].solved = true;
	board[3][8].value=6;   board[3][8].solved = true;
             
	board[4][2].value=6;   board[4][2].solved = true;
	board[4][4].value=8;   board[4][4].solved = true;
	board[4][6].value=9;   board[4][6].solved = true;
            
	board[5][0].value=5;   board[5][0].solved = true;
	board[5][5].value=9;   board[5][5].solved = true;
	board[5][6].value=4;   board[5][6].solved = true;
         
	board[6][0].value=2;   board[6][0].solved = true;
	board[6][2].value=3;   board[6][2].solved = true;
	board[6][4].value=7;   board[6][4].solved = true;
	board[6][6].value=6;   board[6][6].solved = true;
   
	board[7][0].value=1;   board[7][0].solved = true;
	board[7][1].value=6;   board[7][1].solved = true;
	board[7][6].value=8;   board[7][6].solved = true;
       
	board[8][0].value=8;   board[8][0].solved = true;
	board[8][1].value=5;   board[8][1].solved = true;
	board[8][4].value=9;   board[8][4].solved = true;
	board[8][7].value=3;   board[8][7].solved = true;
}