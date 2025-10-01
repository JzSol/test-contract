import { AnchorProvider, Idl, Program, setProvider } from '@coral-xyz/anchor'
import { Connection, PublicKey } from '@solana/web3.js'
import idl from '@/idl/text_signing_contract.json'

export type TextSigningIdl = typeof idl & Idl

export function getProgram(connection: Connection, wallet: any) {
  const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' })
  setProvider(provider)
  const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFp1J')
  return new Program<TextSigningIdl>(idl as any, programId, provider)
}

export async function findVaultPda(programId: PublicKey) {
  const [pda] = PublicKey.findProgramAddressSync([Buffer.from('vault')], programId)
  return pda
}

export async function findSignedTextPda(programId: PublicKey, signer: PublicKey) {
  const [pda] = PublicKey.findProgramAddressSync([Buffer.from('signed_text'), signer.toBuffer()], programId)
  return pda
}

