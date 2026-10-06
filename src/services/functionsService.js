import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase'

export async function testBackendConnection() {

  const testConnection = httpsCallable(
    functions,
    'testConnection'
  )

  const result = await testConnection()

  return result.data
}