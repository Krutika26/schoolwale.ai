/*
  Warnings:

  - You are about to alter the column `sender` on the `ChatMessage` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `ChatMessage` MODIFY `messageText` JSON NOT NULL;
