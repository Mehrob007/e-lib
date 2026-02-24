export interface dataT {
  [key: string]:
    | string
    | string[]
    | number
    | FileList
    | File
    | boolean
    | (File | string)[]
    | { name: string; id?: number; Id?: number };
}
