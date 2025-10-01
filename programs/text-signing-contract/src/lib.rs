use anchor_lang::prelude::*;

// Placeholder program ID; replace with your deployed program ID if needed
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFp1J");

const MAX_TEXT_LEN: usize = 280; // allocate up to 280 bytes for text
const VAULT_SEED: &[u8] = b"vault";

#[program]
pub mod text_signing_contract {
    use super::*;

    pub fn sign_text(ctx: Context<SignText>, text: String) -> Result<()> {
        require!(text.as_bytes().len() <= MAX_TEXT_LEN, TextError::TextTooLong);

        // Require exactly 0.04 SOL payment (in lamports)
        let amount: u64 = 40_000_000;

        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.signer.key(),
            &ctx.accounts.vault.key(),
            amount,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.signer.to_account_info(),
                ctx.accounts.vault.to_account_info(),
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

    pub fn init_vault(ctx: Context<InitVault>) -> Result<()> {
        let (_pda, bump) = Pubkey::find_program_address(&[VAULT_SEED], ctx.program_id);
        ctx.accounts.vault.bump = bump;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let seeds: &[&[u8]] = &[VAULT_SEED, &[ctx.accounts.vault.bump]];

        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.vault.key(),
            &ctx.accounts.destination.key(),
            amount,
        );

        anchor_lang::solana_program::program::invoke_signed(
            &transfer_ix,
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.destination.to_account_info(),
            ],
            &[seeds],
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct SignText<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,

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

#[account]
pub struct Vault {
    pub bump: u8,
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
    #[msg("Unauthorized")] 
    Unauthorized,
}

#[derive(Accounts)]
pub struct InitVault<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + 1, // discriminator + bump
        seeds = [VAULT_SEED],
        bump
    )]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    pub admin: Signer<'info>,
    #[account(mut, seeds = [VAULT_SEED], bump = vault.bump)]
    pub vault: Account<'info, Vault>,
    /// CHECK: destination can be any recipient account
    #[account(mut)]
    pub destination: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}
