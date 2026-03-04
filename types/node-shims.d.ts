declare module 'fs' {
  export const promises: any;
}

declare module 'path' {
  const path: any;
  export default path;
}

declare module 'crypto' {
  const crypto: any;
  export default crypto;
}

declare const process: any;
