-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_answer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "correct" BOOLEAN DEFAULT false,
    "questionId" INTEGER NOT NULL,
    CONSTRAINT "answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_answer" ("correct", "description", "id", "questionId") SELECT "correct", "description", "id", "questionId" FROM "answer";
DROP TABLE "answer";
ALTER TABLE "new_answer" RENAME TO "answer";
CREATE TABLE "new_question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "mandatory" BOOLEAN DEFAULT false,
    "quizId" INTEGER NOT NULL,
    CONSTRAINT "question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quiz" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_question" ("description", "id", "mandatory", "quizId") SELECT "description", "id", "mandatory", "quizId" FROM "question";
DROP TABLE "question";
ALTER TABLE "new_question" RENAME TO "question";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
