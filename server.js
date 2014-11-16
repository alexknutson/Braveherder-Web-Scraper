var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrapeUnits', function(req, res){
	// Let's scrape Anchorman 2
	//	url = 'http://bravefrontierglobal.wikia.com/wiki/Rainbow_Angel_Yujeh';
	//
	//	request(url, function(error, response, html){
	//		//console.log(response);
	//		if(!error){
	//			var $ = cheerio.load(html);
	//
	//			// HELPERS
	//			var setUnitBBFill = function(div_text, row_type) {
	//				if (row_type === 'bb') {
	//					console.log('This is the BB row. Set the BB fill rate');
	//					json.bb_fill = div_text;
	//					delete row_type;
	//				} else if (row_type === 'sbb') {
	//					console.log('This is the BB row. Set the SBB fill rate');
	//					// We need to do some more work to strip the undesired 'BC' text
	//					json.sbb_fill = div_text;
	//					delete row_type;
	//				}
	//			}
	//
	//			// Stats Header
	//			var json = { name : "", character_id : "", element : "", rarity : "", max_lvl : "", cost : "", gender: "", hp_lord: "", atk_lord: "", def_lord: "", rec_lord: "", hp_anima: "", atk_anima: "", def_anima: "", rec_anima: "", hp_breaker: "", atk_breaker: "", def_breaker: "", rec_breaker: "", hp_guardian: "", atk_guardian: "", def_guardian: "", rec_guardian: "", hp_oracle: "", atk_oracle: "", def_oracle: "", rec_oracle: "", leader_skill_name: "", leader_skill: "",  bb_skill_name: "", bb_skill: "", sbb_skill_name: "", sbb_skill: "", bb_fill: "", sbb_fill: "", hits: "", };
	//
	//			var i=0;
	//			var main_content = $(".article-table");
	//			//console.log($(main_content).html());
	//
	//			$(main_content + ' div').each(function(){
	//				i++;
	//				var newID='menu'+i;
	//				$(this).attr('id',newID);
	//				$(this).val(i);
	//			});
	//
	//
	//
	//		}
	//
	//		fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
	//			console.log('File successfully written! - Check your project directory for the output.json file');
	//		})
	//
	//		res.send(html)
	//	})
})

app.get('/scrapeQuests', function(req, res){

	url = 'http://bravefrontierglobal.wikia.com/wiki/Lizeria:Fire?action=render';

	request(url, function(error, response, html){
		//console.log(response);
		if(!error){
			var $ = cheerio.load(html);


			// Stats Header
			var json = { name: "", levels: {} };

			var $table = $('.article-table');

			// Quest Name
			json.name = $table.find('span').first().text().trim();

			var count = $table.children().length;

			// Find each quest level and assign a class to identify it.
			$table.children().each(function(index) {

				if (index > 1) {
					if ($(this).children().first().attr('scope') && $(this).children().first().text().trim() !== 'General Zone Details') {
						$(this).addClass('level');
						//console.log($($table).html());
					}
				}
				if (index === count -1) {

					json.total_levels = $('.level').length;

					// We have all the levels. Lets add them to our JSON
					$table.find('.level').each(function(index){

						// Store index so we can reference it when we create object properties
						var level_index = index;
						// Monsters column
						var $monsters = $(this).next().find('td').eq(0);
						// Notes column
						var $notes = $(this).next().find('td').eq(1);

						// Rare Captures
						var $rare_captures = $(this).next().find('td').eq(2);
						//console.log($notes.html());

						//console.log($details.html());

						// Level Schema
						json.levels[index] = { 
							name: $(this).children().eq(0).text().trim(), 
							energy: parseInt($(this).children().eq(1).text().trim()), 
							battles: parseInt($(this).children().eq(2).text().trim()), 
							exp: parseInt($(this).children().eq(3).text().trim()), 
							ratio: parseInt($(this).children().eq(4).text().trim()),
						};
						json.levels[index]['monsters'] = {};
						json.levels[index]['notes'] = {};
						json.levels[index]['rare_captures'] = {};
						json.levels[index]['drops'] = {};

						//console.log(json.levels);

						// Assign monster data to the object
						$monsters.find('b').each(function(index) {
							console.log($(this).next().html());
							json.levels[level_index]['monsters'][index] = {
								name: $(this).text().trim(),
								hp: parseInt($(this).next().text().trim().replace(/[^\d\.]/gi, ""), 10),
							};
						});

						// Assign notes data to the object
						$notes.find('p').each(function(index){
							if ($(this).text().trim() === 'Notes:') {
								//json.levels[level_index]['notes'][index] = $(this).text().trim();
																$(this).next('ul').find('li').each(function(index){
									json.levels[level_index]['notes'][index] = $(this).text().trim();
								});
							} else if ($(this).text().trim() === 'Drops:') {
								$(this).next('ul').find('li').each(function(index){
									json.levels[level_index]['drops'][index] = $(this).text().trim();
								});
							}
						});

						// Assign drops data to the object
						//						$notes.find('ul').eq(1).find('li').each(function(index){
						//							json.levels[level_index]['drops'][index] = $(this).text().trim();
						//						});

						// Assign rare captures data to the object
						$rare_captures.find('b').each(function(index) {
							json.levels[level_index]['rare_captures'][index] = {
								name: $(this).text().trim(),
								odds: parseInt($(this).next().text().trim().match(/\d+/)),
							};
						});





						// Monsters
						//					var monsters = [];
						//					//console.log($details.first('td').find('div b').text());
						//						
						//					json.levels[index]['monsters'] = {
						//						names: $details.first('td').find('div b').first().text(),
						//					};

						//						$(this).children().each(function(index){
						//							//console.log(index);
						//
						//							switch(index) {
						//								case 0:
						//									json.levels[index].name = $(this).text().trim();
						//									
						//									//console.log($(this).html());
						//									break;
						//								case 1:
						//											json.levels[index].name = $(this).text().trim();
						//									break;
						//								case 2:
						//											json.levels[index].name = $(this).text().trim();
						//									break;
						//								case 3:
						//											json.levels[index].name = $(this).text().trim();
						//									break;
						//
						//							}
						//							//console.log($(this).text());
						//						});







						//console.log($(this).html());
					});	
				}

			});

			//console.log($table.find('.level').html());

			//console.log($table.find('th').first().html());


		}

		fs.writeFile('output-quests.json', JSON.stringify(json, null, 4), function(err){
			console.log('File successfully written! - Check your project directory for the output.json file');
		})

		res.send(html)
	})

})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app; 	
