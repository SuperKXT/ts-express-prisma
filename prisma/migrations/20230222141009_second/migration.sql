/*
  Warnings:

  - You are about to drop the column `correctAnswer` on the `question` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "mandatory" BOOLEAN NOT NULL,
    "quizId" INTEGER NOT NULL,
    CONSTRAINT "question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quiz" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_question" ("description", "id", "mandatory", "quizId") SELECT "description", "id", "mandatory", "quizId" FROM "question";
DROP TABLE "question";
ALTER TABLE "new_question" RENAME TO "question";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
