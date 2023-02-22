import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(express.json());

const idSchema = z.number().int().nonnegative().finite();

app.get('/', async (_req: Request, res: Response) => {
	res.json({ message: 'Hello from Express Prisma Boilerplate!' });
});

app.post('/quiz', async (req: Request, res: Response) => {
	try {
		const user = await prisma.quiz.create({ data: req.body });
		res.json({ message: 'success', data: user });
	} catch (error: any) {
		res.json({ message: error.message, data: null });
	}
});

app.get('/quiz', async (_req: Request, res: Response) => {
	try {
		const quiz = await prisma.quiz.findMany({
			include: { questions: true },
		});
		res.json({ message: 'success', data: quiz });
	} catch (error: any) {
		res.json({ message: error.message, data: null });
	}
});

app.get('/quiz/:id', async (req: Request, res: Response) => {
	try {
		const id = idSchema.parse(req.params.id);
		const quiz = await prisma.quiz.findUnique({
			where: { id },
			include: { questions: true },
		});
		if (!quiz) res.json({ message: 'not found!', data: quiz });
		res.json({ message: 'success', data: quiz });
	} catch (error: any) {
		res.json({ message: error.message, data: null });
	}
});

const quizAttemptSchema = z.array(
	z.strictObject({
		questionId: idSchema,
		answerId: z.number().int().nonnegative().finite(),
	})
);

app.post('/quiz/:id', async (req: Request, res: Response) => {
	try {
		const id = idSchema.parse(req.params.id);
		const questions = quizAttemptSchema.parse(req.body);
		const quiz = await prisma.quiz.findUnique({
			where: { id },
			include: {
				questions: {
					include: {
						answers: true,
					},
				},
			},
		});
		if (!quiz) throw new Error('not found!');
		let score = 0;
		for (const { questionId, answerId } of questions) {
			const correct = quiz.questions
				.find((row) => row.id === questionId)
				?.answers.find((row) => row.correct)?.id;
			if (correct === answerId) score++;
		}
		res.json({ message: 'success', data: score });
	} catch (error: any) {
		res.json({ message: error.message, data: null });
	}
});

app.listen(4000, () => {
	console.log('Express server is running on port 4000');
});
