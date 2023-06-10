"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupMap = exports.Group = void 0;
// make a group datatype
class Group {
    constructor(members, ngId) {
        this.isActive = false;
        this.server = "";
        this.proxy = null;
        this.members = members;
        this.ngId = ngId;
    }
}
exports.Group = Group;
exports.groupMap = new Map();
exports.groupMap.set("1b02d8d2476", new Group(["Miguel Ferreira", "Marco Cruz", "José Mendes", "Ivo Gomes"], "0"));
exports.groupMap.set("21b5eeae29c", new Group(["Paulo Leal", "Bruno Pacheco", "Tomás Henriques"], "1"));
exports.groupMap.set("36ceaa6bf29", new Group(["Diogo Sousa", "Diogo Canito", "Diogo Oliveira"], "2"));
exports.groupMap.set("47a7d22b1bb", new Group(["Delsey Silva", "Joel Tavares", "Diana Gonçalves", "Tiago Sá"], "3"));
exports.groupMap.set("5a5774c5be0", new Group(["Luís Remuge", "Gabriel Meireles", "Gonçalo Sousa", "João Rodrigues"], "4"));
exports.groupMap.set("62868e02fbc", new Group(["João Quental", "Rodrigo Magalhães", "Carlos Pereira"], "5"));
exports.groupMap.set("71b545e329d", new Group(["André Barbosa", "Pedro Soares"], "6"));
//export groupMap and the class Group
exports.default = { groupMap: exports.groupMap };
