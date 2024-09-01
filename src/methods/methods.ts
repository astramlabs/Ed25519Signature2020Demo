import * as vc from '@digitalcredentials/vc';
import { Ed25519Signature2020 } from '@digitalcredentials/ed25519-signature-2020';
import { purposes } from '@digitalcredentials/jsonld-signatures';
import { securityLoader } from '@digitalcredentials/security-document-loader';
import jsonld from '@digitalcredentials/jsonld';

const documentLoader = securityLoader({ fetchRemoteContexts: true }).build();
const suite = new Ed25519Signature2020();

export async function verifyCredential(credential: any) {
  console.log('Verifying credential:', JSON.stringify(credential, null, 2));

  try {
    // Step 1: Extract the proof
    const proof = jsonld.util.getValues(credential, 'proof')[0];
    console.log('Extracted proof:', JSON.stringify(proof, null, 2));

    // Step 2: Create a copy of the credential without the proof
    const credentialWithoutProof = { ...credential };
    delete credentialWithoutProof.proof;
    console.log('Credential without proof:', JSON.stringify(credentialWithoutProof, null, 2));

    // Step 3: Canonicalize the credential without proof
    const canonicalizedCredential = await jsonld.canonize(credentialWithoutProof);
    console.log('Canonicalized credential:', canonicalizedCredential);

    // Step 4: Hash the canonicalized credential
    const documentHash = await suite.hash(canonicalizedCredential);
    console.log('Document hash:', Buffer.from(documentHash).toString('hex'));

    // Step 5: Canonicalize the proof
    const canonicalizedProof = await jsonld.canonize(proof);
    console.log('Canonicalized proof:', canonicalizedProof);

    // Step 6: Hash the canonicalized proof
    const proofHash = await suite.hash(canonicalizedProof);
    console.log('Proof hash:', Buffer.from(proofHash).toString('hex'));

    // Step 7: Combine the hashes to create verify data
    const verifyData = new Uint8Array(proofHash.length + documentHash.length);
    verifyData.set(proofHash);
    verifyData.set(documentHash, proofHash.length);
    console.log('Combined verify data:', Buffer.from(verifyData).toString('hex'));

    // Step 8: Verify the signature
    console.log('Verifying signature with:', {
      verifyData: Buffer.from(verifyData).toString('hex'),
      proofValue: proof.proofValue
    });
    
    try {
      // Attempt to resolve the verification method
      const verificationMethod = await documentLoader(proof.verificationMethod);
      console.log('Resolved verification method:', JSON.stringify(verificationMethod, null, 2));

      const verified = await suite.verifySignature({
        verifyData,
        proof,
        verificationMethod: verificationMethod.document
      });
      console.log('Signature verification result:', verified);
    } catch (verifyError) {
      console.error('Error during signature verification:', verifyError);
      console.log('Suite used for verification:', JSON.stringify(suite, null, 2));
      throw verifyError;
    }

    // Now call the actual vc.verifyCredential function
    const result = await vc.verifyCredential({
      credential,
      suite,
      documentLoader
    });
    
    console.log('Final verification result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Verification error:', error);
    throw error;
  }
}