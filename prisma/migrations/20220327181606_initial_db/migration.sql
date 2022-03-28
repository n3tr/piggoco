BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] VARCHAR(32) NOT NULL,
    [email] NVARCHAR(1000),
    [fbId] VARCHAR(32),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY ([id]),
    CONSTRAINT [User_email_key] UNIQUE ([email]),
    CONSTRAINT [User_fbId_key] UNIQUE ([fbId])
);

-- CreateTable
CREATE TABLE [dbo].[Wallet] (
    [id] VARCHAR(32) NOT NULL,
    [userId] VARCHAR(32) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL CONSTRAINT [Wallet_name_df] DEFAULT 'default',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Wallet_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Wallet_pkey] PRIMARY KEY ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Category] (
    [walletId] VARCHAR(32) NOT NULL,
    [slug] NVARCHAR(32) NOT NULL,
    [title] VARCHAR(32),
    CONSTRAINT [Category_walletId_slug_key] UNIQUE ([walletId],[slug])
);

-- CreateTable
CREATE TABLE [dbo].[TransactionTag] (
    [transactionId] VARCHAR(32) NOT NULL,
    [tag] NVARCHAR(32) NOT NULL,
    CONSTRAINT [TransactionTag_transactionId_tag_key] UNIQUE ([transactionId],[tag])
);

-- CreateTable
CREATE TABLE [dbo].[Transaction] (
    [id] VARCHAR(32) NOT NULL,
    [walletId] VARCHAR(32) NOT NULL,
    [type] VARCHAR(10) NOT NULL,
    [amount] DECIMAL(32,16) NOT NULL,
    [title] NVARCHAR(256),
    [category] NVARCHAR(32),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Transaction_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Transaction_pkey] PRIMARY KEY ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Wallet] ADD CONSTRAINT [Wallet_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[TransactionTag] ADD CONSTRAINT [TransactionTag_transactionId_fkey] FOREIGN KEY ([transactionId]) REFERENCES [dbo].[Transaction]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Transaction] ADD CONSTRAINT [Transaction_walletId_fkey] FOREIGN KEY ([walletId]) REFERENCES [dbo].[Wallet]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
