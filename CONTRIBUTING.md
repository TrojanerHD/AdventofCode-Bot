
# How to contribute
## Pull Requests
Since the configuration for your hosted bot might be different to the configuration on the hosting server (or on my local machine), never create Pull Requests for the main branch. I would suggest using the [unstable branch](https://github.com/TrojanerHD/AdventofCode-Bot/tree/unstable)
## TypeScript Styleguide
The [prettier](https://prettier.io/) code formatter is used

### Upper and lower case
Rule 1: Function and variable names in camelCase:
```ts
const NEWVARIABLE: string = ''; //BAD
const NewVariable: string = ''; //BAD
const newVariable: string = ''; //GOOD

function HelloWorld(): void { //BAD
function HELLOWORLD(): void { //BAD
function helloWorld(): void { //GOOD
```
Rule 2: In class names, each beginning of a word is upper case:
```ts
class test { //BAD
class TEST { //BAD
class Test { //GOOD
```
### String handling
Rule 3: Always use [template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) instead of string concatenation:
```ts
console.log('Hello ' + name); //BAD
console.log(`Hello ${name}`); //GOOD
```
Rule 4: Always use single quotes for strings unless that would require to escape single quotes in the string:
```ts
console.log("Hello World"); //BAD
console.log('Hello World'); //GOOD

console.log('Hello, I\'m world'); //BAD
console.log("Hello, I'm world"); //GOOD
```
### Spacing
Rule 5: Use two spaces:
```ts
//BAD:
if (someBoolean) {
    console.log('true'); 
}

//GOOD:
if (someBoolean) {
  console.log('true');
}
```
Rule 6: Space between instruction (if, switch, …) and parenthesis. Space after curly brace, followed by line break. If no curly brace is required, then either on the same or on the next line:
```ts
if(someBoolean) //BAD
if (someBoolean) //GOOD

//BAD:
if (someBoolean)
{

}

//BAD:
if (someBoolean){

}

//GOOD:
if (someBoolean) {

}
```
Rule 7: Add spaces before and after curly braces if statement is in one line:
```ts
const obj: {value: string} = {value: 'foo'}; //BAD
const obj: { value: string } = { value: 'foo' }; //GOOD
```
### Semicolons
Rule 8: Always use semicolons:
```ts
console.log('Hello World') //BAD
console.log('Hello World'); //GOOD
```
Rule 9: Use semicolons in object types and interfaces; add semicolon also to last index
```ts
//BAD:
interface Human {
  legs: number,
  arms: number
}

//BAD: 
interface Human {
  legs: number;
  arms: number
}

//GOOD:
interface Human {
  legs: number;
  arms: number;
}

const arr: { value: string, valueTwo: string }[] = [] //BAD
const arr: { value: string; valueTwo: string }[] = [] //GOOD
```
### Types
Rule 10: Always add types; never use `any` unless it is unavoidable:
```ts
let someNumber = 54; //BAD
let someNumber: number = 54; //GOOD

const someBoolean = true; //BAD
const someBoolean: boolean = true; //GOOD

function helloWorld() { //BAD
function helloWorld(): void { //GOOD

[3, 2, 1].sort((a: number, b: number) => a > b ? 1 : -1); //BAD
[3, 2, 1].sort((a: number, b: number): number => a > b ? 1 : -1); //GOOD
```
Rule 11: Use `[]`, not `Array<T>`:
```ts
const array: Array<string> = ['Test']; //BAD
const array: string[] = ['Test']; //GOOD
```
### Other rules
Rule 12: Always use three equal signs in comparisons:
```ts
if (a == b) //BAD
if (a === b) //GOOD

const bool: boolean = a == b //BAD
const bool: boolean = a === b //GOOD
```
Rule 13: Use `const` whenever possible; never use `var` unless it is unavoidable:
```ts
var someNumber: number = 54; //BAD
let someNumber: number = 54; //BAD unless it is changed later
const someNumber: number = 54; //GOOD

//GOOD:
let someNumber: number = 54;
someNumber++;

//BAD:
let array: string[] = [];
array.push('hi');

//GOOD:
const array: string[] = [];
array.push('hi');

//BAD:
let obj: { value: string } = { value: 'foo' };
obj.value = 'bar';

//GOOD:
const obj: { value: string } = { value: 'foo' };
obj.value = 'bar';
```
Rule 14: If-else without curly braces as well as Conditional (ternary) operators are permitted:
```ts
//GOOD:
if (someBoolean) console.log('someBoolean true');
else console.log('someBoolean false');

//GOOD:
if (someBoolean)
  console.log('someBoolean true');
else
  console.log('someBoolean false');

//GOOD:
if (someBoolean) {
  console.log('someBoolean true');
} else {
  console.log('someBoolean false');
}

console.log(someBoolean ? 'someBoolean true' : 'someBoolean false'); //GOOD but in this case…
console.log(`someBoolean ${someBoolean}`); //…would be better
```
Rule 15: Never use lambda functions other than for very short operations:
```ts
//BAD:
client.on('message', (message: Message): void => {
   switch (message) {
    case 'Hello World':
      message.channel.send('Hi!').catch(console.error);
      break;
    case 'Bye World':
      message.channel.send('Bye!').catch(console.error);
      break;
    }
});

//GOOD:
client.on('message', onMessage);

function onMessage(message: Message) {
  switch (message) {
    case 'Hello World':
      message.channel.send('Hi!').catch(console.error);
      break;
    case 'Bye World':
      message.channel.send('Bye!').catch(console.error);
      break;
    }
}

[3, 2, 1].sort((a: number, b: number): number => a > b ? 1 : -1); //GOOD
```
Rule 16: Use dot-notation, not `[key]`:
```ts
obj['foo']; //BAD
obj.foo; //GOOD
```