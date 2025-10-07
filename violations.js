// sessionManager.js
const violationData = {};

function setViolation(key, value) {
  violationData[key] = value;
}

function getViolation(key) {
  return violationData[key];
}

function clearViolation(key) {
  delete violationData[key];
}

module.exports = { setViolation, getViolation, clearViolation };
