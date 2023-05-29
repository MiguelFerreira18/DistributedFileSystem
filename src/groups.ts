

// make a group datatype
export class Group {
  members: string[];
  ngId: string;
  isActive: boolean = false;
  server: string = "";
  proxy: any = null;
  constructor(members: string[], ngId: string) {
    this.members = members;
    this.ngId = ngId;
  }
}

export let groupMap = new Map<string, Group>();
groupMap.set(
  "1b02d8d2476",
  new Group(["Miguel Ferreira", "Marco Cruz", "José Mendes", "Ivo Gomes"], "0")
);
groupMap.set(
  "21b5eeae29c",
  new Group(["Paulo Leal", "Bruno Pacheco", "Tomás Henriques"], "1")
);
groupMap.set(
  "36ceaa6bf29",
  new Group(["Diogo Sousa", "Diogo Canito", "Diogo Oliveira"], "2")
);
groupMap.set(
  "47a7d22b1bb",
  new Group(
    ["Delsey Silva", "Joel Tavares", "Diana Gonçalves", "Tiago Sá"],
    "3"
  )
);
groupMap.set(
  "5a5774c5be0",
  new Group(
    ["Luís Remuge", "Gabriel Meireles", "Gonçalo Sousa", "João Rodrigues"],
    "4"
  )
);
groupMap.set(
  "62868e02fbc",
  new Group(["João Quental", "Rodrigo Magalhães", "Carlos Pereira"], "5")
);
groupMap.set("71b545e329d", new Group(["André Barbosa", "Pedro Soares"], "6"));

//export groupMap and the class Group
export default { groupMap, Group };
