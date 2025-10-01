'use client'

import { useCallback, useMemo, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getProgram, findVaultPda, findSignedTextPda } from '@/lib/anchorClient'

const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID || 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFp1J'

export default function SignButton() {
  const { publicKey, sendTransaction, connected, signTransaction, signAllTransactions } = useWallet()
  const { connection } = useConnection()
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('Hello Solana!')
  const [status, setStatus] = useState<string | null>(null)

  const programId = useMemo(() => new PublicKey(PROGRAM_ID), [])

  const onClick = useCallback(async () => {
    if (!publicKey) return
    setLoading(true)
    setStatus(null)
    try {
      const program = getProgram(connection, { publicKey, signTransaction, signAllTransactions } as any)
      const vault = await findVaultPda(program.programId)
      const signedText = await findSignedTextPda(program.programId, publicKey)

      const txSig = await program.methods
        .signText(text)
        .accounts({
          signer: publicKey,
          vault,
          signedText,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      setStatus(`Signed text on-chain. Signature: ${txSig}`)
    } catch (e: any) {
      setStatus(e?.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }, [publicKey, connection, sendTransaction, text])

  return (
    <div className="space-y-4">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to sign"
        className="px-3 py-2 rounded bg-white/10 text-white w-full max-w-xl"
      />
      <button
        onClick={onClick}
        disabled={!connected || loading}
        className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Processing…' : 'Pay 0.04 SOL & Sign'}
      </button>
      {status && (
        <div className="text-sm text-indigo-200 break-all max-w-xl">{status}</div>
      )}
    </div>
  )
}
