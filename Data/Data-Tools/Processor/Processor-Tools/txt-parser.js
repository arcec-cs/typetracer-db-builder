//text-parser.js partial functional implementation; is indempotent/uses pipe, but no need for data to be immutable; 
const FS = require('fs');

//regex
const regexNonContBeg = /[\s\S]*?(?=(?<=\*{2,})[\r\n]{3,})/ // (?<=\*{2,})[\r\n]{3,} : match paragraph spacing if preceded by 2 or many \*, [\s\S]*?(?=X): match any and all char(non-greedy)if before X
const regexNonContEnd = /(?<=[\r\n]{3,}(?=\*{2,}))[\s\S]*/ // [\r\n]{3,}(?=\*{2,}) : match paragraph spacing if followed by 2 or many \*, (?<= X)[\s\S]*: matach any and all char if after X
const regexEnter = /\r\n/g; //Enter for windows machines
const regexPara = /[\r\n]{3,}/; //for "paragraph delimiters" 
const regexSen = /(?<=\.|\!|\?)\s/; //for any end of sentence punctuation

//helpers
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const txtToStringText = filePathToTxtFile => FS.readFileSync(filePathToTxtFile, "utf-8");

const parseNonContentBeg = stringText => stringText.replace(regexNonContBeg, '');// get rid of PG info Beg; uses '*** START OF THE PROJECT GUTENBERG EBOOK FRANKENSTEIN ***' as delimeter
const parseNonContentEnd = stringText => stringText.replace(regexNonContEnd, '');//get rid of PG info END; uses '*** END OF THE PROJECT GUTENBERG EBOOK FRANKENSTEIN ***' as delimeter
const parseEnterEncoding = paraArray => { // parses out Enter encoding(\r\n) and adds space
  paraArray.forEach((para,ind)=>{ paraArray[ind] = para.replace(regexEnter, ' '); }); // we do not need Enter encoding(\r\n) anymore, get rid of and add space
  return paraArray; 
}

const splitBySpace = stringText => stringText.split(/\s/g); 
const splitToParaArr = (stringText) => stringText.split(regexPara); //split by para delimeter.
const splitToParaSenArr = (paraArr) =>{
  const senArray = [];
  paraArr.forEach((para, ind)=>{ senArray[ind] = para.split(regexSen); }); // split into sentences by EOS punctuation senArr[#p][#sentence string]
  return senArray;
}

const countWords = wordArr => {
  let count = 0;
  wordArr.forEach(word => (word != '') && count++); // enters show up a  ''
  return count; 
}

// TEXT PARSING FUNCTIONS
const toStringAndRemovePgHeaderAndFooter = filePathToTxtFile => {  
  return pipe(
    txtToStringText,
    parseNonContentBeg,
    parseNonContentEnd,
  )(filePathToTxtFile)
}

//output notes. Sentences begin with a whitespace except begginging of paragraphs. quotation marks are escaped i.e (["A said\"I am a quote\"])
const toParaSenArr = stringRemovedHeaderAndFooter =>{ //returned array of element resutling in jagged array array[#p][#s] 
  return pipe(
    splitToParaArr,
    parseEnterEncoding,
    splitToParaSenArr
  )(stringRemovedHeaderAndFooter)
}

const getNumOfWords = stringRemovedHeaderAndFooter => {
  return pipe(
    splitBySpace,
    countWords
  )(stringRemovedHeaderAndFooter)
}

module.exports= {
  toStringAndRemovePgHeaderAndFooter: toStringAndRemovePgHeaderAndFooter,
  toParaSenArr: toParaSenArr,
  getNumOfWords: getNumOfWords
};