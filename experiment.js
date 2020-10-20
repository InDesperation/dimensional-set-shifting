/* ************************************ */
/* Define helper functions */
/* ************************************ */
function evalAttentionChecks() {
	var check_percent = 1
	if (run_attention_checks) {
		var attention_check_trials = jsPsych.data.getTrialsOfType('attention-check')
		var checks_passed = 0
		for (var i = 0; i < attention_check_trials.length; i++) {
			if (attention_check_trials[i].correct === true) {
				checks_passed += 1
			}
		}
		check_percent = checks_passed / attention_check_trials.length
	}
	return check_percent
}

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = "center-block-text">' +
		feedback_instruct_text + '</p></div>'
}

function get_stim() {
	/* This function takes the stim (either 2 in one dimension, or 4, 2 from each of the 2 dimensions), pairs them together
	(if necessary, as in the 2 dimension conditions) and displays them in random boxes
	*/
	if (stims.length == 2) {
		stim1 = stims[0]
		stim2 = stims[1]
	} else if (stims.length == 4) {
		if (Math.random() < 0.5 || version2_repeat >= 3 && version1_repeat < 3) {
			stim1 = stims[0] + stims[2]
			stim2 = stims[1] + stims[3]
			version2_repeat = 0
			version1_repeat += 1
		} else {
			stim1 = stims[0] + stims[3]
			stim2 = stims[1] + stims[2]
			version2_repeat += 1
			version1_repeat = 0
		}
	}
	if (reversal === false) {
		target = stim1
	} else {
		target = stim2
	}
	contents = jsPsych.randomization.shuffle(['', '', stim1, stim2])
	stim = '<div class = leftbox>' + contents[0] + '</div><div class = topbox>' + contents[1] +
		'</div><div class = rightbox>' + contents[2] + '</div><div class = bottombox>' + contents[3] +
		'</div>'
	return stim
}

function get_correct_response() {
	return responses[contents.indexOf(target)]
}

function get_data() {
	return {
		trial_id: 'stim',
		exp_stage: 'test',
		condition: stages[stage_counter]
	}
}



/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = false
var attention_check_thresh = 0.65
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds

// task specific variables
// Set up task variables
var responses = [37, 38, 39, 40]
var blocks = ['simple'] //Simple: 1 dimension alone, separate: 2 dimensions side-by-side, compound: overlapping
//'separate', 'compound', 'ID', 'ED'
var stages = ['simple', 'simple_rev']

// ,'separate', 'compound', 'compound_rev', 'ID', 'ID_rev', 'ED', 'ED_rev'

// Set up variables for stimuli
var path = 'images/'
var center_prefix = '<div class = centerimg><img style="height: 80%; width: auto; '
var left_prefix = '<div class = leftimg><img style="height: 80%; width: auto; '
var right_prefix = '<div class = rightimg><img style="height: 80%; width: auto; '
var postfix = '"</img></div>'
var shape_stim = jsPsych.randomization.shuffle(['Animal_9.png', 'Animal_10.png', 'Animal_11.png',
	'Animal_12.png', 'Animal_13.png', 'Animal_14.png', 'Animal_15.png', 'Animal_16.png'
])
var line_stim = jsPsych.randomization.shuffle(['Animal_1.png', 'Animal_2.png', 'Animal_3.png',
	'Animal_4.png', 'Animal_5.png', 'Animal_6.png', 'Animal_7.png', 'Animal_8.png'
])
if (Math.random() < 0.5) {
	var Dim1_stim = shape_stim
	var Dim2_stim = line_stim
	var Dim1_z = 'z-index: 1;" src = "'
	var Dim2_z = 'z-index: 2;" src = "'
} else {
	var Dim1_stim = line_stim
	var Dim2_stim = shape_stim
	var Dim1_z = 'z-index: 2;" src = "'
	var Dim2_z = 'z-index: 1;" src = "'
}

//instruction stim
var instruction_stim = '<div class = leftbox>' + center_prefix + Dim1_z + path + Dim1_stim[6] +
	postfix + '</div><div class = topbox>' + center_prefix + Dim1_z + path + Dim1_stim[7] + postfix +
	'</div><div class = rightbox></div><div class = bottombox></div>'

//initialize global variables used by functions
var contents = [] //holds content of each box (left, up, right, down)
var correct_counter = 0 // tracks number of correct choices in each stage
var stage_counter = 0 // tracks number of stages
var trial_counter = 0 // tracks trials in each stage
var stage_over = 0 // when this variable equals 1 the experiment transitions to the next stage
var target = '' // target is one of the stims
var stims = []
var reversal = false
var version1_repeat = 0
var version2_repeat = 0


/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
// Set up attention check node
var attention_check_block = {
	type: 'attention-check',
	timing_response: 180000,
	response_ends_trial: true,
	timing_post_trial: 200
}

var attention_node = {
	timeline: [attention_check_block],
	conditional_function: function() {
		return run_attention_checks
	}
}

//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       trial_id: "post task questions"
   },
	questions: ['<p class = center-block-text style = "font-size: 20px">Кратко опишите, что вас просили сделать в этой задаче.</p>',
				'<p class = center-block-text style = "font-size: 20px">Есть ли у вас комментарии по поводу этой задачи?</p>'],
   rows: [15, 15],
   columns: [60,60]
};

/* define static blocks */
var feedback_instruct_text = 'Добро пожаловать. Нажмите <strong>Enter</strong>, чтобы начать.';
var feedback_instruct_block = {
	type: 'poldrack-text',
	data: {
		trial_id: 'instruction'
	},
	cont_key: [13],
	text: getInstructFeedback,
	timing_post_trial: 0,
	timing_response: 180000
};
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
	type: 'poldrack-instructions',
	data: {
		trial_id: 'instruction'
	},
	pages: [
		'<div class = centerbox><p class = "block-text">В этом задании ты увидишь две картинки животных, помещенных в два из четырех окошек на экране. Компьютер загадал одного из них, а тебе нужно угадать, кого именно. Для этого нажимай на клавиатуре кнопку со стрелкой, соответствующую окошку, в котором находится выбранное тобой животное (влево, вправо, вверх или вниз).</p><p class = "block-text">Если ты правильно выбрал животное и окошко, в котором оно сейчас появилось, компьютер ответит “Верно”, если загаданное им животное в другом окошке, ответит “Неверно”. Животные могут перемещаться в разные окошки, поэтому старайся понять какое же животное загадал компьютер. Когда компьютеру станет ясно, что ты знаешь, кого он загадал, компьютер выберет другое животное, поэтому следи за его ответами в центре.</p></div>',
		instruction_stim +
		'<div class = betweenStimBox><div class = "center-text">Пример.</div></div>',
		'<div class = centerbox><p class = "block-text">Еще раз, если ты правильно выбрал животное и окошко, в котором оно сейчас появилось, компьютер ответит “Верно”, если загаданное им животное в другом окошке, ответит “Неверно”. Когда компьютеру станет ясно, что ты знаешь, кого он загадал, компьютер выберет другое животное, поэтому следи за его ответами в центре.</p></div>'
	],
	allow_keys: false,
	show_clickable_nav: true,
	timing_post_trial: 1000
};

var instruction_node = {
	timeline: [feedback_instruct_block, instructions_block],
	/* This function defines stopping criteria */
	loop_function: function(data) {
		for (i = 0; i < data.length; i++) {
			if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
				rt = data[i].rt
				sumInstructTime = sumInstructTime + rt
			}
		}
		if (sumInstructTime <= instructTimeThresh * 1000) {
			feedback_instruct_text =
				'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.'
			return true
		} else if (sumInstructTime > instructTimeThresh * 1000) {
			feedback_instruct_text = 'Done with instructions. Press <strong>enter</strong> to continue.'
			return false
		}
	}
}

var end_block = {
	type: 'poldrack-text',
	timing_response: 180000,
	data: {
		trial_id: "end",
		exp_id: 'dimensional_set_shifting'
	},
	text: '<div class = centerbox><p class = "center-block-text">Спасибо! Нажмите <strong>Enter</strong>, чтобы продолжить.</p></div>',
	cont_key: [13],
	timing_post_trial: 0
};

var fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation"
	},
	timing_post_trial: 500,
	timing_stim: 500,
	timing_response: 500
}

var define_simple_stims = {
	type: 'call-function',
	data: {
		trial_id: "define_simple_stims"
	},
	func: function() {
		var Dim1_stim1 = center_prefix + Dim1_z + path + Dim1_stim[0] + postfix
		var Dim1_stim2 = center_prefix + Dim1_z + path + Dim1_stim[1] + postfix
		stims = [Dim1_stim1, Dim1_stim2]
	},
	timing_post_trial: 0
}

var define_separate_stims = {
	type: 'call-function',
	data: {
		trial_id: "define_separate_stims"
	},
	func: function() {
		var Dim1_stim1 = left_prefix + Dim1_z + path + Dim1_stim[0] + postfix
		var Dim1_stim2 = left_prefix + Dim1_z + path + Dim1_stim[1] + postfix
		var Dim2_stim1 = right_prefix + Dim2_z + path + Dim2_stim[0] + postfix
		var Dim2_stim2 = right_prefix + Dim2_z + path + Dim2_stim[1] + postfix
		stims = [Dim1_stim1, Dim1_stim2, Dim2_stim1, Dim2_stim2]
	},
	timing_post_trial: 0
}

var define_compound_stims = {
	type: 'call-function',
	data: {
		trial_id: "define_compound_stims"
	},
	func: function() {
		var Dim1_stim1 = center_prefix + Dim1_z + path + Dim1_stim[0] + postfix
		var Dim1_stim2 = center_prefix + Dim1_z + path + Dim1_stim[1] + postfix
		var Dim2_stim1 = center_prefix + Dim2_z + path + Dim2_stim[0] + postfix
		var Dim2_stim2 = center_prefix + Dim2_z + path + Dim2_stim[1] + postfix
		stims = [Dim1_stim1, Dim1_stim2, Dim2_stim1, Dim2_stim2]
	},
	timing_post_trial: 0
}

var define_ID_stims = {
	type: 'call-function',
	data: {
		trial_id: "define_ID_stims"
	},
	func: function() {
		var Dim1_stim1 = center_prefix + Dim1_z + path + Dim1_stim[2] + postfix
		var Dim1_stim2 = center_prefix + Dim1_z + path + Dim1_stim[3] + postfix
		var Dim2_stim1 = center_prefix + Dim2_z + path + Dim2_stim[2] + postfix
		var Dim2_stim2 = center_prefix + Dim2_z + path + Dim2_stim[3] + postfix
		stims = [Dim1_stim1, Dim1_stim2, Dim2_stim1, Dim2_stim2]
	},
	timing_post_trial: 0
}

var define_ED_stims = {
	type: 'call-function',
	data: {
		trial_id: "define_ED_stims"
	},
	func: function() {
		var Dim1_stim1 = center_prefix + Dim1_z + path + Dim1_stim[4] + postfix
		var Dim1_stim2 = center_prefix + Dim1_z + path + Dim1_stim[5] + postfix
		var Dim2_stim1 = center_prefix + Dim2_z + path + Dim2_stim[4] + postfix
		var Dim2_stim2 = center_prefix + Dim2_z + path + Dim2_stim[5] + postfix
		stims = [Dim2_stim1, Dim2_stim2, Dim1_stim1, Dim1_stim2]
	},
	timing_post_trial: 0
}

var reverse_stims = {
	type: 'call-function',
	data: {
		trial_id: "reverse_stims"
	},
	func: function() {
		reversal = !reversal
	},
	timing_post_trial: 0
}

var outro_test_block = {
	type: 'poldrack-text',
	is_html: true,
	data: {
		trial_id: "test_outro"
	},
	timing_stim: 2000,
	timing_response: 2000,
	timing_post_trial: 0,
	text: '<div class = centerbox><div class="img-container"><img src="images/outro.jpg" alt="Молодец"></div></div>',
};

/* create experiment definition array */
dimensional_set_shifting_experiment = []
dimensional_set_shifting_experiment.push(instruction_node)
	/* define test trials */
for (b = 0; b < blocks.length; b++) {
	block = blocks[b]
	if (block == 'simple') {
		dimensional_set_shifting_experiment.push(define_simple_stims)
	} else if (block == 'separate') {
		dimensional_set_shifting_experiment.push(define_separate_stims)
	} else if (block == 'compound') {
		dimensional_set_shifting_experiment.push(define_compound_stims)
	} else if (block == 'ID') {
		dimensional_set_shifting_experiment.push(define_ID_stims)
	} else if (block == 'ED') {
		dimensional_set_shifting_experiment.push(define_ED_stims)
	}

	var stage_block = {
		type: 'poldrack-categorize',
		stimulus: get_stim,
		is_html: true,
		key_answer: get_correct_response,
		correct_text: '<div class = centerbox><div class = "center-text"><font size = 20>Верно</font></div></div>',
		incorrect_text: '<div class = centerbox><div class = "center-text"><font size = 20>Неверно</font></div></div>',
		choices: responses,
		timing_response: -1,
		timing_stim: -1,
		timing_feedback_duration: 500,
		show_stim_with_feedback: true,
		data: get_data,
		timing_post_trial: 100,
		on_finish: function(data) {
			trial_counter += 1
			if (data.correct === true) {
				correct_counter += 1
			} else {
				correct_counter = 0
			}
			if (correct_counter == 6 || trial_counter == 50) {
				stage_over = 1
			}
		}
	}
	var stage_node = {
		timeline: [fixation_block, stage_block],
		loop_function: function(data) {
			if (stage_over == 1) {
				stage_over = 0
				correct_counter = 0
				trial_counter = 0
				stage_counter += 1
				return false
			} else {
				return true
			}
		}
	}
	dimensional_set_shifting_experiment.push(stage_node)

	if (block != 'separate') {
		dimensional_set_shifting_experiment.push(reverse_stims)
		dimensional_set_shifting_experiment.push(stage_node)
	}
}
dimensional_set_shifting_experiment.push(outro_test_block)
dimensional_set_shifting_experiment.push(post_task_block)
dimensional_set_shifting_experiment.push(end_block)
