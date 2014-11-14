var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrape', function(req, res){
	// Let's scrape Anchorman 2
	url = 'http://bravefrontierglobal.wikia.com/wiki/Tyrant_Lilly_Matah';

	request(url, function(error, response, html){
		if(!error){
			var $ = cheerio.load(html);

			// HELPERS
			var setUnitBBFill = function(div_text, row_type) {
				if (row_type === 'bb') {
					console.log('This is the BB row. Set the BB fill rate');
					json.bb_fill = div_text;
					delete row_type;
				} else if (row_type === 'sbb') {
					console.log('This is the BB row. Set the SBB fill rate');
					// We need to do some more work to strip the undesired 'BC' text
					json.sbb_fill = div_text;
					delete row_type;
				}
			}
			// Unit Data Extraction
			var justText = function(object, row_type) {
				var table_data = $(object);
				var clone = $(table_data).clone();
				// If this has extra data, lets store it.
				if ($(clone).find("span").attr('title')) {
					//var title_data_array = [];
					$(clone).find("span").each(function(){

						// Exception for BB fill rates. Hopefully fill rate is the only div inside this TR
						if (typeof row_type !== 'undefined') {
							console.log(row_type);
							setUnitBBFill($(clone).find('div').text(), row_type);
						}
						// Now that we have extracted the fill rate, 
						// remove the div so it doesnt add the text to the skill description
						$(clone).find('div').remove();

						// Prepare the title to be injected into the skill description
						var title_chunk = ' (' + $(this).attr('title') + ')';
						//console.log(title_chunk);
						if ($(this).attr('title')){
							$(this).append(title_chunk);
						}
						//title_data_array.push($(this).attr('title'));
					});

					return $(clone)
					.children("div")
					.remove()
					.end()
					.text()
					.trim();

				} else {
					// If not, trim as usual.
					return $(object).clone()
					.children("div")
					.remove()
					.end()
					.text()
					.trim();

				}

			};

			// Stats Header
			var json = { name : "", character_id : "", element : "", rarity : "", max_lvl : "", cost : "", gender: "", hp_lord: "", atk_lord: "", def_lord: "", rec_lord: "", hp_anima: "", atk_anima: "", def_anima: "", rec_anima: "", hp_breaker: "", atk_breaker: "", def_breaker: "", rec_breaker: "", hp_guardian: "", atk_guardian: "", def_guardian: "", rec_guardian: "", hp_oracle: "", atk_oracle: "", def_oracle: "", rec_oracle: "", leader_skill_name: "", leader_skill: "",  bb_skill_name: "", bb_skill: "", sbb_skill_name: "", sbb_skill: "", bb_fill: "", sbb_fill: "", };

			$('.article-table').each(function(index) {
				// Left Sidebar Column
				if (index == 0) {
					console.log('Analyzing the first article-table for unit name, story, etc');

					var left_column = $(this);
					$(left_column).find('tr').each(function(index){
						switch(index) {
							case 0:
								json.name = $(this).find('b').text().trim();
								json.gender = $(this).find('div[title]').attr('title');
								break;
							case 1:
								break;
							case 2:
								break;
						}
					});


				} else if (index == 1) {

					// Header Right Column.
					console.log('Analyzing the second article-table for unit stats. This is the bulk of our data collection');
					var article_table = $(this);

					$(article_table).find('tr').each(function(index) {
						// Switch for each TR in this article table.
						switch(index) {

								// No. Element. Rarity. Max lvl. Cost
							case 1: 
								$(this).find('td').each(function(index){
									// Switch to handle each TD in the row.
									// We use this to assign values to our JSON object
									switch(index) {

											// Character ID
										case 0:
											json.character_id = parseInt($(this).text());
											break;

											// Element Type
										case 1:
											json.element = $(this).text().trim();
											break;

											// Rarity (count characters, convert to int)
										case 2:
											json.rarity = $(this).text().trim().length;
											break;

											// Max Level
										case 3:
											json.max_lvl = parseInt($(this).text());
											break;

											// Cost
										case 4:
											json.cost = parseInt($(this).text());
											break;


									}
								});
								break;

								// Lord HP, Lord ATK, Lord DEF, Lord REC
							case 5:
								$(this).find('td').each(function(index) {
									switch(index) {

											// HP
										case 1:
											json.hp_lord = parseInt($(this).text().replace(/\,/g, ''));
											break;
											// ATK
										case 2:
											json.atk_lord = parseInt($(this).text().replace(/\,/g, ''));
											break;
											// DEF
										case 3:
											json.def_lord = parseInt($(this).text().replace(/\,/g, ''));
											break;
											// REC
										case 4:
											json.rec_lord = parseInt($(this).text().replace(/\,/g, ''));
											break;
									}
								});
								break;

								// Anima HP, ATK, DEF, REC
							case 6:
								$(this).find('td').each(function(index) {
									switch(index) {

											// HP
										case 1:
											console.log(parseInt($(this).text().replace(/\,/g, '')));
											json.hp_anima = parseInt($(this).text().replace(/\,/g, ''));
											break;
											// ATK
										case 2:
											json.atk_anima = parseInt($(this).text().replace(/\,/g, ''));
											break;
											// DEF
										case 3:
											json.def_anima = parseInt($(this).text().replace(/\,/g, ''));
											break;
											// REC
										case 4:
											json.rec_anima = parseInt($(this).text().replace(/\,/g, ''));
											break;
									}
								});
								break;

								// Breaker HP, Lord ATK, Lord DEF, Lord REC
							case 7:
								$(this).find('td').each(function(index) {
									switch(index) {

											// HP
										case 1:
											json.hp_breaker = parseInt($(this).text().replace(/\,/g, ''));
											break;
											// ATK
										case 2:
											json.atk_breaker = parseInt($(this).text().replace(/\,/g, ''));
											break;
											// DEF
										case 3:
											json.def_breaker = parseInt($(this).text().replace(/\,/g, ''));
											break;
											// REC
										case 4:
											json.rec_breaker = parseInt($(this).text().replace(/\,/g, ''));
											break;
									}
								});
								break;

								// Guardian HP, Lord ATK, Lord DEF, Lord REC
							case 8:
								$(this).find('td').each(function(index) {
									switch(index) {

											// HP
										case 1:
											json.hp_guardian = parseInt($(this).text().replace(/\,/g, ''));
											break;
											// ATK
										case 2:
											json.atk_guardian = parseInt($(this).text().replace(/\,/g, ''));
											break;
											// DEF
										case 3:
											json.def_guardian = parseInt($(this).text().replace(/\,/g, ''));
											break;
											// REC
										case 4:
											json.rec_guardian = parseInt($(this).text().replace(/\,/g, ''));
											break;
									}
								});
								break;

								// Oracle HP, Lord ATK, Lord DEF, Lord REC
							case 9:
								$(this).find('td').each(function(index) {
									switch(index) {

											// HP
										case 1:
											json.hp_oracle = parseInt($(this).text().replace(/\,/g, ''));
											break;
											// ATK
										case 2:
											json.atk_oracle = parseInt($(this).text().replace(/\,/g, ''));
											break;
											// DEF
										case 3:
											json.def_oracle = parseInt($(this).text().replace(/\,/g, ''));
											break;
											// REC
										case 4:
											json.rec_oracle = parseInt($(this).text().replace(/\,/g, ''));
											break;
									}
								});
								break;

								// Leader Skill Name
							case 12:
								$(this).find('td').each(function(index) {
									switch(index) {

											// Leader Skill Name
										case 0:
											json.leader_skill_name = justText($(this));
											break;

									}
								});
								break;

								// Leader Skill
							case 13:
								$(this).find('td').each(function(index) {
									switch(index) {

											// Leader Skill
										case 0:
											//var leader_skill_data = justText($(this));
											//console.log(leader_skill_data);
											json.leader_skill = justText($(this));
											break;

									}
								});
								break;

								// BB Skill Name
							case 15:
								$(this).find('td').each(function(index) {
									switch(index) {

											// Leader Skill
										case 0:
											json.bb_skill_name = justText($(this));
											break;

									}
								});
								break;

								// BB Skill
							case 16:
								$(this).find('td').each(function(index) {
									switch(index) {

											// BB Skill
										case 0:
											json.bb_skill = justText($(this), 'bb');
											break;

									}
								});
								break;

								// SBB Skill Name
							case 18:
								$(this).find('td').each(function(index) {
									switch(index) {

											// BB Skill
										case 0:
											json.sbb_skill_name = justText($(this));
											break;

									}
								});
								break;

								// SBB Skill 
							case 19:
								$(this).find('td').each(function(index) {
									switch(index) {

											// BB Skill
										case 0:
											json.sbb_skill = justText($(this), 'sbb');
											break;

									}
								});
								break;







						}
						//var array = td.text();
						//console.log(array);

						//console.log(index + ' is the row index');
						//console.log(tr.children().first().text());

						//console.log(cell);
						//console.log(data.children().first().parseInt(data.innerHTML()));

					});

					//console.log(index);


				}
			});


			//$('.wiki-table').filter(function(){
			//var data = $(this);


			//console.log(data);
			////title = data.children().first().text();
			////release = data.children().last().children().text();

			////json.title = title;
			////json.release = release;
			//})

			$('.star-box-giga-star').filter(function(){
				//var data = $(this);
				//rating = data.text();

				//json.rating = rating;
			});
		}

		fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
			console.log('File successfully written! - Check your project directory for the output.json file');
		})

		res.send('Check your console!')
	})
})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app; 	
