import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();


const prisma = new PrismaClient();

app.use(express.json());

app.get("/user", async (req, res) => {
  const users = await prisma.user.findMany({});
  res.json(users);
});

app.post("/user", async (req, res) => {
  const { email, name } = req.body;
  const user = await prisma.user.create({
    data: {
      email,
      name,
    },
  });
  res.json(user);
});

app.post("/todo", async (req, res) => {
  const { title, authorEmail } = req.body;
  const todoItem = await prisma.todoItem.create({
    data: {
      title,
      author: { connect: { email: authorEmail } },
    },
  });
  res.json(todoItem);
});

app.get("/todos/:email", async (req, res) => {
  const email = req.params.email;
  const todoItems = await prisma.todoItem.findMany({
    where: {
      author: {
        email: email,
      },
    },
  });
  res.json(todoItems);
});

app.get("/todos/:userid", async (req, res) => {
  const userid = req.params.userid;
  const todoItems = await prisma.todoItem.findMany({
    where: {
      author: {
        id: userid,
      },
    },
  });
  res.json(todoItems);
});

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000 🎉 🚀");
});

// Prisma Commands
// npx prisma init : to create prisma folder and initialize prisma
// npx prisma studio: to open prisma studio and visualize the database
// npx prisma db push: to push the schema to the database or any changes to the schema
