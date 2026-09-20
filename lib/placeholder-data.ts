import { Question } from "@/types/question";

export const placeholderQuestions: Question[] = [
  {
    id: "1",
    question_text:
      "What number should come next in the series? 1, 4, 9, 16, 25, ...",
    question_image_url: null,
    answer_text: "36",
    answer_image_url: null,
    explanation_text:
      "The pattern is the sequence of perfect squares (1², 2², 3², 4², 5²). The next term is 6², which equals 36.",
    explanation_image_url: null,
    hints: [
      {
        text: "Look at the difference between consecutive numbers.",
        image_url: null,
      },
      {
        text: "The differences are 3, 5, 7, 9... what's the pattern?",
        image_url: null,
      },
    ],
    category: "numerical",
    difficulty: 2,
    qualification: "High school level math",
    format: "free_response",
    options: [],
    correct_option_id: null,
    source_text: "Adapted from classic number sequence puzzles",
    source_url: null,
  },
  {
    id: "2",
    question_text: "Book is to chapter as tree is to _______.",
    question_image_url: null,
    answer_text: "Branch",
    answer_image_url: null,
    explanation_text:
      "A chapter is a major subdivision of a book. Similarly, a branch is a major subdivision of a tree.",
    explanation_image_url: null,
    hints: [
      {
        text: "Think about how the two things are related in structure.",
        image_url: null,
      },
    ],
    category: "verbal",
    difficulty: 1,
    qualification: "Middle school level",
    format: "multiple_choice",
    options: [
      { id: "a", text: "Leaf" },
      { id: "b", text: "Branch" },
      { id: "c", text: "Forest" },
      { id: "d", text: "Wood" },
    ],
    correct_option_id: "b",
    source_text: null,
    source_url: null,
  },
  {
    id: "3",
    question_text:
      "All cats are mammals. Some mammals are black. Which conclusion definitely follows?",
    question_image_url: null,
    answer_text: "Some cats may be black",
    answer_image_url: null,
    explanation_text:
      "We know all cats are mammals, and some mammals are black, but we cannot conclude that any particular cat is black. Only that it is possible.",
    explanation_image_url: null,
    hints: [
      {
        text: "Draw a Venn diagram with three overlapping circles.",
        image_url: null,
      },
      {
        text: 'The word "definitely" is doing a lot of work here. What is guaranteed?',
        image_url: null,
      },
    ],
    category: "logical",
    difficulty: 3,
    qualification: "High school level",
    format: "multiple_choice",
    options: [
      { id: "a", text: "All cats are black" },
      { id: "b", text: "Some cats are definitely black" },
      { id: "c", text: "Some cats may be black" },
      { id: "d", text: "No cats are black" },
    ],
    correct_option_id: "c",
    source_text: null,
    source_url: null,
  },
];
