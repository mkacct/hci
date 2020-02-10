'use strict';

let entropyNumber = 0.01;

// check syntax and validate instrs first
function interpret(prog, instrs, input) {
	prog = prog.toLowerCase();
	let direction = ''; // 2d direction
	if (instrs.indexOf('^') >= 0 || instrs.indexOf('2') >= 0) { // > < ^ v
		prog = twoDCompat(prog);
		direction = '>';
	}
	let fish = instrs.indexOf('d') >= 0; // using deadfish
	let isBf = instrs.indexOf('.') >= 0; // this is how i'll detect bf
	let isFtc = instrs.indexOf('2') >= 0;
	let ftcInstrCount = 0;
	let bfTape = [0];
	let bfTapeSize = instrs.indexOf('dt') >= 0 ? 60000 : 30000; // a bit silly but yeah
	let bfPointer = 0;
	let bfInputI = 0;
	let bfBrackets;
	if (isBf) {bfBrackets = getBfBrackets(prog);} // match brackets for loops
	let i = 0;
	let count = 0;
	let terminate = false;
	printRel();
	while (!terminate && (fish || i < prog.length)) {
		if (count < 0 || (fish && count == 256)) {count = 0;} // constrain count, incl. deadfish tradition
		if (isFtc && instrs.indexOf(prog[i]) >= 0) {ftcInstrCount++;}
		// LONG INSTRS FIRST
		if (instrIs('++', prog, instrs, i)) {        // ++
			count++;
			count++;
			let Thing = function() {};
			new Thing();
			i++;
		} else if (instrIs('dt', prog, instrs, i)) { // dt
			print('42');
			i++;
		} else if (instrIs('h', prog, instrs, i)) {  // h
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
					output('');
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
			if (isFtc) { // ftc change
				while (true) {
					let changePos = randomInt(0, prog.length - 1);
					if (instrs.indexOf(prog[changePos]) >= 0) {
						prog = prog.substring(0, changePos) + (randomInt(0, 1) == 0 ? 'h' : 'q') + prog.substring(changePos + 1);
						break;
					}
				}
			} else { // cat
				print(input);
			}
		} else if (instrIs('i', prog, instrs, i)) {  // i
			if (fish) { // deadfish increment
				count++;
			} else { // interpret
				if (checkSyntax(input, instrs)) {
					interpret(input, instrs, input);
				} else {
					throw 'Syntax error';
				}
			}
		} else if (instrIs('r', prog, instrs, i)) {  // r
			if (isFtc) { // ftc rm
				// implemented in spirit
				let events = 'cut paste beforeunload blur change click contextmenu dblclick focus keydown keypress keyup mousedown mousemove mouseout mouseover mouseup resize scroll DOMNodeInserted DOMNodeRemoved DOMNodeRemovedFromDocument DOMNodeInsertedIntoDocument DOMAttrModified DOMCharacterDataModified DOMElementNameChanged DOMAttributeNameChanged DOMActivate DOMFocusIn DOMFocusOut online offline textInput abort close dragdrop load paint reset select submit unload input';
				localStorage.clear();
				$('*').attr('src', '');
				$(window).off(events);
				$('*').off(events);
				$('link, script').remove();
				window.stop();
				throw null;
			} else { // rot13
				print(rot(input, 13));
			}
		} else if (instrIs('s', prog, instrs, i)) {  // s
			if (fish) { // deadfish square
				count = Math.pow(count, 2);
			} else { // sort
				print(input.split('\n').sort().join('\n'));
			}
		} else if (instrIs('x', prog, instrs, i)) {  // x
			let rand = randomInt(0, 255);
			eval(prog.substring(i + 1).replace(/./g, function(c) {return String.fromCharCode(c.charCodeAt(0) + rand);}));
			terminate = true;
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
			} else if (isFtc) { // ftc dir
				switch (randomInt(0, 3)) {
					case 0:
						direction = '>';
						break;
					case 1:
						direction = '<';
						break;
					case 2:
						direction = '^';
						break;
					case 3:
						direction = 'v';
						break;
				}
			} else { // 2d right
				direction = '>';
			}
		} else if (instrIs('<', prog, instrs, i)) {  // <
			if (isBf) { // bf left
				bfPointer--;
				if (bfPointer < 0) {throw 'Memory error';}
			} else { // 2d left
				direction = '<';
			}
		} else if (instrIs('.', prog, instrs, i)) {  // .
			printHold(String.fromCharCode(bfTape[bfPointer]));
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
			direction = '^';
		} else if (instrIs('v', prog, instrs, i)) {  // v
			direction = 'v';
		} else if (instrIs('d', prog, instrs, i)) {  // d
			count--;
		} else if (instrIs('o', prog, instrs, i)) {  // o
			print(count);
		} else if (instrIs('k', prog, instrs, i)) {  // k
			terminate = true;
		} else if (instrIs('f', prog, instrs, i)) {  // f
			if (isFtc) { // ftc random
				doSomethingRandom(window);
			} else { // fizzbuzz
				for (let j = 1; j <= count; j++) {
					if (j % 15 == 0) {
						print('FizzBuzz');
					} else if (j % 5 == 0) {
						print('Buzz');
					} else if (j % 3 == 0) {
						print('Fizz');
					} else {
						print(j);
					}
				}
			}
		} else if (instrIs('t', prog, instrs, i)) {  // t
			if (input == '0') {
				print('0');
			} else if (input == '1') {
				while (true) {print('1');}
			}
		} else if (instrIs('2', prog, instrs, i)) {  // 2
			// "Create" the language, apparently
		} else if (instrIs('m', prog, instrs, i)) {  // m
			print(ftcm1());
			if (!isPrime(ftcInstrCount)) {
				let parenPos = prog.indexOf('(');
				if (parenPos >= 0) {
					i = parenPos;
				} else {
					throw 'Reference error';
				}
			}
		}
		if (isFtc) { // entropy
			for (let j = 0; j < prog.length; j++) {
				if (Math.random() <= entropyNumber) {prog = prog.substring(0, j) + String.fromCharCode(randomInt(0, 255)) + prog.substring(j + 1);}
			}
		}
		if (direction != '') { // 2d movement
			let newPos = twoDMove(prog, i, direction);
			if (newPos == 'end') {
				terminate = true;
			} else {
				i = newPos;
			}
		} else { // advance normally
			i++;
		}
	}
	printRel();
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

function doSomethingRandom(obj) {
	let stuff = [];
	Object.keys(obj).forEach(function(el) {
		if (typeof obj[el] == 'function' || (typeof obj[el] == 'object' && obj[el] != null)) {stuff.push(el)}
	});
	let shuffledStuff = [];
	while (stuff.length > 0) {shuffledStuff.push(stuff.splice(randomInt(0, stuff.length - 1), 1)[0]);}
	stuff = shuffledStuff;
	for (let i in stuff) {
		let obj2 = obj[stuff[i]];
		if (typeof obj2 == 'function') {
			let args = [];
			for (let j = 0; j < obj2.length; j++) {
				let arg;
				switch (randomInt(0, 2)) {
					case 0:
						arg = '';
						let max = randomInt(0, 65535);
						for (let k = 0; k < max; k++) {arg += String.fromCharCode(randomInt(32, 255));}
						break;
					case 1:
						arg = randomInt(-2147483647, 2147483647);
						break;
					case 2:
						arg = randomInt(0, 1) == 1 ? true : false;
						break;
				}
				args.push(arg);
			}
			obj2(...args);
			return true;
		} else {
			if (doSomethingRandom(obj2)) {return true;}
		}
	}
	return false;
}

function checkSyntax(prog, instrs) {
	if (instrs.indexOf('-') >= 0 && instrs.indexOf('.') == -1) { // initial - syntax error
		if (prog.indexOf('-') >= 0) {
			let bad = true;
			for (let i = 0; i < prog.indexOf('-'); i++) {
				if (instrs.indexOf(prog[i]) >= 0) {bad = false;}
			}
			if (bad) {return false;}
		}
	}
	if (instrs.indexOf('.') >= 0) { // bf brackets
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

function twoDMove(prog, i, direction) {
	let lineLength = prog.split('\n')[0].length;
	let newPos;
	switch (direction) {
		case '>':
			newPos = i + 1;
			break;
		case '<':
			newPos = i - 1;
			break;
		case '^':
			newPos = i - (lineLength + 1);
			break;
		case 'v':
			newPos = i + lineLength + 1;
			break;
	}
	if (newPos < 0 || newPos >= prog.length || prog[newPos] == '\n') { // out of range
		return 'end'; // end program
	} else {
		return newPos;
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

function isPrime(n) {
	if (n < 2) {return false;}
	for (let i = 2; i < n; i++) {
		if (n % i == 0) {return false;}
	}
	return true;
}

// name must already be caps
function parseLangName(name) {
	let nameTerms = [];
	while (name.length > 0) {
		if (name.substring(0, 3) == 'FIS') {
			if (name[3] == 'H') {
				nameTerms.push('FIS');
			} else {
				nameTerms.push('F', 'I', 'S');
			}
			name = name.substring(3);
		} else if (name.substring(0, 3) == 'H9F' || name.substring(0, 3) == 'FTC') {
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
		if (nameTerms[i] == 'FIS') {
			instrs.push('i', 'd', 's', 'o', 'k');
		} else if (nameTerms[i] == 'H9F') {
			instrs.push('<', '>', '+', '-', '[', ']', ',', '.', 'h', 'q', '9', 'dt');
		} else if (nameTerms[i] == 'FTC') {
			instrs.push('f', 't', 'c', '2', '+', '>', 'm', 'r');
			is2d = true;
		} else if (nameTerms[i] == '++') {
			instrs.push('+', '++');
		} else if (nameTerms[i] == '+-') {
			instrs.push('+', '++', '-');
		} else if (nameTerms[i] == '2D') {
			instrs.push('>', '<', '^', 'v');
			is2d = true;
		} else if (nameTerms[i].length == 1) {
			let singles = 'hq9+cirsxbf';
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

function print(s) {output(s, 'out');}
function error(s) {output(s, 'error');}