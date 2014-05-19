// Globals Variables
var board = new Array(9);

var updates = 0;


// Link HTML objects
$( document ).ready(function() {
	// link html table
	initTable();
	
	$('#set').click(function() {
		setTable();
		if(checkErrors(false) < 1)
			initTable();
	})
	
	$('#solve').click(function () {
		// have a check to make sure that the table is valid
		// fill each non solved square with possible 
		fillpossible();
		step1();		
		
		fillpossible();
		step2();		
				
		//check if number only locate in 1 	row/column
		//fillpossible();
		//step3();
		
		checkErrors(false);
	});
	
	$('#check').click(function() {
		checkErrors(true);
	});
});


function step1() {
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
				board[x][y].value = i;
				board[x][y].solved = true;
				updates++;
				
				$('#sudoku-table tr:eq('+x+') td:eq('+y+')')
					.text(board[x][y].value)
					.css('background-color', '#4900cf');
			}		
		}
	}
	
	console.log(updates + " updates by cross checking");
}

// check possiblies for each cell
function step2(){
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
					alert('0 possible failure...')
				
				
				// one possiblity we know it fits
				if(board[r][c].possible.length == 1)
				{
					board[r][c].value = board[r][c].possible[0];
					board[r][c].solved = true;
					updates++;
					
					$('#sudoku-table tr:eq('+r+') td:eq('+c+')')
						.text(board[r][c].value)
						.css('background-color', '#1FCF00');
				}
			}
		}
	}
	
	console.log(updates + " updates by isolation");
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
			board[i][n].possible = [];
			outer:
			for(check=1; check<10; check++)
			{
				for(r=row; r<(row+3); r++)
				{
					for(c=col; c<(col+3); c++)
					{
						 if(board[r][c].value == check) continue outer;
					}
				}				
				
				// check if # lives in row
				for(c=0; c<9; c++)
				{	 
					if(board[i][c].value == check) continue outer;
				}
				
				// check if # lives in column
				for(r=0; r<9; r++)
				{	 
					if(board[r][n].value == check) continue outer;
				}
				
				// Sweet append to possibilities
				board[i][n].possible.push(check);
			}
		}
	}
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
				board[r][c].value=value;   
				board[r][c].solved = true;
				$('#sudoku-table tr:eq('+r+') td:eq('+c+')')
					.text(board[r][c].value)
					.css('background-color', '#CF8600');
			}
			else
			{
				board[r][c].value=null;   
				board[r][c].solved = false;
				$('#sudoku-table tr:eq('+r+') td:eq('+c+')')
					.text(board[r][c].value)
					.css('background-color', '#fff');
			}	
		}
	}
	
	console.log(board);
}

function initTable(){
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
	
	for(j=0; j<board.length; j++)
	{
		board[j]=new Array(9);
		for(k=0; k<board[j].length; k++)
			board[j][k]=new point(null, false);
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
function point(val, fix){
	this.value = val;
	this.solved = fix;
	this.possible = [];
}

function checkErrors(verbose){
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
	
	if(verbose)
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