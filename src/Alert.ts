export interface Alert  {lvl: string, msg: string}
export function isAlert(a: any): a is Alert {
    return a.lvl !== undefined;
}
export function error(errMsg: string, lineNum?: number): Alert {
    return {lvl: "error", msg:errMsg+ (lineNum?" on line "+lineNum: "")};
}

export function warning(m: string) : Alert {
    return {lvl: "warning", msg: m};
}
