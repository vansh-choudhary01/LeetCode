import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../lib/prisma.js";
import dotenv from "dotenv";
dotenv.config();

const problems: Prisma.ProblemCreateInput[] = [
  {
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.",
    tests: {
      create: [
        {
          input: { nums: [2, 7, 11, 15], target: 9 },
          expected: [0, 1],
        },
        {
          input: { nums: [3, 2, 4], target: 6 },
          expected: [1, 2],
        },
      ],
    },
    functionName: "twoSum"
  },
  {
    title: "Valid Parentheses",
    description:
      "Given a string containing only the characters '(', ')', '{', '}', '[' and ']', determine whether the input string is valid.",
    tests: {
      create: [
        {
          input: { value: "()[]{}" },
          expected: true,
        },
        {
          input: { value: "([)]" },
          expected: false,
        },
      ],
    },
    functionName: "validParentheses"
  },
  {
    title: "Reverse String",
    description:
      "Write a function that reverses a string. The input string is given as an array of characters.",
    tests: {
      create: [
        {
          input: { value: ["h", "e", "l", "l", "o"] },
          expected: ["o", "l", "l", "e", "h"],
        },
        {
          input: { value: ["H", "a", "n", "n", "a", "h"] },
          expected: ["h", "a", "n", "n", "a", "H"],
        },
      ],
    },
    functionName: "reverseString"
  },
];

async function seedProblems(data: Prisma.ProblemCreateInput[]) {
  for (const problem of data) {
    await prisma.problem.create({
      data: problem,
    });
  }
}

async function main() {
  await seedProblems(problems);
  console.log(`Seeded ${problems.length} problems.`);
}

main()
  .catch((error) => {
    console.error("Problem seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
