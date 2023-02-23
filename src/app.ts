import express, { Request, response, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

const errorCodes = {
	BAD_INPUT: 1,
	SERVER_ERROR: 2,
	NOT_FOUND: 3,
};

const responses = {
	BAD_INPUT: {
		success: false,
		errors: [errorCodes.BAD_INPUT],
		data: null,
	},
	SERVER_ERROR: {
		success: false,
		errors: [errorCodes.SERVER_ERROR],
		data: null,
	},
	NOT_FOUND: {
		success: false,
		errors: [errorCodes.NOT_FOUND],
		data: null,
	},
	SUCCESS: (data: any) => ({
		success: true,
		errors: null,
		data,
	}),
};

app.get('/', async (_req: Request, res: Response) => {
	res.status(200).json(responses.SUCCESS('Hello!'));
});

const postSchema = z.strictObject({
	title: z.string().max(100),
	description: z.string().max(500),
	questions: z.array(
		z.strictObject({
			description: z.string().max(500),
			mandatory: z.boolean().default(false),
			answers: z.array(
				z.strictObject({
					description: z.string().max(500),
					correct: z.boolean().default(false),
				})
			),
		})
	),
});

app.post('/quiz', async (req: Request, res: Response) => {
	try {
		const parsed = postSchema.safeParse(req.body);
		if (!parsed.success) return res.status(400).json(responses.BAD_INPUT);
		const createData = {
			...parsed.data,
			questions: {
				create: parsed.data.questions.map((row) => ({
					...row,
					answers: {
						create: row.answers,
					},
				})),
			},
		};
		const user = await prisma.quiz.create({
			data: createData,
			include: {
				questions: {
					include: {
						answers: true,
					},
				},
			},
		});
		res.status(201).json(responses.SUCCESS(user));
	} catch (error: any) {
		res.status(500).json(responses.SERVER_ERROR);
	}
});

app.get('/quiz', async (_req: Request, res: Response) => {
	try {
		const quizzes = await prisma.quiz.findMany({
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
		res.status(200).json(responses.SUCCESS(quizzes));
	} catch (error: any) {
		res.status(500).json(responses.SERVER_ERROR);
	}
});

app.get('/quiz/:id', async (req: Request, res: Response) => {
	try {
		const quiz = await prisma.quiz.findUnique({
			where: { id: Number(req.params.id) },
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
		if (!quiz) return res.status(404).json(responses.NOT_FOUND);
		res.status(200).json(responses.SUCCESS(quiz));
	} catch (error: any) {
		res.status(500).json(responses.SERVER_ERROR);
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
		if (!parsed.success) return res.status(400).json(responses.BAD_INPUT);
		const { data } = parsed;
		const quiz = await prisma.quiz.findUnique({
			where: { id: Number(req.params.id) },
			include: {
				questions: {
					include: {
						answers: {
							where: {
								correct: true,
							},
						},
					},
				},
			},
		});
		if (!quiz) return res.status(404).json(responses.NOT_FOUND);
		let score = 0;
		for (const { answers, mandatory } of quiz.questions) {
			const correct = answers[0];
			if (!correct) return res.status(400).json(responses.BAD_INPUT);
			const answer = data.find(
				(row) => row.questionId === correct.questionId
			)?.answerId;
			if (mandatory && !answer)
				return res.status(400).json(responses.BAD_INPUT);
			if (correct.id === answer) score++;
		}
		res.status(200).json(
			responses.SUCCESS({ score: `${score}/${quiz.questions.length}` })
		);
	} catch (error: any) {
		res.status(500).json(responses.SERVER_ERROR);
	}
});

const port = process.env.PORT || 4000;
app.listen(
	{
		port,
		host: '0.0.0.0',
	},
	() => {
		console.log(`Express server is running on port ${port}`);
	}
);
