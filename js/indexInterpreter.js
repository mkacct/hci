'use strict';

// check syntax and validate instrs first
function interpret(prog, instrs, input) {
	prog = prog.toLowerCase();
	if (instrs.indexOf('^') >= 0) {prog = twoDCompat(prog);} // > < ^ v
	let fish = instrs.indexOf('d') >= 0; // using deadfish
	let isBf = instrs.indexOf('.') >= 0; // this is how i'll detect bf
	let bfTape = [0];
	let bfTapeSize = instrs.indexOf('dt') >= 0 ? 60000 : 30000; // a bit silly but yeah
	let bfPointer = 0;
	let bfInputI = 0;
	let bfBrackets;
	if (isBf) {bfBrackets = getBfBrackets(prog);} // match brackets for loops
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
			if (isBf) { // bf increment
				if (bfTape[bfPointer] >= 255) {
					bfTape[bfPointer] = 0;
				} else {
					bfTape[bfPointer] = bfTape[bfPointer] + 1;
				}
			} else { // hq9+ increment
				count++;
			}
		} else if (instrIs('++', prog, instrs, i)) {  // ++
			count++;
			count++;
			let Thing = function() {};
			new Thing();
			i++;
		} else if (instrIs('-', prog, instrs, i)) {  // -
			if (isBf) { // bf decrement
				if (bfTape[bfPointer] <= 0) {
					bfTape[bfPointer] = 255;
				} else {
					bfTape[bfPointer] = bfTape[bfPointer] - 1;
				}
			} else { // hq9+- quality control
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
		} else if (instrIs('b', prog, instrs, i)) {  // b
			let exclPos = input.indexOf('!');
			let bfProg = exclPos == -1 ? input : input.substring(0, exclPos);
			let bfInstrs = ['>', '<', '+', '-', '.', ',', '[', ']'];
			if (checkSyntax(bfProg, bfInstrs)) {
				interpret(bfProg, bfInstrs, exclPos == -1 ? '' : input.substring(exclPos + 1));
			} else {
				throw 'Syntax error';
			}
		} else if (instrIs('>', prog, instrs, i)) {  // >
			if (isBf) { // bf right
				bfPointer++;
				if (bfPointer >= bfTapeSize) {throw 'Memory error';}
				if (typeof bfTape[bfPointer] != 'number') {bfTape[bfPointer] = 0;}
			}
		} else if (instrIs('<', prog, instrs, i)) {  // <
			if (isBf) { // bf left
				bfPointer--;
				if (bfPointer < 0) {throw 'Memory error';}
			} else { // 2d left
				if (prog[i - 1] && prog[i - 1] != '\n') {i--;};
				i--; // negate loop ++
			}
		} else if (instrIs('.', prog, instrs, i)) {  // .
			print(String.fromCharCode(bfTape[bfPointer]), false, true);
		} else if (instrIs(',', prog, instrs, i)) {  // ,
			if (bfInputI < input.length) {
				bfTape[bfPointer] = input.charCodeAt(bfInputI) % 256;
				bfInputI++;
			}
		} else if (instrIs('[', prog, instrs, i)) {  // [
			if (bfTape[bfPointer] == 0) {i = bfBrackets[i];}
		} else if (instrIs(']', prog, instrs, i)) {  // ]
			if (bfTape[bfPointer] != 0) {i = bfBrackets[i];}
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
	endLine(); // extremely unintuitive
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
	if (instrs.indexOf('-') >= 0) { // initial - syntax error
		if (prog.indexOf('-') >= 0) {
			let bad = true;
			for (let i = 0; i < prog.indexOf('-'); i++) {
				if (instrs.indexOf(prog[i]) >= 0) {bad = false;}
			}
			if (bad) {return false;}
		}
	}
	if (instrs.indexOf('[') >= 0) { // bf brackets
		let loopCount = 0;
		for (let i = 0; i < prog.length; i++) {
			if (prog[i] == '[') {
				loopCount++;
			} else if (prog[i] == ']') {
				loopCount--;
			}
			if (loopCount < 0) {return false;}
		}
		if (loopCount != 0) {return false;}
	}
	return true;
}

function getBfBrackets(prog) {
	let res = {};
	let startStack = [];
	for (let i = 0; i < prog.length; i++) {
		if (prog[i] == '[') {
			startStack.push(i);
		} else if (prog[i] == ']') {
			let pair = startStack.pop();
			res[pair] = i;
			res[i] = pair;
		}
	}
	return res;
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
		} else if (name.substring(0, 3) == 'H9F') {
			nameTerms.push(name.substring(0, 3));
			name = name.substring(3);
		} else if (name.substring(0, 2) == '++' || name.substring(0, 2) == '+-' || name.substring(0, 2) == '2D') {
			nameTerms.push(name.substring(0, 2));
			name = name.substring(2);
		} else {
			nameTerms.push(name[0]);
			name = name.substring(1);
		}
	}
	let instrs = [];
	let is2d = false;
	for (let i in nameTerms) {
		if (nameTerms[i] == 'FISH') {
			instrs.push('i', 'd', 's', 'o', 'k', 'h');
		} else if (nameTerms[i] == 'H9F') {
			instrs.push('<', '>', '+', '-', '[', ']', ',', '.', 'h', 'q', '9', 'dt');
		} else if (nameTerms[i] == '++') {
			instrs.push('+', '++');
		} else if (nameTerms[i] == '+-') {
			instrs.push('+', '++', '-');
		} else if (nameTerms[i] == '2D') {
			instrs.push('>', '<', '^', 'v');
			is2d = true;
		} else if (nameTerms[i].length == 1) {
			let singles = 'hq9+cirsxb';
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
		if (instrs.indexOf(instrs[i]) < i || (is2d && instrs[i].length > 1)) {return [];} // no duplicates, no longer instrs with 2d
	}
	return instrs;
}

function instrIs(check, prog, instrs, i) {
	return instrs.indexOf(check) >= 0 && prog.substring(i, i + check.length) == check;
}