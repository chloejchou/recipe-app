// Link to express.
var express = require('express');
var path = require('path');
var mysql = require('mysql');
var app = express();

var bodyParser = require('body-parser');

// Connecting to the database.
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : ''
});

connection.query('USE recipes_test');

// Setting up express.
app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser());


app.get('/', function(req,res) {
	res.render('edit-form');
});


app.post('/ingredient/', function(req, res){
	var myIngredients = req.body.myIngredients;
	var ingredientFilter = myIngredients.map(function(str) {
		return "ingredient LIKE '%" + str + "%'";
	});
	var query = "SELECT recipe_name, COUNT(*) AS count, GROUP_CONCAT(ingredient SEPARATOR ', ') AS ingredients "
		  	  + "FROM recipes_ingredients "
		      + "WHERE " + ingredientFilter.join(" OR ") + " "
		      + "GROUP BY recipe_name "
		      + "ORDER BY count DESC";
	connection.query(query, function(err, rows) {
		res.render('recipes', {ingredient : myIngredients, recipes : rows});
	});
}); 


app.get('/ingredient/:ingredient', function(req, res) {
	var query = "SELECT recipe_name, COUNT(*) AS count, GROUP_CONCAT(ingredient SEPARATOR ', ') AS ingredients " 
			  + "FROM recipes_ingredients " 
			  + "WHERE ingredient = ? " 
			  + "GROUP BY recipe_name " 
			  + "ORDER BY count DESC";
	console.log(query);
	connection.query(query, [req.params.ingredient], function(err, rows) {
		res.render('recipes', {ingredient: req.params.ingredient, recipes : rows});
	});
});


app.get('/recipe/:name', function(req,res) {
	connection.query("SELECT * FROM recipes WHERE name=? LIMIT 1", [req.params.name], function(err, rows) {
		var recipeRecord = rows[0];
		connection.query("SELECT * FROM recipes_ingredients WHERE recipe_name=?", [req.params.name], function(err, rows) {
			var ingredientsRecord = rows;
			connection.query("SELECT * from instructions WHERE recipe_name = ?", [req.params.name], function(err,rows) {
				res.render('specificRecipe', {recipe: recipeRecord, ingredients: ingredientsRecord, instructions: rows});
			});
		});
	});
});


module.exports = app;









