-- CreateTable
CREATE TABLE "quiz" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(99) NOT NULL,
    "description" VARCHAR(500) NOT NULL,

    CONSTRAINT "quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "mandatory" BOOLEAN NOT NULL,
    "correctAnswer" INTEGER NOT NULL,
    "answers" VARCHAR(500)[],
    "quizId" INTEGER NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
