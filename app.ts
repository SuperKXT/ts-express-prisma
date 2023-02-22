import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(express.json());

app.get('/', async (_req: Request, res: Response) => {
	res.json({ message: 'Hello from Express Prisma Boilerplate!' });
});

app.post('/quiz', async (req: Request, res: Response) => {
	try {
		const user = await prisma.quiz.create({ data: req.body });
		res.status(201).json({ message: 'success', data: user });
	} catch (error: any) {
		res.status(500).json({ message: error.message, data: null });
	}
});

app.get('/quiz', async (_req: Request, res: Response) => {
	try {
		const quiz = await prisma.quiz.findMany({
			include: {
				questions: {
					include: {
						answers: {
							select: {
								id: true,
								description: true,
							},
						},
					},
				},
			},
		});
		res.status(200).json({ message: 'success', data: quiz });
	} catch (error: any) {
		res.status(500).json({ message: error.message, data: null });
	}
});

app.get('/quiz/:id', async (req: Request, res: Response) => {
	try {
		const quiz = await prisma.quiz.findUnique({
			where: { id: Number(req.params.id) },
			include: { questions: true },
		});
		if (!quiz)
			return res.status(404).json({ message: 'not found!', data: null });
		res.status(200).json({ message: 'success', data: quiz });
	} catch (error: any) {
		res.status(500).json({ message: error.message, data: null });
	}
});

const quizAttemptSchema = z.array(
	z.strictObject({
		questionId: z.number().int().nonnegative().finite(),
		answerId: z.number().int().nonnegative().finite().nullable(),
	})
);

app.post('/quiz/:id', async (req: Request, res: Response) => {
	try {
		const parsed = quizAttemptSchema.safeParse(req.body);
		if (!parsed.success)
			return res
				.status(400)
				.json({ message: 'invalidInput', data: null });
		const { data } = parsed;
		const questions = await prisma.question.findMany({
			where: { id: Number(req.params.id) },
			include: {
				answers: true,
			},
		});
		if (!questions) return res.status(404).json('not found!');
		let score = 0;
		for (const { questionId, answerId } of data) {
			const question = questions.find((row) => row.id === questionId);
			if (question?.mandatory && !answerId)
				throw new Error('all mandatory questions not answered!');
			const correct = question?.answers.find((row) => row.correct)?.id;
			if (correct === answerId) score++;
		}
		res.status(200).json({ message: 'success', data: score });
	} catch (error: any) {
		res.status(500).json({ message: error.message, data: null });
	}
});

app.listen(4000, () => {
	console.log('Express server is running on port 4000');
});
