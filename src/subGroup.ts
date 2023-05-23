interface subServer {
  serverAdress: string;
  response: boolean;
  isLeader: boolean;
}

let mySubServers: subServer[] = [];

mySubServers.push({
  serverAdress: "http://localhost:3501/",
  response: false,
  isLeader: false,
});
mySubServers.push({
  serverAdress: "http://localhost:3502/",
  response: false,
  isLeader: false,
});
mySubServers.push({
  serverAdress: "http://localhost:3503/",
  response: false,
  isLeader: false,
});

export { mySubServers, subServer };
