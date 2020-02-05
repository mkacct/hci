'use strict';

// check syntax and validate instrs first
function interpret(prog, instrs, input) {
	prog = prog.toLowerCase();
	if (instrs.indexOf('>') >= 0) {prog = twoDCompat(prog);} // > < ^ v
	let fish = instrs.indexOf('d') >= 0; // using deadfish
	let i = 0;
	let count = 0;
	while (i < prog.length) {
		if (fish && (count == -1 || count == 256)) {count = 0;} // deadfish tradition
		if (instrIs('h', prog, instrs, i)) {         // h
			print('Hello, world!');
		} else if (instrIs('q', prog, instrs, i)) {  // q
			print(prog);
		} else if (instrIs('9', prog, instrs, i)) {  // 9
			beer();
		} else if (instrIs('+', prog, instrs, i)) {  // +
			count++;
		} else if (instrIs('++', prog, instrs, i)) {  // ++
			count++;
			count++;
			let Thing = function() {};
			new Thing();
			i++;
		} else if (instrIs('-', prog, instrs, i)) {  // -
			if (i == 0) {
				console.log('If this is logged I messed up');
			} else if (prog[i - 1] == 'h') {
				throw 'I/O error';
			} else if (prog[i - 1] == 'q') {
				let recursion = function() {recursion();};
				recursion();
			} else if (prog[i - 1] == '9') {
				while (true) {};
			} else if (prog[i - 1] == '-') {
				count--;
			} else if (prog[i - 1] == '+') {
				if (prog[i - 2] == '+') {
					let Thing = function() {
						this.err = function() {throw new Error();}
					};
					try {
						new Thing().err();
					} catch(err) {} // this doesn't even need to do anything lol
				} else {
					1 / 0;
				}
			}
		} else if (instrIs('c', prog, instrs, i)) {  // c
			print(input);
		} else if (instrIs('i', prog, instrs, i)) {  // i
			if (fish) { // deadfish increment
				count++;
			} else { // interpret
				interpret(input, instrs, input);
			}
		} else if (instrIs('r', prog, instrs, i)) {  // r
			print(rot(input, 13));
		} else if (instrIs('s', prog, instrs, i)) {  // s
			if (fish) { // deadfish square
				count = Math.pow(count, 2);
			} else { // sort
				print(input.split('\n').sort().join('\n'));
			}
		} else if (instrIs('x', prog, instrs, i)) {  // x
			let rand = randomInt(0, 255);
			eval(prog.substring(i + 1).replace(/./g, function(c) {return String.fromCharCode(c.charCodeAt(0) + rand);}));
			i = prog.length;
		} else if (instrIs('<', prog, instrs, i)) {  // <
			if (prog[i - 1] && prog[i - 1] != '\n') {i--;};
			i--; // negate loop ++
		} else if (instrIs('^', prog, instrs, i)) {  // ^
			i = twoDMove(prog, i, false);
		} else if (instrIs('v', prog, instrs, i)) {  // v
			i = twoDMove(prog, i, true);
		} else if (instrIs('d', prog, instrs, i)) {  // d
			count--;
		} else if (instrIs('o', prog, instrs, i)) {  // o
			print(count);
		} else if (instrIs('k', prog, instrs, i)) {  // k
			i = prog.length;
		} else if (instrIs('dt', prog, instrs, i)) { // dt
			print(42);
		}
		i++;
	}
}

function beer() {
	let beerText = function(n, caps) {
		if (n < 0) {n = 99;}
		if (n == 0) {
			return (caps ? 'N' : 'n') + 'o more bottles';
		} else {
			return n + ' bottle' + (n == 1 ? '' : 's');
		}
	};
	for (let i = 99; i >= 0; i--) {
		print(beerText(i, true) + ' of beer on the wall, ' + beerText(i, false) + ' of beer.');
		print((i == 0 ? 'Go to the store and buy some more, ' : 'Take one down and pass it around, ') + beerText(i - 1, false) + ' of beer on the wall.');
		if (i > 0) {print('');}
	}
}

// i didn't write this
function rot(s, i) {
	return s.replace(/[a-zA-Z]/g, function (c) {
		return String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + i) ? c : c - 26);
	});
}

function checkSyntax(prog, instrs) {
	if (instrs.indexOf('-') >= 0) {
		if (prog.indexOf('-') >= 0) {
			let bad = true;
			for (let i = 0; i < prog.indexOf('-'); i++) {
				if (instrs.indexOf(prog[i]) >= 0) {bad = false;}
			}
			if (bad) {return false;}
		}
	}
	return true;
}

function twoDMove(prog, i, isDown) {
	let lineLength = prog.split('\n')[0].length;
	let pos = i + ((lineLength + 1) * (isDown ? 1 : -1));
	if (pos >= 0 && pos < prog.length) {
		return pos - 1; // -1 to negate loop ++
	} else {
		return i;
	}
}

function twoDCompat(prog) {
	let lines = prog.split('\n');
	let maxLength = 0;
	lines.forEach(function(el) {
		if (el.length > maxLength) {maxLength = el.length;}
	});
	for (let i in lines) {
		while (lines[i].length < maxLength) {lines[i] += ' ';}
	}
	return lines.join('\n');
}

// name must already be caps
function parseLangName(name) {
	let nameTerms = [];
	while (name.length > 0) {
		if (name.substring(0, 4) == 'FISH') {
			nameTerms.push(name.substring(0, 4));
			name = name.substring(4);
		} else if (name.substring(0, 2) == '++' || name.substring(0, 2) == '+-' || name.substring(0, 2) == '2D') {
			nameTerms.push(name.substring(0, 2));
			name = name.substring(2);
		} else {
			nameTerms.push(name[0]);
			name = name.substring(1);
		}
	}
	// bad cases are bad
	if ((nameTerms.indexOf('FISH') >= 0 && (nameTerms.indexOf('I') >= 0 || nameTerms.indexOf('S') >= 0)) || (nameTerms.indexOf('2D') >= 0 && (nameTerms.indexOf('++') >= 0 || nameTerms.indexOf('+-') >= 0))) {
		return [];
	}
	let instrs = [];
	for (let i in nameTerms) {
		if (nameTerms[i] == 'FISH') {
			instrs.push('i', 'd', 's', 'o', 'k', 'h');
		} else if (nameTerms[i] == '++') {
			instrs.push('+', '++');
		} else if (nameTerms[i] == '+-') {
			instrs.push('+', '++', '-');
		} else if (nameTerms[i] == '2D') {
			instrs.push('>', '<', '^', 'v');
		} else if (nameTerms[i].length == 1) {
			let singles = 'hq9+cirsx';
			let letter = nameTerms[i].toLowerCase();
			if (singles.indexOf(letter) >= 0) {
				instrs.push(letter);
			} else {
				return [];
			}
		} else {
			console.log('if you get this log you messed up also');
			return []; // how did you get here anyway
		}
	}
	for (let i in instrs) {
		if (instrs.indexOf(instrs[i]) < i) {return [];}
	}
	return instrs;
}

function instrIs(check, prog, instrs, i) {
	return instrs.indexOf(check) >= 0 && prog.substring(i, i + check.length) == check;
}