"use strict";
const { getAddress, stringToBytes, verifyMessage } = require("viem");
const data =
  "data:image/png;base64,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";
const signature =
  "0x3c5aba848499db2ef4dc44f5985b9e35999bcde1b039ff79b47d42ba2f906e7d35d16db91510409e58d2f0eeccb3bab0a907fcfc5a1ead6bf01215982e8348341b";
const address = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
const run = async () => {
  const valid = await verifyMessage({
    address: getAddress(String(address)),
    message: String(data),
    signature: String(signature),
  });
  console.log("creating and agreement", valid);
};
run();
let contractsList = new Map();
// Adding some sample data
contractsList.set("active", new Set(["123", "456"]));
contractsList.set("inactive", new Set(["789"]));
// Function to stringify a single map entry
function stringifyMapEntry(map, key) {
  if (map.has(key)) {
    const entry = map.get(key);
    if (entry instanceof Set) {
      const obj = {};
      obj[key] = Array.from(entry);
      return JSON.stringify(obj);
    }
  }
  return null;
}
// Fetch and stringify one element
const keyToFetch = "active";
const singleEntryString = stringifyMapEntry(contractsList, keyToFetch);
console.log(singleEntryString);
// Example function to convert Map to JSON string
function stringifyMap(map) {
  const obj = {};
  map.forEach((value, key) => {
    if (value instanceof Set) {
      obj[key] = Array.from(value);
    } else if (value instanceof Map) {
      obj[key] = JSON.parse(stringifyMap(value));
    } else {
      obj[key] = value;
    }
  });
  return JSON.stringify(obj);
}
// Adding some sample data
contractsList.set("active", new Set(["123", "456"]));
contractsList.set("inactive", new Set(["789"]));
// Stringify the map
const contractsListString = stringifyMap(contractsList);
console.log(contractsListString);
let newList = new Map();

for (let [key, value] of contractsList) {
  if (String(key) === "active") {
    newList.set(key, Array.from(value));
  }
}
console.log(newList, JSON.stringify(newList));
console.log(JSON.stringify({ result: Array.from(newList) }));

newList = new Map();
for (let [key, value] of contractsList) {
  newList.set(key, Array.from(value));
}
console.log(newList);
console.log(JSON.stringify({ result: Array.from(contractsList) }));
