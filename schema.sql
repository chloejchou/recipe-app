/* Create tables in MySQL to store data. */

CREATE TABLE recipes (
	id char(100),
	name varchar(200),
	url varchar(200),
	cuisine varchar(30),
	cooking_method varchar(30),
	image varchar(150),
	thumb varchar(150)
);

CREATE TABLE instructions (
	recipe_name char(100),
	step int,
	instruction varchar(1000)
);

CREATE TABLE recipes_ingredients (
	recipe_id char(100),
	recipe_name char(100),
	ingredient varchar(50),
	ingredient_quantity varchar(10),
	ingredient_unit varchar(10)
);

