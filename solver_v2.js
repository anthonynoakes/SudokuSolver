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
							board[x][cw].removePossibility(i_row);
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

// Add some bit-wise logic here so we can deduce which alg was used
const Algorithm = {
    ELIMINATION: 'elimination', // only one spot a value can exist in a section
    ISOLATION: 'isolation',     // only one spot a value can fit in a section
    
    // these two are unlike the others
    LINE: 'line',                   // elements only exist in a single row/col. Reduce other squares
    GROUPING: 'grouping'        // N elements exist only in N squares. Can remove only possibliities
}

// Objects
class Point{
	constructor()
	{
		this.value = null;
        this.solved = false;
        this.algorithm = null

		this.possible = new Array(9);

		// by default all are possible
		for(var i=0; i<this.possible.length; i++)
		{
			this.possible[i] = (i + 1);
		}
	}

	Solve(val, algorithm)
	{
		this.value = val;
		this.solved = true;
        this.possible = [val];
        this.algorithm = algorithm;
	}

	RemovePossibility(val)
	{
		var index = this.possible.indexOf(val);
		if (index > -1) {
			this.possible.splice(index, 1);
		}
	}
}

// todo: simply the
// class Section {
//     constructor(input)
//     {
//         // input expected to be 9 length string of all values
//         // add logic to track which elements have been already solved / unsolved

// 		// Build board points
// 		// 0 | 1 | 2
// 		// - | - | -
// 		// 3 | 4 | 5
// 		// - | - | -
// 		// 6 | 7 | 8

//     }
// }

// todo: create quadrant object

class Board {
	constructor(input)
	{
        // input expected to be 81 length string of all values

		// Build board sections
		// 0 | 1 | 2
		// - | - | -
		// 3 | 4 | 5
		// - | - | -
		// 6 | 7 | 8

		this.sections = 9;

		this.cells = new Array(this.sections);
		for (var x = 0; x<this.sections; x++)
		for (var y = 0; y<this.sections; y++)
		{
			board[x][y] = new point();
		}
	}

	GetSectionIndex(x, y)
	{
		// return section index
		var xquad = Math.floor(x/3);
		return xquad + y;
	}

	GetSection(index)
	{
		// return [] of this.cells;
		var xstart = (index % 3) * 3;
		var ystart = Math.floor(index / 3) * 3;

        // Console.Log("{xstart, ystart}");
        var output = [];
        for(var x=0; x<3; x++)
        for(var y=0; y<3; y++)
        {
            output.push(this.board.cells[xstart+x][ystart+y])
        }

        return output;
	}
}

class App
{
	// todo: add input here
	constructor(input)
	{
		this.board = new Board(input);
    }
    
    SolveIteration()
    {
        var updatedOuter = false;
        // get each section
        for(var s=0; s<this.board.sections; s++)
        {
            var sectionElements = this.board.GetSection(s);
            
            // loop section until no further updates can be determined
            var updatedInner = false;
            do {
                // check if any are the only value available.
                var element = sectionElements[i];
                for (var i=0; i<sectionElements.length; i++)
                {
                    if (!element.solved)
                    {
                        if (element.possible.length == 1)
                        {
                            element.Solve(element.possible[0])
                            // todo: remove from all others in section...
                            updatedOuter |= updatedInner |= true;
                        }
                    }
                }

                // check if any only exist in a single location
                for (var i=1; i<=9; i++)
                {
                    var index = -1;
                    if (!element.solved)
                    {
                        if (element.possible.length == 1)
                        {
                            element.Solve(element.possible[0])
                            updatedOuter |= updatedInner |= true;
                        }
                    }
                }

                // check if any value can only exist in a single row
                // check if any values exist in N locations with N
            } while (updated)          
        }

        return updatedOuter;
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