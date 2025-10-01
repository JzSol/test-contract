'use client'

import { useCallback, useMemo, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'

const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID || 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFp1J'
const CONTRACT_AUTHORITY = process.env.NEXT_PUBLIC_CONTRACT_AUTHORITY || '11111111111111111111111111111111' // replace with your pubkey

export default function SignButton() {
  const { publicKey, sendTransaction, connected } = useWallet()
  const { connection } = useConnection()
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('Hello Solana!')
  const [status, setStatus] = useState<string | null>(null)

  const programId = useMemo(() => new PublicKey(PROGRAM_ID), [])
  const contractAuthority = useMemo(() => new PublicKey(CONTRACT_AUTHORITY), [])

  const onClick = useCallback(async () => {
    if (!publicKey) return
    setLoading(true)
    setStatus(null)
    try {
      // For demo: perform a simple system transfer of 0.04 SOL to authority.
      // This simulates the payment requirement. A full Anchor RPC would serialize the instruction.
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: contractAuthority,
          lamports: Math.floor(0.04 * LAMPORTS_PER_SOL),
        })
      )

      const sig = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(sig, 'confirmed')
      setStatus(`Payment sent. Signature: ${sig}`)

      // TODO: Wire with Anchor IDL to call sign_text and pass text when program is deployed
    } catch (e: any) {
      setStatus(e?.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }, [publicKey, connection, sendTransaction, contractAuthority])

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
