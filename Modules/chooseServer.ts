import {groupMap,Group} from "../src/groups";
import crypto from "crypto";

/**
 * Returns the number of the node that will receive the file 
 * @param fileName Name of the file that will be sent
 * @returns number of the node 
 */
export const chooseNode = async (fileName: string) => {
  let count = 0;
  for (const [key, value] of groupMap) {
    if (value.isActive) {
      count++;
    }
  }
  const Nodes_N = BigInt(count);
  let md5 = crypto.createHash("md5").update(fileName).digest("hex");
  let _8_first_bytes_as_hex = "0x" + md5.substr(0, 16);
  const hugeHex = BigInt(_8_first_bytes_as_hex);
  const destNode = hugeHex % Nodes_N;

  return { destNode, _8_first_bytes_as_hex };
};
/**
 * Returns the group that will receive the file
 * @param fileName Name of the file that will be sent
 * @returns Group that receives the file
 */
export const groupNodeReturn = async (fileName: string) => {
  const destNode = (await chooseNode(fileName)).destNode;
  let group: Group;
  let count = 0;
  for (const [key, value] of groupMap) {
    if (BigInt(count) === destNode) {
      group = value;
      return group;
    } else if (value.isActive) {
      count++;
    }
  }
  return null;
};

export default { chooseNode, activeServers: groupNodeReturn };
