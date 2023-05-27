//create a object to be created in other places
interface loggerMessage{
    TimeStamp:string
    LogType:string
    Action:string
    DataObject:any
}
export {loggerMessage as logStruct}