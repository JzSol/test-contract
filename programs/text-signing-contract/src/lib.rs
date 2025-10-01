use anchor_lang::prelude::*;

// Placeholder program ID; replace with your deployed program ID if needed
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFp1J");

const MAX_TEXT_LEN: usize = 280; // allocate up to 280 bytes for text

#[program]
pub mod text_signing_contract {
    use super::*;

    pub fn sign_text(ctx: Context<SignText>, text: String) -> Result<()> {
        require!(text.as_bytes().len() <= MAX_TEXT_LEN, TextError::TextTooLong);

        // Require exactly 0.04 SOL payment (in lamports)
        let amount: u64 = 40_000_000;

        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.signer.key(),
            &ctx.accounts.contract_authority.key(),
            amount,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.signer.to_account_info(),
                ctx.accounts.contract_authority.to_account_info(),
            ],
        )?;

        // Store the signed text
        let signed_text = &mut ctx.accounts.signed_text;
        signed_text.text = text.clone();
        signed_text.signer = ctx.accounts.signer.key();
        signed_text.timestamp = Clock::get()?.unix_timestamp;

        emit!(TextSigned {
            signer: ctx.accounts.signer.key(),
            text,
            timestamp: signed_text.timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct SignText<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: This is the contract authority that receives payments
    #[account(mut)]
    pub contract_authority: AccountInfo<'info>,

    #[account(
        init,
        payer = signer,
        space = 8  // discriminator
              + 32 // signer pubkey
              + 8  // timestamp
              + 4  // string length prefix
              + MAX_TEXT_LEN, // string bytes
        seeds = [b"signed_text", signer.key().as_ref()],
        bump
    )]
    pub signed_text: Account<'info, SignedText>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct SignedText {
    pub text: String,
    pub signer: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TextSigned {
    pub signer: Pubkey,
    pub text: String,
    pub timestamp: i64,
}

#[error_code]
pub enum TextError {
    #[msg("Text exceeds maximum allowed length")] 
    TextTooLong,
}
