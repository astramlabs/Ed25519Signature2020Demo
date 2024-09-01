// main.ts

import { VerifiableCredential, CredentialError, CredentialErrorTypes } from '../types/credential';
import { verifyCredential } from './methods';
// import { VerifiableCredential, CredentialErrorTypes } from '../types/credential';

export async function verifyCredentialWrapper(credential: VerifiableCredential): Promise<any> {
  try {
    const result = await verifyCredential(credential);
    
    if (result?.error?.name === 'VerificationError') {
      console.error('Verification error:', result.error);
      return createErrorMessage(credential, CredentialErrorTypes.CouldNotBeVerified);
    }

    return result;
  } catch (err) {
    console.error('Error in verifyCredentialWrapper:', err);
    return createErrorMessage(credential, CredentialErrorTypes.CouldNotBeVerified);
  }
}

function createErrorMessage(credential: VerifiableCredential, message: string) {
  return {
    verified: false,
    results: [
      {
        verified: false,
        credential: credential,
        error: {
          details: {
            cause: {
              message: message,
              name: 'Error',
            },
          },
          message: message,
          name: 'Error',
        },
        log: [
            { id: 'expiration', valid: false },
            { id: 'valid_signature', valid: false },
            { id: 'issuer_did_resolves', valid: false },
            { id: 'revocation_status', valid: false }
          ],
      }
    ]
  }
}