// .ts is the standard TypeScript files. The content then will be compiled to JavaScript.
// *.d.ts is the type definition files that allow to use existing JavaScript code in TypeScript.

// getting the request type from express, and adding the user property that is a string

declare namespace Express {
  export interface Request {
    user: string;
  }
}
