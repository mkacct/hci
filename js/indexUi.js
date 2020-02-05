'use strict';

let langName;

$(document).ready(function() {
	$('#langName').val(lsGet('langName', 'HQ9+'));
	langName = $('#langName').val().toUpperCase();
	$('#code').val(lsGet('code', ''));
	$('#input').val('');
	$(window).on('beforeunload', function(e) {lsSet('code', $('#code').val());});
	$('#langName').on('input', function(e) {
		$('#langName').val($('#langName').val().toUpperCase());
	});
	$('#langName').on('change', function(e) {
		$('#langName').val($.trim($('#langName').val().toUpperCase()));
		if (parseLangName($('#langName').val()).length > 0) {
			langName = $('#langName').val().toUpperCase();
			lsSet('langName', langName);
		} else {
			$('#langName').val(langName);
			toast('Invalid language name', 2000);
		}
	});
	$('#code').on('change', function(e) {lsSet('code', $('#code').val());});
	$('#code, #input').on('keydown', function(e) {
		if (e.ctrlKey && e.keyCode == 13) {run();}
	});
	$('#runButton').on('click', run);
	$('#helpButton').on('click', function() {openModal('#helpModal');});
	$('#aboutButton').on('click', function() {openModal('#aboutModal');});
	$('#runButton, #helpButton, #aboutButton').attr('disabled', false);
});

function run() {
	$('#output').empty();
	let instrs = parseLangName(langName);
	if (instrs.length == 0) {throw 'How irresponsible of you';} // this shouldn't happen
	let prog = $('#code').val();
	let input = $('#input').val();
	if (checkSyntax(prog, instrs)) {
		try {
			interpret(prog, instrs, input);
		} catch (err) {
			if (err.stack) {
				error(err.stack);
			} else {
				error(err);
			}
		}
	} else {
		toast('<i class="fas fa-exclamation-triangle"></i>Syntax error', 2000);
	}
}

function print(s, isError) {
	s = s.toString();
	if (s == '') {s = '\u200b';}
	let el = $('<li></li>').text(s);
	if (isError) {el.addClass('errorLog');}
	$('#output').append(el);
	$('#output').scrollTop($('#output')[0].scrollHeight);
}

function error(s) {print(s, true);}