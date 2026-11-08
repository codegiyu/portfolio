import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseServiceAccount } from '@/lib/server/env';

export function getDb() {
  if (!getApps().length) {
    const account = getFirebaseServiceAccount();
    initializeApp({
      credential: cert({
        projectId: account.project_id,
        clientEmail: account.client_email,
        privateKey: account.private_key,
      }),
    });
  }
  return getFirestore();
}
