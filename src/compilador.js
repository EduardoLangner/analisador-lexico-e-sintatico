import { createLexer } from 'syntax-parser';
import { createParser, chain, matchTokenType, many, optional } from 'syntax-parser';
import fs from 'fs';

const myLexer = createLexer([ //Inicilização do analisador léxico e declaração de tokens 
  {
    type: 'whitespace',
    regexes: [/^(\s+)/],
    ignore: true
  },
  {
    type: 'IDENT',
    regexes: [/^(var [a-zA-Z][a-zA-Z0-9]*)/]
  },
  {
    type: 'INT',
    regexes: [/^(int)/]
  },
  {
    type: 'FLOAT',
    regexes: [/^(float)/]
  },
  {
    type: 'STRING',
    regexes: [/^(string)/]
  },
  {
    type: 'BOOL',
    regexes: [/^(bool)/i]
  },
  {
    type: 'FLOAT_POS',
    regexes: [/^(\d+\.\d+)/]
  },
  {
    type: 'FLOAT_NEG',
    regexes: [/^(-\d+\.\d+)/]
  },
  {
    type: 'INT_POS',
    regexes: [/^(\d+)/]
  },
  {
    type: 'INT_NEG',
    regexes: [/^(-\d+)/]
  },
  {
    type: 'VAL_STRING',
    regexes: [/^("([^"]*)")/]
  },
  {
    type: 'VAL_BOOL',
    regexes: [/^(true|false)/i]
  },
  {
    type: '>=',
    regexes: [/^(>=)/]
  },
  {
    type: '<=',
    regexes: [/^(<=)/]
  },
  {
    type: 'OP_COMP',
    regexes: [/^(==)/]
  },
  {
    type: 'OP_AND',
    regexes: [/^(&&)/]
  },
  {
    type: 'OP_OR',
    regexes: [/^(\|\|)/]
  },
  {
    type: '=',
    regexes: [/^(=)/]
  },
  {
    type: '+',
    regexes: [/^(\+)/]
  },
  {
    type: '-',
    regexes: [/^(-)/]
  },
  {
    type: '/',
    regexes: [/^(\/)/]
  },
  {
    type: '*',
    regexes: [/^(\*)/]
  },
  {
    type: '>',
    regexes: [/^(>)/]
  },
  {
    type: '<',
    regexes: [/^(<)/]
  },
  {
    type: '!=',
    regexes: [/^(!=)/]
  },
  {
    type: '!',
    regexes: [/^(!)/]
  },
  {
    type: 'IF',
    regexes: [/^(if)/]
  },
  {
    type: 'ELSE',
    regexes: [/^(else)/]
  },
  {
    type: 'FOR',
    regexes: [/^(for)/]
  },
  {
    type: '.',
    regexes: [/^(\.)/]
  },
  {
    type: ';',
    regexes: [/^(;)/]
  },
  {
    type: 'COMENT',
    regexes: [/^(#[^\n]*#)/]
  },
  {
    type: '(',
    regexes: [/^(\()/]
  },
  {
    type: ')',
    regexes: [/^(\))/]
  },
  {
    type: '{',
    regexes: [/^(\{)/]
  },
  {
    type: '}',
    regexes: [/^(\})/]
  },
]);

const root = () => chain(Q0)(); 
const firstQ0 = () => chain(Q1, Q2, '=', Q3, ';', optional(Q4))() // TODO: Q4
const secondQ0 = () => chain(matchTokenType('COMENT'))()
const thirdQ0 = () => chain(matchTokenType('IDENT'), '=', matchTokenType('IDENT'), Q5, matchTokenType('IDENT'), ';')()
const ifCondition = () => chain('IF', '(', optional(Q6), Q7, Q8, optional(Q6), Q7, optional(Q10), ')', '{', optional(Q4), '}', Q12)()
const forLoop = () => chain(
  'FOR', '(', 
  matchTokenType('IDENT'), '=', 
  matchTokenType('INT_POS'), ';',
  matchTokenType('IDENT'), Q8,
  matchTokenType('INT_POS'), ';',
  matchTokenType('IDENT'), Q9,
  ')', '{', optional(Q4), '}', Q12
)()

const Q0 = () => chain([firstQ0, secondQ0, thirdQ0, ifCondition, forLoop])()

// Q1 -> INT | FLOAT | STRING | BOOL
const Q1 = () => chain(['INT', 'FLOAT', 'STRING', 'BOOL'])()

  // Q2 -> IDENT
const Q2 = () => chain(matchTokenType('IDENT'))()

// Q3 -> INT_ POS | INT_NEG | FLOAT_ POS | FLOAT_NEG | VAL_STRING | VAL_BOOL
const Q3 = () =>
  chain([matchTokenType('INT_POS'), 
    matchTokenType('INT_NEG'), 
    matchTokenType('FLOAT_POS'), 
    matchTokenType('FLOAT_NEG'), 
    matchTokenType('VAL_STRING'), 
    matchTokenType('VAL_BOOL')
  ])()

const Q4 = () => chain([firstQ0, secondQ0, thirdQ0, ifCondition, forLoop])() // TODO: &

// Q5 -> + | - | * | /
const Q5 = () => chain(['+', '-', '*', '/'])()

// Q6 -> ! | &
const Q6 = () => chain('!')()

// Q7 -> IDENT | Q3 
const Q7 = () => chain([matchTokenType('IDENT'), Q3])()

// Q8 ? > | < | >= | <= | != | OP_COMP | OP_AND | OP_OR
const Q8 = () => chain(['>', '<', '>=', '<=', '!=', matchTokenType('OP_COMP'), matchTokenType('OP_AND'), matchTokenType('OP_OR')])()

// Q9 -> ++ | --
const Q9 = () => chain([chain('+','+'), chain('-','-')])()

// Q10 -> Q11 Q6 Q7 Q8 Q6 Q7 | &
const Q10 = () => chain(Q11, optional(Q6), Q7, Q8, optional(Q6), Q7)()

// Q11 -> OP_AND | OP_OR
const Q11 = () => chain([matchTokenType('OP_AND'), matchTokenType('OP_OR')])()

// Q12 -> ELSE {Q4} | Q4
const Q12 = () => chain([chain('ELSE', '{', Q4, '}'), optional(Q4)])()

const myParser = createParser(
  root, // Root grammar.
  myLexer // Created in lexer example. 
);

// let linguagem = 'if (!2.9 == !-1  || 2.9 == -1) { if (!2.9 == !-1  || 2.9 == -1) { #comentario# } }' //true
// let linguagem = 'float var teste2 = "teste2"; bool var teste3 = 1.4; if(var teste2 != var teste3){#testee#}' //true
// let linguagem = 'int var teste4 = 10; int var teste5 = 20; for(var teste4 = 0; var teste4 <= 10; var teste4 ++){int var teste6 = "teste"; var teste4 = var teste5 + var teste6;}' //true
// let linguagem = 'if (var teste2 != var teste3){#testee#} else {#testee#}' //true
// let linguagem = 'int var teste = 10; if(var teste >= 10){int var teste2 = "teste";}else{int var teste3 = "teste";}' //true
// let linguagem = 'int var teste = 10; for(var teste = 0; var teste <= 10; var teste ++){int var teste2 = "teste";}' //true

let tokens = myParser(linguagem)

console.log(myLexer(linguagem))
console.log(tokens)

// save tokens in a file and format it
fs.writeFileSync('./tokens.json', JSON.stringify(tokens, null, 2))