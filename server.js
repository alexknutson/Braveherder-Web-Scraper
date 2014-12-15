var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrapeUnits', function(req, res){
	// Let's scrape Brave Frontier Units from Wikia!
		url = 'http://bravefrontierglobal.wikia.com/wiki/Frost_Queen_Stya';
	
		request(url, function(error, response, html){
			//console.log(response);
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
				var getAbilityDetails = function (spanContainer) {
					$(spanContainer).parent().siblings().find('span').each(function(){
					var abilityTitle = $(this).attr('title');
					$(this).after(' (' + abilityTitle + ')');
					});	
				}
	
				// Stats Header
				var json = { name : "", character_id : "", element : "", rarity : "", max_lvl : "", cost : "", gender: "", series: "", evo_1: "", evo_2: "", evo_3: "", evo_4: "", evo_5: "", evo_cost: "", hp_base: "", atk_base: "", def_base: "", rec_base: "", hp_lord: "", atk_lord: "", def_lord: "", rec_lord: "", hp_anima: "", atk_anima: "", def_anima: "", rec_anima: "", hp_breaker: "", atk_breaker: "", def_breaker: "", rec_breaker: "", hp_guardian: "", atk_guardian: "", def_guardian: "", rec_guardian: "", hp_oracle: "", atk_oracle: "", def_oracle: "", rec_oracle: "", leader_skill_name: "", leader_skill: "",  bb_skill_name: "", bb_skill: "", sbb_skill_name: "", sbb_skill: "", bb_fill: "", sbb_fill: "", bb_hits: "", sbb_hits: "", hits: "", icon: "", image: "", how_to_obtain: {}};
	
				var i=0;
				var main_content = $("div [style*='max-width:900px']");

				var test = $(main_content).children();
				$("div [style*='max-width:900px']").children().each(function(index){
					$(this).attr('id', 'unit-info-' + index);
				});
				//console.log($('#unit-info-0'));
				
				// First wrapper that contains unit data (Name, Element, etc)
				json.name = $('#unit-info-0').find('b').first().text().trim();
				json.character_id = parseInt($('#unit-info-0').find("th:contains('No.')").next().text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.element = $('#unit-info-0').find("th:contains('Element')").next().text().trim();
				json.gender = $('#unit-info-0').find("th:contains('Gender')").next().text().trim();
				json.rarity = parseInt($('#unit-info-0').find("th:contains('Rarity')").next().children().children().length);
				json.max_lvl = parseInt($('#unit-info-0').find("th:contains('Max Lv.')").next().text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.cost = parseInt($('#unit-info-0').find("th:contains('Cost')").next().text().trim().replace(/[^\d\.]/gi, ""), 10);
				// Hit Counts
				json.hits = parseInt($('#unit-info-0').find("th:contains('Normal')").next().text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.bb_hits = parseInt($('#unit-info-0').find("th:contains('Normal')").parent().next().children().first().next().text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.bb_fill = parseInt($('#unit-info-0').find("th:contains('Normal')").parent().next().children().first().next().next().text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.sbb_hits = parseInt($('#unit-info-0').find("th:contains('SBB')").next().text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.sbb_fill = parseInt($('#unit-info-0').find("th:contains('SBB')").next().next().text().trim().replace(/[^\d\.]/gi, ""), 10);
				
				// Second wrapper (The Image)
				var imageURL = $('#unit-info-1').find('a').first().attr('href');
				// Remove extra query markup from image url
				json.image = imageURL.substring(0, imageURL.indexOf('?')).replace('/revision/latest', '');
				
				// Icon
				var iconURL = $('a[title="' + json.name + '"]').find('img').first().attr('data-src');
				json.icon = iconURL.substring(0, imageURL.indexOf('?')).replace('/revision/latest', '');
				console.log(json.icon);
				//json.icon = $(icon).find('img').attr('src');
				//console.log(json.icon);
				
				// Third wrapper (Stats, BB/SBB Names, etc)
				var statsTable = $('#unit-info-2');
				// Base Stats
				json.hp_base = parseInt($(statsTable).find('tr').eq(1).find('td').eq(0).text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.atk_base = parseInt($(statsTable).find('tr').eq(1).find('td').eq(1).text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.def_base = parseInt($(statsTable).find('tr').eq(1).find('td').eq(2).text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.rec_base = parseInt($(statsTable).find('tr').eq(1).find('td').eq(3).text().trim().replace(/[^\d\.]/gi, ""), 10);
				// Lord Stats
				json.hp_lord = parseInt($(statsTable).find('tr').eq(2).find('td').eq(0).text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.atk_lord = parseInt($(statsTable).find('tr').eq(2).find('td').eq(1).text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.def_lord = parseInt($(statsTable).find('tr').eq(2).find('td').eq(2).text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.rec_lord = parseInt($(statsTable).find('tr').eq(2).find('td').eq(3).text().trim().replace(/[^\d\.]/gi, ""), 10);
				// Anima Stats
				json.hp_anima = parseInt($(statsTable).find('tr').eq(3).find('td').eq(0).text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.atk_anima = parseInt($(statsTable).find('tr').eq(3).find('td').eq(1).text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.def_anima = parseInt($(statsTable).find('tr').eq(3).find('td').eq(2).text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.rec_anima = parseInt($(statsTable).find('tr').eq(3).find('td').eq(3).text().trim().replace(/[^\d\.]/gi, ""), 10);
				// Breaker Stats
				json.hp_breaker = parseInt($(statsTable).find('tr').eq(4).find('td').eq(0).text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.atk_breaker = parseInt($(statsTable).find('tr').eq(4).find('td').eq(1).text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.def_breaker = parseInt($(statsTable).find('tr').eq(4).find('td').eq(2).text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.rec_breaker = parseInt($(statsTable).find('tr').eq(4).find('td').eq(3).text().trim().replace(/[^\d\.]/gi, ""), 10);
				// Guardian Stats
				json.hp_guardian = parseInt($(statsTable).find('tr').eq(5).find('td').eq(0).text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.atk_guardian = parseInt($(statsTable).find('tr').eq(5).find('td').eq(1).text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.def_guardian = parseInt($(statsTable).find('tr').eq(5).find('td').eq(2).text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.rec_guardian = parseInt($(statsTable).find('tr').eq(5).find('td').eq(3).text().trim().replace(/[^\d\.]/gi, ""), 10);
				// Oracle Stats
				json.hp_oracle = parseInt($(statsTable).find('tr').eq(6).find('td').eq(0).text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.atk_oracle = parseInt($(statsTable).find('tr').eq(6).find('td').eq(1).text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.def_oracle = parseInt($(statsTable).find('tr').eq(6).find('td').eq(2).text().trim().replace(/[^\d\.]/gi, ""), 10);
				json.rec_oracle = parseInt($(statsTable).find('tr').eq(6).find('td').eq(3).text().trim().replace(/[^\d\.]/gi, ""), 10);
				
				// Leader Skill
				json.leader_skill_name = $(statsTable).find("b:contains('Leader Skill:')").text().replace('Leader Skill:', '').trim();
				// BB Skill
				json.bb_skill_name = $(statsTable).find("b:contains('Brave Burst:')").text().replace('Brave Burst:', '').trim();
				// SBB Skill
				json.sbb_skill_name = $(statsTable).find("b:contains('Super BB:')").text().replace('Super BB:', '').trim();
				// Extract Span Text
				getAbilityDetails($("b:contains('Leader Skill:')"));
				getAbilityDetails($("b:contains('Brave Burst:')"));
				getAbilityDetails($("b:contains('Super BB:')"));
				json.leader_skill = $(statsTable).find("b:contains('Leader Skill:')").parent().siblings().text().trim();
				json.bb_skill = $(statsTable).find("b:contains('Brave Burst:')").parent().siblings().text().trim();
				json.sbb_skill = $(statsTable).find("b:contains('Super BB:')").parent().siblings().text().trim();
				
				// Cost to Upgrade
				json.evo_cost = parseInt($(statsTable).find("th:contains('Cost')").siblings().find('div').eq(0).text().trim().replace(/[^\d\.]/gi, ""), 10);
				// Evolution Materials
				json.evo_1 = $(statsTable).find("th:contains('Cost')").siblings().find('a').eq(0).attr('title');
				json.evo_2 = $(statsTable).find("th:contains('Cost')").siblings().find('a').eq(1).attr('title');
				json.evo_3 = $(statsTable).find("th:contains('Cost')").siblings().find('a').eq(2).attr('title');
				json.evo_4 = $(statsTable).find("th:contains('Cost')").siblings().find('a').eq(3).attr('title');
				json.evo_5 = $(statsTable).find("th:contains('Cost')").siblings().find('a').eq(4).attr('title');
				
				// Series (we use the first unit to decide what the name of the series is).
				json.series = $(statsTable).find("th:contains('Chain')").siblings().find('a').eq(0).attr('title');
				
				// How to Obtain
				var obtainList = $('#unit-info-3');
				$(obtainList).find('li').each(function (index) {
					var description = $(this).text().trim();
					var obtainURL = 'http://bravefrontierglobal.wikia.com' + $(this).find('a').attr('href');
					if (typeof $(this).find('a').attr('href') !== "undefined") {
					json.how_to_obtain[index] = { how: description, url: obtainURL };
					} else {
						json.how_to_obtain[index] = { how: description };
					}
				});
				
				// DATA cleanup
				// If no evo material, set 'None' for that value.
				if (typeof json.evo_1 == "undefined")  { json.evo_1 = 'None'; }
				if (typeof json.evo_2 == "undefined")  { json.evo_2 = 'None'; }
				if (typeof json.evo_3 == "undefined")  { json.evo_3 = 'None'; }
				if (typeof json.evo_4 == "undefined")  { json.evo_4 = 'None'; }
				if (typeof json.evo_5 == "undefined")  { json.evo_5 = 'None'; }
				
				if (json.leader_skill_name == "")  { json.leader_skill_name = 'None'; }
				if (json.leader_skill == "")  { json.leader_skill = 'None'; }
				if (json.bb_skill_name == "")  { json.bb_skill_name = 'None'; }
				if (json.bb_skill == "")  { json.bb_skill = 'None'; }
				if (json.sbb_skill_name == "")  { json.sbb_skill_name = 'None'; }
				if (json.sbb_skill == "")  { json.sbb_skill = 'None'; }
			}
	
			fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
				console.log('File successfully written! - Check your project directory for the output.json file');
			})
	
			res.send($.html())
		})
});

app.get('/scrapeQuests', function(req, res){

//	var quest_worlds = ['Mistral', 'Morgan', 'St._Lamia', 'Cordelica', 'Amdahl', 'Encervis', 'Palmyna', 'Lizeria', 'Ryvern', 'Agni', 'Mirvana', 'Lanara', 'Vriksha'];
//
//	var quest_type = ['First', 'Fire', 'Water', 'Earth', 'Thunder', 'Light', 'Dark', 'Final', 'Bonus'];
//
//	var urls = [];
//
//
//	// Helper function to build a variety of URLs to hit with our scraper.
//	var urlBuilder = function(world, quest)	{
//		return 'http://bravefrontierglobal.wikia.com/wiki/' + world + ':' + quest + '?action=render';
//	}
//
//	//urls.push(urlBuilder(world, type));
//	total_counter = 0;
//
//
//	// Default Validated is TRUE. Only if the response HTML doesnt have the right elements does this fail.
//	var url_validated = true;
//
//	// Multiple Quests
//	quest_worlds.forEach(function(world){
//		quest_type.forEach(function(type){
//			// Build the URL we'll use for this scrape
//			var url = urlBuilder(world, type);
//
//			// Default Validated is TRUE. Only if the response HTML doesnt have the right elements does this fail.
//			var url_validated = true;
//
//			request(url, function(error, response, html){
//				//console.log(response);
//				if(!error){
//
//					// Load the response into Cheerio so we can parse stuff.
//					var $ = cheerio.load(html);
//					
//					// Stats Header
//					var json = { world: world, type: type, name: "", levels: {}, general_monsters: {}, general_drops: {} };
//					// We store the article table.
//					var $table = $('.article-table');
//
//					// Quest Name
//					json.name = $table.find('span').first().text().trim();
//
//					// ## MAIN VALIDATOR. Checks to make sure the $table exists. If not, we'll skip the fs.write
//					if ($table.length === 0) {
//						console.log('No quest page to scrape. Skipping this document');
//						url_validated = false;
//					}
//
//					// Genereral count.
//					var count = $table.children().length;
//
//					// Find each quest level and assign a class to identify it.
//					$table.children().each(function(index) {
//
//						if (index > 1) {
//							if ($(this).children().first().attr('scope') && $(this).children().first().text().trim() !== 'General Zone Details') {
//								$(this).addClass('level');
//								//console.log($($table).html());
//							}
//						}
//						if (index === count -1) {
//
//							json.total_levels = $('.level').length;
//
//							// We have all the levels. Lets add them to our JSON
//							$table.find('.level').each(function(index){
//
//								// Store index so we can reference it when we create object properties
//								var level_index = index;
//								// Monsters column
//								var $monsters = $(this).next().find('td').eq(0);
//								// Notes column
//								var $notes = $(this).next().find('td').eq(1);
//								// Rare Captures
//								var $rare_captures = $(this).next().find('td').eq(2);
//
//								// General Zone Monsters
//								var $general_monsters = $table.find(':contains(Monsters:)').next();
//								// General Zone Drops
//								var $general_drops = $table.children().last().find(':contains(Drops:)').next();
//
//
//								// Level Schema
//								json.levels[index] = { 
//									name: $(this).children().eq(0).text().trim(), 
//									energy: parseInt($(this).children().eq(1).text().trim().replace(/[^\d\.]/gi, ""), 10), 
//									battles: parseInt($(this).children().eq(2).text().trim().replace(/[^\d\.]/gi, ""), 10), 
//									exp: parseInt($(this).children().eq(3).text().trim().replace(/[^\d\.]/gi, ""), 10), 
//									ratio: parseFloat($(this).children().eq(4).text().trim()),
//								};
//								json.levels[index]['monsters'] = {};
//								json.levels[index]['notes'] = {};
//								json.levels[index]['rare_captures'] = {};
//								json.levels[index]['drops'] = {};
//
//								//console.log(json.levels);
//
//								// Assign monster data to the object
//								$monsters.find('b').each(function(index) {
//									//console.log($(this).next().html());
//									json.levels[level_index]['monsters'][index] = {
//										name: $(this).text().trim(),
//										hp: parseInt($(this).next().text().trim().replace(/[^\d\.]/gi, ""), 10),
//									};
//								});
//
//								// Assign notes data to the object
//								$notes.find('p').each(function(index){
//									if ($(this).text().trim() === 'Notes:') {
//										//json.levels[level_index]['notes'][index] = $(this).text().trim();
//										$(this).next('ul').find('li').each(function(index){
//											json.levels[level_index]['notes'][index] = $(this).text().trim();
//										});
//									} else if ($(this).text().trim() === 'Drops:') {
//										$(this).next('ul').find('a').each(function(index){
//											json.levels[level_index]['drops'][index] = $(this).text().trim();
//										});
//									}
//								});
//
//								// Assign rare captures data to the object
//								$rare_captures.find('b').each(function(index) {
//									json.levels[level_index]['rare_captures'][index] = {
//										name: $(this).text().trim(),
//										odds: parseInt($(this).next().text().trim().match(/\d+/)),
//									};
//								});
//								// Assign General Monster Details to the object
//								$general_monsters.find('a').each(function(index){ 
//									json.general_monsters[index] = $(this).text().trim();
//								});
//
//								// Assign General Drops Details to the object
//								$general_drops.find('a').each(function(index){
//									json.general_drops[index] = $(this).text().trim();
//								});
//							});	
//						}
//
//					});
//				}
//				if (url_validated == true) {
//					var random = Math.floor((Math.random() * 1000) + 1);;
//					fs.writeFile('world/' + world + '-' + type + '.json', JSON.stringify(json, null, 4), function(err){
//						console.log('File successfully written! - Check your project directory for the output.json file');
//						//total_counter++;
//					})
//				}
//
//				//res.send(html)
//			})
//
//		});
//	});


	// Single quest
	//url = 'http://bravefrontierglobal.wikia.com/wiki/Mistral:Earth?action=render';
//	request(url, function(error, response, html){
//		//console.log(response);
//		if(!error){
//
//			// Load the response into Cheerio so we can parse stuff.
//			var $ = cheerio.load(html);
//
//			// Stats Header
//			var json = { name: "", levels: {}, general_monsters: {}, general_drops: {} };
//
//			// We store the article table.
//			var $table = $('.article-table');
//
//			// Quest Name
//			json.name = $table.find('span').first().text().trim();
//
//			// ## MAIN VALIDATOR. Checks to make sure the $table exists. If not, we'll skip the fs.write
//			if ($table.length === 0) {
//				console.log('No quest page to scrape. Skipping this document');
//				url_validated = false;
//			}
//
//			// Genereral count.
//			var count = $table.children().length;
//
//			// Find each quest level and assign a class to identify it.
//			$table.children().each(function(index) {
//
//				if (index > 1) {
//					if ($(this).children().first().attr('scope') && $(this).children().first().text().trim() !== 'General Zone Details') {
//						$(this).addClass('level');
//						//console.log($($table).html());
//					}
//				}
//				if (index === count -1) {
//
//					json.total_levels = $('.level').length;
//
//					// We have all the levels. Lets add them to our JSON
//					$table.find('.level').each(function(index){
//
//						// Store index so we can reference it when we create object properties
//						var level_index = index;
//						// Monsters column
//						var $monsters = $(this).next().find('td').eq(0);
//						// Notes column
//						var $notes = $(this).next().find('td').eq(1);
//						// Rare Captures
//						var $rare_captures = $(this).next().find('td').eq(2);
//						// General Zone Monsters
//						var $general_monsters = $table.find(':contains(Monsters:)').next();
//						// General Zone Drops
//						var $general_drops = $table.children().last().find(':contains(Drops:)').next();
//
//						console.log($general_drops.html());
//
//						// Level Schema
//						json.levels[index] = { 
//							name: $(this).children().eq(0).text().trim(), 
//							energy: parseInt($(this).children().eq(1).text().trim().replace(/[^\d\.]/gi, ""), 10), 
//							battles: parseInt($(this).children().eq(2).text().trim().replace(/[^\d\.]/gi, ""), 10), 
//							exp: parseInt($(this).children().eq(3).text().trim().replace(/[^\d\.]/gi, ""), 10), 
//							ratio: parseFloat($(this).children().eq(4).text().trim()),
//						};
//						json.levels[index]['monsters'] = {};
//						json.levels[index]['notes'] = {};
//						json.levels[index]['rare_captures'] = {};
//						json.levels[index]['drops'] = {};
//
//						//console.log(json.levels);
//
//						// Assign monster data to the object
//						$monsters.find('b').each(function(index) {
//							//console.log($(this).next().html());
//							json.levels[level_index]['monsters'][index] = {
//								name: $(this).text().trim(),
//								hp: parseInt($(this).next().text().trim().replace(/[^\d\.]/gi, ""), 10),
//							};
//						});
//
//						// Assign notes data to the object
//						$notes.find('p').each(function(index){
//							if ($(this).text().trim() === 'Notes:') {
//								//json.levels[level_index]['notes'][index] = $(this).text().trim();
//								$(this).next('ul').find('li').each(function(index){
//									json.levels[level_index]['notes'][index] = $(this).text().trim();
//								});
//							} else if ($(this).text().trim() === 'Drops:') {
//								$(this).next('ul').find('a').each(function(index){
//									json.levels[level_index]['drops'][index] = $(this).text().trim();
//								});
//							}
//						});
//
//						// Assign rare captures data to the object
//						$rare_captures.find('b').each(function(index) {
//							json.levels[level_index]['rare_captures'][index] = {
//								name: $(this).text().trim(),
//								odds: parseInt($(this).next().text().trim().match(/\d+/)),
//							};
//						});
//
//						// Assign General Monster Details to the object
//						$general_monsters.find('a').each(function(index){ 
//							json.general_monsters[index] = $(this).text().trim();
//						});
//
//						// Assign General Drops Details to the object
//						$general_drops.find('a').each(function(index){
//							json.general_drops[index] = $(this).text().trim();
//						});
//
//					});	
//				}
//
//			});
//		}
//		if (url_validated == true) {
//			fs.writeFile('output-quests.json', JSON.stringify(json, null, 4), function(err){
//				console.log('File successfully written! - Check your project directory for the output.json file');
//				total_counter++;
//			})
//		}
//
//		res.send(html)
//	})

	//urls.push(urlBuilder(world, type));
	//console.log(urls);



});

app.listen('8081');
console.log('Magic happens on port 8081');
exports = module.exports = app; 	
