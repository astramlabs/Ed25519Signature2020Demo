declare module '@digitalcredentials/ed25519-signature-2020' {
  export class Ed25519Signature2020 {
    constructor(options?: any);
    verifySignature(options: any): Promise<boolean>;
    createVerifyData(options: any): Promise<Uint8Array>;
    // Add any other methods or properties you use
  }
}

declare module '@digitalcredentials/jsonld-signatures' {
  export namespace purposes {
    class AssertionProofPurpose {
      constructor(options?: any);
      validate(proof: any, options: any): Promise<{valid: boolean, error?: Error}>;
    }
    // Add other purpose classes if needed
  }
}

declare module '@digitalcredentials/vc-status-list' {
  export function checkStatus(credential: any): Promise<{verified: boolean, error?: Error}>;
}

declare module '@digitalcredentials/vc' {
  const vc: {
    verify: (options: any) => Promise<{verified: boolean, results: any[], error?: Error}>;
    verifyCredential: (options: any) => Promise<{verified: boolean, results: any[], error?: Error}>;
    // Add other methods you use from this module
  };
  export default vc;
}

declare module '@digitalcredentials/security-document-loader' {
  export function securityLoader(options?: any): {
    build: () => (url: string) => Promise<{document: any}>;
  };
}
