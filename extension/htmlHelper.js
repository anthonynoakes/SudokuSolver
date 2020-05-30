// Save a library, write a document 
$(document).ready(function() {
	function drawBoard(cells, colorOverride)
	{
		for(x=0; x<9; x++)
		{
			for(y=0; y<9; y++)
			{
				cell = cells[x][y];
				// $('#sudoku-table tr:eq('+x+') td:eq('+y+')').empty();
				if(cell.value && cell.value > 0 && cell.value < 10)
				{
                    cell.Solve(cell.value);
                    
                    // only update if not already set
                    if($('#sudoku-table tr:eq('+x+') td:eq('+y+')').text() == "")
                    {                        
					    $('#sudoku-table tr:eq('+x+') td:eq('+y+')')
						    .text(cell.value)
                            .css('background-color', colorOverride || '#008dcf');
                    }					
				}
				else
				{
					$('#sudoku-table tr:eq('+x+') td:eq('+y+')')
						//.text("["+cell.x+"]["+cell.y+"]")
						.css('background-color', '#fff');
				}	
			}
		}
		
		console.log(app);
	}

	$('#back').click(function() {
		app.StepBackward();
		drawBoard(app.board.cells);
	})

	$('#forward').click(function() {
		app.StepForward();
		drawBoard(app.board.cells);
	})

	$('#manual').click(function() {
		// read from html
		var input = "";
		for(r=0; r<9; r++)
		{
			for(c=0; c<9; c++)
			{
				value = $('#sudoku-table tr:eq('+r+') td:eq('+c+') input').val();
				$('#sudoku-table tr:eq('+r+') td:eq('+c+')').empty();
				if(value > 0 && value < 10)
				{
					input += value;
				}
				else
				{
					input += 0;
				}	
			}
		}

		console.log(input);
		app.SetupBoard(input);
		
		drawBoard(app.board.cells);
	})

	$('#test').click(function() {
		var asdf = prompt("input test string")
		{
			app.SetupBoard(asdf);
		}
		
		drawBoard(app.board.cells);
	})
	

	// Html builder
	$('#sudoku-table').empty();
	var content = '';
	for(i=0; i<9; i++){
		content += '<tr>';
		for(j=0; j<9; j++)
			content += '<td><input type="text"></td>';
		content += '</tr>';
	}
	$('#sudoku-table').append(content);

	var test = "570006200108040000040032000000000123456780000000000000000000000000000000000000000000000012345678000000000107005000000000308015700001020000904070207000000069007801";
	
	// section test
	var test = "123000000456000000780000000000123000000456000000780000000000123000000456000000780";
	
	// row test
	var test = "";

	// column test
	var test = "000000001000000002000000003000000004000000005000000006000000007000000008000000000";

	var test = "000000000000000000000000000000000000000000000000000000000000000000000000000000000"
	
    
    
    let searchParams = new URLSearchParams(window.location.search)
    if(searchParams.has('puzzle'))
    {       
        let puzzle = searchParams.get('puzzle')
        //app.SetupBoard(puzzle);
        //
        var app = new App(puzzle);
        drawBoard(app.board.cells, "#17d402");
    }
    else
    {
        var app = new App();
    }


	//app.SetupBoard(test);
	//drawBoard(app.board.cells);	
});