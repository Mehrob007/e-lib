export interface dataT {
  [key: string]:
    | string
    | string[]
    | number
    | FileList
    | File
    | boolean
    | (File | string)[]
    | { [key: string]: any };
}
