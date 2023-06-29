const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

//middlewares
app.use(express.json()); //req.body
app.use(express.urlencoded({ extends: true })); //req.body
app.use(cors());
app.use(morgan("tiny"));

app.listen(3000, () =>
    console.log("servidor escuchando en http://localhost:3000")
);

//RUTAS ENDPOINTS
let { User, Post } = require("./models");

//RUTAS USUARIO
app.get("/users", async (req, res) => {
    try {
        let users = await User.findAll({
            include: {
                model: Post,
                as: "posts",
                attributes: { exclude: ["updatedAt", "createdAt", "userId"] },
            },
            attributes: { exclude: ["updatedAt", "createdAt"] },
        });
        console.log(users);
        res.send({ code: 200, data: users });
    } catch (error) {
        res.status(500).send({
            code: 500,
            message: "Error al buscar los usuarios.",
        });
    }
});
app.get("/users/id/:id", async (req, res) => {
    try {
        let id = req.params.id;
        let user = await User.findByPk(id);
        if (!user) {
            return res.status(400).send({
                code: 400,
                message:
                    `Usuario con ID: ${id} no encontrado en la base de datos.`,
            });
        }
        console.log(user);
        res.send({ code: 200, data: user });
    } catch (error) {
        res.status(500).send({
            code: 500,
            message: "Error al buscar el usuario.",
        });
    }
});



app.post("/users", async (req, res) => {
    try {
        let { firstName, lastName, email } = req.body;

        let newUser = await User.create({
            firstName,
            lastName,
            email,
        });
        console.log(newUser);

        res.send({
            code: 200,
            data: newUser,
            message: "Usuario creado con éxito.",
        });
    } catch (error) {
        res.status(500).send({
            code: 500,
            message: "Error al agregar el usuario.",
        });
    }
});

//RUTAS POST

app.get("/posts", async (req, res) => {
    try {
        let posts = await Post.findAll({
            include: {
                model: User,
                as: "author",
                attributes: { exclude: ["updatedAt", "createdAt"] },
            },
            attributes: { exclude: ["updatedAt", "createdAt", "userId"] },
        });
        console.log(posts);
        res.send({ code: 200, data: posts });
    } catch (error) {
        res.status(500).send({
            code: 500,
            message: "Error al buscar los posts.",
        });
    }
});

app.get("/posts/user/:id", async (req, res) => {
    let id = req.params.id;
    try {
        let user = await User.findByPk(id);
        if (!user) {
            return res.status(400).send({
                code: 400,
                message: `Usuario con ID: ${id} no encontrado en la base de datos.`,
            });
        }
        let posts = await Post.findAll({
            where: {
                userId: id,
            },
        });
        let data = {
            usuario: user,
            posts
        }

        res.send({ code: 200, data});
    } catch (error) {
        res.status(500).send({
            code: 500,
            message: "Error al encontrar los post del usuario: " + id,
        });
    }
});


app.post("/posts", async (req, res) => {
    try {
        let { title, content, userId } = req.body;

        let user = await User.findByPk(userId);

        if (!user) {
            return res.status(400).send({
                code: 400,
                message:
                    "El usuario con el que se intenta crear el post no existe en la base de datos.",
            });
        }

        let newPost = await Post.create({
            title,
            content,
            date: new Date(),
            userId,
        });
        console.log(newPost);

        res.send({
            code: 200,
            data: newPost,
            message: "Post creado con éxito.",
        });
    } catch (error) {
        res.status(500).send({
            code: 500,
            message: "Error al agregar el nuevo Post.",
        });
    }
});
