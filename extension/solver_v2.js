// Objects
class Point{
	constructor(x, y, point)
	{
		// Deep copy constructor for back/forward
		if (point)
		{
			this.x = point.x;
			this.y = point.y
			this.value = point.value;
			this.solved = point.solved;
			this.error = point.error;
	
			if (point.possible)
			{
				this.possible = [...point.possible]; // ES6 hack for initalize array
			}
		}
		else
		{
			this.x = x;
			this.y = y
			this.value = null;
			this.solved = false;
			this.error = false;
	
			this.possible = new Array(9);
	
			// by default all are possible
			for(var i=0; i<this.possible.length; i++)
			{
				this.possible[i] = parseInt(i + 1);
			}
		}		
	}

	Solve(val)
	{
		this.value = parseInt(val);
		this.solved = true;
        this.possible = [this.value]; // remove all other possiblities
	}

	RemovePossibility(val)
	{
		var index = this.possible.indexOf(parseInt(val));
		if (index > -1) {
			this.possible.splice(index, 1);
		}
	}
}

class Board {
	constructor(puzzle_input)
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
		{
			this.cells[x] = new Array(this.sections);
			for (var y = 0; y<this.sections; y++)
			{
				this.cells[x][y] = new Point(x, y);
				// check if input was recieved if so, set value
				if(puzzle_input)
				{
					var square_input = puzzle_input[x*9 + y%9];
					if(square_input != 0)
					{
						this.cells[x][y].Solve(square_input);
					}
				}
			}
		}
	}
	
	GetSection(index)
	{
		// return [] of this.cells;
		var xstart = (index % 3) * 3;
		var ystart = Math.floor(index / 3) * 3;

        var output = [];
        for(var x=0; x<3; x++)
        for(var y=0; y<3; y++)
        {
            output.push(this.cells[ystart+y][xstart+x])
        }

        return output;
	}

	GetRow(index)
	{
		// return [] of this.cells;
		var ystart = index;

        var output = [];
        for(var x=0; x<9; x++)
        {
            output.push(this.cells[x][ystart])
        }

        return output;
	}

	GetColumn(index)
	{
		// return [] of this.cells;
		var xstart = index;

        var output = [];
        for(var y=0; y<9; y++)
        {
            output.push(this.cells[xstart][y])
        }

        return output;
	}

	GetSnapshot()
	{
		var output = "";
		for (var x=0; x<9; x++)
		{
			for (var y=0; y<9; y++)
			{
				output += this.cells[x][y].solved ? this.cells[x][y].value : "0"
			}
		}

		return output;
	}

	Validate()
	{
		for(var s=0; s<9; s++)
		{
			var cells = this.GetSection(s);
			if(this.HasDuplicated(cells)){
				return true
			}
			
			var cells = this.GetRow(s);
			if(this.HasDuplicated(cells)) {
				return true
			}
			
			var cells = this.GetColumn(s);
			if(this.HasDuplicated(cells)) {
				return true
			}
		}

		return false;
	}

	// check for any duplicated
	HasDuplicated(cells)
	{
		let set = new Set()
		for(var i=0; i<cells.length; i++)
		{
			if(cells[i].solved && set.has(cells[i].value))
			{
				return true;
			}

			set.add(cells[i].value);
		}

		return false;
	}
}

class App
{
	// todo: add input here
	constructor(input)
	{
		this.reductionSteps = 0;		

		this.step_index = -1;
		this.steps = [this.cells];

		if(input != null)
		{
			this.SetupBoard(input)
		}
	}
	
	SetupBoard(input)
	{
		this.step_index = 0;
		this.board = new Board(input);
	}

	StepForward()
	{
		this.step_index++
		this.steps[this.step_index] = this.board.GetSnapshot();
		this.SolveIteration();
	}

	StepBackward()
	{
		if(this.step_index >=0)
		{
			this.board = new Board(this.steps[this.step_index]);
			this.step_index--;
		}
		else
		{
			alert("No history to step backward")
		}
	}

	Reduce_internal(cells)
	{
		// Find all the solved in section
		var solved = [];
		for (var c=0; c<cells.length; c++)
		{
			if(cells[c].solved)
			{
				solved.push(cells[c].value)
			}
		}

		// Remove all solved from each possibility
		for (var r=0; r<solved.length; r++) {
			for (var c=0; c<cells.length; c++)
			{
				if(!cells[c].solved){
					cells[c].RemovePossibility(solved[r])
				}
			}			
		}
	}

	ReducePossibles()
	{	
		// Steps
		// 1. check if it exists in the box (- the box)
		for(var s=0; s<9; s++)
		{
			var cells = this.board.GetSection(s);
			this.Reduce_internal(cells);
		}

		// // 2. check if it exists in the row (- the box)
		for(var s=0; s<9; s++)
		{
			var cells = this.board.GetRow(s);
			this.Reduce_internal(cells);
		}

		// //3. check if it exists in the column (- the box)
		for(var s=0; s<9; s++)
		{
			var cells = this.board.GetColumn(s);
			this.Reduce_internal(cells);		
		}

		// 4. check if any value can only exist in a single row
		// todo

		// 5. check if any values exist in N locations with N
		// todo
	}

	SolveByPossibles()
	{
		// get each section
        for(var s=0; s<9; s++)
        {
			var cells = this.board.GetSection(s);
			
			// check if any are the only value available.
			for (var i=0; i<cells.length; i++)
			{
				var cell = cells[i];
				if (!cell.solved)
				{
					if (cell.possible.length == 1)
					{
						cell.Solve(cell.possible[0])
						this.board.Validate();
					}
				}
			}

			// check for each value possible if any only exist in a single location
			// todo: only check values that have not yet been solved.
			for (var n=1; n<10; n++)
			{
				var index = [];
				for (var i=0; i<cells.length; i++)
				{
					var element = cells[i];
					if (element.possible.indexOf(n) >= 0)
					{
						index.push(i);
					}
				}
				
				if (index.length == 1)
				{
					cells[index[0]].Solve(n);
					this.board.Validate();
				}
			}         
        }

		this.Validate();
	}
    
    SolveIteration()
    {
		this.ReducePossibles();
		this.SolveByPossibles();
	}
	
	Validate()
	{
		for(var s=0; s<9; s++)
		{
			var cells = this.board.GetSection(s);
			if(this.HasDuplicated(cells)) console.log("error section")
			
			var cells = this.board.GetRow(s);
			if(this.HasDuplicated(cells)) console.log("error row")
			
			var cells = this.board.GetColumn(s);
			if(this.HasDuplicated(cells)) console.log("error column")
		}
	}

	// check for any duplicated
	HasDuplicated(cells)
	{
		let set = new Set()
		for(var i=0; i<cells.length; i++)
		{
			if(cells[i].solved && set.has(cells[i].value))
			{
				return true;
			}

			set.add(cells[i].value);
		}

		return false;
	}
}