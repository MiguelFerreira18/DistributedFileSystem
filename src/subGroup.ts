interface subServer {
  serverAdress: string;
  response: boolean;
  isLeader: boolean;
  isOn:boolean;
}

let mySubServers: subServer[] = [];

mySubServers.push({
  serverAdress: "http://localhost:3500/",
  response: false,
  isLeader: false,
  isOn:false,
});
mySubServers.push({
  serverAdress: "http://localhost:3501/",
  response: false,
  isLeader: false,
  isOn:false,
});
mySubServers.push({
  serverAdress: "http://localhost:3502/",
  response: false,
  isLeader: false,
  isOn:false,
});

export { mySubServers, subServer };
