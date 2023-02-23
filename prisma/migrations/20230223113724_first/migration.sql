-- CreateTable
CREATE TABLE `quiz` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(500) NOT NULL,
    `mandatory` BOOLEAN NOT NULL DEFAULT false,
    `quizId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `answer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(500) NOT NULL,
    `correct` BOOLEAN NOT NULL DEFAULT false,
    `questionId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `question` ADD CONSTRAINT `question_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `quiz`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answer` ADD CONSTRAINT `answer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
