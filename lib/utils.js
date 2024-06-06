export function processFileName(fileName) {
  fileName = fileName.replace(/ /g, "-");
  fileName = fileName.toLowerCase();
  fileName = fileName.split(".")[0];
  return fileName;
}
