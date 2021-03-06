//traverse.js - made to traverse the 2010PG iso's file system to grab the path of each TEXT_ID's .txt file once(TEXT_ID can contain many .txt and html) and export to JSON
//textFilePathIndex: {id:"pathToTxtInFS"}
const PATH = require("path");
const FS  = require("fs");

const regexTxt = /([0-9]+.txt)$/; // gets only txt files, excludes read.me.txt included in some indexes
const regexTxtNum = /[0-9]+(?=\\[0-9]*-*[0-9]+.txt)/; // get text num from path

let metaDataIndex; //arg of module export that is an indexed object correlating with the indexed filesystem of the arg rootDir
const textFilePathIndex = {}; //the output 

const dataDirectory =  PATH.resolve(__dirname,'..//..//..//..//Data-Source//pre-processor-generated');
const jsonName = 'textFilePathIndex.json';
//const jsonPath = `${dataDirectory}//${jsonName}`;
const jsonPath = PATH.join(`${dataDirectory}`,`${jsonName}`);

const existsMsg = `traverse.js: NO NEW JSON FILE CREATED, ${jsonName} already exists at '${jsonPath}'. if the rootDir has been updated please expell json and rerun, else ignore this message.`;
const successMsg = `traverse.js: ${jsonPath} created.`; 
const dirCreateMsg = `traverse.js: ${dataDirectory} created.`; 

function recursiveDirectoryTraversal(dir, lang) {
  FS.readdirSync(dir).forEach(file => {
       const path = PATH.join(dir, file);
       if (FS.statSync(path).isDirectory()) return recursiveDirectoryTraversal(path, lang);
       else if (isTextFile(path) && isLanguage(path, lang)) return checkFilePathIndex(path, getTextId(path));
   });
 }

const isTextFile = path => regexTxt.test(path);

const isLanguage = (path, lang) => (getTextLanguage(path) == lang ? true : false);

const getTextLanguage = path => metaDataIndex[getTextId(path)].language[0];

const getTextId = path => path.match(regexTxtNum)[0];

const existsInTextFilePathIndex = id => (textFilePathIndex[id] !== undefined ? true : false);

const checkFilePathIndex = (path, id) => !existsInTextFilePathIndex(id) && addToTextFilePathIndex(path, id);

const addToTextFilePathIndex = (path, id) => textFilePathIndex[id]= path;

const createJson = obj => { FS.writeFileSync(jsonPath, JSON.stringify(obj)); console.log(successMsg); };

const createDataDir = () => { console.log(dirCreateMsg); return FS.mkdirSync(dataDirectory);}   

const dataDirectoryExits = () => FS.existsSync(dataDirectory); 

const jsonExists = () => FS.existsSync(jsonPath);

function createTextFilePathIndex(rootDir, metaData, lang){
  metaDataIndex = metaData; // make acc to module scope
  !dataDirectoryExits() && createDataDir(); //made w/o db-builder FS in mind. should have dataDir but will keep check for now.
  console.log(`traverse.js: Creation of ${jsonPath} in progress...`);
  recursiveDirectoryTraversal(rootDir, lang);
  return textFilePathIndex;
}

const createTextFilePathIndexJson = (rootDir, metaData,  lang) => !jsonExists() ? createJson(createTextFilePathIndex(rootDir, metaData, lang)) : console.log(existsMsg);

module.exports ={
  createTextFilePathIndexJson: createTextFilePathIndexJson
}; 
