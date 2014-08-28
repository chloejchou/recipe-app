// Uploads entries from the Pearson Kitchen Manager API into MySQL tables.

// Connect to MySQL.
var request = require('request');
var mysql =  require('mysql');

var loader = exports = module.exports = {};

var connection =  mysql.createConnection({
	host : "localhost",
	user : "root",
	password: ""
});

connection.connect();
connection.query("USE recipes_test");

var dedup = {};
var recipe_id = [];
var numDone = 0;
var numDone1 = 0;

var insertRecipe = function(record) {
	// Prevent duplicates.
	if (!dedup[record.id]) {
		dedup[record.id] = 0;
	}
	dedup[record.id]++;
	if (dedup[record.id] < 2) {
		connection.query("INSERT INTO recipes SET id=?, name=?, url=?, cuisine=?, cooking_method=?, image=?, thumb=?", 
			[record.id, record.name, record.url, record.cuisine, record.cooking_method, record.image, record.thumb]);
			// Create an array of recipe IDs. 
			recipe_id.push(record.id);		
	}	
}

var insertDetails = function(record) {
	for (var i = 0; i < record.ingredients.length; i++) {
		connection.query("INSERT INTO recipes_ingredients SET recipe_id = ?, recipe_name = ?, ingredient = ?, ingredient_quantity = ?, ingredient_unit = ?",
			[record.id, record.name, record.ingredients[i].name, record.ingredients[i].quantity, record.ingredients[i].unit, record.id, record.ingredients[i].name]);
	}
	for (var c = 0; c < record.directions.length; c++) {
		connection.query("INSERT INTO instructions SET recipe_name = ?, step = ?, instruction = ?",
			[record.name, c + 1, record.directions[c]]);
	}
}

// Establish a list of ingredients that appear in recipes to include in the database.
var ingredients = [
	"chicken",
	"beans",
	"corn",
	"beef",
	"salt",
	"rice"
];

 
for (var j = 0; j < ingredients.length; j++) {
	var keyIngredient = ingredients[j];
	// The URL below includes all the recipes that matched a specific ingredient search. 
	var url = "http://api.pearson.com/kitchen-manager/v1/recipes?limit=100&ingredients-any=" + keyIngredient;
	(function(keyIngredient) {
		// Read the text from the URL.
		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var json = JSON.parse(body);
				json.results.forEach(function(result) {
					insertRecipe(result);
				});
				// Increment numDone by 1 when each URL has been read. 
				numDone++;
				// When finished with evaluating all URLs...
				if (numDone === ingredients.length) {
					// Repeat the above procedure with another set of URLs. 
					for (var z = 0; z < recipe_id.length; z++) {
						var ID = recipe_id[z];
						// The URL below includes the details of a specific recipe in recipe_id.
						var url = "https://api.pearson.com/kitchen-manager/v1/recipes/" + ID;
						(function(ID) {
							request(url, function(error, response, body) {
								if(!error && response.statusCode == 200) {
									var json1 = JSON.parse(body);
									insertDetails(json1);
									// Increment numDone1 by 1 when each URL has been read. 
									numDone1++;
									// Terminate MySQL connection when all URLs have been evaluated.
									if (numDone1 === recipe_id.length) {
										connection.end(function(err) {
											connection.destroy();
										});
									}
								}
							});
						// Run this function for an entry in recipe_id.
						})(recipe_id[z]);
					}
				}
			}
		});
	// Run this function for an entry in ingredients.
	})(ingredients[j]);
}


