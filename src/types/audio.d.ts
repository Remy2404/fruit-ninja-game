// Type declarations for audio assets imported via webpack's asset/inline loader.
// These imports resolve to base64 data URIs (strings) at build time.
declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.ogg' {
  const src: string;
  export default src;
}

declare module '*.wav' {
  const src: string;
  export default src;
}
